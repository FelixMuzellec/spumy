// Phase 6 V3 — étude du moteur BORD (PROVISOIRE) : identités mathématiques du ZINB, limites du ratio Gamma–Poisson,
// identifiabilité, recombinaison fidèle du moteur V2, contrat de classement proposé, données manquantes jamais neutres,
// et résultats de l'étude identiques au fichier versionné (déterministes).
// Usage : node tests/etude-moteur-bord.mjs
import fs from "node:fs";
import path from "node:path";
import { etude } from "../scripts/etude-moteur-bord/etude.mjs";
import { classer, TRAJET_MAX_MIN, PROCHE_MIN } from "../scripts/etude-moteur-bord/classement.mjs";
import { a1, bV2, PRESENCE_PLANCHER } from "../scripts/etude-moteur-bord/architectures.mjs";
import { pAuMoinsUne, zeroStructurel, pZINB, zeroNB, thetaRatio, psiBeta, thetaPosterieur } from "../scripts/etude-moteur-bord/zinb.mjs";
import { confiance, publier, dimDonnees, dimAccord, dimPreuvesRegles, dimPreuvesPoste, dimDomaine } from "../scripts/etude-moteur-bord/confiance.mjs";
import { etatSecurite, WIND_LIMITS, HOULE_MARGE } from "../scripts/etude-moteur-bord/securite.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
let pass = 0, fail = 0;
const t = (n, c, info = "") => { c ? pass++ : (fail++, console.log(`   ÉCHEC · ${n}${info ? " — " + info : ""}`)); };

const R = await etude();
const fichier = fs.readFileSync(path.join(root, "data/moteur-bord/resultats-etude.json"), "utf8");
t("étude : résultats recalculés identiques au fichier versionné (graines fixes)", fichier === JSON.stringify(R, null, 1) + "\n");

// E1 — identités du § 9.1.8
for (const l of R.e1_identitesZINB.lignes) {
  t(`ZINB ψ=${l.psi}, Λ=${l.Lambda}, k=${l.k} : la NB2 somme à 1, de moyenne Λ et de variance Λ + Λ²/k`, l.sommeNB === 1 && l.moyenneNB === l.Lambda && l.varianceNB === l.varianceTheorique);
  t(`ZINB ψ=${l.psi} : P(Y ≥ 1) = 1 − P(Y = 0) et π⁽⁰⁾ égale la règle de Bayes`, l.pAuMoinsUne === l.unMoinsPZero && l.pi0 === l.pi0Bayes && l.sommeZINB === 1);
}
const lim = R.e1_identitesZINB.limitePoisson;
t("limite k → ∞ : ψ[1 − (1 + Λ/k)^(−k)] tend vers ψ(1 − e^(−Λ))", lim.every((x, i) => i === 0 || x.ecart < lim[i - 1].ecart) && lim.at(-1).ecart < 1e-8);
// Valeurs non dégénérées : avec la convention inversée (ψ = probabilité du zéro structurel), ces égalités échouent.
t("convention : π_zero = 1 − ψ, jamais ψ (ψ = 0,6, Λ = 0,8, k = 2 : P(Y = 0) = 0,7061 et P(Y ≥ 1) = 0,2939)",
  Math.abs(pZINB(0, 0.6, 0.8, 2) - 0.70612) < 1e-4 && Math.abs(pAuMoinsUne(0.6, 0.8, 2) - 0.29388) < 1e-4 && Math.abs(pZINB(0, 0.6, 0.8, 2) - 0.6 * zeroNB(0.8, 2) - 0.4) < 1e-12);
