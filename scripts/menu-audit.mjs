// Prints seed menu counts for quick auditing.
// Usage: npx tsx scripts/menu-audit.mjs
import { MENU, ADD_ONS } from '../server/seed/menu.js';

let items = 0;
let variants = 0;
for (const c of MENU) {
  items += c.items.length;
  for (const i of c.items) variants += i.variants.length;
}
console.log(`categories: ${MENU.length}`);
console.log(`items: ${items}`);
console.log(`variants: ${variants}`);
console.log(`add-ons: ${ADD_ONS.length}`);
