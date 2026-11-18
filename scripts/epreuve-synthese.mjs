// Phase 8 — Synthèse de plusieurs passages Monte Carlo (scripts/epreuve-mc.mjs, un fichier par lot de guides) :
// mêmes mesures sur l'ensemble des journées-guides, et un tableau par guide.
// Usage : node scripts/epreuve-synthese.mjs <résultat.json> [<résultat.json>…]
import fs from "node:fs";
import { HYP, INPUTS } from "./epreuve-params.mjs";

const files = process.argv.slice(2);
const runs = files.map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
const guides = Object.assign({}, ...runs.map((r) => r.guides));
const keys = runs[0].keys;
const all = Object.values(guides).flatMap((g) => g.days.filter((x) => !x.skipped));
const m = (f, xs = all) => xs.reduce((a, x) => a + f(x), 0) / Math.max(1, xs.length);
const label = Object.fromEntries([...HYP, ...INPUTS].map((h) => [h.k, h]));
const p = (x) => `${(100 * x).toFixed(1)} %`;
console.log(`[synthèse · ${runs[0].mode} · ${runs[0].N} tirages] ${all.length} journées-guides`);
console.log(`  premier inchangé ${p(m((x) => x.p1))} (dans le groupe d'égalité ${p(m((x) => x.p1t))}) · trois premiers inchangés ${p(m((x) => x.p3))} (${p(m((x) => x.p3t))})`);
console.log(`  journées où les trois premiers tiennent dans 80 % des tirages : ${all.filter((x) => x.p3 >= 0.8).length} (à égalité près : ${all.filter((x) => x.p3t >= 0.8).length})`);
const bands = all.flatMap((x) => Object.values(x.band).filter((b) => b != null));
console.log(`  Spearman ${m((x) => x.spearman ?? 0).toFixed(2)} · palier inchangé ${p(bands.reduce((a, b) => a + b, 0) / Math.max(1, bands.length))} · premier et deuxième à 3 points ou moins : ${all.filter((x) => x.gap12 <= 3).length}`);
const close = all.filter((x) => x.gap12 <= 3), clear = all.filter((x) => x.gap12 > 3);
console.log(`  premier inchangé quand l'écart au deuxième dépasse 3 points : ${p(m((x) => x.p1, clear))} (${clear.length} j.) ; à 3 points ou moins : ${p(m((x) => x.p1, close))} (${close.length} j.)`);
console.log("  part de la variance de la favorabilité :");
for (const k of [...keys].sort((a, b) => m((x) => x.share[b]) - m((x) => x.share[a]))) {
  const h = label[k], v = m((x) => x.share[k]);
  console.log(`    ${p(v).padStart(7)}  ${h.label}${h.niveau ? ` (niveau ${h.niveau})` : " (entrée)"}${h.niveau >= 4 && v > 0.3 ? "  ⚠ plus de 30 %" : ""}`);
}
console.log("  ce qui fait changer le premier :");
for (const k of [...keys].sort((a, b) => m((x) => x.flipC[b]) - m((x) => x.flipC[a])).slice(0, 6)) console.log(`    ${m((x) => x.flipC[k]).toFixed(2)}  ${label[k].label}`);
console.log("  par guide (journées · premier inchangé · à égalité près · trois premiers · à égalité près · Spearman) :");
for (const [g, v] of Object.entries(guides)) {
  const d = v.days.filter((x) => !x.skipped);
  console.log(`    ${g.padEnd(13)} ${String(d.length).padStart(3)} · ${p(m((x) => x.p1, d))} · ${p(m((x) => x.p1t, d))} · ${p(m((x) => x.p3, d))} · ${p(m((x) => x.p3t, d))} · ${m((x) => x.spearman ?? 0, d).toFixed(2)}`);
}