t("bornes : ψ = 0 donne toujours zéro capture ; 0 ≤ P(Y ≥ 1) ≤ 1", pAuMoinsUne(0, 5, 2) === 0 && pZINB(0, 0, 5, 2) === 1 && [0.1, 0.5, 1].every((p) => [0.01, 1, 50].every((L) => { const v = pAuMoinsUne(p, L, 0.5); return v >= 0 && v <= 1; })));
t("ψ = 1 : aucune bredouille n'est attribuée à un zéro structurel ; ψ < 1 : une part l'est", zeroStructurel(0.6, 1, 2) > 0 && zeroStructurel(1, 1, 2) === 0);
const deux = [{ y: 3, Lbase: 1 }, { y: 0, Lbase: 1 }];
t("moteur 2 : une bredouille sans q n'est jamais comptée active par défaut (erreur)", (() => { try { thetaRatio(2, [{ y: 0, Lbase: 1 }]); return false; } catch { /* attendu */ } try { psiBeta(2, 2, [{ y: 0 }]); return false; } catch { return true; } })());
t("moteur 2 : ψ et k sont exigés par le posterior (aucun défaut silencieux vers ψ = 1, k infini)", (() => { try { thetaPosterieur(2, deux); return false; } catch { return true; } })());
t("moteur 2 : le contrôle de troncature du posterior signale une grille trop courte et accepte une grille assez large",
  thetaPosterieur(2, deux, { psi: 0.6, k: 2, max: 8 }).densiteAuBord > 1e-9 && thetaPosterieur(2, deux, { psi: 0.6, k: 2, max: 30 }).densiteAuBord < 1e-9);

// E2 — le ratio Gamma–Poisson n'est exact que dans le cas Poisson sans excès de zéros
const e2 = R.e2_gammaPoissonContreExact;
const poisson = e2.sansExces[0], kfaible = e2.sansExces.at(-1);
t("Gamma–Poisson : avec k → ∞ et ψ = 1, le ratio égale le posterior exact (moyenne et écart type)", Math.abs(poisson.ratio - poisson.moyenneExacte) < 0.005 && Math.abs(poisson.ecartTypeExact - poisson.ecartTypeGammaPoisson) < 0.005);
t("Gamma–Poisson : à k fini, le ratio sous-estime l'incertitude (écart type exact plus grand)", e2.sansExces.slice(1).every((x) => x.ecartTypeExact > x.ecartTypeGammaPoisson) && kfaible.ecartTypeExact > 1.5 * kfaible.ecartTypeGammaPoisson);
t("excès de zéros : le ratio naïf (sans q) biaise θ vers le bas ; le ratio de travail avec q s'approche du posterior exact",
  e2.avecExces.moyenneExacte - e2.avecExces.ratioNaif > 0.2 && Math.abs(e2.avecExces.ratioTravailAvecQ - e2.avecExces.moyenneExacte) < 0.05);

const e2b = R.e2b_biaisSimule.resultats;
t("simulation (400 jeux) : le ratio naïf sous-estime θ de plus de 25 % ; le ratio de travail reste à moins de 0,1 du posterior exact en moyenne",
  e2b.every((x) => x.naifMoyen < 0.75 && x.ecartTravailExactMoyen < 0.1));

// E3 — identifiabilité de ψ et k (λ = 0,45 capture par heure), puis de ψ et θ ensemble
const e3 = R.e3_identifiabilite.resultats.filter((x) => x.lambdaParHeure === 0.45), par = Object.fromEntries(e3.map((x) => [x.sessions, x]));
t("identifiabilité : avec 3 ou 10 sessions, ψ n'est pas estimable (moins d'une estimation sur deux à ±0,15)", par[3].partPsiA015 < 0.5 && par[10].partPsiA015 < 0.5);
t("identifiabilité : avec 200 sessions, ψ est estimé à ±0,15 au moins 9 fois sur 10 et k se distingue du Poisson", par[200].partPsiA015 >= 0.9 && par[200].partKSup50 < 0.1);
const jt = Object.fromEntries(R.e3_identifiabilite.psiEtThetaEnsemble.resultats.map((x) => [x.sessions, x]));
t("identifiabilité : ψ et l'effet de poste θ se confondent (estimations corrélées négativement) ; à 10 sessions, ni l'un ni l'autre n'est estimable",
  jt[40].correlationPsiTheta < -0.3 && jt[10].partPsiA015 < 0.5 && jt[10].partThetaA25pc < 0.5);

