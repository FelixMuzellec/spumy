// Phase 12 — Photo d'ambiance posée en fond (écran Décision, fiche du spot), avec la marque « Illustration ».
// Miniature floue d'abord (dans le catalogue, donc aussi hors connexion), photo nette quand elle est chargée.
import { useState } from "react";
import { color } from "../../design/tokens.js";
import { photoSrc } from "./ambiance.js";

const SCRIM = "linear-gradient(180deg, rgba(7,20,39,.30) 0%, rgba(7,20,39,0) 26%, rgba(7,20,39,.42) 56%, rgba(7,20,39,.93) 100%)";

export function IllustrationMark({ style }) {
  return (
    <span title="Image générée : ambiance du créneau, pas une photo de ce lieu"
      style={{position:"absolute",zIndex:1,top:12,left:12,padding:"3px 9px",borderRadius:999,fontSize:11.5,fontWeight:700,letterSpacing:"0.02em",
        color:color.strong,background:"rgba(7,20,39,.55)",border:"1px solid rgba(243,248,252,.22)",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)",...style}}>
      Illustration
    </span>
  );
}

export function AmbiancePhoto({ photo, scrim = SCRIM, markStyle, mark = true }) {
  const [ok, setOk] = useState(false);
  if (!photo) return null;
  const pos = `${photo.focus?.[0] ?? 50}% ${photo.focus?.[1] ?? 50}%`;
  const fill = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos };
  return (
    <>
      <div aria-hidden="true" style={{position:"absolute",inset:0,overflow:"hidden"}}>
        {photo.lqip && <img src={photo.lqip} alt="" style={{...fill,filter:"blur(10px)",transform:"scale(1.1)"}}/>}
        <img src={photoSrc(photo)} alt="" loading="lazy" decoding="async" onLoad={() => setOk(true)} onError={() => setOk(false)}
          style={{...fill,opacity:ok ? 1 : 0,transition:"opacity .35s"}}/>
        {scrim && <div style={{position:"absolute",inset:0,background:scrim}}/>}
      </div>
      {mark && <IllustrationMark style={markStyle}/>}
    </>
  );
}
