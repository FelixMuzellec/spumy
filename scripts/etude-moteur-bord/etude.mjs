// Phase 6 V3 — étude reproductible du moteur BORD (PROVISOIRE). Aucune modification du moteur : le vrai moteur V2
// (src/engine.js, sept guides) est lu tel quel ; les architectures candidates recombinent ses composantes.
// Sortie : data/moteur-bord/resultats-etude.json (déterministe : graines fixes, aucune date de passage).
//   node scripts/etude-moteur-bord/etude.mjs            écrit le fichier
//   node scripts/etude-moteur-bord/etude.mjs --verifier  recalcule et compare au fichier (code 1 si écart)
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { pAuMoinsUne, logNB, pZINB, zeroStructurel, thetaRatio, thetaPosterieur, psiBeta, alea, tirerZINB } from "./zinb.mjs";
import { composantes, bV2, bSimple, a1, a2, a3, palier, spearman, MAX } from "./architectures.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const SORTIE = path.join(root, "data/moteur-bord/resultats-etude.json");
const GUIDES = ["logonna", "pirou", "plouguerneau", "audierne", "carantec", "concarneau", "crozon"];
const r3 = (x) => (x == null ? null : Math.round(x * 1000) / 1000);
const moy = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
const quantile = (a, q) => { const b = [...a].sort((x, y) => x - y); return b.length ? b[Math.min(b.length - 1, Math.floor(q * b.length))] : null; };

