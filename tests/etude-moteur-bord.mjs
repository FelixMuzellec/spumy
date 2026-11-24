// Phase 6 V3 — étude du moteur BORD (PROVISOIRE) : identités mathématiques du ZINB, limites du ratio Gamma–Poisson,
// identifiabilité, recombinaison fidèle du moteur V2, contrat de classement proposé, données manquantes jamais neutres,
// et résultats de l'étude identiques au fichier versionné (déterministes).
// Usage : node tests/etude-moteur-bord.mjs
import fs from "node:fs";
import path from "node:path";
import { etude } from "../scripts/etude-moteur-bord/etude.mjs";
import { classer, TRAJET_MAX_MIN, PROCHE_MIN } from "../scripts/etude-moteur-bord/classement.mjs";
import { a1, bV2 } from "../scripts/etude-moteur-bord/architectures.mjs";
import { pAuMoinsUne, zeroStructurel, pZINB } from "../scripts/etude-moteur-bord/zinb.mjs";
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
t("convention : π_zero = 1 − ψ (zéro structurel), jamais ψ", Math.abs(pZINB(0, 0.7, 1e-12, 2) - 0.3 - 0.7) < 1e-9 && Math.abs(pAuMoinsUne(1, 0, 2)) < 1e-12);
t("une capture confirmée exclut le zéro structurel (q = 1) ; un résultat inconnu n'a pas de q", zeroStructurel(0.6, 1, 2) > 0 && zeroStructurel(1, 1, 2) === 0);

// E2 — le ratio Gamma–Poisson n'est exact que dans le cas Poisson sans excès de zéros
const e2 = R.e2_gammaPoissonContreExact;
const poisson = e2.sansExces[0], kfaible = e2.sansExces.at(-1);
t("Gamma–Poisson : avec k → ∞ et ψ = 1, le ratio égale le posterior exact (moyenne et écart type)", Math.abs(poisson.ratio - poisson.moyenneExacte) < 0.005 && Math.abs(poisson.ecartTypeExact - poisson.ecartTypeGammaPoisson) < 0.005);
t("Gamma–Poisson : à k fini, le ratio sous-estime l'incertitude (écart type exact plus grand)", e2.sansExces.slice(1).every((x) => x.ecartTypeExact > x.ecartTypeGammaPoisson) && kfaible.ecartTypeExact > 1.5 * kfaible.ecartTypeGammaPoisson);
t("excès de zéros : le ratio naïf (sans q) biaise θ vers le bas ; le ratio de travail avec q s'approche du posterior exact",
  e2.avecExces.moyenneExacte - e2.avecExces.ratioNaif > 0.2 && Math.abs(e2.avecExces.ratioTravailAvecQ - e2.avecExces.moyenneExacte) < 0.05);

// E3 — identifiabilité de ψ et k
const e3 = R.e3_identifiabilite.resultats, par = Object.fromEntries(e3.map((x) => [x.sessions, x]));
t("identifiabilité : avec 3 ou 10 sessions, ψ n'est pas estimable (moins d'une estimation sur deux à ±0,15)", par[3].partPsiA015 < 0.5 && par[10].partPsiA015 < 0.5);
t("identifiabilité : avec 200 sessions, ψ est estimé à ±0,15 au moins 9 fois sur 10 et k se distingue du Poisson", par[200].partPsiA015 >= 0.9 && par[200].partKPoisson < 0.1);

// E4 — la recombinaison des composantes égale le vrai moteur V2
const e4 = R.e4_architectures;
t(`recombinaison B-V2 = moteur V2 sur les ${e4.creneaux} créneaux des ${e4.spots} spots`, e4.recombinaisonEgaleMoteur && e4.spots === 66);
t("vent inconnu : la renormalisation V2 se trompe de plus de 10 points sur une part non nulle des créneaux (imputation cachée)", e4.ventInconnu.partErreurSup10 > 0 && e4.ventInconnu.erreurMax > 10);
t("A1 : un vent inconnu ne publie jamais un nombre précis (fourchette ou qualitatif)", !e4.ventInconnu.publicationA1.nombre);

// Données manquantes : jamais neutres (§ 9.1.5)
const c0 = { pts: { fenetre: 25, coef: 20, lumiere: 25 }, exclus: new Set(["vent"]), presence: 0.9, saison: 0.9, eauConnue: true };
const x = a1(c0);
t("données manquantes : l'intervalle A1 va du critère manquant à 0 jusqu'à son maximum", x.bas === Math.round(70 * 0.9) && x.haut === Math.round(100 * 0.9) && x.publication !== "nombre");
t("données manquantes : la baseline V2 renormalise (même note qu'avec un vent parfait), ce que la V3 interdit", bV2(c0).valeur === 90);

// Contrat de classement proposé (§ 9.1.6, § 9.1.7)
const S = (id, o) => ({ id, securite: "SAFE", aVerifier: false, accesFerme: false, interdit: false, trajetMin: 30, fav: 60, confiance: 50, ...o });
const base = [S("a", { fav: 80 }), S("b", { fav: 78 }), S("c", { fav: 70, trajetMin: 12 }), S("d", { fav: 70 }), S("e", { fav: 65 }),
  S("f", { securite: "DANGER", fav: 99 }), S("g", { securite: "BLOCKED", fav: 98 }), S("h", { securite: "INSUFFICIENT_DATA", fav: 97 }),
  S("i", { aVerifier: true, fav: 96 }), S("j", { trajetMin: 75, fav: 95 }), S("k", { accesFerme: true, fav: 94 }), S("l", { interdit: true, fav: 93 }), S("m", { fav: null })];
