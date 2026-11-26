// Phase 8 V3 — jeux de test SYNTHÉTIQUES de la calibration et de l'apprentissage du journal. Aucune sortie réelle : des
// sorties tirées d'un modèle connu, pour vérifier que les outils retrouvent ce qu'on y a mis, et mesurer ce que coûtent
// les défauts d'un vrai journal (bredouilles non notées, résultats inconnus, prise isolée, peu de sorties par poste).
// Ce n'est jamais une preuve que SPUMY prédit des prises : seulement que la mesure est juste quand les données existeront.
// Sortie déterministe : data/moteur-bord/calibration-synthetique.json.
//   node scripts/calibration/journal-synthetique.mjs            écrit le fichier
//   node scripts/calibration/journal-synthetique.mjs --verifier  recalcule et compare (code 1 si écart)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brier, brierSkill, auc, penteFiabilite, verifier } from "./verification.mjs";
import { alea, tirerZINB, thetaPosterieur, thetaRatio, zeroStructurel, psiBeta } from "../etude-moteur-bord/zinb.mjs";
import { fitModel, predictRate, scoreOf, MIN_TRIPS } from "../../src/bateau/offshore.js";
import { spearman } from "./verification.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SORTIE = path.join(root, "data/moteur-bord/calibration-synthetique.json");
const r3 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 1000) / 1000);
const moy = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const logit = (p) => Math.log(p / (1 - p)), sig = (x) => 1 / (1 + Math.exp(-x));

/** C1 : prévisionnistes connus (calibré, trop tranché, sans compétence), à 40, 120 et 400 sorties ; 200 répétitions. */
function c1() {
  const u = alea(88001), out = [];
  for (const N of [40, 120, 400]) {
    const R = { calibre: [], tranche: [], sansCompetence: [] };
    for (let r = 0; r < 200; r++) {
      const vrai = Array.from({ length: N }, () => 0.1 + 0.7 * u()), y = vrai.map((p) => (u() < p ? 1 : 0));
      const base = moy(vrai);
      for (const [nom, p] of [["calibre", vrai], ["tranche", vrai.map((v) => sig(2 * logit(v)))], ["sansCompetence", vrai.map(() => base)]]) {
        const f = penteFiabilite(p, y);
        R[nom].push({ bss: brierSkill(p, y), pente: f ? f.pente : null, auc: auc(p, y), brier: brier(p, y) });
      }
    }
    const q = (a, x) => { const b = a.filter((v) => v != null).sort((m, n) => m - n); return b[Math.floor(x * (b.length - 1))]; };
    const res = (l, k) => ({ mediane: r3(q(l.map((x) => x[k]), 0.5)), q05: r3(q(l.map((x) => x[k]), 0.05)), q95: r3(q(l.map((x) => x[k]), 0.95)) });
    out.push({ sorties: N, ...Object.fromEntries(Object.entries(R).map(([k, l]) => [k, { bss: res(l, "bss"), pente: res(l, "pente"), auc: res(l, "auc"),
      partBssPositif: r3(l.filter((x) => x.bss > 0).length / l.length), partPenteDansLaBarre: r3(l.filter((x) => x.pente != null && x.pente >= 0.8 && x.pente <= 1.2).length / l.length) }])) });
  }
  return out;
}

/** C2 : biais de sélection. Un prévisionniste calibré, mais seules 30 % des bredouilles sont notées. */
function c2() {
  const u = alea(88002), N = 400, R = 200, full = [], biais = [], freq = [], freqB = [];
  for (let r = 0; r < R; r++) {
    const p = Array.from({ length: N }, () => 0.1 + 0.7 * u()), y = p.map((v) => (u() < v ? 1 : 0));
    const k = y.map((v) => v === 1 || u() < 0.3);
    const pb = p.filter((_, i) => k[i]), yb = y.filter((_, i) => k[i]);
    full.push(penteFiabilite(p, y)?.intercept ?? null); biais.push(penteFiabilite(pb, yb)?.intercept ?? null);
    freq.push(moy(y)); freqB.push(moy(yb));
  }
  return { lecture: "ordonnée de la droite de fiabilité (0 si calibré) et fréquence de prise apparente, journal complet contre journal sans 70 % des bredouilles",
    ordonneeComplet: r3(moy(full.filter((x) => x != null))), ordonneeSelection: r3(moy(biais.filter((x) => x != null))),
    frequenceComplet: r3(moy(freq)), frequenceSelection: r3(moy(freqB)) };
}

