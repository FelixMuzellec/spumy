// Phase 7 — Une note à l'écran, quel que soit le moteur qui l'a calculée (s.engine, posé par rankDay) :
//   v1 : note sur 10, vert ≥ 7, orange ≥ 5 ou « à vérifier », gris en dessous (inchangé) ;
//   v2 : favorabilité sur 100, pastille de son palier (cinq bleus), « à vérifier » en pointillé avec « ? »,
//        non recommandé gris barré, pas de note vide ; le chiffre reste en couleur de texte.
import { ScoreRing, Pastille } from "../../design/components.jsx";
import { C, scoreColor } from "../../design/kit.jsx";
import { favBands } from "../../design/tokens.js";
import { fmtScore, scaleOf } from "../../core/scale.js";
import { bandOf } from "../engine/v2-params.js";

export const isV2 = (s) => s?.engine === "v2";
/** État d'affichage d'un spot ou d'un créneau noté : { kind: fill | verify | nr | none, band }. */
export function noteState(s) {
  if (!s || !s.eligible) return { kind: "nr", band: null };
  if (s.score == null) return { kind: "none", band: null };
  const band = bandOf(s.score);
  return { kind: s.verify?.length ? "verify" : "fill", band };
}
/** Le chiffre (« 7,4 » ou « 74 ») ; « – » sans note ou non praticable. */
export const fmtNote = (s, engine) => (s?.eligible ? fmtScore(s.score, engine || s.engine || "v1") : "–");
/** Couleur du chiffre : celle de la note en v1 ; en v2, texte (la pastille porte le palier). */
export function noteText(s, engine) {
  if ((engine || s?.engine) !== "v2") return scoreColor(s?.score, !!s?.eligible, !!s?.verify?.length);
  return s?.eligible ? C.strong : C.faint;
}
/** Couleur de remplissage (cartes, frise des créneaux) : note en v1 ; palier bleu en v2 (gris si non recommandé). */
export function noteFill(s, engine) {
  if ((engine || s?.engine) !== "v2") return scoreColor(s?.score, !!s?.eligible, !!s?.verify?.length);
  if (!s?.eligible) return C.faint;
  const b = bandOf(s.score);
  return b ? favBands[b - 1] : C.faint;
}
/** Libellé du verdict : « Bonnes conditions »… (v1) ; « Favorable »… (v2, par palier). */
export function noteLabel(s) {
  if (s?.verify?.length) return "Conditions à vérifier";
  if (isV2(s)) {
    const b = bandOf(s.score);
    return b == null ? "Pas assez de données pour noter" : ["Défavorable", "Peu favorable", "Moyennement favorable", "Favorable", "Très favorable"][b - 1];
  }
  const v = s?.score;
  return v >= 8 ? "Très bonnes conditions" : v >= 7 ? "Bonnes conditions" : v >= 5 ? "Conditions moyennes" : "Conditions difficiles";
}
/** Pastille d'un spot, avec un titre lisible (lecteur d'écran). */
export function NoteDot({ s, size = 16 }) {
  const st = noteState(s);
  if (!isV2(s)) return <span aria-hidden="true" style={{width:size - 2,height:size - 2,borderRadius:"50%",background:noteFill(s),flexShrink:0,display:"inline-block"}}/>;
  const title = st.kind === "nr" ? "Non recommandé" : st.kind === "none" ? "Pas de note" : `Favorabilité ${fmtScore(s.score, "v2")} sur 100${st.kind === "verify" ? ", à vérifier" : ""}`;
  return <Pastille kind={st.kind} band={st.band} size={size} title={title}/>;
}
/** Anneau de note du spot, dans l'échelle de son moteur. */
export function NoteRing({ s, size = 76, label }) {
  const v2 = isV2(s), sc = scaleOf(v2 ? "v2" : "v1");
  return <ScoreRing score={s?.eligible ? s.score : null} size={size} verify={!!s?.verify?.length} max={sc.max} band={v2 ? bandOf(s?.score) : null}
    label={label ?? sc.unit}/>;
}
/** Seuil « favorable » / « au vert » et écart d'égalité de l'échelle d'une journée notée. */
export const scaleFor = (list) => scaleOf(list?.find?.((s) => s?.engine)?.engine || list?.engine || "v1");
