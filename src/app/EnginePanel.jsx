// Réglages → « Moteur de notes » (phase 7) : réglages de l'appareil, communs à tous les guides.
//   moteur : v2 (favorabilité, pertinence, confiance sur 100 ; par défaut) ou v1 (note sur 10), tant que la v2 n'est
//            pas validée par la phase 8 (spécification v2, §11) ;
//   boîte complète : la pertinence ne filtre le classement que si ta boîte est l'inventaire complet ;
//   temps de trajet maximal : au-delà, la pertinence baisse (jusqu'à 0 au double).
import { useState } from "react";
import { color, radius, touch } from "../design/tokens.js";
import { engineMode, setEngineMode } from "../core/scale.js";
import { BOX_COMPLETE_KEY, loadV2Prefs, saveV2Pref, TRAJET_KEY, V2 } from "../bord/engine/v2-params.js";

const btn = (on) => ({ flex: "1 1 150px", minHeight: touch.min, padding: "6px 10px", borderRadius: radius.sm, border: `1px solid ${on ? color.accent : color.line}`,
  background: on ? `${color.accent}26` : "none", color: on ? color.strong : color.text, fontSize: 13.5, fontWeight: 700, cursor: "pointer", textAlign: "left" });

export function EnginePanel() {
  const [engine] = useState(() => engineMode());
  const [prefs, setPrefs] = useState(() => loadV2Prefs());
  const [changed, setChanged] = useState(false);
  const pickEngine = (v) => { if (v === engine) return; setEngineMode(v); try { location.reload(); } catch { setChanged(true); } };
  const setBox = (v) => { saveV2Pref(BOX_COMPLETE_KEY, v); setPrefs((p) => ({ ...p, boxComplete: v })); setChanged(true); };
  const setTrajet = (raw) => {
    const m = parseInt(raw, 10);
    if (!Number.isFinite(m) || m < 5 || m > 600) return;
    saveV2Pref(TRAJET_KEY, m === V2.trajetMax ? null : m); setPrefs((p) => ({ ...p, trajetMax: m })); setChanged(true);
  };
  return (
    <section aria-labelledby="moteur-h" style={{ margin: "0 0 12px" }}>
      <div id="moteur-h" style={{ color: color.text, fontWeight: 700, marginBottom: 6 }}>Moteur de notes</div>
      <div role="group" aria-label="Moteur de notes" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" aria-pressed={engine === "v2"} onClick={() => pickEngine("v2")} style={btn(engine === "v2")}>
          v2 · trois scores sur 100<span style={{ display: "block", fontSize: 12, fontWeight: 500, color: color.muted }}>favorabilité, pertinence, confiance (par défaut)</span></button>
        <button type="button" aria-pressed={engine === "v1"} onClick={() => pickEngine("v1")} style={btn(engine === "v1")}>
          v1 · note sur 10<span style={{ display: "block", fontSize: 12, fontWeight: 500, color: color.muted }}>l'ancienne note, tant que la v2 n'est pas validée</span></button>
      </div>
      <p style={{ margin: "6px 0 8px", fontSize: 12.5, color: color.muted }}>La sécurité est la même avec les deux moteurs : à vérifier dès la force 6 ou 60 km/h de rafales, non recommandé dès la force 8 ou 90 km/h.</p>
      <label style={{ display: "flex", alignItems: "flex-start", gap: 8, minHeight: touch.min, cursor: "pointer" }}>
        <input type="checkbox" checked={prefs.boxComplete} onChange={(e) => setBox(e.target.checked)} style={{ width: 22, height: 22, marginTop: 1, accentColor: color.accent }} />
        <span>Ma boîte est l'inventaire complet<span style={{ display: "block", fontSize: 12.5, color: color.muted }}>Coché : un spot où ta boîte ne convient pas (pertinence sous {V2.pert.seuil}) passe après les autres. Décoché : la pertinence s'affiche, provisoire, sans changer le classement.</span></span>
      </label>
      <label style={{ display: "block", marginTop: 6 }}>Temps de trajet maximal (minutes)
        <input type="number" inputMode="numeric" min="5" max="600" step="5" defaultValue={prefs.trajetMax} onBlur={(e) => setTrajet(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") setTrajet(e.currentTarget.value); }} aria-describedby="trajet-aide"
          style={{ display: "block", width: 120, minHeight: touch.min, marginTop: 3, padding: "0 9px", borderRadius: 6, border: `1px solid ${color.line}`, background: color.card2, color: color.strong, fontSize: 14 }} />
        <span id="trajet-aide" style={{ display: "block", fontSize: 12.5, color: color.muted }}>Au-delà, la pertinence baisse, jusqu'à 0 au double ({prefs.trajetMax} min : 0 à {prefs.trajetMax * 2} min).</span>
      </label>
      {changed && <button type="button" onClick={() => location.reload()} style={{ ...btn(true), flex: "none", marginTop: 8 }}>Recharger pour appliquer</button>}
    </section>
  );
}
