// v9.1 — Dessine toutes les icônes SPUMY à partir de scripts/brand.mjs (à relancer seulement si la marque change ;
// les SVG sources et les PNG produits sont versionnés dans assets/).
//   assets/brand/spumy.svg, assets/brand/<guide>.svg   sources vectorielles
//   icon-192.png, icon-512.png   coins arrondis, fond transparent (« any »)
//   icon-maskable.png            plein cadre, marque dans le cercle de 80 % qu'Android ne rogne jamais
//   apple-touch-icon.png         180 px plein cadre (iOS applique son propre arrondi)
//   <guide>-192.png              icône d'un guide (favicon, accueil, raccourcis Android)
// Usage : node scripts/icons.mjs
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { GUIDE_WATER, iconSVG } from "./brand.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const A = (f) => path.join(root, "assets", f);
fs.mkdirSync(A("brand"), { recursive: true });
fs.writeFileSync(A("brand/spumy.svg"), iconSVG() + "\n");
for (const [k, water] of Object.entries(GUIDE_WATER)) fs.writeFileSync(A(`brand/${k}.svg`), iconSVG({ water }) + "\n");

const jobs = [
  ["icon-192.png", iconSVG(), 192],
  ["icon-512.png", iconSVG(), 512],
  ["icon-maskable.png", iconSVG({ shape: "square", scale: 0.82 }), 512],
  ["apple-touch-icon.png", iconSVG({ shape: "square", scale: 0.9 }), 180],
  ...Object.entries(GUIDE_WATER).map(([k, water]) => [`${k}-192.png`, iconSVG({ water }), 192]),
];
const browser = await chromium.launch();
for (const [name, svg, size] of jobs) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path: A(name), omitBackground: true });
  await page.close();
  console.log(name, size);
}
await browser.close();
