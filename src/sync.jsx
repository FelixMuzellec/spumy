// Sauvegarde du journal dans un dépôt GitHub PRIVÉ.
//
// Le navigateur garde le journal sur l'appareil ; GitHub en garde la copie
// de référence, versionnée (un commit par enregistrement), partagée entre le
// téléphone et l'ordinateur et lisible par Claude pour recalibrer les spots.
// Fusion sans perte : union par identifiant de session, aucune suppression.
import { useEffect, useState } from "react";
import { onJournalWrite } from "./storage.js";
import { sanitizeJournal } from "./engine/journal.js";
import { mergeMyRecords } from "./engine/myspots.js";
import { getTheme, setTheme } from "./ui/theme.js";

import { b64dec, b64enc, DEFAULT_CFG, explain, getCfg, gh, setCfg } from "./ghsync.js";
export { getCfg };

const fileFor = (siteId) => `journal-${siteId}.json`;
const localKey = (siteId) => `bar:journal:${siteId}`;
function readLocal(siteId) { try { const v = JSON.parse(localStorage.getItem(localKey(siteId)) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } }

/** Union par identifiant ; à identifiant égal, les champs locaux complètent le distant. */
export function mergeEntries(remote, local) {
  const by = new Map();
  for (const e of remote || []) if (e && e.id != null) by.set(String(e.id), e);
  for (const e of local || []) if (e && e.id != null) by.set(String(e.id), { ...(by.get(String(e.id)) || {}), ...e });
  return [...by.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.id).localeCompare(String(b.id)));
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

async function readRemote(cfg, siteId) {
  const r = await gh(cfg, "GET", fileFor(siteId));
  if (r.status === 404) {
    // 404 ambigu : fichier absent (normal au premier usage), dépôt vide, OU dépôt inaccessible.
    const repo = await fetch(`https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}`,
      { cache: "no-store", headers: { Authorization: `Bearer ${cfg.token}`, Accept: "application/vnd.github+json" } }).catch(() => null);
    if (repo && repo.ok) return { ok: true, entries: [], sha: null };
    return { ok: false, reason: explain(repo ? repo.status : 0, null) };
  }
  if (r.status !== 200) return { ok: false, reason: explain(r.status, r.json) };
  try {
    const entries = JSON.parse(b64dec(r.json.content));
    if (!Array.isArray(entries)) return { ok: false, reason: "fichier du journal illisible sur GitHub" };
    // v8.9 : une entrée malformée du dépôt ne doit jamais bloquer l'application (ni les autres appareils).
    return { ok: true, entries: sanitizeJournal(entries), sha: r.json.sha };
  } catch { return { ok: false, reason: "fichier du journal illisible sur GitHub" }; }
}

// v8.11 — Tes spots : même dépôt, fichier spots-<guide>.json. Fusion par identifiant, la version la plus récente
// gagne, une suppression reste notée (sinon le spot reviendrait de l'autre appareil).
const spotsFile = (siteId) => `spots-${siteId}.json`;
const spotsKey = (siteId) => `bar:myspots:${siteId}`;
function readLocalSpots(siteId) { try { const v = JSON.parse(localStorage.getItem(spotsKey(siteId)) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } }
export async function syncSpots(siteId, cfg) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await gh(cfg, "GET", spotsFile(siteId));
    let remote = [], sha = null;
    if (r.status === 200) {
      try { remote = JSON.parse(b64dec(r.json.content)); sha = r.json.sha; if (!Array.isArray(remote)) throw new Error("format"); }
      catch { return { ok: false, reason: "fichier de tes spots illisible sur GitHub" }; }
    } else if (r.status !== 404) return { ok: false, reason: explain(r.status, r.json) };
    const local = readLocalSpots(siteId);
    const merged = mergeMyRecords(remote, local);
    const pulled = !same(merged, mergeMyRecords([], local));
    if (pulled) { try { localStorage.setItem(spotsKey(siteId), JSON.stringify(merged)); } catch { /* quota */ } }
    if (same(merged, mergeMyRecords(remote, []))) return { ok: true, pulled };
    const put = await gh(cfg, "PUT", spotsFile(siteId), {
      message: `Spots ${siteId} : ${merged.filter((x) => !x.deleted).length}`,
      content: b64enc(JSON.stringify(merged, null, 2) + "\n"), ...(sha ? { sha } : {}),
    });
    if (put.status === 200 || put.status === 201) return { ok: true, pulled, pushed: true };
    if (put.status === 409 || put.status === 422) continue;
    return { ok: false, reason: explain(put.status, put.json) };
  }
  return { ok: false, reason: "conflit d'écriture répété, réessaie" };
}