/** C3 : apprentissage de θ_x (multiplicateur du poste) avec ZINB (ψ = 0,6, k = 2, θ vrai = 1). */
function c3() {
  const psi = 0.6, k = 2, b0 = 2, u = alea(88003);
  const tirer = (N) => Array.from({ length: N }, () => { const Lbase = 0.45 * (1 + 3 * u()); return { Lbase, y: tirerZINB(u, psi, Lbase, k) }; });
  const travail = (S) => { let th = 1, q = []; for (let it = 0; it < 50; it++) { q = S.map((s) => (s.y > 0 ? 1 : 1 - zeroStructurel(psi, th * s.Lbase, k))); th = thetaRatio(b0, S.map((s, i) => ({ ...s, q: q[i] }))); } return th; };
  // a. Zéros explicites contre zéros absents (bredouilles non notées) et résultats inconnus lus comme des zéros.
  const a = { complet: [], sansZeros: [], inconnusEnZeros: [] };
  for (let r = 0; r < 200; r++) {
    const S = tirer(40);
    a.complet.push(travail(S));
    const sz = S.filter((s) => s.y > 0); if (sz.length) a.sansZeros.push(travail(sz));
    // 10 sorties de plus au résultat inconnu ; en réalité, des sorties ordinaires (même loi) ; comptées à tort comme bredouilles.
    const inc = tirer(10).map((s) => ({ ...s, y: 0 })); a.inconnusEnZeros.push(travail([...S, ...inc]));
  }
  // b. Prise isolée : 9 bredouilles et une sortie à 6 prises, contre 10 bredouilles.
  const iso = (ys) => { const S = ys.map((y) => ({ y, Lbase: 0.9 })); const p = thetaPosterieur(b0, S, { psi, k, max: 20, pas: 0.005 }); return { moyenne: r3(p.moyenne), q05: r3(p.q05), q95: r3(p.q95) }; };
  // c. Stabilité de l'intervalle de θ_x selon le nombre de sorties d'un poste ; d. surapprentissage : dix postes identiques
  //    (θ = 1 partout), combien semblent « meilleurs » ou « moins bons » sur leur seule moyenne.
  const c = [], d = [];
  for (const N of [3, 5, 10, 20, 40, 80]) {
    const L = [], ecarts = [];
    for (let r = 0; r < 30; r++) { const p = thetaPosterieur(b0, tirer(N), { psi, k, max: 20, pas: 0.01 }); L.push(p.q95 - p.q05); }
    for (let r = 0; r < 30; r++) { const m = Array.from({ length: 10 }, () => thetaPosterieur(b0, tirer(N), { psi, k, max: 20, pas: 0.01 }).moyenne); ecarts.push(Math.max(...m) - Math.min(...m)); }
    c.push({ sortiesParPoste: N, largeurIntervalle90Mediane: r3([...L].sort((x, y) => x - y)[15]) });
    d.push({ sortiesParPoste: N, ecartFauxEntreDixPostesIdentiques: r3([...ecarts].sort((x, y) => x - y)[15]) });
  }
  // e. ψ (part des sorties où le bar est là) : posterior Beta(2, 2) avec q, à 10 et 80 sorties.
  const e = [10, 80, 400].map((N) => { const v = Array.from({ length: 50 }, () => { const S = tirer(N), q = S.map((s) => (s.y > 0 ? 1 : 1 - zeroStructurel(psi, s.Lbase, k))); return psiBeta(2, 2, S.map((s, i) => ({ ...s, q: q[i] }))); });
    return { sorties: N, psiVrai: psi, psiEstimeMoyen: r3(moy(v)), psiMin: r3(Math.min(...v)), psiMax: r3(Math.max(...v)) }; });
  // f. Saison : sorties d'été seulement (Λ_base porte déjà la saison), puis θ appliqué l'hiver. Si la saison est comptée deux
  //    fois (Λ_base sans saison, θ l'apprend), θ d'été surestime l'hiver d'autant (D6-13).
  const ete = Array.from({ length: 80 }, () => { const Lbase = 0.9 * (1 + u()); return { Lbase, y: tirerZINB(u, psi, Lbase, k) }; });
  const f = { thetaAvecSaisonDansLambda: r3(travail(ete)), thetaSiSaisonOubliee: r3(travail(ete.map((s) => ({ ...s, Lbase: s.Lbase / 1.8 })))),
    lecture: "θ vrai = 1 ; une saison oubliée dans Λ_base est apprise par θ (environ 1,8 ici), et serait appliquée telle quelle l'hiver" };
  return { psi, k, thetaVrai: 1,
    a_zerosEtInconnus: { complet: r3(moy(a.complet)), sansZeros: r3(moy(a.sansZeros)), inconnusEnZeros: r3(moy(a.inconnusEnZeros)) },
    b_priseIsolee: { dixBredouilles: iso(Array(10).fill(0)), neufBredouillesEtSixPrises: iso([...Array(9).fill(0), 6]) },
    c_intervalleSelonSorties: c, d_surapprentissageParPoste: d, e_psi: e, f_saison: f };
}

/**
 * C5 : le modèle BATEAU V2 (src/bateau/offshore.js, régression de Poisson pénalisée « d'après tes sorties »), éprouvé seul,
 * sans lui appliquer le moteur BORD. Vérité connue : le taux de prise dépend du vent (effet négatif) et du coefficient
 * (positif) ; dix autres variables n'ont aucun effet. Mesures hors échantillon (sorties tirées à part).
 */
