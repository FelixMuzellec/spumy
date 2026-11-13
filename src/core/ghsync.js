// v8.15 — Accès au dépôt GitHub du journal, sans guide : partagé par les guides (sync.jsx) et l'accueil
// (sorties en bateau, offshore.json). Le jeton reste sur l'appareil et ne part que vers api.github.com.
const CFG_KEY = "bar:sync";
// 13 nov. 2026 : dépôt de sauvegarde par défaut dans l'organisation spumy (spumy.github.io), sans lien avec l'ancien guide.
export const DEFAULT_CFG = { owner: "spumy", repo: "journal", token: "" };

export function getCfg() {
  try { const c = JSON.parse(localStorage.getItem(CFG_KEY) || "null"); return c && c.token ? { ...DEFAULT_CFG, ...c } : null; }
  catch { return null; }
}
export function setCfg(c) { try { c ? localStorage.setItem(CFG_KEY, JSON.stringify(c)) : localStorage.removeItem(CFG_KEY); } catch { /* sans effet */ } }

export const b64enc = (str) => { let bin = ""; for (const b of new TextEncoder().encode(str)) bin += String.fromCharCode(b); return btoa(bin); };
export const b64dec = (b64) => new TextDecoder().decode(Uint8Array.from(atob(String(b64).replace(/\s/g, "")), (c) => c.charCodeAt(0)));

// Lot 3.8 — Le dépôt de sauvegarde doit être PRIVÉ : sinon le journal (spots, heures, prises, conditions) serait
// lisible par tout le monde. Vérifié avant chaque première écriture (GET /repos/{propriétaire}/{dépôt}, champ
// « private »), puis gardé en mémoire le temps de la page. Un dépôt public, ou une vérification impossible, bloque
// l'écriture : rien n'est envoyé. La lecture reste possible (rien ne fuit en lisant ses propres données).
export const PUBLIC_REPO = "public";
const privacy = new Map();
export async function repoPrivacy(cfg) {
  const id = `${cfg.owner}/${cfg.repo}`.toLowerCase();
  if (privacy.get(id) === true) return { ok: true };
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}`, {
      cache: "no-store", signal: ctrl.signal,
      headers: { Authorization: `Bearer ${cfg.token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    });
    let json = null; try { json = await res.json(); } catch { /* vide */ }
    if (!res.ok) return { ok: false, status: res.status, json };
    if (json?.private === true) { privacy.set(id, true); return { ok: true }; }
    return { ok: false, status: PUBLIC_REPO, json: { message: `${cfg.owner}/${cfg.repo}` } };
  } catch (e) {
    return { ok: false, status: 0, json: { message: e?.name === "AbortError" ? "délai dépassé" : (e?.message || "réseau indisponible") } };
  } finally { clearTimeout(timer); }
}

export async function gh(cfg, method, file, body) {
  if (method === "PUT") {
    const p = await repoPrivacy(cfg);
    if (!p.ok) return { status: p.status, json: p.json };
  }
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
  if (status === PUBLIC_REPO) return `dépôt ${json?.message || ""} public : ton journal y serait visible par tous. Rends-le privé (Settings → General → Danger Zone → Change visibility) ; rien n'a été envoyé`.replace("dépôt  public", "dépôt public");
  if (status === 401) return "jeton refusé (expiré ou mal copié)";
  if (status === 403) return "jeton sans droit d'écriture sur ce dépôt (Contents : Read and write)";
  if (status === 404) return "dépôt introuvable pour ce jeton (nom du dépôt, ou dépôt non inclus dans le jeton)";
  if (status === 0) return json?.message || "réseau indisponible";
  return `GitHub ${status}${json?.message ? " : " + json.message : ""}`;
}