/** Synchronisation complète : journal puis tes spots ; lit GitHub, fusionne, écrit des deux côtés si besoin. */
export async function syncJournal(siteId, cfg = getCfg()) {
  if (!cfg) return { state: "off" };
  const j = await syncJournalOnly(siteId, cfg);
  if (j.state !== "ok") return j;
  const sp = await syncSpots(siteId, cfg);
  if (!sp.ok) return { state: "error", msg: `tes spots : ${sp.reason}` };
  return { ...j, pulled: j.pulled || sp.pulled };
}
async function syncJournalOnly(siteId, cfg) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const rem = await readRemote(cfg, siteId);
    if (!rem.ok) return { state: "error", msg: rem.reason };
    const local = readLocal(siteId);
    const merged = mergeEntries(rem.entries, local);
    if (!same(merged, local)) { try { localStorage.setItem(localKey(siteId), JSON.stringify(merged)); } catch { /* quota */ } }
    if (same(merged, mergeEntries(rem.entries, []))) return { state: "ok", at: Date.now(), n: merged.length, pulled: !same(merged, local) };
    const put = await gh(cfg, "PUT", fileFor(siteId), {
      message: `Journal ${siteId} : ${merged.length} session${merged.length > 1 ? "s" : ""}`,
      content: b64enc(JSON.stringify(merged, null, 2) + "\n"), ...(rem.sha ? { sha: rem.sha } : {}),
    });
    if (put.status === 200 || put.status === 201) return { state: "ok", at: Date.now(), n: merged.length, pushed: true, pulled: !same(merged, local) };
    if (put.status === 409 || put.status === 422) continue;   // écrit ailleurs entre-temps : on relit et on refusionne
    return { state: "error", msg: explain(put.status, put.json) };
  }
  return { state: "error", msg: "conflit d'écriture répété, réessaie" };
}

// ── Bandeau d'état et réglages ───────────────────────────────────────
const C = { bg: "#020617", line: "#1e293b", txt: "#94a3b8", dim: "#475569", ok: "#22c55e", warn: "#f59e0b", err: "#f87171", acc: "#38bdf8" };
const fmt = (ms) => new Date(ms).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