// E4 — la recombinaison des composantes égale le vrai moteur V2
const e4 = R.e4_architectures;
t(`recombinaison B-V2 = moteur V2 sur les ${e4.creneaux} créneaux des ${e4.spots} spots`, e4.recombinaisonEgaleMoteur && e4.spots === 66);
t("vent inconnu : la renormalisation V2 se trompe de plus de 10 points sur une part non nulle des créneaux (imputation cachée)", e4.ventInconnu.partErreurSup10 > 0 && e4.ventInconnu.erreurMax > 10);
t("A1 : un vent inconnu ne publie jamais un nombre (fourchette ou qualitatif)", !e4.ventInconnu.publicationA1.nombre);

// Données manquantes : jamais neutres (§ 9.1.5)
const c0 = { pts: { fenetre: 25, coef: 20, lumiere: 25 }, exclus: new Set(["vent"]), presence: 0.9, saison: 0.9, eauConnue: true };
const x = a1(c0);
t("données manquantes : l'intervalle A1 va du critère manquant à 0 jusqu'à son maximum", x.bas === Math.round(70 * 0.9) && x.haut === Math.round(100 * 0.9) && x.publication !== "nombre");
t("données manquantes : la baseline V2 renormalise (même note qu'avec un vent parfait), ce que la V3 interdit", bV2(c0).valeur === 90);
const bas = a1({ ...c0, presence: 0.3, saison: 0.3 }), plein = a1({ ...c0, exclus: new Set(), pts: { ...c0.pts, vent: 30 } });
t("A1 : jamais de nombre quand un critère manque, même avec une présence basse ; un nombre seulement si tout est connu", bas.publication !== "nombre" && bas.valeur == null && plein.publication === "nombre" && plein.valeur === 90);
const eau = a1({ ...c0, exclus: new Set(), pts: { ...c0.pts, vent: 30 }, eauConnue: false, saison: 0.95, presence: 0.95 });
t("A1 : une eau inconnue donne une présence entre le plancher et la saison, pas la saison seule (D6-03)", eau.bas === Math.round(100 * PRESENCE_PLANCHER) && eau.haut === 95 && eau.publication !== "nombre");
const complet = { ...c0, exclus: new Set(), pts: { ...c0.pts, vent: 30 } };
t("A1 : « tout connu » ne se lit jamais sur la largeur : eau non déclarée, saison au plancher ou présence nulle ne publient pas de nombre",
  a1({ ...complet, eauConnue: undefined }).publication !== "nombre" && a1({ ...complet, eauConnue: false, saison: 0.3, presence: 0.3 }).publication !== "nombre"
  && a1({ ...c0, presence: 0, saison: 0 }).publication !== "nombre"
  && a1({ ...complet, pts: { ...complet.pts, coef: NaN } }).publication !== "nombre" && a1({ ...complet, pts: { ...complet.pts, coef: "20" } }).publication !== "nombre"
  && a1({ ...complet, presence: NaN }).publication !== "nombre" && a1({ ...complet, presence: undefined }).publication !== "nombre");
t("A1 : une fourchette a de 1 à 20 points ; un intervalle incomplet de largeur nulle est publié en qualitatif", a1({ ...c0, presence: 0, saison: 0 }).publication === "qualitatif");

// Contrat de classement proposé (§ 9.1.6, § 9.1.7)
const S = (id, o) => ({ id, securite: "SAFE", aVerifier: false, accesFerme: false, trajetMin: 30, fav: 60, favLargeur: 0, confiance: 50, ...o });
const base = [S("a", { fav: 80 }), S("b", { fav: 78 }), S("c", { fav: 70, trajetMin: 12 }), S("d", { fav: 70 }), S("e", { fav: 65 }),
  S("f", { securite: "DANGER", fav: 99 }), S("g", { securite: "BLOCKED", fav: 98 }), S("h", { securite: "INSUFFICIENT_DATA", fav: 97 }),
  S("i", { aVerifier: true, fav: 96 }), S("j", { trajetMin: 75, fav: 95 }), S("k", { accesFerme: true, fav: 94 }), S("l", { fav: 93, favLargeur: 25 }), S("m", { fav: null })];
