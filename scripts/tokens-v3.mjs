// Génère src/design/v3/tokens.css depuis src/design/v3/tokens.js (source unique des jetons V3).
// Usage : node scripts/tokens-v3.mjs [--check]   (--check : échoue si le fichier CSS n'est pas à jour)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as T from "../src/design/v3/tokens.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "src/design/v3/tokens.css");
const kebab = (k) => k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
const decl = (obj, prefix = "") => Object.entries(obj).map(([k, v]) => `  --${prefix}${kebab(String(k))}: ${v};`).join("\n");

export function css() {
  const tiers = T.TIERS.map((t) => `  --tier-${t.id}: ${t.hex}; /* ${t.min}–${t.max} · ${t.word} */`).join("\n");
  const ty = T.TYPE;
  return `/* SPUMY V3 — jetons de design. FICHIER GÉNÉRÉ par scripts/tokens-v3.mjs depuis src/design/v3/tokens.js : ne pas modifier à la main.
 * Statuts et règles : docs/design/DESIGN-SYSTEM-V3.md. Thème : celui du système par défaut ; [data-theme] l'impose.
 */
:root {
  color-scheme: light;
  /* Marque, PROTÉGÉ : jamais redéfini par un thème, un filtre ou une transparence. */
  --brand-logo-orange: ${T.BRAND.brandLogoOrange};
  /* Palette principale, APPROUVÉ. */
${decl(T.PALETTE, "palette-")}
  /* Paliers des jauges et des pastilles (RÈGLE § 6.7.5.1 ; valeurs PROPOSITION À TESTER). */
${tiers}
  /* Typographie, espacements, rayons, élévations, mouvement, cibles (PROPOSITION À TESTER). */
  --font-text: ${ty.fontText};
  --font-numeric: ${ty.fontNumeric};
  --font-brand: ${ty.fontBrand};
  --brand-tracking: ${ty.brandTracking};
${Object.entries(ty.size).map(([k, v]) => `  --fs-${kebab(k)}: ${v}px;`).join("\n")}
${Object.entries(ty.lineHeight).map(([k, v]) => `  --lh-${k}: ${v};`).join("\n")}
${Object.entries(ty.weight).map(([k, v]) => `  --fw-${k}: ${v};`).join("\n")}
${Object.entries(T.SPACE).map(([k, v]) => `  --sp-${k}: ${v}px;`).join("\n")}
${Object.entries(T.RADIUS).map(([k, v]) => `  --r-${k}: ${v}px;`).join("\n")}
${Object.entries(T.ELEVATION).map(([k, v]) => `  --elev-${k}: ${v};`).join("\n")}
  --t-fast: ${T.MOTION.fast}ms; --t-base: ${T.MOTION.base}ms; --t-slow: ${T.MOTION.slow}ms; --ease: ${T.MOTION.ease};
  --touch: ${T.TOUCH.min}px; --touch-main: ${T.TOUCH.main}px;
  --gutter: ${T.LAYOUT.gutter}px; --reading-max: ${T.LAYOUT.readingMax}px; --desktop-list: ${T.LAYOUT.desktopList}px; --nav-height: ${T.LAYOUT.navHeight}px;
  /* Thème clair (défaut). */
${decl(T.THEMES.light)}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
${decl(T.THEMES.dark).replace(/^ {2}/gm, "    ")}
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
${decl(T.THEMES.dark)}
}
@media (prefers-reduced-motion: reduce) {
  :root { --t-fast: 0ms; --t-base: 0ms; --t-slow: 0ms; }
}
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const want = css();
  if (process.argv.includes("--check")) {
    const have = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
    if (have !== want) { console.error("tokens.css n'est pas à jour : node scripts/tokens-v3.mjs"); process.exit(1); }
    console.log("tokens.css à jour");
  } else {
    fs.writeFileSync(out, want);
    console.log("écrit", path.relative(root, out));
  }
}
