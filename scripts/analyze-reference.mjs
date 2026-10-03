import fs from 'node:fs';
import { PNG } from 'pngjs';

const SRC = 'assets/reference-logo.png';
const png = PNG.sync.read(fs.readFileSync(SRC));
const W = png.width, H = png.height;
const idx = (x, y) => (W * y + x) << 2;
const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
const isBg = (x, y) => {
  if (!inb(x, y)) return true;
  const r = png.data[idx(x, y)], g = png.data[idx(x, y) + 1], b = png.data[idx(x, y) + 2];
  const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
  return (mx - mn < 12 && mn > 205);
};

function bbox(pred) {
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (pred(x, y)) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

const bbAll = bbox((x, y) => !isBg(x, y));

// vertical scan: content blocks separated by >=25 consecutive empty rows ("strong ink" test ignores soft shadows/specks)
const strong = (x, y) => {
  if (!inb(x, y)) return false;
  const r = png.data[idx(x, y)], g = png.data[idx(x, y) + 1], b = png.data[idx(x, y) + 2];
  const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
  return (mn < 200 || mx - mn >= 30);
};
const rowCnt = new Array(H).fill(0);
for (let y = 0; y < H; y++) { let c = 0; for (let x = 0; x < W; x++) if (strong(x, y)) c++; rowCnt[y] = c; }
const blocks = [];
let bs = -1, bempty = 0;
for (let y = 0; y < H; y++) {
  if (rowCnt[y] >= 12) { if (bs < 0) bs = y; bempty = 0; }
  else if (bs >= 0) { bempty++; if (bempty >= 20) { blocks.push({ y0: bs, y1: y - bempty }); bs = -1; } }
}
if (bs >= 0) blocks.push({ y0: bs, y1: H - 1 });
blocks.sort((a, b) => (b.y1 - b.y0) - (a.y1 - a.y0));
const emblemBlock = blocks[0];
const wordBlock = blocks.find(b => b.y0 > emblemBlock.y1) || null;
let emblemBottom = emblemBlock.y1, wordTop = wordBlock ? wordBlock.y0 : H - 1;
const emblemPred = (x, y) => !isBg(x, y) && y <= emblemBottom;
const bbE = bbox(emblemPred);
const bbW = wordBlock ? bbox((x, y) => !isBg(x, y) && y >= wordTop) : { x0: 0, y0: 0, x1: 0, y1: 0, w: 0, h: 0 };

// ---- palette: cluster non-bg emblem colors around 4 initial guesses
const px = [];
for (let y = bbE.y0; y <= bbE.y1; y++) for (let x = bbE.x0; x <= bbE.x1; x++) {
  if (!isBg(x, y)) px.push([png.data[idx(x, y)], png.data[idx(x, y) + 1], png.data[idx(x, y) + 2]]);
}
let centroids = [[38, 86, 226], [66, 133, 244], [152, 196, 246], [244, 248, 255]];
const assignments = new Array(px.length).fill(0);
for (let iter = 0; iter < 12; iter++) {
  for (let i = 0; i < px.length; i++) {
    let best = 0, bd = 1e9;
    for (let c = 0; c < 4; c++) {
      const dr = px[i][0] - centroids[c][0], dg = px[i][1] - centroids[c][1], db = px[i][2] - centroids[c][2];
      const d = dr * dr + dg * dg + db * db;
      if (d < bd) { bd = d; best = c; }
    }
    assignments[i] = best;
  }
  const sums = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  for (let i = 0; i < px.length; i++) {
    const a = assignments[i];
    sums[a][0] += px[i][0]; sums[a][1] += px[i][1]; sums[a][2] += px[i][2]; sums[a][3]++;
  }
  for (let c = 0; c < 4; c++) if (sums[c][3] > 0) {
    centroids[c] = [sums[c][0] / sums[c][3], sums[c][1] / sums[c][3], sums[c][2] / sums[c][3]];
  }
}
const counts = [0, 0, 0, 0];
for (const a of assignments) counts[a]++;
const hex = (rgb) => '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

// ---- emblem silhouette: normalized per-row extents + vertical/horizontal probes through center
const rows = [];
for (let y = bbE.y0; y <= bbE.y1; y += 2) {
  let x0 = -1, x1 = -1;
  for (let x = bbE.x0; x <= bbE.x1; x++) if (!isBg(x, y)) { if (x0 < 0) x0 = x; x1 = x; }
  if (x0 >= 0) rows.push({ y, nx: ((x0 - bbE.x0) / bbE.w).toFixed(3), nX: ((x1 - bbE.x0) / bbE.w).toFixed(3) });
}
const cx = Math.round(bbE.x0 + bbE.w / 2), cy = Math.round(bbE.y0 + bbE.h / 2);
let vertRuns = [], cur = null;
for (let y = bbE.y0; y <= bbE.y1; y++) {
  const fg = !isBg(cx, y);
  if (fg && !cur) cur = { y0: y, y1: y };
  else if (fg && cur) cur.y1 = y;
  else if (!fg && cur) { vertRuns.push({ y0: cur.y0, y1: cur.y1 }); cur = null; }
}
if (cur) vertRuns.push({ y0: cur.y0, y1: cur.y1 });
const rel = (r) => ({ y0: +(100 * (r.y0 - bbE.y0) / bbE.h).toFixed(1), y1: +(100 * (r.y1 - bbE.y0) / bbE.h).toFixed(1) });

// horizontal probe rows (relative heights) to map seams: top plate band, mid band, bottom band
function hRunsAt(relY) {
  const y = Math.round(bbE.y0 + relY / 100 * bbE.h);
  const runs = []; let s = null;
  for (let x = bbE.x0; x <= bbE.x1; x++) {
    const fg = !isBg(x, y);
    if (fg && s === null) s = x;
    else if (!fg && s !== null) { runs.push({ x0: s, x1: x - 1 }); s = null; }
  }
  if (s !== null) runs.push({ x0: s, x1: bbE.x1 });
  return runs.map(r => ({ nx0: +(100 * (r.x0 - bbE.x0) / bbE.w).toFixed(1), nx1: +(100 * (r.x1 - bbE.x0) / bbE.w).toFixed(1) }));
}
const probes = {};
for (const ry of [6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74, 78, 82, 86, 90]) probes[ry] = hRunsAt(ry);

// color sampled along the vertical centerline and at specific probe points
function colorAt(x, y) {
  if (!inb(x, y)) return null;
  return hex([png.data[idx(x, y)], png.data[idx(x, y) + 1], png.data[idx(x, y) + 2]]);
}
const centerSamples = [];
for (const ry of [8, 14, 20, 26, 32, 38, 44, 50, 56, 62, 68, 74, 80, 86, 92]) {
  const y = Math.round(bbE.y0 + ry / 100 * bbE.h);
  centerSamples.push({ ry, c: colorAt(cx, y) });
}

const out = {
  imageSize: { W, H },
  bbAll, emblemBottom, wordTop, bbE, bbW,
  palette: [
    { name: 'deep royal blue', hex: hex(centroids[0]), share: +(100 * counts[0] / px.length).toFixed(1) },
    { name: 'medium blue', hex: hex(centroids[1]), share: +(100 * counts[1] / px.length).toFixed(1) },
    { name: 'light icy blue', hex: hex(centroids[2]), share: +(100 * counts[2] / px.length).toFixed(1) },
    { name: 'near-white', hex: hex(centroids[3]), share: +(100 * counts[3] / px.length).toFixed(1) }
  ],
  silhouetteRows: rows,
  centerlineRuns: vertRuns.map(rel),
  probes,
  centerSamples,
  cornerSamples: {
    topPlateTopLeft: colorAt(bbE.x0 + Math.round(bbE.w * 0.2), bbE.y0 + Math.round(bbE.h * 0.12)),
    midRight: colorAt(bbE.x0 + Math.round(bbE.w * 0.78), bbE.y0 + Math.round(bbE.h * 0.42)),
    botLeft: colorAt(bbE.x0 + Math.round(bbE.w * 0.16), bbE.y0 + Math.round(bbE.h * 0.62)),
    botBottom: colorAt(bbE.x0 + Math.round(bbE.w * 0.45), bbE.y0 + Math.round(bbE.h * 0.93))
  }
};
fs.writeFileSync('assets/analysis.json', JSON.stringify(out, null, 2));
console.log('image', W, 'x', H);
console.log('blocks:', JSON.stringify(blocks));
console.log('emblem bbox', JSON.stringify(bbE), 'emblemBottom=' + emblemBottom, 'wordmark bbox', JSON.stringify(bbW), 'wordTop=' + wordTop);
console.log('palette:', out.palette.map(p => p.name + ' ' + p.hex + ' ' + p.share + '%').join(' | '));
console.log('centerline runs (rel% of emblem height):', JSON.stringify(out.centerlineRuns));
console.log('corner samples:', JSON.stringify(out.cornerSamples));

// ---- wordmark crop with alpha (chroma-key white bg)
const pad = 12;
const cw = bbW.w + pad * 2, ch = bbW.h + pad * 2;
const outPng = new PNG({ width: cw, height: ch });
for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
  const sx = bbW.x0 - pad + x, sy = bbW.y0 - pad + y;
  const di = (cw * y + x) << 2;
  if (sx >= 0 && sy >= 0 && sx < W && sy < H) {
    const si = idx(sx, sy);
    let r = png.data[si], g = png.data[si + 1], b = png.data[si + 2];
    // estimate alpha from distance to white
    const m = Math.min(r, g, b);
    const alpha = Math.max(0, Math.min(255, Math.round(255 - m * 1.06)));
    // un-premultiply against white
    const a = alpha / 255;
    const rr = Math.round(255 - (255 - r) / Math.max(a, 1e-3));
    const gg = Math.round(255 - (255 - g) / Math.max(a, 1e-3));
    const bb2 = Math.round(255 - (255 - b) / Math.max(a, 1e-3));
    outPng.data[di] = Math.max(0, Math.min(255, rr));
    outPng.data[di + 1] = Math.max(0, Math.min(255, gg));
    outPng.data[di + 2] = Math.max(0, Math.min(255, bb2));
    outPng.data[di + 3] = alpha;
  }
}
fs.writeFileSync('assets/wordmark-alpha.png', PNG.sync.write(outPng));
console.log('wrote assets/wordmark-alpha.png', cw, 'x', ch);
