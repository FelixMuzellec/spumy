// Comparaison de noms de lieux, commune à l'intégration des accès (toponymes IGN) et des photos (Wikimedia Commons).
export const GENERIQUES = new Set(["de", "du", "des", "la", "le", "les", "l", "d", "et", "sur", "a", "au", "aux", "en", "pointe", "plage", "anse", "baie", "embouchure", "embouchures", "estuaire", "rochers", "dunes", "sillon", "ile", "cap", "havre", "greve", "pont", "digue"]);
export const mots = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter((w) => w && !GENERIQUES.has(w));
/** Le toponyme porte-t-il le nom du spot ? Tous ses mots significatifs sont dans le nom du spot, ou l'inverse. */
export function memeNom(spot, topo) {
  const a = mots(spot), b = mots(topo);
  if (!a.length || !b.length) return false;
  return b.every((w) => a.includes(w)) || a.every((w) => b.includes(w));
}
/**
 * Parties nommantes d'un nom de spot : « Carantec : Penn al Lann – Cosmeur » → [« Penn al Lann », « Cosmeur »].
 * Ce qui précède « : » est la commune ; il ne sert que si la suite n'a aucun mot significatif.
 */
export function partiesDuNom(nom) {
  const [avant, apres] = nom.includes(":") ? nom.split(/\s*:\s*/, 2) : [null, nom];
  const decoupe = (s) => s.split(/\s+[–-]\s+|\s+et\s+(?:du|de la|de l'|des)?\s*/i).map((p) => p.trim()).filter((p) => mots(p).length);
  const parties = decoupe(apres);
  return parties.length ? parties : avant ? decoupe(avant) : [];
}
/**
 * Un texte (titre, description) nomme-t-il le spot ? Tous les mots significatifs d'une de ses parties y figurent.
 * Quand le seul nom est celui de la commune (« Locquirec : pointe et digue »), le texte doit aussi nommer l'élément
 * (« pointe », « digue ») : une photo de la mairie de Locquirec n'est pas une photo du spot.
 */
export function texteNommeLeSpot(nomSpot, texte) {
  const t = new Set(mots(texte));
  const brut = new Set((texte || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" "));
  const apres = nomSpot.includes(":") ? nomSpot.split(/\s*:\s*/, 2)[1] : null;
  const communeSeule = apres !== null && !mots(apres).length;
  const elements = communeSeule ? apres.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split(/[^a-z]+/).filter((w) => GENERIQUES.has(w) && w.length > 3) : [];
  return partiesDuNom(nomSpot).some((p) => mots(p).every((w) => t.has(w))) && (!elements.length || elements.some((w) => brut.has(w)));
}
