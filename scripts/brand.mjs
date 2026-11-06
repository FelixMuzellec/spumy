// v9.1 — Identité SPUMY : une seule marque, déclinée par guide.
//
// La marque : un bar (Dicentrarchus labrax) de profil, tête à droite, qui bondit hors de l'écume.
// Ses traits distinctifs restent lisibles jusqu'à 29 px : première dorsale épineuse, seconde dorsale
// séparée, queue fourchue, opercule, grande bouche. Aucune écriture dans les icônes : le nom de
// l'application ou du guide s'affiche toujours à côté, en vrai texte (accueil, onglets, écran
// d'accueil du téléphone), donc toujours net et lisible par les lecteurs d'écran.
//
// Chaque guide garde la même marque ; seule la couleur de l'eau change (teintes marines, jamais les
// couleurs vert/orange/rouge réservées aux notes).

export const INK = "#f8fafc";
export const BG = ["#0d2b4a", "#030b17"];
export const APP_WATER = ["#22d3ee", "#0369a1"];
export const GUIDE_WATER = {
  logonna: ["#7dd3fc", "#0369a1"],
  pirou: ["#c4b5fd", "#6d28d9"],
  plouguerneau: ["#6ee7b7", "#047857"],
  audierne: ["#5eead4", "#0f766e"],
  carantec: ["#93c5fd", "#1d4ed8"],
  concarneau: ["#a5b4fc", "#4338ca"],
  crozon: ["#67e8f9", "#0e7490"],
};

const BASS = "M446,252 C434,236 414,226 388,220 C360,214 334,210 300,207 C262,205 214,209 178,220 C160,226 144,232 130,238"
  + " C108,222 86,206 62,188 C78,214 89,236 96,256 C89,276 78,298 62,324 C86,306 108,290 130,276"
  + " C160,288 200,298 250,302 C300,305 350,296 392,282 C420,272 438,264 448,258 C447,256 446,254 446,252 Z";
const FINS = [
  // première dorsale, épineuse
  "M342,212 L328,164 C322,184 316,194 310,201 L304,160 C298,180 292,192 286,200 L280,168 C275,184 270,194 264,203 L258,180 C254,192 251,201 248,209 Z",
  // seconde dorsale, molle
  "M246,209 L236,186 C222,186 204,194 186,216 Z",
  // anale
  "M214,298 L200,318 C192,312 184,302 176,292 Z",
];
// Écume le long de la crête, sous la queue (la « spume » du nom).
const FOAM = [[34, 352, 15], [60, 344, 19], [92, 342, 17], [120, 348, 13], [144, 356, 10], [166, 363, 7], [186, 368, 5],
  [78, 318, 7], [112, 304, 5.5], [52, 322, 4.5], [140, 326, 4]];

function mark(cut) {
  return `<g transform="translate(244 230) rotate(-20) translate(-256 -250)">`
    + `<g fill="${INK}"><path d="${BASS}"/>${FINS.map((d) => `<path d="${d}"/>`).join("")}</g>`
    + `<path d="M372 226 C358 244 358 268 374 286" fill="none" stroke="${cut}" stroke-width="8" stroke-linecap="round"/>`
    + `<path d="M446 257 L414 261" fill="none" stroke="${cut}" stroke-width="6" stroke-linecap="round"/>`
    + `<path d="M352 266 C338 268 326 276 318 288" fill="none" stroke="${cut}" stroke-width="6" stroke-linecap="round"/>`
    + `<circle cx="405" cy="240" r="10" fill="${cut}"/><circle cx="408" cy="237" r="3" fill="${INK}"/></g>`
    + `<path d="M-400 372 L-24 372 C44 344 98 342 152 360 C206 378 250 380 300 360 C350 340 402 338 452 356 C484 368 508 368 540 358 L900 358 L900 900 L-400 900 Z" fill="url(#water)"/>`
    + `<path d="M-400 424 L-24 424 C44 400 98 400 152 414 C206 430 250 432 300 414 C350 396 402 396 452 410 C484 420 508 420 540 412 L900 412" fill="none" stroke="${cut}" stroke-opacity=".28" stroke-width="12" stroke-linecap="round"/>`
    + `<g fill="${INK}">${FOAM.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>`;
}

/**
 * Icône SVG 512 × 512.
 * shape « rounded » : carte aux coins arrondis, fond transparent autour (icônes « any », favicon, cartes de l'accueil) ;
 * « square » : plein cadre (icône « maskable » d'Android, icône de l'écran d'accueil iOS, qui appliquent leur propre masque).
 * scale < 1 garde la marque dans la zone sûre des masques (cercle de 80 % pour « maskable »).
 */
export function iconSVG({ water = APP_WATER, shape = "rounded", scale = 1, size } = {}) {
  const rx = shape === "square" ? 0 : 114;
  const dim = size ? ` width="${size}" height="${size}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"${dim}>`
    + `<defs><radialGradient id="bg" cx="28%" cy="14%" r="100%"><stop offset="0" stop-color="${BG[0]}"/><stop offset="1" stop-color="${BG[1]}"/></radialGradient>`
    + `<linearGradient id="water" gradientUnits="userSpaceOnUse" x1="0" y1="340" x2="0" y2="560"><stop offset="0" stop-color="${water[0]}"/><stop offset="1" stop-color="${water[1]}"/></linearGradient>`
    + `<clipPath id="clip"><rect width="512" height="512" rx="${rx}"/></clipPath></defs>`
    + `<g clip-path="url(#clip)"><rect width="512" height="512" fill="url(#bg)"/>`
    + `<g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${mark(BG[1])}</g></g></svg>`;
}
