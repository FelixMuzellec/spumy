// Phase 4 V3 — socle commun : erreur commune et validation des entrées (ARCHITECTURE-V3 § 11.4 et § 11.1).
// Usage : node tests/socle.mjs
import { SpumyError, MESSAGES, expurger, isSpumyError, ok, fail } from "../src/core/errors.js";
import { borne, coordonnees, coefficient, heureIso, cle100m } from "../src/core/validate.js";

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

console.log(`[socle] erreurs et validation : ${pass}/${pass + failN}`);
process.exit(failN ? 1 : 0);
