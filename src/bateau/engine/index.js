// Phase 13 — Moteur BATEAU : la sortie (sécurité d'abord), puis, par zone, les espèces ouvertes avec leurs trois scores.
// Spécification : docs/SPEC-MOTEUR-BATEAU.md. Données : data/bateau/moteur.json. Rien de ce module ne lit le réseau.
import { milles, RAPPELS, ST, tripSafety, worse } from "./safety.js";
import { lightOf, rankSpecies } from "./species.js";

export { beaufort, milles, profileProblems, RAPPELS, ST, thresholds, tripSafety } from "./safety.js";
export { closedOn, confidence, criteria, ESPECES, favorability, lightOf, personalAdjust, presence, rankSpecies, relevance, weightNeeded } from "./species.js";

/** Temps de route (min) depuis ton port d'attache (premier abri) à ta vitesse (nœuds). */
export function routeMinutes(profile, zone) {
  const port = (profile?.abris || [])[0];
  const d = milles(port, zone), v = profile?.vitesseNds;
  return d == null || !Number.isFinite(v) || v <= 0 ? null : (d / v) * 60;
}

/**
 * Une zone pour un créneau : { safety, species, light, routeMin }.
 * args = { profile, zone, hours, start, end, sun, ageH, date, tide, sst, caught, trips }
 * La favorabilité est calculée sur le milieu du créneau (lumière) et le pire du créneau (vent, mer).
 */
export function evaluateZone(args) {
  const { profile, zone, hours = [], start, end, sun, ageH, date, tide, sst, caught, trips } = args;
  const safety = tripSafety({ profile, zone, hours, start, end, sun, ageH });
  const mid = (start + end) / 2;
  const light = lightOf(mid, sun);
  const routeMin = routeMinutes(profile, zone);
  const win = hours.filter((h) => h.t >= start - 18e5 && h.t <= end);
  const visibilityKnown = win.length > 0 && win.every((h) => Number.isFinite(h.visibility));
  const species = rankSpecies({ zone, profile, date, light, bf: safety.worst.bf, wave: safety.worst.wave?.v ?? null, sst, tide, ageH, visibilityKnown, routeMin, caught, trips });
  return { safety, species, light, routeMin };
}

/**
 * Toutes tes zones pour un créneau : la sortie est jugée zone par zone ; le verdict global est celui de la meilleure
 * zone (une zone sûre suffit pour sortir), et les zones non recommandées restent listées avec leur raison.
 * Classement : zones sans doute avant zones à vérifier, puis meilleure favorabilité ; la confiance ne change rien.
 */
export function evaluateTrip(args) {
  const zones = (args.zones || []).map((zone) => ({ zone, ...evaluateZone({ ...args, zone }) }));
  const order = { ok: 0, verify: 1, nr: 2 };
  zones.sort((a, b) => order[a.safety.status] - order[b.safety.status] || (b.species.especes[0]?.fav ?? -1) - (a.species.especes[0]?.fav ?? -1));
  const best = zones[0];
  const status = !zones.length ? ST.VERIFY : best.safety.status;
  return { status, zones, rappels: RAPPELS, worstOfAll: zones.reduce((s, z) => worse(s, z.safety.status), ST.OK) };
}
