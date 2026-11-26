// Phase 8 V3 — épreuve du moteur BORD sur les journées archivées (plan de validation de la phase 6, V-01 à V-04).
// Rien n'est changé dans le moteur : le vrai moteur V2 (src/engine.js, sept guides) note chaque créneau, puis les
// architectures de l'étude (B-V2, B-simple, A1), le contrat de sécurité proposé et la règle de classement proposée sont
// rejoués sur ces notes. Les critères de réussite sont ceux écrits AVANT l'épreuve (docs/moteur-bord/06-PLAN-VALIDATION.md § 3).
// Ce que cette épreuve ne fait pas : elle ne mesure aucune précision de prise (aucune vérité terrain ici). Les journées où
// l'archive porte une session du journal sont écartées : rien du journal n'entre dans les résultats (PF-17).
// Sortie déterministe (graines fixes, aucune date de passage) : data/moteur-bord/epreuve-phase-8.json.
//   node scripts/epreuve-v3/epreuve.mjs            écrit le fichier
//   node scripts/epreuve-v3/epreuve.mjs --verifier  recalcule et compare (code 1 si écart)
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ARCHIVES, readDays } from "../epreuve-journees.mjs";
import { composantes, bV2, bSimple, a1, palier, spearman } from "../etude-moteur-bord/architectures.mjs";
import { etatSecurite } from "../etude-moteur-bord/securite.mjs";
import { classer } from "../etude-moteur-bord/classement.mjs";
import { alea } from "../etude-moteur-bord/zinb.mjs";
import { PROPOSE, zoneDe } from "../revision-saison.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SORTIE = path.join(root, "data/moteur-bord/epreuve-phase-8.json");
const GUIDES = ["logonna", "pirou", "plouguerneau", "audierne", "carantec", "concarneau", "crozon"];
const TIRAGES = 60;
const r3 = (x) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 1000) / 1000);
const pc = (a, b) => (b ? Math.round((1000 * a) / b) / 10 : null);
const saisonDe = (date) => { const m = +date.slice(5, 7); return m >= 5 && m <= 10 ? "mai-octobre" : "novembre-avril"; };
const fiche = (id) => { const f = path.join(root, "data/spots/fiches", `${id}.json`); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null; };
const connu = (x) => (x && x.statut !== "INCONNU" ? x.valeur : null);