const r = classer(base);
const ids = (l) => l.map((s) => s.id);
t("classement : DANGER et BLOCKED ne sont jamais recommandés, même à 99", !ids(r.top).includes("f") && !ids(r.top).includes("g") && r.nonRecommandes.length === 2);
t("classement : INSUFFICIENT_DATA ne vaut jamais SAFE (rangé avec « à vérifier »)", ids(r.aVerifier).includes("h") && !ids(r.documentes).includes("h"));
t(`classement : au-delà de ${TRAJET_MAX_MIN} min ou accès fermé : exclus, avec la raison`, ["j", "k"].every((id) => r.exclus.some((e) => e.id === id && e.raison)));
t("classement : une note qui n'est qu'un intervalle (critère inconnu) n'est jamais classée parmi les spots documentés (D6-01)", ids(r.aVerifier).includes("l") && !ids(r.documentes).includes("l"));
const stricte = classer([S("a", { fav: 80 }), S("b", { fav: 79 }), S("c", { fav: 78 }), S("n", { trajetMin: null, trajetVerifie: true }), S("t", { trajetMin: "30" }),
  { id: "x", securite: "SAFE", trajetMin: 20, fav: 99 }, S("y", { fav: NaN }), S("p", { fav: 40, trajetMin: -5, trajetVerifie: true })]);
t("classement : entrées strictes : temps de route absent, en texte ou négatif exclu ; champs non déclarés ou note illisible jamais parmi les documentés",
  ["n", "t", "p"].every((id) => stricte.exclus.some((e) => e.id === id)) && ids(stricte.aVerifier).includes("x") && ids(stricte.aVerifier).includes("y") && ids(stricte.top).join() === "a,b,c"
  && ids(classer([{ ...S("z"), accesFerme: undefined }]).aVerifier).join() === "z");
t("classement : le Top vient des spots documentés et notés, par Favorabilité décroissante ; égalité stricte au 3e rang : un 4e", ids(r.top).join() === "a,b,c,d" && !r.top.some((s) => s.fav == null));
const conf = classer(base.map((s, i) => ({ ...s, confiance: (i * 37) % 101 })));
const ordres = (o) => JSON.stringify([ids(o.top), ids(o.documentes), ids(o.aVerifier), o.exclus.map((e) => e.id), o.nonRecommandes.map((e) => e.id), o.autresAEgalite]);
t("classement : changer toutes les Confiances ne change ni l'éligibilité ni l'ordre", ordres(conf) === ordres(classer(base.map((s) => ({ ...s, confiance: 0 })))) && ordres(conf) === ordres(r));
// Garde-fou structurel : la règle de classement ne lit ni la Confiance, ni la Pertinence, ni la boîte (V3-006, REC-02, REC-10).
const srcClasser = fs.readFileSync(path.join(root, "scripts/etude-moteur-bord/classement.mjs"), "utf8").replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, "");
t("classement : le code de la règle ne lit jamais la Confiance, la Pertinence ni la boîte", !/confiance|\bpert\b|pertinence|boite|\bbox\b/i.test(srcClasser));
const egal = classer([S("a", { fav: 80 }), S("b", { fav: 70 }), S("c", { fav: 70, trajetMin: 10 }), S("d", { fav: 70 }), S("e", { fav: 70 }), S("f", { fav: 70 }), S("g", { fav: 70 })]);
t("classement : égalité stricte au troisième rang : jusqu'à cinq spots, les autres signalés", egal.top.length === 5 && egal.autresAEgalite.length === 2);
const loin = classer([S("a", { fav: 80 }), S("b", { fav: 79 }), S("c", { fav: 78 }), S("p", { fav: 50, trajetMin: 14, trajetVerifie: true })]);
const res = loin.top.find((s) => s.id === "p");
t(`classement : place réservée à un spot à ${PROCHE_MIN} min ou moins de route vérifiée, sans bonus de Favorabilité`, loin.top.length === 3 && res?.placeReservee === true && res.fav === 50 && loin.deplacesParLaPlaceReservee.join() === "c");
const estime = classer([S("a", { fav: 80 }), S("b", { fav: 79 }), S("c", { fav: 78 }), S("p", { fav: 50, trajetMin: 14, trajetVerifie: false })]);
t("classement : un temps de route seulement estimé ne donne pas la place réservée", !estime.top.some((s) => s.placeReservee) && ids(estime.top).join() === "a,b,c");
const procheAV = classer([S("a", { fav: 80 }), S("b", { fav: 79 }), S("c", { fav: 78 }), S("p", { fav: 50, trajetMin: 5, trajetVerifie: true, securite: "INSUFFICIENT_DATA" })]);
t("classement : la place réservée ne va jamais à un spot « à vérifier »", !procheAV.top.some((s) => s.id === "p"));
const bord = classer([S("a", { trajetMin: 60 }), S("b", { trajetMin: 61 })]);
t("classement : 60 min de route gardé, 61 min exclu (V3-007)", ids(bord.documentes).join() === "a" && bord.exclus[0]?.id === "b");

