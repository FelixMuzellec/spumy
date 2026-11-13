// v9.1 — CONFIANCE DANS LE CONSEIL : un indicateur à part, qui ne fait pas semblant d'être une note.
//
// Aucun pourcentage, aucun « /100 » : on ne sait pas mesurer la probabilité qu'un conseil soit juste.
// On sait en revanche dire ce que le conseil a eu sous la main et ce qui lui a manqué. La confiance est
// donc une liste de constats (météo et sa fraîcheur, accord des modèles, houle, eau, stabilité du
// classement, fiche, marée, journal), résumée en trois mots :
//   « élevée »  rien ne manque ;
//   « moyenne » une ou deux réserves ;
//   « faible »  une donnée essentielle manque (pas de météo, météo de plus de 10 jours ou hors ligne
//               depuis plus de 12 h, classement volatil), ou trois réserves et plus.
// Ces règles de résumé sont des choix de présentation, pas une mesure : la liste détaillée reste affichée.

export const CONFIDENCE_LEVELS = {
  elevee: { label: "Élevée", dots: 3 },
  moyenne: { label: "Moyenne", dots: 2 },
  faible: { label: "Faible", dots: 1 },
};

const ageText = (ms) => {
  const m = Math.max(0, Math.round(ms / 60000));
  if (m < 60) return `${m} min`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} h` : `${Math.round(h / 24)} jours`;
};

/**
 * s : spot noté (stability, custom, zw, tideAccuracy) ; w : créneau retenu (zw) ;
 * live : météo du jour (null si absente ; _wxAt, _stale, sst_confidence) ;
 * dayOffset : écart au jour même ; calib : calibration du journal ; now : horloge (ms).
 * Renvoie { level, label, dots, items: [{ ok: "ok"|"reserve"|"manque"|"info", t }] }.
 */
export function confidenceOf(s, w, { live = null, dayOffset = 0, calib = null, now = Date.now() } = {}) {
  const items = [];
  const add = (ok, t) => items.push({ ok, t });
  const zw = w?.zw || s?.zw || null;

  if (!live) add("manque", "Pas de météo : conseil sur la marée et la lumière seules.");
  else {
    if (dayOffset > 10) add("manque", "Au-delà de 10 jours : la météo n'est qu'une tendance.");
    if (live._stale) {
      const age = live._wxAt ? now - live._wxAt : null;
      add(age != null && age > 12 * 36e5 ? "manque" : "reserve", `Hors ligne : météo téléchargée il y a ${age != null ? ageText(age) : "un moment"}.`);
    } else if (live._wxAt) add("ok", `Météo téléchargée il y a ${ageText(now - live._wxAt)}.`);
    const model = zw?.model || "";
    if (/AROME/.test(model)) add("ok", "Vent du modèle AROME de Météo-France (maille d'environ 1,3 km).");
    else if (/ECMWF/.test(model)) add("reserve", "Vent du seul modèle ECMWF, global et moins fin qu'AROME près des côtes (au-delà de l'échéance d'AROME).");
    if (zw?.alt && ((zw.spreadF || 1) >= 2 || (zw.spreadD || 1) >= 2)) add("reserve", `AROME et ECMWF en désaccord sur le vent (l'autre modèle annonce ${zw.alt.dir || "?"} ${zw.alt.kmh} km/h).`);
    if (zw?.houleKnown === false) add("reserve", "Houle inconnue (modèle de vagues indisponible ici).");
    else if (zw) add("ok", "Houle prévue au spot.");
    const sstConf = live.sst_confidence;
    if (sstConf === "inconnue" || live.sst == null) add("reserve", "Température de l'eau inconnue : présence du bar estimée sur la saison seule.");
    else add("ok", "Température de l'eau du modèle Open-Meteo Marine.");
  }

  if (s?.stability === "stable") add("ok", "Classement stable si le vent varie d'un Beaufort ou d'un secteur.");
  else if (s?.stability === "sensible") add("reserve", "Classement sensible : un Beaufort ou un secteur de vent de plus peut changer le premier spot.");
  else if (s?.stability === "volatile") add("manque", "Classement volatil : il dépend d'une valeur exacte du vent.");

  if (s?.custom) add("reserve", "Spot ajouté par toi : exposition, fond et créneaux estimés, pas sourcés.");
  else if (s) add("ok", "Fiche du guide, sources citées.");
  if (s?.tideAccuracy && /interpol/i.test(s.tideAccuracy)) add("reserve", "Marée interpolée entre deux ports de référence.");
  else if (s?.tideAccuracy) add("ok", /SHOM/.test(s.tideAccuracy) ? "Marée calculée sur l'appareil, contrôlée contre les tables du SHOM." : "Marée calculée sur l'appareil.");

  const n = calib?.detail?.[s?.id]?.n || 0;
  add("info", n ? `Note ajustée par ton journal (${n} session${n > 1 ? "s" : ""} sur ce spot).` : "Aucune session notée ici : ton journal affinera la note.");

  const manque = items.filter((i) => i.ok === "manque").length, reserve = items.filter((i) => i.ok === "reserve").length;
  const level = manque || reserve >= 3 ? "faible" : reserve ? "moyenne" : "elevee";
  const order = { manque: 0, reserve: 1, ok: 2, info: 3 };
  items.sort((a, b) => order[a.ok] - order[b.ok]);
  return { level, ...CONFIDENCE_LEVELS[level], items };
}