export function SyncBar({ siteId, initial }) {
  const [st, setSt] = useState(initial || { state: getCfg() ? "syncing" : "off" });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => getCfg() || DEFAULT_CFG);
  const [busy, setBusy] = useState(false);
  const [theme, setThemeState] = useState(getTheme);
  const pickTheme = (v) => { setTheme(v); setThemeState(v); };

  // v9.2 — L'état est publié pour le sommaire « Plus » (qui affiche aussi le bouton Réglages) ;
  // la barre elle-même ne se montre que s'il y a quelque chose à dire (sauvegarde en cours, échec) ou si les réglages sont ouverts.
  useEffect(() => { try { window.__barSync = st; window.dispatchEvent(new CustomEvent("bar:sync-state", { detail: st })); } catch { /* sans effet */ } }, [st]);
  useEffect(() => {
    const openIt = () => setOpen(true);
    window.addEventListener("bar:reglages", openIt);
    return () => window.removeEventListener("bar:reglages", openIt);
  }, []);
  useEffect(() => {
    let timer = null;
    const off = onJournalWrite(() => {
      if (!getCfg()) return;
      clearTimeout(timer);
      setSt((s) => ({ ...s, state: "syncing" }));
      timer = setTimeout(async () => setSt(await syncJournal(siteId)), 1200);
    });
    return () => { off(); clearTimeout(timer); };
  }, [siteId]);

  const save = async () => {
    setBusy(true);
    const cfg = { owner: form.owner.trim(), repo: form.repo.trim(), token: form.token.trim() };
    const r = await syncJournal(siteId, cfg);
    if (r.state === "ok") { setCfg(cfg); setOpen(false); if (r.pulled) window.location.reload(); }
    setSt(r); setBusy(false);
  };
  const disable = () => { setCfg(null); setSt({ state: "off" }); setForm(DEFAULT_CFG); setOpen(false); };

  const label = st.state === "ok" ? <span style={{ color: C.ok }}>● Journal sauvegardé sur GitHub · {fmt(st.at)}{st.n ? ` · ${st.n} session${st.n > 1 ? "s" : ""}` : ""}</span>
    : st.state === "syncing" ? <span style={{ color: C.acc }}>◌ Sauvegarde GitHub…</span>
    : st.state === "error" ? <span style={{ color: C.err }}>⚠ Sauvegarde GitHub en échec : {st.msg}</span>
    : <span style={{ color: C.txt }}>○ Journal gardé sur cet appareil (sans copie GitHub)</span>;

  const inp = { width: "100%", boxSizing: "border-box", padding: "8px 9px", borderRadius: 6, border: `1px solid ${C.line}`, background: "#0b1220", color: "#e2e8f0", fontSize: 13, fontFamily: "monospace", marginTop: 3 };
  return (
    <footer className="sync-bar" aria-label="Sauvegarde du journal" hidden={!open && st.state !== "error" && st.state !== "syncing"}
      style={{ position: "fixed", left: 0, right: 0, bottom: "calc(64px + env(safe-area-inset-bottom))", zIndex: 1000, background: C.bg, borderTop: `1px solid ${C.line}`, fontFamily: "system-ui,sans-serif", boxShadow: "0 -8px 24px rgba(0,0,0,0.35)" }}>
      {open && (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "12px 16px 4px", color: C.txt, fontSize: 13, lineHeight: 1.55, maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ color: "#e2e8f0", fontWeight: 700, marginBottom: 6 }}>Affichage</div>
          <div role="group" aria-label="Affichage" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[["nuit", "Sombre (nuit, aube)"], ["sun", "Plein soleil (fond clair)"]].map(([k, l]) => (
              <button key={k} onClick={() => pickTheme(k)} aria-pressed={theme === k} style={{ flex: 1, minHeight: 44, borderRadius: 8, border: `1px solid ${theme === k ? C.acc : C.line}`, background: theme === k ? "rgba(14,165,233,0.15)" : "none", color: theme === k ? "#e2e8f0" : C.txt, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>{l}</button>
            ))}
          </div>
          <div style={{ color: "#e2e8f0", fontWeight: 700, marginBottom: 6 }}>Sauvegarde du journal sur GitHub</div>
          <p style={{ margin: "0 0 8px" }}>
            Le journal est gardé sur cet appareil. Pour ne plus jamais le perdre et le retrouver sur tous tes appareils,
            il est aussi écrit dans un dépôt GitHub <strong>privé</strong> (un fichier par application, un historique par enregistrement).
          </p>
          <ol style={{ margin: "0 0 8px", paddingLeft: 18 }}>
            <li>Crée un dépôt <strong>privé</strong> nommé <code>guide-peche-bar-journal</code>.</li>
            <li>GitHub → Settings → Developer settings → Fine-grained tokens → Generate : accès au seul dépôt
              du journal, permission <em>Contents : Read and write</em>.</li>
            <li>Colle le jeton ci-dessous. Il reste sur cet appareil et n'est envoyé qu'à GitHub.</li>
          </ol>
          <label>Compte<input style={inp} value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} autoCapitalize="off" autoCorrect="off" /></label>
          <label style={{ display: "block", marginTop: 6 }}>Dépôt<input style={inp} value={form.repo} onChange={(e) => setForm({ ...form, repo: e.target.value })} autoCapitalize="off" autoCorrect="off" /></label>
          <label style={{ display: "block", marginTop: 6 }}>Jeton<input style={inp} type="password" value={form.token} placeholder="github_pat_…" onChange={(e) => setForm({ ...form, token: e.target.value })} autoCapitalize="off" autoCorrect="off" /></label>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button disabled={busy || !form.token.trim()} onClick={save} style={{ minHeight: 40, padding: "0 14px", borderRadius: 6, border: `1px solid ${C.acc}`, background: "rgba(14,165,233,0.15)", color: C.acc, fontSize: 13, cursor: "pointer" }}>{busy ? "Test…" : "Enregistrer et tester"}</button>
            {getCfg() && <button onClick={disable} style={{ minHeight: 40, padding: "0 14px", borderRadius: 6, border: `1px solid ${C.line}`, background: "none", color: C.txt, fontSize: 13, cursor: "pointer" }}>Désactiver</button>}
            <button onClick={() => setOpen(false)} style={{ minHeight: 40, padding: "0 14px", borderRadius: 6, border: `1px solid ${C.line}`, background: "none", color: C.dim, fontSize: 13, cursor: "pointer" }}>Fermer</button>
          </div>
          <p style={{ margin: "10px 0 4px", color: C.dim, fontSize: 12.5 }}>
            iPhone : Partager → « Sur l'écran d'accueil ». L'application s'ouvre alors en plein écran et Safari ne purge plus ses données.
          </p>
          <p style={{ margin: "0 0 8px", color: C.dim, fontSize: 12 }}>
            Météo : <a href="https://open-meteo.com/" style={{ color: C.dim }}>Open-Meteo.com</a> (CC BY 4.0), modèles Météo-France AROME et ECMWF ·
            Marée : constantes TICON-4 (CC BY 4.0), calcul d'après Neaps (MIT).
          </p>
        </div>
      )}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "4px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, fontSize: 12.5 }}>
        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <button onClick={() => setOpen(!open)} aria-expanded={open} style={{ flexShrink: 0, minHeight: 44, padding: "0 12px", borderRadius: 6, border: `1px solid ${C.line}`, background: "none", color: C.txt, fontSize: 13, cursor: "pointer" }}>{open ? "Masquer" : "Réglages"}</button>
      </div>
    </footer>
  );
}