async function moteur(guide) {
  const out = path.join(root, "tests/.build", `epreuve8_${guide}.mjs`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await build({ entryPoints: [path.join(root, "src/engine.js")], bundle: true, format: "esm", platform: "node", outfile: out, jsx: "automatic",
    external: ["react", "react/jsx-runtime", "react-dom"], logLevel: "warning",
    plugins: [{ name: "site", setup(b) { b.onResolve({ filter: /^SITE_CONFIG$/ }, () => ({ path: path.join(root, `data/sites/${guide}.config.js`) })); } }] });
  return import(out + `?t=${guide}`);
}

/** Entrée du contrat de sécurité proposé pour un créneau réel : météo du créneau (deux modèles), fiche V3 du poste. */
export function entreeSecurite(E, spot, w, F, { supposeDocumente = false } = {}) {
  const zw = w.zw || {}, S = F?.safety || {};
  const regles = E.securityFor(spot, { coeff: w.coeff });
  const forceAlt = zw.alt && Number.isFinite(zw.alt.kmh) ? E.beaufortOf(zw.alt.kmh) : undefined;
  const isolement = supposeDocumente ? (regles.some((a) => a.isolement && a.active) ? true : false)
    : S.acces_maree?.statut === "INCONNU" ? null : regles.some((a) => a.isolement && a.active) ? true : null;
  return {
    ventConnu: zw.windKnown === true, force: zw.wind_force, forceAutreModele: forceAlt, rafalesKmh: zw.gust_kmh,
    directionConnue: !!zw.wind_dir, rade: E.SITE.zones?.[spot.zone]?.sea === "rade",
    houleConnue: zw.houleKnown === true, houleM: zw.houle,
    houleMaxM: supposeDocumente ? (connu(S.houle_max_m) ?? spot.houleMax ?? null) : connu(S.houle_max_m),
    engagement: supposeDocumente ? (connu(S.engagement) ?? spot.dangerLevel ?? null) : connu(S.engagement),
    coef: w.coeff, coefMaxDur: spot.coefHardMax ?? null, isolement,
    consignesActives: regles.filter((a) => a.active && !a.isolement).map((a) => a.t),
    nuit: w.light?.band === "nuit" ? true : w.light?.band ? false : null,
    fermetureOfficielle: supposeDocumente ? false : F?.quality?.criteres?.["QUAL-6"]?.ok ? false : null,
  };
}

/** Présence avec la table de saison proposée en phase 7 (min de la saison et de l'eau, comme presenceV2). */
function presencePropose(spot, f, month) {
  const zone = zoneDe(spot.lat ?? spot.coords?.[0], spot.lon ?? spot.coords?.[1]);
  const regime = f.pres.regime || f.pres.season?.regime;
  const s = PROPOSE[zone]?.[regime]?.[month - 1];
  if (s == null) return f.pres.factor;
  return Math.round(Math.min(s, f.pres.thermal ? f.pres.thermal.factor : Infinity) * 100) / 100;
}

export async function epreuve() {
  const V1 = { creneaux: 0, nombreAvecManque: 0, nombreEauInconnue: 0, bv2HorsIntervalle: 0, bv2Comparables: 0, bv2EcartMax: 0 };
  const V2pub = { "mai-octobre": { nombre: 0, fourchette: 0, qualitatif: 0, aucune: 0 }, "novembre-avril": { nombre: 0, fourchette: 0, qualitatif: 0, aucune: 0 } };
  const raisonsAucune = {};
  const SEC = { creneaux: 0, etats: {}, etatsSiDocumente: {}, v2SansDouteMaisV3Danger: 0, v2NonRecommandeMaisV3Safe: 0, v2SansDouteMaisV3DangerSiDocumente: 0, exemplesDivergence: [] };
  const V4 = { journees: 0, topAvecNonSafe: 0, topVide: 0, topVideSiDocumente: 0, documentesMoyen: 0, documentesMoyenSiDocumente: 0, aVerifierMoyen: 0 };
  const V3 = { journees: 0, stables80: 0, partStable: [], exact: 0, larges80: 0, largesExact: 0 };
  const SAIS = { journees: 0, memePremier: 0, top3Commun: 0, parMois: {}, spearman: [] };
  const BASE = { journees: 0, memePremierBV2BSimple: 0, spearmanBV2BSimple: [], spearmanBV2A1bas: [] };
  const exemples = [];
  for (const g of GUIDES) {
    const E = await moteur(g), data = readDays(ARCHIVES, g);
    if (!data) continue;
    const rng = alea(8000 + GUIDES.indexOf(g));
    for (const [date, live] of Object.entries(data.days).sort()) {
      if (!live || live.error || live.journal) continue;   // session du journal : écartée (PF-17)
      const month = +date.slice(5, 7), S = saisonDe(date);
      const day = E.rankDay(date, live, { engine: "v2", hours: E.DEFAULT_HOURS, clock: Date.parse(`${date}T05:00:00Z`), pertinence: false });
      const lignes = [];
      for (const x of day) {
        const spot = E.SPOTS.find((s) => s.id === x.id), F = fiche(x.id);
        const v2w = new Map((x.v2?.windows || []).map((v) => [v.id, v]));
        let meilleur = null;
        for (const w of x.windows || []) {
          const v = v2w.get(w.id);
          if (!v?.f || w.outOfHours) continue;
          const c = composantes(v.f), A = a1(c), B = bV2(c), Bs = bSimple(c);
          V1.creneaux++;
          if (A.publication === "nombre" && (c.exclus.size || Object.keys(c.pts).length < 4)) V1.nombreAvecManque++;
          if (A.publication === "nombre" && !c.eauConnue) V1.nombreEauInconnue++;
          if (B.valeur != null && A.bas != null) { V1.bv2Comparables++; if (B.valeur < A.bas || B.valeur > A.haut) { V1.bv2HorsIntervalle++; V1.bv2EcartMax = Math.max(V1.bv2EcartMax, B.valeur < A.bas ? A.bas - B.valeur : B.valeur - A.haut); } }
          V2pub[S][A.publication]++;
          if (A.publication === "aucune") { const k = [...c.exclus].sort().join("+") || "critères manquants"; raisonsAucune[k] = (raisonsAucune[k] || 0) + 1; }
          const sec = etatSecurite(entreeSecurite(E, spot, w, F)), secDoc = etatSecurite(entreeSecurite(E, spot, w, F, { supposeDocumente: true }));
          SEC.creneaux++; SEC.etats[sec.etat] = (SEC.etats[sec.etat] || 0) + 1; SEC.etatsSiDocumente[secDoc.etat] = (SEC.etatsSiDocumente[secDoc.etat] || 0) + 1;
          const v2SansDoute = v.eligible && !(v.verify || []).length, v2NR = !v.eligible;
          if (v2SansDoute && (sec.etat === "DANGER" || sec.etat === "BLOCKED")) SEC.v2SansDouteMaisV3Danger++;
          if (v2SansDoute && (secDoc.etat === "DANGER" || secDoc.etat === "BLOCKED")) {
            SEC.v2SansDouteMaisV3DangerSiDocumente++;
            if (SEC.exemplesDivergence.length < 6) SEC.exemplesDivergence.push({ guide: g, spot: x.id, mois: month, regles: secDoc.raisons.filter((r) => r.etat === "DANGER" || r.etat === "BLOCKED").map((r) => `${r.regle} : ${r.texte}`) });
          }
          if (v2NR && sec.etat === "SAFE") SEC.v2NonRecommandeMaisV3Safe++;
          const cand = { w, c, A, B, Bs, sec, secDoc, presProp: presencePropose(spot, v.f, month) };
          // Créneau qui sert au rang : le meilleur créneau dont la note B-V2 existe (le moteur V2 classe sur la meilleure fenêtre).
          if (B.valeur != null && (!meilleur || B.valeur > meilleur.B.valeur)) meilleur = cand;
        }
        if (meilleur) lignes.push({ id: x.id, trajet: x.distMin ?? 30, ...meilleur });
      }
      if (lignes.length < 3) continue;
      // V-04 : classement proposé, avec les données de fiche actuelles, puis en supposant la fiche documentée.
      const versClasser = (doc) => lignes.map((l) => { const s = doc ? l.secDoc : l.sec, A = l.A;
        return { id: l.id, securite: s.etat, aVerifier: s.etat !== "SAFE", accesFerme: false, trajetMin: l.trajet, trajetVerifie: false,
          fav: A.publication === "nombre" ? A.valeur : A.bas, favLargeur: A.publication === "nombre" ? 0 : A.largeur ?? 99, confiance: 50 }; });
      const C0 = classer(versClasser(false)), C1 = classer(versClasser(true));
      V4.journees++;
      if (C0.top.some((s) => s.securite !== "SAFE") || C1.top.some((s) => s.securite !== "SAFE")) V4.topAvecNonSafe++;
      if (!C0.top.length) V4.topVide++;
      if (!C1.top.length) V4.topVideSiDocumente++;
      V4.documentesMoyen += C0.documentes.length; V4.documentesMoyenSiDocumente += C1.documentes.length; V4.aVerifierMoyen += C0.aVerifier.length;
      // V-03 : stabilité du Top 3 B-V2 sous perturbation des tables de points et de la présence (60 tirages).
      const ordreB = (arr) => [...arr].sort((a, b) => b.v - a.v || a.id.localeCompare(b.id));
      const ref = ordreB(lignes.map((l) => ({ id: l.id, v: l.B.valeur }))).slice(0, 3).map((x) => x.id);
      // Deux amplitudes : modérée (points ×0,8 à ×1,2, présence ×0,5 à ×1,5) et large (points ×0,5 à ×1,5, présence ×0 à ×2).
      // « Stable » : chaque spot du Top 3 de référence reste à 10 points au plus du 3ᵉ du tirage ; « exact » : même Top 3.
      const tirer = (a, kMin, kMax) => { let st = 0, ex = 0;
        for (let t = 0; t < TIRAGES; t++) {
          const echelle = { fenetre: 1 - a + 2 * a * rng(), coef: 1 - a + 2 * a * rng(), lumiere: 1 - a + 2 * a * rng(), vent: 1 - a + 2 * a * rng() }, kPresence = kMin + (kMax - kMin) * rng();
          const o = ordreB(lignes.map((l) => ({ id: l.id, v: bV2(l.c, { echelle, kPresence }).valeur ?? -1 })));
          if (ref.every((id) => o.find((x) => x.id === id).v >= o[2].v - 10)) st++;
          const t3 = new Set(o.slice(0, 3).map((x) => x.id)); if (ref.every((id) => t3.has(id))) ex++;
        }
        return [st / TIRAGES, ex / TIRAGES]; };
      const [stM, exM] = tirer(0.2, 0.5, 1.5), [stL, exL] = tirer(0.5, 0, 2);
      V3.journees++; V3.partStable.push(stM); if (stM >= 0.8) V3.stables80++; if (exM >= 0.8) V3.exact++; if (stL >= 0.8) V3.larges80++; if (exL >= 0.8) V3.largesExact++;
      // Saison proposée (phase 7) contre saison V2, même composantes : effet sur le classement B-V2 (descriptif, jamais une preuve).
      const avec = ordreB(lignes.map((l) => ({ id: l.id, v: bV2({ ...l.c, presence: l.presProp }).valeur ?? -1 })));
      const sans = ordreB(lignes.map((l) => ({ id: l.id, v: l.B.valeur })));
      SAIS.journees++; const pm = (SAIS.parMois[String(month).padStart(2, "0")] ||= { journees: 0, memePremier: 0 }); pm.journees++;
      if (avec[0].id === sans[0].id) { SAIS.memePremier++; pm.memePremier++; }
      const t3 = new Set(sans.slice(0, 3).map((x) => x.id)); SAIS.top3Commun += avec.slice(0, 3).filter((x) => t3.has(x.id)).length / 3;
      // Baselines : B-V2 contre B-simple et contre la borne basse de A1 (accord de rang, Spearman).
      BASE.journees++;
      const bs = ordreB(lignes.filter((l) => l.Bs.valeur != null).map((l) => ({ id: l.id, v: l.Bs.valeur })));
      if (bs.length && bs[0].id === sans[0].id) BASE.memePremierBV2BSimple++;
      const rho = spearman(lignes.map((l) => l.B.valeur), lignes.map((l) => l.Bs.valeur)); if (rho != null) BASE.spearmanBV2BSimple.push(rho);
      const rhoA = spearman(lignes.map((l) => l.B.valeur), lignes.map((l) => l.A.bas)); if (rhoA != null) BASE.spearmanBV2A1bas.push(rhoA);
      // Exemples de recommandation complète : le 6 de quatre mois répartis, pour deux guides (journées choisies d'avance).
      if (["logonna", "pirou"].includes(g) && ["2026-01-06", "2026-04-06", "2026-07-06", "2026-10-06"].includes(date)) {
        exemples.push({ guide: g, date, saison: S,
          spots: sans.slice(0, 5).map((o, i) => { const l = lignes.find((y) => y.id === o.id);
            return { rang: i + 1, id: l.id, creneau: `${l.w.startFmt}–${l.w.endFmt}`, bV2: l.B.valeur, palierV2: palier(l.B.valeur), points: l.c.pts, criteresExclus: [...l.c.exclus], presence: l.c.presence,
              eauConnue: l.c.eauConnue, a1: { publication: l.A.publication, bas: l.A.bas, haut: l.A.haut }, securiteV3: l.sec.etat,
              manques: l.sec.raisons.filter((r) => r.etat === "INSUFFICIENT_DATA").map((r) => r.regle), securiteSiDocumente: l.secDoc.etat }; }) });
      }
    }
  }
  const moy = (a) => (a.length ? r3(a.reduce((s, x) => s + x, 0) / a.length) : null);
  const n = V4.journees || 1;
  const v01 = { ...V1, partHorsIntervalle: pc(V1.bv2HorsIntervalle, V1.bv2Comparables),
    critere: "aucune carte publiée en nombre avec un critère manquant", tenu: V1.nombreAvecManque === 0 && V1.nombreEauInconnue === 0 };
  const v02 = { parSaison: Object.fromEntries(Object.entries(V2pub).map(([k, v]) => { const t = Object.values(v).reduce((a, b) => a + b, 0); return [k, { creneaux: t, ...Object.fromEntries(Object.entries(v).map(([p, x]) => [p, pc(x, t)])) }]; })),
    raisonsAucune, critere: "aucun « — » sans raison écrite", tenu: Object.keys(raisonsAucune).every((k) => !!k) };
  const v03 = { journees: V3.journees, tirages: TIRAGES, journeesStablesA80: V3.stables80, part: pc(V3.stables80, V3.journees), partStableMediane: r3([...V3.partStable].sort((a, b) => a - b)[Math.floor(V3.partStable.length / 2)]),
    memeTop3ExactA80: pc(V3.exact, V3.journees), large: { stablesA80: pc(V3.larges80, V3.journees), memeTop3ExactA80: pc(V3.largesExact, V3.journees) },
    critere: "Top 3 à 10 points près dans 80 % des tirages au moins ; sinon, la publication doit le dire (D6-02)" };
  v03.tenu = v03.part >= 80;
  const v04 = { journees: V4.journees, topAvecNonSafe: V4.topAvecNonSafe, topVide: V4.topVide, partTopVide: pc(V4.topVide, V4.journees), topVideSiDocumente: V4.topVideSiDocumente,
    spotsDocumentesParJournee: r3(V4.documentesMoyen / n), spotsDocumentesParJourneeSiDocumente: r3(V4.documentesMoyenSiDocumente / n), spotsAVerifierParJournee: r3(V4.aVerifierMoyen / n),
    critere: "aucun créneau DANGER ou BLOCKED dans un Top ; aucun INSUFFICIENT_DATA dans le groupe documenté", tenu: V4.topAvecNonSafe === 0 };
  const securite = { ...SEC, critere: "aucun créneau « non recommandé » en V2 qui devienne SAFE ; divergences V2 sans doute → V3 non recommandé comptées et expliquées", tenu: SEC.v2NonRecommandeMaisV3Safe === 0 };
  const saison = { journees: SAIS.journees, memePremier: pc(SAIS.memePremier, SAIS.journees), top3Commun: pc(SAIS.top3Commun, SAIS.journees),
    parMois: Object.fromEntries(Object.entries(SAIS.parMois).sort().map(([m, v]) => [m, pc(v.memePremier, v.journees)])),
    lecture: "effet de la table proposée sur le classement, à composantes égales ; aucune vérité terrain : ce n'est pas une preuve qu'elle classe mieux" };
  const baselines = { journees: BASE.journees, memePremierBV2BSimple: pc(BASE.memePremierBV2BSimple, BASE.journees), spearmanBV2BSimpleMoyen: moy(BASE.spearmanBV2BSimple), spearmanBV2A1basMoyen: moy(BASE.spearmanBV2A1bas) };
  return { "//": "Épreuve de la phase 8 V3 sur les journées archivées (aucune session du journal). Régénérer : node scripts/epreuve-v3/epreuve.mjs. Lecture : docs/validation/EPREUVE-MOTEUR-PHASE-8.md",
    v01_proprietes: v01, v02_publication: v02, v03_stabilite: v03, v04_classementSecurite: v04, securite, saisonProposee: saison, baselines, exemples };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const r = JSON.stringify(await epreuve(), null, 1) + "\n";
  if (process.argv.includes("--verifier")) {
    const ok = fs.existsSync(SORTIE) && fs.readFileSync(SORTIE, "utf8") === r;
    console.log(ok ? "épreuve de la phase 8 à jour" : "épreuve de la phase 8 périmée : node scripts/epreuve-v3/epreuve.mjs");
    process.exit(ok ? 0 : 1);
  }
  fs.writeFileSync(SORTIE, r);
  console.log(`écrit ${path.relative(root, SORTIE)}`);
}
