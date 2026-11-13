// Composants neutres (lot 3.7) : aucun savoir de pêche, seulement de l'affichage. Venus de src/bord/ui/components.jsx
// (jauge, pastille, chargement) et des trois copies identiques du style de bouton (accueil, Offshore, ajout de spot),
// à l'identique : le rendu ne change pas. Les autres composants communs sont dans kit.jsx (carte, tuile, puce,
// bloc repliable, sous-onglets, ligne, source, bandeau).
import { color, font, radius, scoreBands, touch } from "./tokens.js";

/**
 * v9.2 — Anneau de note /10 : l'arc suit la note, sa couleur est celle de la note (vert ≥ 7, orange ≥ 5, gris en dessous).
 * Une seule échelle partout. size : diamètre en px ; label : texte sous le chiffre (« sur 10 » par défaut).
 */
export function ScoreRing({ score, size = 76, color: c0, label = "sur 10", track = color.track }) {
  const sw = Math.max(5, Math.round(size / 11)), r = (size - sw) / 2 - 1, circ = 2 * Math.PI * r, cx = size / 2;
  const ok = score != null && Number.isFinite(+score);
  const c = c0 || (ok ? (score >= scoreBands.good ? color.good : score >= scoreBands.fair ? color.warn : color.muted) : color.dim);
  const f = ok ? Math.max(0.02, Math.min(1, score / 10)) : 0;
  const big = Math.round(size * 0.31), small = Math.max(11, Math.round(size * 0.15));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={ok ? `Note ${String(score.toFixed(1)).replace(".", ",")} sur 10` : "Pas de note"} style={{flexShrink:0,display:"block"}}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={track} strokeWidth={sw}/>
      {ok && <circle cx={cx} cy={cx} r={r} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={`${f * circ} ${circ}`} transform={`rotate(-90 ${cx} ${cx})`} style={{filter:`drop-shadow(0 0 ${Math.round(sw / 1.5)}px ${c}55)`}}/>}
      <text x={cx} y={cx + (label ? big * 0.12 : big * 0.35)} textAnchor="middle" fontSize={big} fontWeight="800" fill={color.strong} fontFamily={font.familySvg} style={font.numbers}>
        {ok ? score.toFixed(1).replace(".", ",") : "–"}</text>
      {label && <text x={cx} y={cx + big * 0.12 + small * 1.25} textAnchor="middle" fontSize={small} fontWeight="600" fill={color.muted} fontFamily={font.familySvg}>{label}</text>}
    </svg>
  );
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