// Contrat de sécurité BORD proposé (§ 9.5)
const C0 = { ventConnu: true, force: 3, rafalesKmh: 40, directionConnue: true, rade: false, houleConnue: true, houleM: 1, houleMaxM: 1.5, engagement: 2, coef: 70, coefMaxDur: null, isolement: false, nuit: false, fermetureOfficielle: false };
const E = (o) => etatSecurite({ ...C0, ...o }).etat;
t("sécurité : conditions connues et sous les seuils : SAFE", E({}) === "SAFE");
t("sécurité : force 8 ou rafales 90 km/h : DANGER ; force 6 ou rafales 60 km/h : CAUTION (seuils V2 validés)", E({ force: 8 }) === "DANGER" && E({ rafalesKmh: 90 }) === "DANGER" && E({ force: 6 }) === "CAUTION" && E({ rafalesKmh: 60 }) === "CAUTION");
t("sécurité : vent, rafales ou houle inconnus en côte ouverte : INSUFFICIENT_DATA, jamais SAFE", E({ ventConnu: false }) === "INSUFFICIENT_DATA" && E({ rafalesKmh: null }) === "INSUFFICIENT_DATA" && E({ houleConnue: false }) === "INSUFFICIENT_DATA");
t("sécurité : engagement inconnu de nuit : INSUFFICIENT_DATA (la V2 le laissait passer) ; engagé de nuit : DANGER", E({ engagement: null, nuit: true }) === "INSUFFICIENT_DATA" && E({ engagement: 3, nuit: true }) === "DANGER");
t("sécurité : houle au-dessus du maximum : CAUTION jusqu'à +0,5 m, DANGER au-delà ou sur un spot engagé", E({ houleM: 1.8 }) === "CAUTION" && E({ houleM: 2.1 }) === "DANGER" && E({ houleM: 1.8, engagement: 3 }) === "DANGER");
t("sécurité : isolement par le flot ou coefficient au-delà de la limite : DANGER ; accès selon la marée inconnu : INSUFFICIENT_DATA", E({ isolement: true }) === "DANGER" && E({ coef: 100, coefMaxDur: 95 }) === "DANGER" && E({ isolement: null }) === "INSUFFICIENT_DATA");
t("sécurité : fermeture officielle à la date : BLOCKED, quelle que soit la météo", E({ fermetureOfficielle: true }) === "BLOCKED");
t("sécurité : l'état le plus sévère l'emporte et toutes les raisons restent listées", (() => { const x = etatSecurite({ ...C0, force: 6, ventConnu: true, isolement: null }); return x.etat === "INSUFFICIENT_DATA" && x.raisons.length === 2; })());
t("sécurité : aucune donnée douteuse ne sort SAFE (nuit inconnue, côte inconnue avec houle inconnue, coefficient inconnu face à une limite, réglementation non lue, force ou rafales illisibles)",
  E({ engagement: 3, nuit: null }) === "INSUFFICIENT_DATA" && E({ rade: null, houleConnue: false }) === "INSUFFICIENT_DATA" && E({ coef: null, coefMaxDur: 95 }) === "INSUFFICIENT_DATA"
  && E({ fermetureOfficielle: null }) === "INSUFFICIENT_DATA" && E({ force: null }) === "INSUFFICIENT_DATA" && E({ force: NaN }) === "INSUFFICIENT_DATA" && E({ rafalesKmh: NaN }) === "INSUFFICIENT_DATA");
