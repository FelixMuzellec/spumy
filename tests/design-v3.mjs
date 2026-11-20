// Phase 3 V3 — contrôle du Design System V3 (src/design/v3/tokens.js et tokens.css).
//
// 1. Palette approuvée et jeton protégé du logo BRAND : valeurs exactes, jamais redéfinies par un thème.
// 2. Aucun cyan ni turquoise structurant (§ 6.2).
// 3. Paliers des jauges (§ 6.7.5.1) : bornes 0, 19, 20, 39, 40, 59, 60, 74, 75, 89, 90, 100 ; hors bornes et non-nombres
//    sans note ; arrondi de la valeur affichée ; largeur remplie = valeur affichée ; libellés de la fixture § 6.7.2.
// 4. Contrastes WCAG 2.2 de chaque association texte / fond et composant / fond déclarée, dans les deux thèmes.
//    Seuils : 4,5:1 texte courant ; 3:1 grand texte, icônes, contours et repères (1.4.11).
// 5. tokens.css à jour (généré depuis tokens.js).
// Écrit les ratios dans docs/design/contrastes-v3.json (tables de DESIGN-SYSTEM-V3.md).
// Usage : node tests/design-v3.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as T from "../src/design/v3/tokens.js";
import { css } from "../scripts/tokens-v3.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let ok = 0, fail = 0;
const t = (name, cond, info = "") => { if (cond) ok++; else { fail++; console.log(`   ÉCHEC · ${name}${info ? " — " + info : ""}`); } };

