import { Component } from "react";
import { createRoot } from "react-dom/client";
import App from "APP";
import { installStorage } from "./storage.js";
import { SyncBar, syncJournal, getCfg } from "./sync.jsx";
import { applyTheme, SUN_CSS } from "./ui/theme.js";

/* global __SITE_ID__ */
const SITE_ID = __SITE_ID__;

installStorage();
// v9.2 — La barre de navigation (64 px) est fixée en bas ; la place est réservée par le contenu lui-même.
// Affichage plein soleil : appliqué avant le premier rendu (pas de flash sombre).
{ const st = document.createElement("style"); st.textContent = SUN_CSS; document.head.appendChild(st); applyTheme(); }

// v8.9 — Une erreur d'affichage ne laisse plus un écran vide : le journal brut reste exportable,
// la synchronisation peut être coupée (si une entrée du dépôt est en cause), et la page rechargée.
class Recover extends Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    const exportRaw = () => {
      let raw = "[]"; try { raw = localStorage.getItem(`bar:journal:${SITE_ID}`) || "[]"; } catch { /* stockage refusé */ }
      const u = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
      const a = document.createElement("a"); a.href = u; a.download = `journal-bar-${SITE_ID}-brut.json`; a.click(); URL.revokeObjectURL(u);
    };
    const btn = { display: "block", width: "100%", minHeight: 48, margin: "10px 0", borderRadius: 10, border: "1px solid #38bdf8", background: "#0b2a42", color: "#fff", fontSize: 16, fontWeight: 700 };
    return (
      <div role="alert" style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px", color: "#e2e8f0", fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
        <h1 style={{ fontSize: 20 }}>Le guide n'a pas pu s'afficher</h1>
        <p>Ton journal n'est pas effacé. Exporte-le, puis recharge. Si l'erreur revient juste après une synchronisation, coupe la sauvegarde GitHub : il faudra recoller ton jeton dans les Réglages pour la réactiver.</p>
        <p style={{ fontSize: 13, color: "#94a3b8" }}>Détail : {String(this.state.err?.message || this.state.err)}</p>
        <button style={btn} onClick={exportRaw}>Exporter le journal brut</button>
        <button style={btn} onClick={() => { try { localStorage.removeItem("bar:sync"); } catch { /* sans effet */ } location.reload(); }}>Couper la sauvegarde GitHub et recharger</button>
        <button style={btn} onClick={() => location.reload()}>Recharger</button>
      </div>
    );
  }
}

const withTimeout = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r({ state: "error", msg: "GitHub ne répond pas (délai)" }), ms))]);

(async () => {
  // Le journal GitHub est relu AVANT l'affichage : l'application démarre
  // directement avec les sessions saisies sur les autres appareils.
  let initial = { state: "off" };
  if (getCfg()) initial = await withTimeout(syncJournal(SITE_ID), 6000);
  createRoot(document.getElementById("root")).render(
    <>
      <Recover><App /></Recover>
      <SyncBar siteId={SITE_ID} initial={initial} />
    </>
  );
})();

// Hors ligne sur le spot : l'application (et donc la marée calculée) reste disponible.
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(() => {});
}