function c5() {
  const u = alea(88005);
  const poisson = (m) => { let k = 0, p = Math.exp(-m), s = p; const x = u(); while (x > s && k < 200) { k++; p *= m / k; s += p; } return k; };
  const sortie = (i, spotId = `s${i % 4}`) => {
    const cond = { wind: 5 + 35 * u(), gust: 10 + 50 * u(), wave: 2 * u(), period: 5 + 8 * u(), swell: 2 * u(), sst: 9 + 10 * u(), pressure: 995 + 35 * u(), dp24: -8 + 16 * u(), cloud: 100 * u(), coef: 30 + 85 * u(), tideH: 12.4 * u(), hour: 24 * u(), doy: 365 * u() };
    const taux = 0.6 * Math.exp(-0.04 * (cond.wind - 20) + 0.015 * (cond.coef - 70));
    const h = 2 + Math.floor(3 * u());
    return { id: `t${i}`, spotId, date: "2026-06-01", start: "08:00", end: `${String(8 + h).padStart(2, "0")}:00`, cond, catches: [{ sp: "bar", n: poisson(taux * h) }], _taux: taux };
  };
  const test = Array.from({ length: 300 }, (_, i) => sortie(10000 + i));
  const res = [];
  for (const N of [MIN_TRIPS - 1, MIN_TRIPS, 20, 60, 200]) {
    const m = fitModel(Array.from({ length: N }, (_, i) => sortie(i)));
    if (!m.ok) { res.push({ sorties: N, ok: false, raison: m.reason }); continue; }
    const pred = test.map((t) => predictRate(m, t.cond, t.spotId)), vrai = test.map((t) => t._taux);
    const nuls = Object.entries(m.beta).filter(([c]) => !/^(wind|coef)$/.test(c)).map(([, b]) => Math.abs(b));
    res.push({ sorties: N, ok: true, effetVent: r3(m.beta.wind), effetCoef: r3(m.beta.coef), effetFauxMax: r3(Math.max(...nuls)),
      spearmanHorsEchantillon: r3(spearman(pred, vrai)), noteMin: scoreOf(m, Math.min(...pred)), noteMax: scoreOf(m, Math.max(...pred)) });
  }
  const sansPrise = fitModel(Array.from({ length: 30 }, (_, i) => ({ ...sortie(i), catches: [] })));
  // Capots non notés : seules les sorties avec prise sont gardées. Le modèle compare à TA moyenne : le biais déplace la moyenne.
  const toutes = Array.from({ length: 200 }, (_, i) => sortie(i)), avecPrise = toutes.filter((t) => t.catches[0].n > 0);
  const mT = fitModel(toutes), mP = fitModel(avecPrise);
  return { lecture: "taux vrai : exp(−0,04 (vent − 20) + 0,015 (coef − 70)) ; dix variables sans effet ; quatre spots identiques",
    parTaille: res, sansAucunePrise: sansPrise.ok ? "note produite à tort" : sansPrise.reason,
    capotsNonNotes: { tauxMoyenComplet: r3(mT.meanRate), tauxMoyenSansCapots: r3(mP.meanRate), effetVentComplet: r3(mT.beta.wind), effetVentSansCapots: r3(mP.beta.wind) } };
}

/** C4 : les garde-fous de l'outil sur un faux journal (statuts attendus). */
function c4() {
  const u = alea(88004);
  const sortie = (y) => ({ noteFigee: true, favorabilite: Math.round(100 * u()), resultat: y ? "prise" : "bredouille", prises: y ? 1 + Math.floor(3 * u()) : 0, heures: 2 });
  const trois = verifier([sortie(1), sortie(1), sortie(0)]);
  const sansBredouille = verifier(Array.from({ length: 60 }, () => sortie(1)));
  const assez = verifier(Array.from({ length: 60 }, (_, i) => sortie(i % 3 === 0)));
  return { troisSorties: trois.statut, troisSortiesManque: trois.manque, soixanteSansBredouille: sansBredouille.statut, soixanteMelangees: assez.statut,
    soixanteMelangeesChance: assez.chance.statut };
}

export function calculer() {
  return { "//": "Jeux SYNTHÉTIQUES de la phase 8 V3 (aucune sortie réelle). Régénérer : node scripts/calibration/journal-synthetique.mjs. Lecture : docs/validation/CALIBRATION-PHASE-8.md",
    c1_previsionnistesConnus: c1(), c2_biaisDeSelection: c2(), c3_apprentissageTheta: c3(), c4_gardeFous: c4(), c5_bateau: c5() };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const r = JSON.stringify(calculer(), null, 1) + "\n";
  if (process.argv.includes("--verifier")) {
    const ok = fs.existsSync(SORTIE) && fs.readFileSync(SORTIE, "utf8") === r;
    console.log(ok ? "calibration synthétique à jour" : "calibration synthétique périmée : node scripts/calibration/journal-synthetique.mjs");
    process.exit(ok ? 0 : 1);
  }
  fs.writeFileSync(SORTIE, r);
  console.log(`écrit ${path.relative(root, SORTIE)}`);
}
