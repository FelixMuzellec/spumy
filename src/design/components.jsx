// Composants neutres (lot 3.7) : aucun savoir de pêche, seulement de l'affichage. Venus de src/bord/ui/components.jsx
// (jauge, pastille, chargement) et des trois copies identiques du style de bouton (accueil, Offshore, ajout de spot),
// à l'identique : le rendu ne change pas. Les autres composants communs sont dans kit.jsx (carte, tuile, puce,
// bloc repliable, sous-onglets, ligne, source, bandeau).
import { useId } from "react";
import { color, favBands, font, pastille, radius, scoreBands, touch } from "./tokens.js";

/**
 * v9.2 — Anneau de note : l'arc suit la note, sa couleur est celle de la note. size : diamètre en px ; label : texte
 * sous le chiffre (« sur 10 » par défaut).
 * Note sur 10 (moteur v1) : vert ≥ 7, orange ≥ 5, gris en dessous ; verify (phase 4) : arc orange, jamais vert.
 * Phase 7 — favorabilité sur 100 (moteur v2, max = 100) : l'arc prend le bleu de son palier (band 1 à 5) ; « à vérifier »
 * ajoute un contour pointillé orange et un « ? » ; text : le chiffre déjà formaté.
 */
export function ScoreRing({ score, size = 76, color: c0, label = "sur 10", track = color.track, verify = false, max = 10, band = null, text = null }) {
  const sw = Math.max(5, Math.round(size / 11)), r = (size - sw) / 2 - 1, circ = 2 * Math.PI * r, cx = size / 2;
  const ok = score != null && Number.isFinite(+score);
  const v2 = max === 100;
  const c = c0 || (!ok ? color.dim : v2 ? favBands[(band || 1) - 1] : verify ? color.warn : score >= scoreBands.good ? color.good : score >= scoreBands.fair ? color.warn : color.muted);
  const f = ok ? Math.max(0.02, Math.min(1, score / max)) : 0;
  const big = Math.round(size * 0.31), small = Math.max(11, Math.round(size * 0.15));
  const shown = !ok ? "–" : text != null ? text : v2 ? String(Math.round(score)) : score.toFixed(1).replace(".", ",");
  const aria = ok ? `${v2 ? "Favorabilité" : "Note"} ${shown} sur ${max}${verify ? ", à vérifier" : ""}` : "Pas de note";
  // v10 : arc en dégradé dans la teinte de la note (du palier vers le palier suivant, plus clair), chiffre en condensé.
  const gid = `sr${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const c2 = !c0 && ok && v2 ? favBands[Math.min(4, band || 1)] : c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={aria} style={{flexShrink:0,display:"block"}}>
      <defs><linearGradient id={gid} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor={c}/><stop offset="1" stopColor={c2}/></linearGradient></defs>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={track} strokeWidth={sw}/>
      {ok && <circle cx={cx} cy={cx} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={`${f * circ} ${circ}`} transform={`rotate(-90 ${cx} ${cx})`} style={{filter:`drop-shadow(0 0 ${Math.round(sw / 1.5)}px ${c}55)`}}/>}
      {ok && v2 && verify && <circle cx={cx} cy={cx} r={r + sw / 2 + 1} fill="none" stroke={pastille.verify} strokeWidth={2} strokeDasharray="5 4"/>}
      <text x={cx} y={cx + (label ? big * 0.12 : big * 0.35)} textAnchor="middle" fontSize={Math.round(big * 1.08)} fontWeight="700" fill={color.strong} fontFamily={font.display} style={font.numbers}>
        {shown}{ok && v2 && verify ? "?" : ""}</text>
      {label && <text x={cx} y={cx + big * 0.12 + small * 1.25} textAnchor="middle" fontSize={small} fontWeight="600" fill={color.muted} fontFamily={font.familySvg}>{label}</text>}
    </svg>
  );
}

/**
 * Phase 7 — Pastille d'un spot (spécification v2, §8) : kind « fill » (favorabilité, band 1 à 5), « verify » (à vérifier :
 * remplissage du palier, contour pointillé orange et « ? »), « nr » (non recommandé : gris, barré), « none » (pas de note : vide).
 * Le sens n'est jamais porté par la seule couleur : forme, « ? », barre, et le chiffre ou le mot à côté.
 */
export function Pastille({ kind = "none", band = null, size = 16, title }) {
  const r = size / 2 - 1.5, cx = size / 2;
  const fill = kind === "nr" ? pastille.nr : kind === "none" ? "none" : favBands[(band || 1) - 1];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={{flexShrink:0,display:"block"}}>
      <circle cx={cx} cy={cx} r={r} fill={fill} fillOpacity={kind === "nr" ? 0.6 : 1} stroke={kind === "verify" ? pastille.verify : kind === "none" ? pastille.none : pastille.ring}
        strokeWidth={kind === "verify" ? 2 : 1.5} strokeDasharray={kind === "verify" ? "3 2" : kind === "none" ? "2 2" : undefined}/>
      {kind === "nr" && <line x1={cx - r * 0.7} y1={cx + r * 0.7} x2={cx + r * 0.7} y2={cx - r * 0.7} stroke={pastille.nrBar} strokeWidth={Math.max(1.5, size / 9)} strokeLinecap="round"/>}
      {kind === "verify" && <text x={cx} y={cx + size * 0.18} textAnchor="middle" fontSize={size * 0.55} fontWeight="900" fill={band >= 4 ? pastille.ring : color.strong} fontFamily={font.familySvg}>?</text>}
    </svg>
  );
}
/** La même pastille en texte SVG, pour les marqueurs de carte (Leaflet). */
export function pastilleSvg(kind, band, size = 22) {
  const r = size / 2 - 1.5, cx = size / 2;
  const fill = kind === "nr" ? pastille.nr : kind === "none" ? "none" : favBands[(band || 1) - 1];
  const stroke = kind === "verify" ? pastille.verify : kind === "none" ? pastille.none : pastille.ring;
  const dash = kind === "verify" ? ' stroke-dasharray="3 2"' : kind === "none" ? ' stroke-dasharray="2 2"' : "";
  const bar = kind === "nr" ? `<line x1="${cx - r * 0.7}" y1="${cx + r * 0.7}" x2="${cx + r * 0.7}" y2="${cx - r * 0.7}" stroke="${pastille.nrBar}" stroke-width="${Math.max(1.5, size / 9)}" stroke-linecap="round"/>` : "";
  const q = kind === "verify" ? `<text x="${cx}" y="${cx + size * 0.18}" text-anchor="middle" font-size="${size * 0.55}" font-weight="900" fill="${band >= 4 ? pastille.ring : color.strong}" font-family="${font.familySvg}">?</text>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${cx}" cy="${cx}" r="${r}" fill="${fill}" fill-opacity="${kind === "nr" ? 0.6 : 1}" stroke="${stroke}" stroke-width="${kind === "verify" ? 2 : 1.5}"${dash}/>${bar}${q}</svg>`;
}

/** Pastille de couleur (état, catégorie). */
export function Pill({ color: c, children, title }) {
  return <span title={title} style={{display:"inline-block",fontSize:13,fontWeight:700,letterSpacing:"0.02em",color:c,background:c+"18",border:`1px solid ${c}40`,borderRadius:radius.round,padding:"2px 8px",whiteSpace:"nowrap",lineHeight:1.4}}>{children}</span>;
}

/** État de chargement : roue et message. */
export function Loader({ msg }) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"28px 0",gap:12}}>
      <div style={{width:32,height:32,border:`3px solid ${color.line}`,borderTop:`3px solid ${color.accent}`,borderRadius:"50%",animation:"spin .85s linear infinite"}}/>
      <span style={{color:color.muted,fontSize:13.5,textAlign:"center"}}>{msg}</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/** Style d'un bouton d'action : contour de la couleur donnée ; plein (solid) pour l'action principale. */
export const buttonStyle = (c, solid) => ({ minHeight: touch.main, padding: "0 16px", borderRadius: radius.md, border: `1px solid ${c}`, background: solid ? `${c}30` : "none",
  color: solid ? color.strong : c, fontSize: 15, fontWeight: 700, cursor: "pointer" });
