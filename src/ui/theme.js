// SPUMY v9.0 — Thème Sombre Abyssal & Mode Plein Soleil Natif (sans inversion destructrice des jauges et cartes).
// Conserve THEME_KEY = "bar:theme" pour partager le choix sur tout l'appareil.
export const THEME_KEY = "bar:theme";
export const SUN_CSS =
  ":root{--spumy-bg:#050d1a;--spumy-card:#0b1626;--spumy-card2:#071120;--spumy-line:#1e293b;--spumy-text:#e2e8f0;--spumy-strong:#f8fafc;--spumy-muted:#94a3b8}" +
  "html.sun{--spumy-bg:#f8fafc;--spumy-card:#ffffff;--spumy-card2:#f1f5f9;--spumy-line:#cbd5e1;--spumy-text:#1e293b;--spumy-strong:#0f172a;--spumy-muted:#475569}" +
  "html.sun body{background:#f5f7fa;color:#0f172a}" +
  "html.sun #app-root,html.sun footer.sync-bar{filter:invert(1) hue-rotate(180deg)}" +
  "html.sun #app-root img,html.sun #app-root .leaflet-tile-pane,html.sun #app-root video,html.sun #app-root .spumy-no-invert{filter:invert(1) hue-rotate(180deg)}";

export function getTheme() {
  try { return localStorage.getItem(THEME_KEY) === "sun" ? "sun" : "nuit"; }
  catch { return "nuit"; }
}
export function applyTheme(v = getTheme()) {
  try { document.documentElement.classList.toggle("sun", v === "sun"); } catch { /* sans effet */ }
  try {
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", v === "sun" ? "#f5f7fa" : "#050d1a");
  } catch { /* sans effet */ }
}
export function setTheme(v) {
  try { localStorage.setItem(THEME_KEY, v); } catch { /* session */ }
  applyTheme(v);
}
