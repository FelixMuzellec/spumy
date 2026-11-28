// Phase 8 V3 — outil de vérification des notes de SPUMY face aux sorties (indicateurs K-01 à K-03, PF-34, V3-030).
// Méthodes de référence de la vérification des prévisions (OMM, groupe WWRP/WGNE) : score de Brier et Brier skill score
// contre la fréquence observée (référence naïve), pente de fiabilité (régression logistique du résultat sur le logit de
// la chance annoncée), discrimination (aire sous la courbe ROC, statistique de Mann-Whitney, ex æquo comptés pour moitié).
//
// Trois scores, trois épreuves séparées (référentiel, phase 8) : aucune ne sert de preuve indirecte pour une autre.
//   - chance de prise P(Y ≥ 1) : Brier, BSS, pente de fiabilité, AUC ;
//   - Favorabilité /100 : discrimination (AUC) et accord de rang avec les prises par heure, jamais un Brier (ce n'est pas
//     une probabilité) ;
//   - Confiance : la Confiance ne change jamais le rang ; on vérifie seulement que l'écart entre chance annoncée et
//     résultat est plus petit quand la Confiance est haute.
//
// Garde-fous (JRN-06, § 9.1.8, V-07, V-08) :
//   - seules comptent les sorties dont la note a été FIGÉE avant la sortie (instantané : note, Confiance, version du modèle) ;
//   - un résultat inconnu n'est jamais un zéro : il est écarté et compté à part ; une bredouille doit être déclarée ;
//   - aucune conclusion sous le seuil : 40 sorties notées au moins, dont 10 avec prise et 10 bredouilles déclarées ;
//   - aucune bredouille déclarée : biais de sélection, aucune mesure.
// Le journal de Félix est privé (PF-17) : l'outil lit un export HORS du dépôt et n'écrit rien ; il refuse un fichier
// placé dans le dépôt et n'imprime que des indicateurs agrégés (ni date, ni lieu, ni prise d'une sortie).
//   node scripts/calibration/verification.mjs <export.json hors du dépôt>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SEUILS = { sorties: 40, avecPrise: 10, bredouilles: 10 };
const fini = (x) => typeof x === "number" && Number.isFinite(x);
const r3 = (x) => (fini(x) ? Math.round(x * 1000) / 1000 : null);

/** Score de Brier : moyenne de (p − y)². */
export function brier(p, y) {
  if (!p.length || p.length !== y.length) throw new Error("séries vides ou de longueurs différentes");
  return p.reduce((s, x, i) => s + (x - y[i]) ** 2, 0) / p.length;
}

/** Brier skill score contre la fréquence observée de l'échantillon (référence naïve). null si la référence est parfaite. */
export function brierSkill(p, y) {
  const o = y.reduce((a, b) => a + b, 0) / y.length, ref = brier(y.map(() => o), y);
  return ref === 0 ? null : 1 - brier(p, y) / ref;
}

/** Aire sous la courbe ROC (Mann-Whitney) : chance qu'une sortie avec prise ait une note plus haute qu'une bredouille. */
export function auc(score, y) {
  const pos = score.filter((_, i) => y[i] === 1), neg = score.filter((_, i) => y[i] === 0);
  if (!pos.length || !neg.length) return null;
  let s = 0;
  for (const a of pos) for (const b of neg) s += a > b ? 1 : a === b ? 0.5 : 0;
  return s / (pos.length * neg.length);
}

/**
 * Pente de fiabilité : régression logistique y ~ a + b · logit(p), par Newton-Raphson. Une prévision bien calibrée a b = 1 ;
 * b < 1 : chances trop tranchées ; b > 1 : trop timides. null si l'ajustement ne converge pas (séparation parfaite).
 */
export function penteFiabilite(p, y, { iter = 100, eps = 1e-10 } = {}) {
  const x = p.map((v) => { const q = Math.min(1 - 1e-6, Math.max(1e-6, v)); return Math.log(q / (1 - q)); });
  let a = 0, b = 1;
  for (let it = 0; it < iter; it++) {
    let g0 = 0, g1 = 0, h00 = 0, h01 = 0, h11 = 0;
    for (let i = 0; i < x.length; i++) {
      const m = 1 / (1 + Math.exp(-(a + b * x[i]))), w = m * (1 - m), r = y[i] - m;
      g0 += r; g1 += r * x[i]; h00 += w; h01 += w * x[i]; h11 += w * x[i] * x[i];
    }
    const det = h00 * h11 - h01 * h01;
    if (!(Math.abs(det) > 1e-12)) return null;
    const da = (h11 * g0 - h01 * g1) / det, db = (h00 * g1 - h01 * g0) / det;
    a += da; b += db;
    if (!fini(a) || !fini(b) || Math.abs(b) > 1e3) return null;
    if (Math.abs(da) + Math.abs(db) < eps) return { intercept: a, pente: b };
  }
  return null;
}

/** Corrélation de rang de Spearman (ex æquo au rang moyen). */
export function spearman(xs, ys) {
  const rang = (v) => { const o = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]), r = new Array(v.length);
    for (let i = 0; i < o.length;) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++; for (let t = i; t <= j; t++) r[o[t][1]] = (i + j) / 2 + 1; i = j + 1; } return r; };
  const a = rang(xs), b = rang(ys), n = a.length, ma = (n + 1) / 2;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { num += (a[i] - ma) * (b[i] - ma); da += (a[i] - ma) ** 2; db += (b[i] - ma) ** 2; }
  return da && db ? num / Math.sqrt(da * db) : null;
}