// --- couleurs ---
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lum = (hex) => {
  const c = rgb(hex).map((v) => v / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const hsl = (hex) => {
  const [r, g, b] = rgb(hex).map((v) => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  const l = (mx + mn) / 2; const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0; if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
};
const isHex = (v) => typeof v === "string" && /^#[0-9A-Fa-f]{6}$/.test(v);

// 1. Palette et marque.
t("palette : accent #F07824", T.PALETTE.accentOrange === "#F07824");
t("palette : marine #172B3A", T.PALETTE.navy === "#172B3A");
t("palette : ardoise #344B5A", T.PALETTE.slate === "#344B5A");
t("palette : blanc cassé #F3F1EB", T.PALETTE.offWhite === "#F3F1EB");
t("marque : brand-logo-orange = #C76A31 (mesuré sur la source)", T.BRAND.brandLogoOrange === "#C76A31");
t("marque : brand-logo-orange distinct de l'accent d'interface", T.BRAND.brandLogoOrange !== T.PALETTE.accentOrange);
for (const [name, th] of Object.entries(T.THEMES)) {
  t(`thème ${name} : ne redéfinit aucun jeton de marque`, !Object.keys(th).some((k) => /brand/i.test(k)));
  t(`thème ${name} : n'emploie pas l'orange du logo`, !Object.values(th).includes(T.BRAND.brandLogoOrange));
}
const cssText = css();
t("tokens.css : --brand-logo-orange déclaré une seule fois", (cssText.match(/--brand-logo-orange:/g) || []).length === 1);
const onDisk = fs.readFileSync(path.join(root, "src/design/v3/tokens.css"), "utf8");
t("tokens.css à jour (node scripts/tokens-v3.mjs)", onDisk === cssText);

// 2. Pas de cyan ni de turquoise structurant : teinte 160–200° et saturation > 0,35 interdites dans les thèmes.
for (const [name, th] of Object.entries(T.THEMES)) {
  for (const [k, v] of Object.entries(th)) {
    if (!isHex(v)) continue;
    const { h, s } = hsl(v);
    t(`thème ${name} : ${k} n'est pas cyan ni turquoise`, !(h >= 160 && h <= 200 && s > 0.35), `${v} teinte ${h.toFixed(0)}°, saturation ${s.toFixed(2)}`);
  }
}
for (const tr of T.TIERS) { const { h, s } = hsl(tr.hex); t(`palier ${tr.id} : pas cyan ni turquoise`, !(h >= 160 && h <= 200 && s > 0.35)); }

// 3. Paliers.
const expect = { 0: 0, 19: 0, 20: 1, 39: 1, 40: 2, 59: 2, 60: 3, 74: 3, 75: 4, 89: 4, 90: 5, 100: 5 };
for (const [v, id] of Object.entries(expect)) t(`borne ${v} → palier ${id}`, T.tierOf(Number(v))?.id === id, String(T.tierOf(Number(v))?.id));
for (const v of [-1, 101, NaN, Infinity, null, undefined, "72", {}]) t(`sans note : ${String(v)}`, T.tierOf(v) === null && T.gaugeWidth(v) === 0);
t("arrondi : 19,4 → palier 0", T.tierOf(19.4)?.id === 0);
t("arrondi : 19,5 s'affiche 20 → palier 1", T.displayValue(19.5) === 20 && T.tierOf(19.5)?.id === 1);
t("arrondi : 100,4 → 100 ; -0,4 → 0", T.displayValue(100.4) === 100 && T.displayValue(-0.4) === 0);
for (const v of [0, 19, 20, 53, 69, 100]) t(`largeur remplie = valeur affichée (${v})`, T.gaugeWidth(v) === v);
t("paliers contigus de 0 à 100", T.TIERS.every((x, i) => (i === 0 ? x.min === 0 : x.min === T.TIERS[i - 1].max + 1)) && T.TIERS.at(-1).max === 100);
t("six familles du référentiel", T.TIERS.map((x) => x.family).join() === "anthracite,rouge,orange,jaune,vert,bleu");
t("couleurs des paliers toutes différentes", new Set(T.TIERS.map((x) => x.hex)).size === 6);
t("fixture : « 53/100 — À vérifier »", T.favorabilityLabel(53, { status: "verify" }) === "53/100 — À vérifier");
t("fixture : « 69/100 — Moyenne »", T.confidenceLabel(69, "Moyenne") === "69/100 — Moyenne");
t("libellé : 72 → « 72/100 — Bon »", T.favorabilityLabel(72) === "72/100 — Bon");
t("libellé : sans note", T.favorabilityLabel(null) === "Sans note");
t("le statut « À vérifier » ne change pas la couleur du palier", T.tierOf(53)?.id === 2);
for (const tr of T.TIERS) {
  const ink = T.PALETTE[T.TIER_INK[tr.id]], other = T.PALETTE[T.TIER_INK[tr.id] === "navy" ? "offWhite" : "navy"];
  t(`palier ${tr.id} : chiffre de 19 px gras lisible sur le disque (3:1)`, ratio(ink, tr.hex) >= 3, ratio(ink, tr.hex).toFixed(2));
  t(`palier ${tr.id} : l'encre choisie est la plus contrastée`, ratio(ink, tr.hex) >= ratio(other, tr.hex));
}
t("Favorables : seuil 75 (V3-021)", T.FAVORABLE_MIN === 75 && T.FAVORABLE_MIN === T.TIERS[4].min);
t("Favorables : 74 non, 75 oui", !T.isFavorable(74, { safetyOk: true }) && T.isFavorable(75, { safetyOk: true }));
t("Favorables : 74,5 s'affiche 75, donc oui", T.isFavorable(74.5, { safetyOk: true }));
t("Favorables : jamais sans sécurité permise", !T.isFavorable(90, {}) && !T.isFavorable(90, { safetyOk: false }));
t("Favorables : jamais « à vérifier » ni « non recommandé »", !T.isFavorable(90, { safetyOk: true, status: "verify" }) && !T.isFavorable(90, { safetyOk: true, status: "nr" }));
t("Favorables : sans note, non", !T.isFavorable(null, { safetyOk: true }));

// 4. Contrastes. [premier plan, fond, seuil, rôle]
const PAIRS = {
  light: [
    ["textPrimary", "bgApp", 4.5, "texte principal sur le fond"], ["textPrimary", "surfaceCard", 4.5, "texte principal sur carte"],
    ["textPrimary", "surfaceSunken", 4.5, "texte dans un champ"],
    ["textSecondary", "bgApp", 4.5, "texte secondaire sur le fond"], ["textSecondary", "surfaceCard", 4.5, "texte secondaire sur carte"],
    ["textMuted", "bgApp", 4.5, "texte discret sur le fond"], ["textMuted", "surfaceCard", 4.5, "texte discret sur carte"], ["textMuted", "surfaceSunken", 4.5, "aide de champ"],
    ["textOnInverse", "surfaceInverse", 4.5, "navigation : libellés"], ["accent", "surfaceInverse", 3, "navigation : repère actif orange"],
    ["textOnAccent", "accent", 4.5, "bouton principal : texte marine sur orange"],
    ["accentInk", "surfaceCard", 4.5, "lien et icône active sur carte"], ["accentInk", "bgApp", 4.5, "lien sur le fond"],
    ["focusRing", "bgApp", 3, "anneau de focus sur le fond"], ["focusRing", "surfaceCard", 3, "anneau de focus sur carte"],
    ["borderStrong", "surfaceCard", 3, "contour de champ et de bouton secondaire"], ["borderStrong", "bgApp", 3, "contour sur le fond"],
    ["successInk", "successSoft", 4.5, "succès sur sa pastille"], ["successInk", "surfaceCard", 4.5, "succès sur carte"],
    ["warningInk", "warningSoft", 4.5, "avertissement sur sa pastille"], ["warningInk", "surfaceCard", 4.5, "avertissement sur carte"],
    ["dangerInk", "dangerSoft", 4.5, "danger sur sa pastille"], ["dangerInk", "surfaceCard", 4.5, "danger sur carte"],
    ["infoInk", "infoSoft", 4.5, "information sur sa pastille"], ["infoInk", "surfaceCard", 4.5, "information sur carte"],
    ["gaugeIndex", "gaugeTrack", 3, "repère de valeur de la jauge sur sa piste"],
  ],
  dark: [
    ["textPrimary", "bgApp", 4.5, "texte principal sur le fond"], ["textPrimary", "surfaceCard", 4.5, "texte principal sur carte"],
    ["textPrimary", "surfaceSunken", 4.5, "texte dans un champ"],
    ["textSecondary", "bgApp", 4.5, "texte secondaire sur le fond"], ["textSecondary", "surfaceCard", 4.5, "texte secondaire sur carte"],
    ["textMuted", "bgApp", 4.5, "texte discret sur le fond"], ["textMuted", "surfaceCard", 4.5, "texte discret sur carte"], ["textMuted", "surfaceSunken", 4.5, "aide de champ"],
    ["textOnInverse", "surfaceInverse", 4.5, "navigation : libellés"], ["accent", "surfaceInverse", 3, "navigation : repère actif orange"],
    ["textOnAccent", "accent", 4.5, "bouton principal : texte marine sur orange"],
    ["accentInk", "bgApp", 4.5, "lien orange sur le fond marine"], ["accentInk", "surfaceCard", 3, "icône active orange sur carte (pas de petit texte)"],
    ["focusRing", "bgApp", 3, "anneau de focus sur le fond"], ["focusRing", "surfaceCard", 3, "anneau de focus sur carte"],
    ["borderStrong", "surfaceCard", 3, "contour de champ sur carte"], ["borderStrong", "bgApp", 3, "contour sur le fond"],
    ["successInk", "successSoft", 4.5, "succès sur sa pastille"], ["successInk", "surfaceCard", 4.5, "succès sur carte"],
    ["warningInk", "warningSoft", 4.5, "avertissement sur sa pastille"], ["warningInk", "surfaceCard", 4.5, "avertissement sur carte"],
    ["dangerInk", "dangerSoft", 4.5, "danger sur sa pastille"], ["dangerInk", "surfaceCard", 4.5, "danger sur carte"],
    ["infoInk", "infoSoft", 4.5, "information sur sa pastille"], ["infoInk", "surfaceCard", 4.5, "information sur carte"],
    ["gaugeIndex", "gaugeTrack", 3, "repère de valeur de la jauge sur sa piste"],
  ],
};
const report = { genere: "tests/design-v3.mjs", themes: {}, paliers: {}, anneau: null };
for (const [name, pairs] of Object.entries(PAIRS)) {
  const th = T.THEMES[name]; report.themes[name] = [];
  for (const [fg, bg, min, role] of pairs) {
    const r = ratio(th[fg], th[bg]);
    report.themes[name].push({ role, fg, bg, fgHex: th[fg], bgHex: th[bg], ratio: Math.round(r * 100) / 100, seuil: min, ok: r >= min });
    t(`${name} : ${role} (${th[fg]} sur ${th[bg]})`, r >= min, `${r.toFixed(2)}:1 < ${min}:1`);
  }
}
// Paliers : information, pas un échec. La valeur et le libellé accompagnent toujours la couleur (§ 6.7.5.1).
for (const [name, th] of Object.entries(T.THEMES)) {
  report.paliers[name] = T.TIERS.map((x) => ({ palier: x.id, hex: x.hex, surFond: +ratio(x.hex, th.bgApp).toFixed(2), surCarte: +ratio(x.hex, th.surfaceCard).toFixed(2), surPiste: +ratio(x.hex, th.gaugeTrack).toFixed(2) }));
}
// Anneau double des pastilles : contre n'importe quel fond de carte, l'un des deux anneaux atteint √(rapport entre eux).
const ring = ratio(T.THEMES.light.markerRingInner, T.THEMES.light.markerRingOuter);
report.anneau = { interieur: T.THEMES.light.markerRingInner, exterieur: T.THEMES.light.markerRingOuter, rapport: +ring.toFixed(2), minimumGaranti: +Math.sqrt(ring).toFixed(2) };
t("pastilles : l'anneau double garantit 3:1 sur tout fond de carte", Math.sqrt(ring) >= 3, Math.sqrt(ring).toFixed(2));
for (let g = 0; g <= 255; g += 15) {
  const bg = "#" + [g, g, g].map((v) => v.toString(16).padStart(2, "0")).join("");
  const best = Math.max(ratio(report.anneau.interieur, bg), ratio(report.anneau.exterieur, bg));
  if (best < 3) t(`pastilles : anneau visible sur ${bg}`, false, best.toFixed(2));
}

fs.writeFileSync(path.join(root, "docs/design/contrastes-v3.json"), JSON.stringify(report, null, 1) + "\n");
console.log(`[design v3] jetons, paliers et contrastes : ${ok}/${ok + fail}`);
process.exit(fail ? 1 : 0);