async function moteur(guide) {
  const out = path.join(root, "tests/.build", `etude_${guide}.mjs`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await build({
    entryPoints: [path.join(root, "src/engine.js")], bundle: true, format: "esm", platform: "node", outfile: out,
    jsx: "automatic", external: ["react", "react/jsx-runtime", "react-dom"], logLevel: "warning",
    plugins: [{ name: "site", setup(b) { b.onResolve({ filter: /^SITE_CONFIG$/ }, () => ({ path: path.join(root, `data/sites/${guide}.config.js`) })); } }],
  });
  return import(out + `?t=${guide}`);
}

// ── E1 : identités mathématiques du ZINB (§ 9.1.8) ──
function e1() {
  const lignes = [];
  for (const [psi, L, k] of [[0.6, 0.8, 2], [0.9, 2.5, 0.7], [0.3, 0.2, 10]]) {
    let somme = 0, m = 0, m2 = 0;
    for (let y = 0; y < 400; y++) { const p = Math.exp(logNB(y, L, k)); somme += p; m += y * p; m2 += y * y * p; }
    const zinbSomme = Array.from({ length: 400 }, (_, y) => pZINB(y, psi, L, k)).reduce((a, x) => a + x, 0);
    const pi0 = zeroStructurel(psi, L, k), bayes = (1 - psi) / pZINB(0, psi, L, k);
    lignes.push({ psi, Lambda: L, k, sommeNB: r3(somme), moyenneNB: r3(m), varianceNB: r3(m2 - m * m), varianceTheorique: r3(L + L * L / k),
      sommeZINB: r3(zinbSomme), pAuMoinsUne: r3(pAuMoinsUne(psi, L, k)), unMoinsPZero: r3(1 - pZINB(0, psi, L, k)), pi0: r3(pi0), pi0Bayes: r3(bayes) });
  }
  const limite = [1, 10, 100, 1e4, 1e8].map((k) => ({ k, ecart: Math.abs(pAuMoinsUne(0.7, 1.2, k) - 0.7 * (1 - Math.exp(-1.2))) }));
  return { lignes, limitePoisson: limite.map((x) => ({ k: x.k, ecart: Number(x.ecart.toExponential(2)) })) };
}

// ── E2 : le ratio Gamma–Poisson contre le posterior exact (§ 9.1.9, limite à k fini) ──
function e2() {
  const b0 = 2;
  const sessions = [[2, 1.1], [0, 0.9], [1, 0.8], [0, 1.4], [3, 1.6], [0, 0.6], [1, 1.0], [0, 1.2]].map(([y, Lbase]) => ({ y, Lbase }));
  const sansExces = [Infinity, 10, 2, 0.5].map((k) => {
    const ex = thetaPosterieur(b0, sessions, { psi: 1, k });
    return { k: Number.isFinite(k) ? k : "∞ (Poisson)", ratio: r3(thetaRatio(b0, sessions)), moyenneExacte: r3(ex.moyenne), ecartTypeExact: r3(ex.ecartType),
      ecartTypeGammaPoisson: r3(Math.sqrt((b0 + sessions.reduce((a, s) => a + s.y, 0))) / (b0 + sessions.reduce((a, s) => a + s.Lbase, 0))), q05: r3(ex.q05), q95: r3(ex.q95) };
  });
  // Avec excès de zéros (ψ = 0,6, k = 2) : ratio naïf (sans q), ratio de travail (q par session), posterior exact.
  const psi = 0.6, k = 2;
  const naif = thetaRatio(b0, sessions);
  let th = 1, q = [];
  for (let it = 0; it < 50; it++) {             // point fixe de type EM : q_i dépend de θ courant
    q = sessions.map((s) => (s.y > 0 ? 1 : 1 - zeroStructurel(psi, th * s.Lbase, k)));
    th = thetaRatio(b0, sessions.map((s, i) => ({ ...s, q: q[i] })));
  }
  const ex = thetaPosterieur(b0, sessions, { psi, k });
  const psiTravail = psiBeta(2, 2, sessions.map((s, i) => ({ q: q[i] })));
  return { b0, sessions, sansExces, avecExces: { psi, k, ratioNaif: r3(naif), ratioTravailAvecQ: r3(th), q: q.map(r3), moyenneExacte: r3(ex.moyenne), ecartTypeExact: r3(ex.ecartType), psiTravailBeta22: r3(psiTravail) } };
}

// ── E3 : identifiabilité de ψ et k selon le nombre de sessions (vraisemblance sur grille, θ = 1, Λ_i connues) ──
function e3() {
  const u = alea(20261124), psiVrai = 0.6, kVrai = 2, lambda = 0.45;
  const grillePsi = Array.from({ length: 49 }, (_, i) => 0.04 + i * 0.02);
  const grilleK = [0.2, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 5, 8, 13, 20, 50, 1e6];
  const res = [];
  for (const N of [3, 10, 40, 200]) {
    const psis = [], ks = [], poisson = [];
    for (let r = 0; r < 120; r++) {
      const S = Array.from({ length: N }, () => { const E = 1 + 3 * u(), L = lambda * E; return { L, y: tirerZINB(u, psiVrai, L, kVrai) }; });
      let best = -Infinity, bp = null, bk = null;
      for (const p of grillePsi) for (const k of grilleK) {
        let l = 0;
        for (const s of S) l += Math.log(pZINB(s.y, p, s.L, k));
        if (l > best) { best = l; bp = p; bk = k; }
      }
      psis.push(bp); ks.push(bk); poisson.push(bk >= 50 ? 1 : 0);
    }
    res.push({ sessions: N, psiMediane: r3(quantile(psis, 0.5)), psiQ05: r3(quantile(psis, 0.05)), psiQ95: r3(quantile(psis, 0.95)),
      partPsiA015: r3(psis.filter((p) => Math.abs(p - psiVrai) <= 0.15).length / psis.length),
      kMediane: quantile(ks, 0.5), kQ05: quantile(ks, 0.05), kQ95: quantile(ks, 0.95), partKPoisson: r3(moy(poisson)) });
  }
  return { psiVrai, kVrai, lambdaParHeure: lambda, effortHeures: "1 à 4", replications: 120, graine: 20261124, resultats: res };
}

// ── Grille de créneaux sur les 66 spots V2 ──
const MOIS = [[2, 9], [5, 13], [8, 17], [11, 12]];   // mois et température de l'eau de la grille (valeurs d'essai, pas des mesures)
async function grille() {
  const lignes = [], classement = [], moteurs = new Map();
  for (const g of GUIDES) {
    const E = await moteur(g);
    moteurs.set(g, E);
    const dirOf = (angles) => E.DIR16[Math.round((((angles?.[0] ?? 0) % 360) + 360) % 360 / 22.5) % 16];
    for (const s of E.SPOTS) {
      const face = dirOf(s.exposedAngles), dos = dirOf([(s.exposedAngles?.[0] ?? 0) + 180]);
      const prio = s.tidalRules?.windows?.[0]?.priority === "prime" ? "prime" : "bon";
      for (const [month, sst] of MOIS) for (const coeff of [35, 70, 100]) for (const priority of ["prime", "bon"])
        for (const band of ["aube", "jour", "crepuscule", "nuit"]) for (const force of [1, 3, 5]) for (const [expo, dir] of [["face", face], ["dos", dos]]) for (const sky of ["clear", "overcast"]) {
          if (band !== "jour" && sky === "overcast") continue;
          const zw = { wind_dir: dir, wind_force: force, windKnown: true, houle: 0.6, houleKnown: true, sky };
          const f = E.favorability(s, { priority, coeff, light: { band } }, zw, { month, sst, sstConf: "modele" });
          lignes.push({ guide: g, spot: s.id, month, coeff, priority, band, force, expo, sky, prioSpot: prio, f, c: composantes(f),
            sansVent: composantes(E.favorability(s, { priority, coeff, light: { band } }, { windKnown: false }, { month, sst, sstConf: "modele" })),
            sansEau: composantes(E.favorability(s, { priority, coeff, light: { band } }, zw, { month })) });
        }
      // Grille du classement (E6) : même vent pour tous les spots du guide (direction O ou NE, force 2 ou 4), chaque spot
      // à la priorité de sa première fenêtre de marée ; physiquement cohérente entre spots, contrairement à « face/dos ».
      for (const [month, sst] of MOIS) for (const coeff of [35, 70, 100]) for (const band of ["aube", "jour"]) for (const dir of ["O", "NE"]) for (const force of [2, 4]) {
        const f = E.favorability(s, { priority: prio, coeff, light: { band } }, { wind_dir: dir, wind_force: force, windKnown: true, houle: 0.6, houleKnown: true, sky: "clear" }, { month, sst, sstConf: "modele" });
        classement.push({ guide: g, spot: s.id, month, coeff, band, dir, force, c: composantes(f) });
      }
    }
  }
  return { lignes, classement, moteurs };
}

function e4(G) {
  const v2 = G.map((x) => bV2(x.c).valeur), simple = G.map((x) => bSimple(x.c).valeur);
  const A1 = G.map((x) => a1(x.c)), A2 = G.map((x) => a2(x.c).valeur), A3 = G.map((x) => a3(x.c).valeur);
  const ecartMoteur = G.filter((x, i) => x.f.fav !== v2[i]).length;   // la recombinaison B-V2 doit égaler le moteur
  const pearson2 = (xs, ys) => { const r = spearmanPearson(xs, ys); return r == null ? null : r3(r * r); };
  const r2Univarie = {
    presence: pearson2(G.map((x) => x.c.presence), v2), fenetre: pearson2(G.map((x) => x.c.pts.fenetre), v2), coef: pearson2(G.map((x) => x.c.pts.coef), v2),
    lumiere: pearson2(G.map((x) => x.c.pts.lumiere), v2), vent: pearson2(G.map((x) => x.c.pts.vent), v2),
  };
  // Compensation : une note « favorable » (≥ 65) obtenue avec une disponibilité biologique faible, ou avec des conditions faibles.
  const fav65 = G.map((x, i) => [x, v2[i]]).filter(([, v]) => v != null && v >= 65);
  const compensation = { favorables: fav65.length, presenceSous06: fav65.filter(([x]) => x.c.presence < 0.6).length,
    conditionsSous50: fav65.filter(([x]) => bV2(x.c, { kPresence: 0 }).valeur < 50).length,
    // Compensation à l'intérieur des conditions (somme) : un critère au plus à 20 % de son maximum dans une note ≥ 65.
    unCritereSous20pc: fav65.filter(([x]) => Object.entries(MAX).some(([k, m]) => x.c.pts[k] != null && x.c.pts[k] <= 0.2 * m)).length,
    ventSous20pcEtNote75: G.filter((x, i) => v2[i] >= 75 && x.c.pts.vent != null && x.c.pts.vent <= 0.2 * MAX.vent).length,
    coefNulEtNote65: fav65.filter(([x]) => x.c.pts.coef === 0).length };
  // Saut de lumière : même créneau, plein jour ciel clair contre aube.
  const cle = (x) => [x.guide, x.spot, x.month, x.coeff, x.priority, x.force, x.expo].join("|");
  const parCle = new Map(); G.forEach((x, i) => { if (x.sky === "clear") parCle.set(`${cle(x)}|${x.band}`, v2[i]); });
  const sauts = []; for (const [k, v] of parCle) if (k.endsWith("|jour")) { const a = parCle.get(k.replace(/\|jour$/, "|aube")); if (a != null && v != null) sauts.push(a - v); }
  // Données manquantes : vent inconnu (renormalisation V2) et eau inconnue (saison seule).
  const mv = G.map((x, i) => [v2[i], bV2(x.sansVent).valeur, a1(x.sansVent)]).filter(([a, b]) => a != null && b != null);
  const erreurVent = mv.map(([a, b]) => Math.abs(a - b));
  const largeurs = mv.map(([, , c]) => c.largeur);
  const pub = mv.reduce((o, [, , c]) => ({ ...o, [c.publication]: (o[c.publication] || 0) + 1 }), {});
  const me = G.map((x, i) => [v2[i], bV2(x.sansEau).valeur]).filter(([a, b]) => a != null && b != null).map(([a, b]) => b - a);
  return {
    creneaux: G.length, spots: new Set(G.map((x) => `${x.guide}/${x.spot}`)).size, recombinaisonEgaleMoteur: ecartMoteur === 0,
    spearman: { bV2_bSimple: r3(spearman(v2, simple)), bV2_a2: r3(spearman(v2, A2)), bV2_a3: r3(spearman(v2, A3)) },
    r2UnivarieSurLaGrille: r2Univarie, compensation,
    sautLumiereAubeContreJour: { moyenne: r3(moy(sauts)), q05: quantile(sauts, 0.05), q95: quantile(sauts, 0.95), max: Math.max(...sauts) },
    ventInconnu: { creneaux: mv.length, erreurRenormalisationMoyenne: r3(moy(erreurVent)), erreurQ95: quantile(erreurVent, 0.95), erreurMax: Math.max(...erreurVent),
      partErreurSup10: r3(erreurVent.filter((e) => e > 10).length / erreurVent.length), largeurIntervalleA1: { mediane: quantile(largeurs, 0.5), max: Math.max(...largeurs) }, publicationA1: pub },
    eauInconnue: { creneaux: me.length, ecartMoyen: r3(moy(me)), q05: quantile(me, 0.05), q95: quantile(me, 0.95) },
    paliersV2: [1, 2, 3, 4, 5].map((p) => ({ palier: p, part: r3(v2.filter((v) => palier(v) === p).length / v2.filter((v) => v != null).length) })),
    a1Publication: A1.reduce((o, x) => ({ ...o, [x.publication]: (o[x.publication] || 0) + 1 }), {}),
  };
}
function spearmanPearson(xs, ys) {
  const ok = xs.map((x, i) => [x, ys[i]]).filter(([x, y]) => x != null && y != null), n = ok.length;
  const mx = ok.reduce((s, p) => s + p[0], 0) / n, my = ok.reduce((s, p) => s + p[1], 0) / n;
  let a = 0, b = 0, c = 0; for (const [x, y] of ok) { a += (x - mx) * (y - my); b += (x - mx) ** 2; c += (y - my) ** 2; }
  return b && c ? a / Math.sqrt(b * c) : null;
}

// ── E5 : sensibilité un facteur à la fois (§ 13.3), amplitude selon le niveau de preuve (niveau 4 : ±40 %) ──
function e5(G) {
  const base = G.map((x) => bV2(x.c).valeur);
  const essais = [["fenetre", 0.4], ["coef", 0.4], ["lumiere", 0.4], ["vent", 0.4]].flatMap(([k, d]) => [[`${k} −${d * 100} %`, { echelle: { [k]: 1 - d } }], [`${k} +${d * 100} %`, { echelle: { [k]: 1 + d } }]]);
  essais.push(["présence ×0,6 (plus proche de 1)", { kPresence: 0.6 }], ["présence ×1,4", { kPresence: 1.4 }]);
  return essais.map(([nom, o]) => {
    const v = G.map((x) => bV2(x.c, o).valeur), d = v.map((x, i) => (x == null || base[i] == null ? null : Math.abs(x - base[i]))).filter((x) => x != null);
    const ch = v.filter((x, i) => x != null && base[i] != null && palier(x) !== palier(base[i])).length;
    return { essai: nom, ecartMoyen: r3(moy(d)), ecartQ95: quantile(d, 0.95), partPalierChange: r3(ch / d.length), spearman: r3(spearman(base, v)) };
  });
}

// ── E6 : stabilité du classement entre spots d'un guide sous incertitude des paramètres (Monte Carlo, graine fixe) ──
function e6(G6) {
  const u = alea(424242), R = 300;
  const ctxs = new Map();
  for (const x of G6) {
    const k = [x.guide, x.month, x.coeff, x.band, x.dir, x.force].join("|");   // même situation pour tous les spots du guide
    if (!ctxs.has(k)) ctxs.set(k, []);
    ctxs.get(k).push(x);
  }
  const mesure = { strict: [], egal3: [], egal10: [], top3: [], top3egal10: [], classeA2: [] };
  for (const items of ctxs.values()) {
    if (items.length < 4) continue;
    const note = (o) => items.map((x) => ({ id: x.spot, v: bV2(x.c, o).valeur ?? -1 })).sort((a, b) => b.v - a.v || a.id.localeCompare(b.id));
    const b = note({}), b3 = new Set(b.slice(0, 3).map((x) => x.id));
    const classeA2 = (x) => a2(x.c).valeur ?? -1, topClasse = Math.max(...items.map(classeA2));
    const setA2 = new Set(items.filter((x) => classeA2(x) === topClasse).map((x) => x.spot));
    let s = 0, e3 = 0, e10 = 0, t3 = 0, t3e = 0;
    for (let r = 0; r < R; r++) {
      const ech = { fenetre: 0.6 + 0.8 * u(), coef: 0.6 + 0.8 * u(), lumiere: 0.6 + 0.8 * u(), vent: 0.6 + 0.8 * u() }, kP = 0.6 + 0.8 * u();
      const d = note({ echelle: ech, kPresence: kP }), premier = b[0].id, vPremier = d.find((x) => x.id === premier).v;
      if (d[0].id === premier) s++;
      if (d[0].v - vPremier <= 3) e3++;
      if (d[0].v - vPremier <= 10) e10++;
      const d3 = d.slice(0, 3).map((x) => x.id);
      if (d3.every((id) => b3.has(id))) t3++;
      const seuil3 = d[2].v - 10;   // à 10 points près : chaque spot du Top 3 de base reste à 10 points du troisième tiré
      if ([...b3].every((id) => d.find((x) => x.id === id).v >= seuil3)) t3e++;
    }
    mesure.strict.push(s / R); mesure.egal3.push(e3 / R); mesure.egal10.push(e10 / R); mesure.top3.push(t3 / R); mesure.top3egal10.push(t3e / R);
    mesure.classeA2.push(setA2.size);
  }
  return { situations: mesure.strict.length, tirages: R, graine: 424242, amplitude: "poids de chaque critère ×0,6 à ×1,4 et présence k 0,6 à 1,4 (niveau 4) ; la météo n'est pas perturbée",
    grille: "7 guides × 4 mois × 3 coefficients × aube ou jour × vent O ou NE × force 2 ou 4, chaque spot à la priorité de sa première fenêtre",
    premierInchange: r3(moy(mesure.strict)), premierAEgalite3: r3(moy(mesure.egal3)), premierAEgalite10: r3(moy(mesure.egal10)),
    top3Inchange: r3(moy(mesure.top3)), top3AEgalite10: r3(moy(mesure.top3egal10)),
    situationsTop3Tient80: mesure.top3.filter((p) => p >= 0.8).length, situationsTop3Egalite10Tient80: mesure.top3egal10.filter((p) => p >= 0.8).length,
    a2TailleClasseDeTete: { mediane: quantile(mesure.classeA2, 0.5), q95: quantile(mesure.classeA2, 0.95) } };
}


// ── E7 : deux défauts du moteur V2 mis en évidence sur le vrai moteur (audit, constats A5 et A12) ──
function e7(moteurs) {
  // A5 : une houle inconnue retire tout le critère « vent et mer » (30 points) alors que sa valeur ne lit que le vent.
  let spots = 0, retire = 0; const ecarts = [];
  const zw = { wind_dir: "O", wind_force: 3, windKnown: true, houle: 0.6, houleKnown: true, sky: "clear" };
  for (const E of moteurs.values()) for (const s of E.SPOTS) {
    const win = { priority: "prime", coeff: 70, light: { band: "aube" } }, ctx = { month: 8, sst: 17, sstConf: "modele" };
    const a = E.favorability(s, win, zw, ctx), b = E.favorability(s, win, { ...zw, houleKnown: false }, ctx);
    spots++;
    if (b.excluded.some((x) => x.k === "vent" && /houle/.test(x.why))) { retire++; ecarts.push(b.fav - a.fav); }
  }
  // A12 : un niveau d'engagement absent est lu comme « non engagé » : la nuit n'est pas bloquée.
  const E = moteurs.get("crozon") || [...moteurs.values()][0];
  const s0 = E.SPOTS.find((s) => s.dangerLevel >= 3) || E.SPOTS[0];
  const nuit = { priority: "prime", coeff: 70, light: { band: "nuit" } }, calme = { wind_dir: "O", wind_force: 2, wind_kmh: 10, gust_kmh: 20, windKnown: true, houle: 0.5, houleKnown: true };
  const engage = E.windowSafety({ ...s0, dangerLevel: 3 }, nuit, calme, { coeff: 70 });
  const inconnu = E.windowSafety({ ...s0, dangerLevel: undefined }, nuit, calme, { coeff: 70 });
  return {
    houleInconnueRetireLeVent: { spots, spotsTouches: retire, ecartNote: { min: Math.min(...ecarts), max: Math.max(...ecarts), moyenne: r3(moy(ecarts)) } },
    engagementInconnuDeNuit: { spotsV2SansEngagement: [...moteurs.values()].reduce((n, M) => n + M.SPOTS.filter((x) => !Number.isFinite(x.dangerLevel)).length, 0), spotEssai: s0.id, engageBloque: !!engage.block, inconnuBloque: !!inconnu.block, inconnuAVerifier: (inconnu.verify || []).length > 0 },
    seuilsSecuriteMoteur: { WIND_LIMITS: E.WIND_LIMITS, HOULE_MARGE: E.HOULE_MARGE },
  };
}

export async function etude() {
  const { lignes: G, classement: G6, moteurs } = await grille();
  return { "//": "Étude PROVISOIRE de la phase 6 V3 : structure et robustesse, jamais une précision terrain (aucune vérité terrain ici). Régénérer : node scripts/etude-moteur-bord/etude.mjs",
    e1_identitesZINB: e1(), e2_gammaPoissonContreExact: e2(), e3_identifiabilite: e3(), e4_architectures: e4(G), e5_sensibilite: e5(G), e6_stabiliteClassement: e6(G6), e7_defautsMoteurV2: e7(moteurs) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = JSON.stringify(await etude(), null, 1) + "\n";
  if (process.argv.includes("--verifier")) {
    const ok = fs.existsSync(SORTIE) && fs.readFileSync(SORTIE, "utf8") === r;
    console.log(ok ? "[étude moteur BORD] résultats identiques au fichier" : "[étude moteur BORD] ÉCART avec data/moteur-bord/resultats-etude.json");
    process.exit(ok ? 0 : 1);
  }
  fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
  fs.writeFileSync(SORTIE, r);
  console.log(`[étude moteur BORD] écrit ${path.relative(root, SORTIE)}`);
}
