import type { DB } from '../db.js';
import type { Config } from '../config.js';

const CACHE_TTL_SECONDS = 30 * 60;

interface PlacesReview {
  author: string;
  rating: number;
  text: string;
  relativeTime?: string;
}

interface PlacesResult {
  rating?: number;
  userRatingCount?: number;
  reviews?: PlacesReview[];
}

interface NormalizedReviews {
  status: 'ok' | 'not_configured';
  rating?: number;
  reviewsCount?: number;
  reviews: { author: string; rating: number; text: string; relativeTime?: string }[];
}

/**
 * Google Places API (New) — place lookup with reviews.
 * Uses the /v1/places/{placeId} endpoint with reviews field mask.
 * Results are cached in the review_cache table for 30 minutes.
 * If no API key / place_id is configured, returns { status: 'not_configured' }
 * so the client can fall back to a Google Maps link.
 */
export async function getReviewsForBranch(
  db: DB,
  config: Config,
  branch: { id: number; slug: string; nameEn: string; placeId: string | null }
): Promise<NormalizedReviews> {
  if (!config.googlePlacesApiKey || !branch.placeId) {
    return { status: 'not_configured', reviews: [] };
  }

  const cached = db.prepare('SELECT payload_json, fetched_at FROM review_cache WHERE branch_id = ?').get(branch.id) as
    | { payload_json: string; fetched_at: number }
    | undefined;
  if (cached && Date.now() / 1000 - cached.fetched_at < CACHE_TTL_SECONDS) {
    try {
      return JSON.parse(cached.payload_json) as NormalizedReviews;
    } catch {
      /* stale cache, refetch */
    }
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(branch.placeId)}`;
    const resp = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': config.googlePlacesApiKey,
        'X-Goog-FieldMask': 'rating,userRatingCount,reviews'
      }
    });
    if (!resp.ok) {
      // API error: don't cache; expose nothing sensitive.
      return { status: 'not_configured', reviews: [] };
    }
    const data = (await resp.json()) as PlacesResult;
    const normalized: NormalizedReviews = {
      status: 'ok',
      rating: typeof data.rating === 'number' ? data.rating : undefined,
      reviewsCount: typeof data.userRatingCount === 'number' ? data.userRatingCount : undefined,
      reviews: (data.reviews || []).slice(0, 5).map((r) => ({
        author: r.author || 'Google user',
        rating: r.rating || 0,
        text: r.text || '',
        relativeTime: r.relativeTime
      }))
    };
    db.prepare(
      `INSERT INTO review_cache (branch_id, payload_json, fetched_at) VALUES (?, ?, unixepoch())
       ON CONFLICT(branch_id) DO UPDATE SET payload_json = excluded.payload_json, fetched_at = unixepoch()`
    ).run(branch.id, JSON.stringify(normalized));
    return normalized;
  } catch {
    // Network failure: fall back to stale cache if present, else not_configured.
    if (cached) {
      try {
        return JSON.parse(cached.payload_json) as NormalizedReviews;
      } catch {
        /* ignore */
      }
    }
    return { status: 'not_configured', reviews: [] };
  }
}
