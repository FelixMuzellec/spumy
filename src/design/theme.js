// v8.9 — Affichage « plein soleil » : le thème sombre est inversé en clair (texte sombre sur fond blanc),
// pour la lecture en plein soleil. Les photos et le fond de carte sont ré-inversés pour rester naturels.
// Choix propre à l'appareil, commun à tous les guides.
export const THEME_KEY = "bar:theme";
export const SUN_CSS = "html.sun body{background:#f5f7fa}"
  + "html.sun #app-root,html.sun footer.sync-bar{filter:invert(1) hue-rotate(180deg)}"
  + "html.sun #app-root img,html.sun #app-root .leaflet-tile-pane,html.sun #app-root video{filter:invert(1) hue-rotate(180deg)}";
export function getTheme() { try { return localStorage.getItem(THEME_KEY) === "sun" ? "sun" : "nuit"; } catch { return "nuit"; } }
export function applyTheme(v = getTheme()) {
  try { document.documentElement.classList.toggle("sun", v === "sun"); } catch { /* sans effet */ }
  try { const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", v === "sun" ? "#f5f7fa" : "#020c18"); } catch { /* sans effet */ }
}
export function setTheme(v) { try { localStorage.setItem(THEME_KEY, v); } catch { /* stockage refusé : le choix vaut pour la session */ } applyTheme(v); }
