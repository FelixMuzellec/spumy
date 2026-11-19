// Phase 11 — Contrôle du système de design : contrastes WCAG des jetons, dans les deux thèmes.
//
// Lit src/design/ds/tokens.css, calcule le contraste de chaque paire texte / fond utilisée par les composants, échoue
// sous le seuil (4,5:1 pour le texte courant, 3:1 pour les chiffres et titres de 24 px et plus), et écrit les ratios du
// thème « Nuit marine » dans src/prototype/data/contrastes.json pour la planche du système de design.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const css = fs.readFileSync(path.join(root, "src/design/ds/tokens.css"), "utf8");
const block = (sel) => {
  const i = css.indexOf(sel);
  const body = css.slice(css.indexOf("{", i) + 1, css.indexOf("\n}", i));
  return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map((m) => [m[1], m[2]]));
};
const nuit = block(":root,\n[data-theme=\"nuit\"]");
const soleil = { ...nuit, ...block("[data-theme=\"soleil\"] {") };

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// [premier plan, fond, seuil, rôle]
const PAIRS = [
  ["--text-1", "--surface-solid", 4.5, "titres sur carte"], ["--text-2", "--surface-solid", 4.5, "texte courant sur carte"], ["--text-3", "--surface-solid", 4.5, "texte secondaire sur carte"],
  ["--text-1", "--bg-1", 4.5, "titres sur le fond"], ["--text-2", "--bg-1", 4.5, "texte sur le fond"], ["--text-3", "--bg-1", 4.5, "secondaire sur le fond"],
  ["--text-3", "--bg-2", 4.5, "libellé inactif de la barre du bas"], ["--text-3", "--surface-2", 4.5, "secondaire sur tuile active"],
  ["--accent-ink", "--surface-solid", 4.5, "lien et icône active sur carte"], ["--accent-ink", "--bg-2", 4.5, "onglet actif de la barre du bas"],
  ["--on-accent", "--accent", 4.5, "texte du bouton principal (début du dégradé)"], ["--on-accent", "--accent-2", 4.5, "texte du bouton principal (fin du dégradé)"],
  ["--warn-ink", "--surface-solid", 4.5, "« À vérifier », « À surveiller »"], ["--good-ink", "--surface-solid", 4.5, "vert discret"], ["--gold", "--surface-solid", 4.5, "« Notre conseil »"],
  ["--danger", "--surface-solid", 4.5, "erreur de données"], ["--text-1", "--surface-3", 4.5, "chiffre sur pastille non recommandée"],
];
const FIXED = [
  ["#ffffff", "--fav-1", 4.5, "chiffre sur pastille palier 1", "nuit"], ["#ffffff", "--fav-2", 4.5, "chiffre sur pastille palier 2", "nuit"], ["#04182f", "--fav-3", 4.5, "chiffre sur pastille palier 3", "nuit"],
  ["#04182f", "--fav-4", 4.5, "chiffre sur pastille palier 4", "nuit"], ["#04182f", "--fav-5", 4.5, "chiffre sur pastille palier 5", "nuit"],
  ["#eafff3", "--good-deep", 4.5, "puce « Recommandé »", "nuit"], ["#ffffff", "--good-deep", 4.5, "puce « Recommandé »", "soleil"],
];

let pass = 0, fail = 0;
const out = {};
const fmt = (r) => `${r.toFixed(1).replace(".", ",")}:1`;
for (const [theme, T] of [["nuit", nuit], ["soleil", soleil]]) {
  for (const [fg, bg, min, role] of PAIRS) {
    const r = ratio(T[fg], T[bg]);
    const ok = r >= min;
    ok ? pass++ : fail++;
    if (!ok) console.log(`✗ ${theme} ${fg} sur ${bg} (${role}) : ${fmt(r)} < ${min}`);
    if (theme === "nuit" && bg === "--surface-solid" && !out[fg]) out[fg] = `${fmt(r)} sur une carte`;
  }
}
for (const [fg, bg, min, role, theme] of FIXED) {
  const T = theme === "nuit" ? nuit : soleil;
  const r = ratio(fg, T[bg]);
  const ok = r >= min;
  ok ? pass++ : fail++;
  if (!ok) console.log(`✗ ${theme} ${fg} sur ${bg} (${role}) : ${fmt(r)} < ${min}`);
  if (theme === "nuit") out[bg] = `${fmt(r)} avec son chiffre`;
}
for (const k of ["--bg-0", "--bg-1", "--bg-2", "--surface-solid", "--surface-2"]) out[k] ||= `${fmt(ratio(nuit["--text-1"], nuit[k]))} avec les titres`;
for (const k of ["--accent", "--accent-2"]) out[k] = `${fmt(ratio(nuit["--on-accent"], nuit[k]))} avec le texte du bouton`;
fs.writeFileSync(path.join(root, "src/prototype/data/contrastes.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`[design] contrastes des jetons (Nuit marine, Plein soleil) : ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
