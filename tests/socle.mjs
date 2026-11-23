// Phase 4 V3 — socle commun : erreur commune et validation des entrées (ARCHITECTURE-V3 § 11.4 et § 11.1).
// Usage : node tests/socle.mjs
import { SpumyError, MESSAGES, expurger, isSpumyError, ok, fail } from "../src/core/errors.js";
import { borne, coordonnees, coefficient, heureIso, cle100m } from "../src/core/validate.js";
import * as ign from "../src/core/ign/reponses.js";

let pass = 0, failN = 0;
const t = (name, cond, info = "") => { if (cond) pass++; else { failN++; console.log(`   ÉCHEC · ${name}${info ? ` — ${info}` : ""}`); } };

// Erreur commune
const cause = new Error("fetch failed");
const e = new SpumyError("SERVICE_ERREUR", { cause, details: { service: "open-meteo", lat: 49.16672, lon: -1.58331, token: "github_pat_x", journal: [1], notes: "privé" } });
t("SpumyError : code stable et message par défaut en français", e.code === "SERVICE_ERREUR" && e.message === MESSAGES.SERVICE_ERREUR && e.name === "SpumyError");
t("SpumyError : la cause d'origine est gardée", e.cause === cause);
t("SpumyError : détails expurgés (jeton, journal, notes retirés ; coordonnées arrondies à 0,01°)", !("token" in e.details) && !("journal" in e.details) && !("notes" in e.details) && e.details.lat === 49.17 && e.details.lon === -1.58 && e.details.service === "open-meteo", JSON.stringify(e.details));
t("SpumyError : message propre possible", new SpumyError("VALIDATION", { message: "latitude : un nombre est attendu." }).message === "latitude : un nombre est attendu.");
t("isSpumyError distingue l'erreur commune", isSpumyError(e) && !isSpumyError(cause));
t("chaque code a un message", Object.values(MESSAGES).every((m) => typeof m === "string" && m.length > 10));
t("expurger : rien n'est perdu d'autre", JSON.stringify(expurger({ a: 1, b: "x" })) === '{"a":1,"b":"x"}');
t("ok / fail", ok(3).ok === true && ok(3).value === 3 && fail(e).ok === false && fail(e).error === e);

// Validation
t("borne : nombre dans l'intervalle", borne(5, 0, 10, "x").ok && borne("4,5", 0, 10, "x").value === 4.5);
t("borne : refuse hors intervalle, NaN, texte, vide, null", [borne(11, 0, 10, "x"), borne(NaN, 0, 10, "x"), borne("abc", 0, 10, "x"), borne("", 0, 10, "x"), borne(null, 0, 10, "x")].every((r) => !r.ok && r.error.code === "VALIDATION"));
const c = coordonnees("49,1667", -1.5833);
t("coordonnées : virgule ou point acceptés", c.ok && c.value.lat === 49.1667 && c.value.lon === -1.5833);
t("coordonnées : refuse une latitude de 91 et une longitude de 200", !coordonnees(91, 0).ok && !coordonnees(0, 200).ok);
t("coordonnées : le message dit le champ", !coordonnees(91, 0).ok && coordonnees(91, 0).error.message.startsWith("latitude"));
t("coefficient : entier de 20 à 120", coefficient(78).ok && !coefficient(78.5).ok && !coefficient(19).ok && !coefficient(121).ok);
t("heure ISO : avec fuseau seulement", heureIso("2026-11-23T06:00:00Z").ok && heureIso("2026-11-23T07:00+01:00").ok && !heureIso("2026-11-23 06:00").ok && !heureIso("2026-11-23T06:00:00").ok && !heureIso(42).ok);
t("clé de cache arrondie à environ 100 m", cle100m({ lat: 49.16672, lon: -1.58331 }) === "49.167,-1.583");

// Réponses IGN (ARCHITECTURE-V3 § 5) : formes observées le 23 nov. 2026 (contrat IGN, passage 45210735483)
const COUTANCES = { lon: -1.445, lat: 49.048 };
const carre = (cx, cy, d) => [[cx - d, cy - d], [cx + d, cy - d], [cx + d, cy + d], [cx - d, cy + d], [cx - d, cy - d]];
const it = ign.itineraire({ duration: 2899, distance: 30032.2, timeUnit: "second", distanceUnit: "meter" });
t("IGN itinéraire : secondes et mètres convertis (2 899 s, 30,0 km → 48,3 min)", it.ok && Math.abs(it.value.minutes - 48.32) < 0.01 && Math.abs(it.value.km - 30.03) < 0.01);
t("IGN itinéraire : refuse durée absente, nulle, négative, au-delà de 10 h", ["x", 0, -5, 40000].every((d) => !ign.itineraire({ duration: d, distance: 30000 }).ok));
t("IGN itinéraire : refuse une vitesse absurde (30 km en 1 min) et une unité inconnue",
  !ign.itineraire({ duration: 60, distance: 30000 }).ok && !ign.itineraire({ duration: 2899, distance: 30032, timeUnit: "jour" }).ok);
const ri = ign.itineraire(null);
t("IGN itinéraire : réponse vide → SERVICE_REPONSE_INVALIDE avec sa raison", !ri.ok && ri.error.code === "SERVICE_REPONSE_INVALIDE" && ri.error.details.service === "itineraire");
const zone = { geometry: { type: "Polygon", coordinates: [carre(-1.445, 49.048, 0.5)] } };
t("IGN isochrone : polygone fermé, en France, contenant le départ", ign.isochrone(zone, COUTANCES).ok);
t("IGN isochrone : refuse une zone qui ne contient pas le départ", !ign.isochrone({ geometry: { type: "Polygon", coordinates: [carre(2.35, 48.85, 0.3)] } }, COUTANCES).ok);
const ouvert = carre(-1.445, 49.048, 0.5).slice(0, 4).concat([[-1.9, 48.5]]);
t("IGN isochrone : refuse un anneau ouvert, un point hors de France, une géométrie absente ou de type ligne",
  !ign.isochrone({ geometry: { type: "Polygon", coordinates: [ouvert] } }, COUTANCES).ok
  && !ign.isochrone({ geometry: { type: "Polygon", coordinates: [carre(-1.445, 49.048, 20)] } }, COUTANCES).ok
  && !ign.isochrone({}, COUTANCES).ok && !ign.isochrone({ geometry: { type: "LineString", coordinates: [[0, 0], [1, 1]] } }, COUTANCES).ok);
const troue = { type: "Polygon", coordinates: [carre(-1.445, 49.048, 0.5), carre(-1.2, 49.2, 0.1)] };
t("IGN zone : un point dans un trou n'est pas dans la zone ; MultiPolygon pris en charge",
  ign.dansZone(COUTANCES, troue) && !ign.dansZone({ lon: -1.2, lat: 49.2 }, troue)
  && ign.dansZone({ lon: 2.35, lat: 48.85 }, { type: "MultiPolygon", coordinates: [[carre(-1.445, 49.048, 0.5)], [carre(2.35, 48.85, 0.3)]] }));
t("IGN géocodage : premier lieu utilisable, sinon erreur",
  ign.geocodage({ features: [{ geometry: { coordinates: [-1.4452, 49.0476] }, properties: { label: "Coutances" } }] }).ok
  && !ign.geocodage({ features: [] }).ok && !ign.geocodage({ features: [{ geometry: { coordinates: [55.45, -20.88] }, properties: { label: "Saint-Denis" } }] }).ok);

console.log(`[socle] erreurs et validation : ${pass}/${pass + failN}`);
process.exit(failN ? 1 : 0);