/**
 * Tri des sorties. Une sortie : { noteFigee: true, favorabilite (0 à 100), chance (0 à 1, facultative : SPUMY n'en publie
 * pas, D6-12), confiance (0 à 100, facultative), resultat: "prise" | "bredouille" | "inconnu", prises (entier ≥ 0),
 * heures (> 0) }. Une sortie non figée, au résultat inconnu ou incohérente est écartée et comptée par raison.
 */
export function trier(sorties) {
  const gardees = [], ecartees = { nonFigee: 0, resultatInconnu: 0, incoherente: 0 };
  for (const s of Array.isArray(sorties) ? sorties : []) {
    if (!s || s.noteFigee !== true) { ecartees.nonFigee++; continue; }
    if (s.resultat !== "prise" && s.resultat !== "bredouille") { ecartees.resultatInconnu++; continue; }
    const prises = s.resultat === "bredouille" ? 0 : s.prises;
    if (!fini(s.favorabilite) || s.favorabilite < 0 || s.favorabilite > 100 || !Number.isInteger(prises) || prises < 0
        || (s.resultat === "prise") !== (prises > 0) || !(fini(s.heures) && s.heures > 0)
        || (s.chance != null && !(fini(s.chance) && s.chance >= 0 && s.chance <= 1))) { ecartees.incoherente++; continue; }
    gardees.push({ fav: s.favorabilite, chance: s.chance ?? null, confiance: fini(s.confiance) ? s.confiance : null, y: prises > 0 ? 1 : 0, prises, heures: s.heures });
  }
  return { gardees, ecartees };
}

/** Mesure complète. Renvoie un statut « insuffisant » (avec ce qui manque) tant que les seuils ne sont pas atteints. */
export function verifier(sorties, seuils = SEUILS) {
  const { gardees: G, ecartees } = trier(sorties);
  const avecPrise = G.filter((s) => s.y === 1).length, bredouilles = G.length - avecPrise;
  const base = { sorties: G.length, avecPrise, bredouilles, ecartees, seuils };
  const manque = [];
  if (G.length < seuils.sorties) manque.push(`${seuils.sorties - G.length} sorties notées de plus`);
  if (avecPrise < seuils.avecPrise) manque.push(`${seuils.avecPrise - avecPrise} sorties avec prise de plus`);
  if (bredouilles === 0) manque.push("aucune bredouille déclarée : biais de sélection, aucune mesure possible");
  else if (bredouilles < seuils.bredouilles) manque.push(`${seuils.bredouilles - bredouilles} bredouilles déclarées de plus`);
  if (manque.length) return { statut: "insuffisant", ...base, manque };
  const y = G.map((s) => s.y);
  // Favorabilité : discrimination et accord avec les prises par heure, jamais un Brier.
  const favorabilite = { auc: r3(auc(G.map((s) => s.fav), y)), spearmanPrisesParHeure: r3(spearman(G.map((s) => s.fav), G.map((s) => s.prises / s.heures))) };
  // Chance de prise : seulement si chaque sortie gardée en porte une (jamais déduite de la Favorabilité).
  let chance = { statut: "non mesurée : SPUMY ne publie pas de chance de prise (D6-12)" };
  if (G.every((s) => s.chance != null)) {
    const p = G.map((s) => s.chance), f = penteFiabilite(p, y);
    chance = { statut: "mesurée", brier: r3(brier(p, y)), brierSkill: r3(brierSkill(p, y)), penteFiabilite: f ? r3(f.pente) : null, auc: r3(auc(p, y)) };
  }
  // Confiance : écart moyen |p − y| par moitié de Confiance (haute contre basse), seulement si chance et Confiance existent.
  let confiance = { statut: "non mesurée : il faut une chance annoncée et une Confiance par sortie" };
  if (chance.statut === "mesurée" && G.every((s) => s.confiance != null)) {
    const tri = [...G].sort((a, b) => a.confiance - b.confiance), mi = Math.floor(tri.length / 2);
    const ecart = (l) => l.reduce((s, x) => s + Math.abs(x.chance - x.y), 0) / l.length;
    confiance = { statut: "mesurée", ecartConfianceBasse: r3(ecart(tri.slice(0, mi))), ecartConfianceHaute: r3(ecart(tri.slice(mi))) };
    confiance.coherente = confiance.ecartConfianceHaute <= confiance.ecartConfianceBasse;
  }
  return { statut: "mesuré", ...base, partBredouilles: r3(bredouilles / G.length), chance, favorabilite, confiance };
}

/** Garde-fou PF-17 : un export du journal placé dans le dépôt est refusé. */
export function dansLeDepot(fichier, racine) {
  // Liens symboliques résolus (un lien hors du dépôt vers un fichier du dépôt reste dans le dépôt) ; « ..x.json » n'est pas « .. ».
  const reel = (p) => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };
  const rel = path.relative(reel(racine), reel(fichier));
  return rel === "" || (rel !== ".." && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const f = process.argv[2];
  if (!f) { console.error("usage : node scripts/calibration/verification.mjs <export.json hors du dépôt>"); process.exit(2); }
  if (dansLeDepot(f, racine)) { console.error("refusé : le journal reste hors du dépôt (PF-17). Place l'export ailleurs."); process.exit(2); }
  const d = JSON.parse(fs.readFileSync(f, "utf8"));
  console.log(JSON.stringify(verifier(Array.isArray(d) ? d : d.sorties), null, 1));
}