t("sécurité : seule une rade connue est exemptée de la houle inconnue (définition V2) ; un havre hors rade ne l'est pas", E({ rade: true, houleConnue: false }) === "SAFE" && E({ rade: false, houleConnue: false }) === "INSUFFICIENT_DATA");
t("sécurité : la pire heure du créneau et le plus fort des deux modèles sont lus (D6-14)", E({ force: [3, 6] }) === "CAUTION" && E({ force: [3, 5, 8] }) === "DANGER" && E({ rafalesKmh: [40, 95] }) === "DANGER"
  && E({ force: 3, forceAutreModele: 6 }) === "CAUTION" && E({ rafalesKmh: 40, rafalesAutreModele: 90 }) === "DANGER");
t("sécurité : une heure ou un second modèle sans valeur, une valeur négative ou une limite illisible ne sortent jamais SAFE",
  [{ force: [3, NaN] }, { force: [3, null] }, { rafalesKmh: [40, null] }, { houleM: [1, null] }, { coef: [70, null], coefMaxDur: 95 }, { forceAutreModele: null }, { forceAutreModele: [2, NaN] },
    { force: -3 }, { rafalesKmh: -10 }, { houleM: -1 }, { coefMaxDur: "95", coef: 110 }, { coefMaxDur: NaN, coef: 110 }, { houleMaxM: "1.5" }, { houleMaxM: [1.5, 3] }].every((o) => E(o) !== "SAFE"));
t("sécurité : un second modèle absent est accepté (la Confiance le dit), le niveau affiché n'est jamais un vert", (() => { const x = etatSecurite(C0); return x.etat === "SAFE" && x.niveauAffiche === "Aucune alerte connue"; })());
t("sécurité : les prudences V2 (consignes actives, poste engagé, nuit sur un poste de niveau 2) s'affichent sans changer l'état",
  (() => { const x = etatSecurite({ ...C0, engagement: 2, nuit: true, consignesActives: ["la mer qui monte coupe le retour : garder une porte de sortie"] }); const y = etatSecurite({ ...C0, engagement: 3 });
    return x.etat === "SAFE" && x.prudences.length === 2 && x.niveauAffiche === "Prudence" && y.etat === "SAFE" && y.niveauAffiche === "Prudence"; })());
t("sécurité : aucune entrée, ou des consignes données en texte : tout est inconnu, et une consigne reste une seule prudence",
  etatSecurite(undefined).etat === "INSUFFICIENT_DATA" && etatSecurite({ ...C0, consignesActives: "la mer monte vite" }).prudences.length === 1);
t("sécurité : les facteurs du § 9.5 non évalués sont toujours listés à côté de l'état", etatSecurite(C0).nonEvalues.length === 7 && etatSecurite(C0).nonEvalues.some((x) => /mouvements de terrain/.test(x)) && etatSecurite(C0).nonEvalues.some((x) => /exposition/.test(x)));

