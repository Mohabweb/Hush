import fs from 'node:fs';
import { PNG } from 'pngjs';

const png = PNG.sync.read(fs.readFileSync('assets/reference-logo.png'));
const W = png.width, H = png.height;
const idx = (x, y) => (W * y + x) << 2;

// emblem bbox from analysis.json
const bbE = { x0: 340, y0: 243, x1: 940, y1: 858, w: 601, h: 616 };

// classes: R royal #1351cc, M medium #5ea3f7, I icy #abcffa, W white/near-white or bg
const refs = { R: [19, 81, 204], M: [94, 163, 247], I: [171, 207, 250], W: [236, 242, 248] };
function classify(r, g, b) {
  // background: near-neutral light
  const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
  if (mx - mn < 10 && mn > 228) return '.';
  let best = 'W', bd = 1e9;
  for (const [k, [rr, gg, bb]] of Object.entries(refs)) {
    const d = (r - rr) ** 2 + (g - gg) ** 2 + (b - bb) ** 2;
    if (d < bd) { bd = d; best = k; }
  }
  return best;
}

const COLS = 76, ROWS = 78;
let out = '';
for (let j = 0; j < ROWS; j++) {
  let row = '';
  for (let i = 0; i < COLS; i++) {
    const x = bbE.x0 + Math.round((i + 0.5) / COLS * bbE.w);
    const y = bbE.y0 + Math.round((j + 0.5) / ROWS * bbE.h);
    // majority in 3x3
    const tally = { R: 0, M: 0, I: 0, W: 0, '.': 0 };
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const c = classify(png.data[idx(x + dx, y + dy)], png.data[idx(x + dx, y + dy) + 1], png.data[idx(x + dx, y + dy) + 2]);
      tally[c]++;
    }
    row += Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
  }
  out += row + '\n';
}
console.log(out);