const r = classer(base);
const ids = (l) => l.map((s) => s.id);
t("classement : DANGER et BLOCKED ne sont jamais recommandés, même à 99", !ids(r.top).includes("f") && !ids(r.top).includes("g") && r.nonRecommandes.length === 2);
t("classement : INSUFFICIENT_DATA ne vaut jamais SAFE (rangé avec « à vérifier »)", ids(r.aVerifier).includes("h") && !ids(r.documentes).includes("h"));
t(`classement : au-delà de ${TRAJET_MAX_MIN} min, accès fermé ou pêche interdite : exclus, avec la raison`, ["j", "k", "l"].every((id) => r.exclus.some((e) => e.id === id && e.raison)));
t("classement : le Top vient des spots documentés et notés, par Favorabilité décroissante ; égalité stricte au 3e rang : un 4e", ids(r.top).join() === "a,b,c,d" && !r.top.some((s) => s.fav == null));
const conf = classer(base.map((s, i) => ({ ...s, confiance: (i * 37) % 101 })));
const ordres = (o) => JSON.stringify([ids(o.top), ids(o.documentes), ids(o.aVerifier), o.exclus.map((e) => e.id), o.nonRecommandes.map((e) => e.id), o.autresAEgalite]);
t("classement : changer toutes les Confiances ne change ni l'éligibilité ni l'ordre", ordres(conf) === ordres(classer(base.map((s) => ({ ...s, confiance: 0 })))) && ordres(conf) === ordres(r));
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
const C0 = { ventConnu: true, force: 3, rafalesKmh: 40, directionConnue: true, coteOuverte: true, houleConnue: true, houleM: 1, houleMaxM: 1.5, engagement: 2, coef: 70, coefMaxDur: null, isolement: false, nuit: false, fermetureOfficielle: false };
const E = (o) => etatSecurite({ ...C0, ...o }).etat;
t("sécurité : conditions connues et sous les seuils : SAFE", E({}) === "SAFE");
t("sécurité : force 8 ou rafales 90 km/h : DANGER ; force 6 ou rafales 60 km/h : CAUTION (seuils V2 validés)", E({ force: 8 }) === "DANGER" && E({ rafalesKmh: 90 }) === "DANGER" && E({ force: 6 }) === "CAUTION" && E({ rafalesKmh: 60 }) === "CAUTION");
t("sécurité : vent, rafales ou houle inconnus en côte ouverte : INSUFFICIENT_DATA, jamais SAFE", E({ ventConnu: false }) === "INSUFFICIENT_DATA" && E({ rafalesKmh: null }) === "INSUFFICIENT_DATA" && E({ houleConnue: false }) === "INSUFFICIENT_DATA");
t("sécurité : engagement inconnu de nuit : INSUFFICIENT_DATA (la V2 le laissait passer) ; engagé de nuit : DANGER", E({ engagement: null, nuit: true }) === "INSUFFICIENT_DATA" && E({ engagement: 3, nuit: true }) === "DANGER");
t("sécurité : houle au-dessus du maximum : CAUTION jusqu'à +0,5 m, DANGER au-delà ou sur un spot engagé", E({ houleM: 1.8 }) === "CAUTION" && E({ houleM: 2.1 }) === "DANGER" && E({ houleM: 1.8, engagement: 3 }) === "DANGER");
t("sécurité : isolement par le flot ou coefficient au-delà de la limite : DANGER ; accès selon la marée inconnu : INSUFFICIENT_DATA", E({ isolement: true }) === "DANGER" && E({ coef: 100, coefMaxDur: 95 }) === "DANGER" && E({ isolement: null }) === "INSUFFICIENT_DATA");
t("sécurité : fermeture officielle à la date : BLOCKED, quelle que soit la météo", E({ fermetureOfficielle: true }) === "BLOCKED");
t("sécurité : l'état le plus sévère l'emporte et toutes les raisons restent listées", (() => { const x = etatSecurite({ ...C0, force: 6, ventConnu: true, isolement: null }); return x.etat === "INSUFFICIENT_DATA" && x.raisons.length === 2; })());
const e7 = R.e7_defautsMoteurV2;
t("sécurité : seuils du contrat proposé égaux à ceux du moteur V2", JSON.stringify(e7.seuilsSecuriteMoteur) === JSON.stringify({ WIND_LIMITS, HOULE_MARGE }));
t("audit A12 : sur le vrai moteur V2, un engagement absent laisse passer la nuit (défaut à ne pas reprendre)", e7.engagementInconnuDeNuit.engageBloque && !e7.engagementInconnuDeNuit.inconnuBloque && e7.engagementInconnuDeNuit.spotsV2SansEngagement === 0);
t("audit A5 : sur le vrai moteur V2, une houle inconnue retire le critère vent, qui ne lit pourtant que le vent", e7.houleInconnueRetireLeVent.spotsTouches > 0 && e7.houleInconnueRetireLeVent.ecartNote.max > 0);

console.log(`[étude moteur BORD] identités, Gamma–Poisson, identifiabilité, architectures, classement : ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
