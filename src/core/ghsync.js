// v8.15 — Accès au dépôt GitHub du journal, sans guide : partagé par les guides (sync.jsx) et l'accueil
// (sorties en bateau, offshore.json). Le jeton reste sur l'appareil et ne part que vers api.github.com.
const CFG_KEY = "bar:sync";
export const DEFAULT_CFG = { owner: "FelixMuzellec", repo: "guide-peche-bar-journal", token: "" };

export function getCfg() {
  try { const c = JSON.parse(localStorage.getItem(CFG_KEY) || "null"); return c && c.token ? { ...DEFAULT_CFG, ...c } : null; }
  catch { return null; }
}
export function setCfg(c) { try { c ? localStorage.setItem(CFG_KEY, JSON.stringify(c)) : localStorage.removeItem(CFG_KEY); } catch { /* sans effet */ } }

export const b64enc = (str) => { let bin = ""; for (const b of new TextEncoder().encode(str)) bin += String.fromCharCode(b); return btoa(bin); };
export const b64dec = (b64) => new TextDecoder().decode(Uint8Array.from(atob(String(b64).replace(/\s/g, "")), (c) => c.charCodeAt(0)));

export async function gh(cfg, method, file, body) {
  const url = `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${file}`;
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, {
      method, cache: "no-store", signal: ctrl.signal,
      headers: { Authorization: `Bearer ${cfg.token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28",
                 ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    let json = null; try { json = await res.json(); } catch { /* vide */ }
    return { status: res.status, json };
  } catch (e) {
    return { status: 0, json: { message: e?.name === "AbortError" ? "délai dépassé" : (e?.message || "réseau indisponible") } };
  } finally { clearTimeout(timer); }
}

export function explain(status, json) {
  if (status === 401) return "jeton refusé (expiré ou mal copié)";
  if (status === 403) return "jeton sans droit d'écriture sur ce dépôt (Contents : Read and write)";
  if (status === 404) return "dépôt introuvable pour ce jeton (nom du dépôt, ou dépôt non inclus dans le jeton)";
  if (status === 0) return json?.message || "réseau indisponible";
  return `GitHub ${status}${json?.message ? " : " + json.message : ""}`;
}