// Confiance proposée (§ 9.1.5) : maillon le plus faible, dimension limitante nommée, ne fait que baisser la publication
const dims = { donnees: 100, couverture: 100, accord: 75, preuvesRegles: dimPreuvesRegles([{ max: 25, niveau: 2 }, { max: 20, niveau: 4 }, { max: 25, niveau: 2 }, { max: 30, niveau: 2 }], 4), preuvesPoste: dimPreuvesPoste({ statut: "TOP_TIER", positionControlee: true }), domaine: 100 };
const cf = confiance(dims);
t("Confiance : la plus basse des six dimensions, nommée (présence N4 : preuves des règles à 40, moyenne au mieux)", cf.score === 40 && cf.limitante === "preuvesRegles" && cf.niveau === "moyenne");
t("Confiance : âge ou échéance inconnus → 0 ; un seul modèle → 40 (sans corroboration) ; eau utilisée de maille inconnue → 60",
  dimDonnees({ ageHeures: null, joursAvant: 0 }) === 0 && dimDonnees({ ageHeures: 2, joursAvant: null }) === 0 && dimAccord({}) === 40 && dimDonnees({ ageHeures: 2, joursAvant: 1 }) === 83
  && dimDomaine({ eauUtilisee: true }) === 60 && dimDomaine({ eauUtilisee: true, eauMailleKm: 8 }) === 100);
t("Confiance : seules « haute » et « moyenne » gardent le nombre ; elle n'élève jamais la publication",
  publier("nombre", "faible") === "qualitatif" && publier("nombre", undefined) === "qualitatif" && publier("nombre", "Faible") === "qualitatif" && publier("fourchette", "haute") === "fourchette" && publier("nombre", "haute") === "nombre");
const jette = (d) => { try { confiance(d); return false; } catch { return true; } };
t("Confiance : exactement les six dimensions nommées, chacune de 0 à 100 (aucune ne manque ni ne se cache derrière une clé en trop)",
  jette({ donnees: 1 }) && jette({ a: 90, b: 90, c: 90, d: 90, e: 90, f: 90 }) && jette({ ...dims, extra: 0 }) && jette({ ...dims, accord: 120 }) && !jette(dims));

const e7 = R.e7_defautsMoteurV2;
t("sécurité : seuils du contrat proposé égaux à ceux du moteur V2", JSON.stringify(e7.seuilsSecuriteMoteur) === JSON.stringify({ WIND_LIMITS, HOULE_MARGE }));
t("audit A12 : sur le vrai moteur V2, un engagement absent laisse passer la nuit (défaut à ne pas reprendre)", e7.engagementInconnuDeNuit.engageBloque && !e7.engagementInconnuDeNuit.inconnuBloque && e7.engagementInconnuDeNuit.spotsV2SansEngagement === 0);
t("audit A5 : sur le vrai moteur V2, une houle inconnue retire le critère vent, qui ne lit pourtant que le vent", e7.houleInconnueRetireLeVent.spotsTouches > 0 && e7.houleInconnueRetireLeVent.ecartNote.max > 0);

// Scénarios et fixtures (data/moteur-bord/scenarios.json), sur le vrai moteur V2
const e8 = R.e8_scenarios;
for (const [id, ok] of Object.entries(e8.proprietesTenues)) t(`scénario ${id} : ${JSON.parse(fs.readFileSync(path.join(root, "data/moteur-bord/scenarios.json"), "utf8")).scenarios.find((x) => x.id === id).propriete}`, ok === true);
t("scénarios : 24 fixtures, toutes jouées", e8.scenarios === 24 && Object.keys(e8.proprietesTenues).length === 24);
const fx = JSON.parse(fs.readFileSync(path.join(root, "data/moteur-bord/scenarios.json"), "utf8")).scenarios;
t("scénarios : toute hypothèse d'essai (`supposeDocumente`) est déclarée en clair dans la fixture", fx.every((x) => !x.entree?.supposeDocumente || (typeof x.hypotheseDEssai === "string" && x.hypotheseDEssai.length > 20)));
const e9 = R.e9_admissibiliteStatique;
t("fiches : avec les données de sécurité actuelles, aucune fiche ne peut être SAFE (impact de D6-15 et D6-21 mesuré) ; 23 contraintes de marée connues mais non situées",
  e9.fiches === 98 && e9.peuventEtreSAFE === 0 && e9.raisonsParFiche.fenetreSecurite === 23
  && Object.values(e9.combinaisons).reduce((a, b) => a + b, 0) === 98);

console.log(`[étude moteur BORD] identités, Gamma–Poisson, identifiabilité, architectures, classement : ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
