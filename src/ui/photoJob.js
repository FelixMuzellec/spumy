// Analyse photo : l'état vit ici, hors de l'onglet. Changer d'onglet ne l'arrête donc plus.
// Chaque passe terminée est enregistrée (IndexedDB) : si la page est fermée ou le téléphone
// mis en veille, l'analyse reprend à la passe manquante, sans refaire ni refacturer les autres.
import { useSyncExternalStore } from "react";
import { SITE } from "SITE_CONFIG";
import { PHOTO, PHOTOS_KEY, PHOTO_JOB_KEY, runAnalysis } from "../engine/photo.js";
import { idbDel, idbGet, idbSet } from "./idb.js";

const HIST_KEY = "photos:" + SITE.id;
const DRAFT_KEY = "photodraft:" + SITE.id;
const EMPTY_DRAFT = { spotId: null, photos: [], notes: "", manual: "" };

let S = { loaded: false, draft: EMPTY_DRAFT, job: null, history: [], result: null, unseen: false };
const subs = new Set();
const set = (patch) => { S = { ...S, ...patch }; subs.forEach((f) => f()); };
export const getPhotoState = () => S;
export const subscribePhoto = (fn) => { subs.add(fn); return () => subs.delete(fn); };
export const usePhotoState = () => useSyncExternalStore(subscribePhoto, getPhotoState, getPhotoState);

// Écran allumé pendant l'analyse (Wake Lock), là où le navigateur le permet.
let ctl = null, wake = null;
async function lockScreen() {
  try { if (typeof navigator !== "undefined" && navigator.wakeLock && document.visibilityState === "visible") wake = await navigator.wakeLock.request("screen"); } catch { wake = null; }
}
function unlockScreen() { try { wake?.release(); } catch { /* déjà libéré */ } wake = null; }
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && S.job?.status === "running" && !wake) lockScreen(); });
}

let loading = null;
export function loadPhotoState() {
  if (S.loaded) return Promise.resolve();
  if (!loading) loading = (async () => {
    let history = (await idbGet(HIST_KEY)) || [];
    // v8.2 gardait l'historique dans localStorage : il passe dans IndexedDB.
    try {
      const old = JSON.parse(localStorage.getItem(PHOTOS_KEY) || "null");
      if (Array.isArray(old) && old.length) {
        history = [...history, ...old.filter((o) => !history.some((h) => h.id === o.id))].slice(0, PHOTO.keep);
        await idbSet(HIST_KEY, history); localStorage.removeItem(PHOTOS_KEY);
      }
    } catch { /* rien à migrer */ }
    const draft = (await idbGet(DRAFT_KEY)) || EMPTY_DRAFT;
    let job = await idbGet(PHOTO_JOB_KEY);
    // Une analyse « en cours » au chargement a forcément été coupée : on propose de la reprendre.
    if (job?.status === "running") job = { ...job, status: "interrupted", error: "L'analyse a été coupée (page fermée, rechargée ou téléphone en veille)." };
    set({ loaded: true, history, draft: { ...EMPTY_DRAFT, ...draft }, job });
  })();
  return loading;
}

let draftTimer = null;
export function setDraft(patch) {
  const draft = { ...S.draft, ...(typeof patch === "function" ? patch(S.draft) : patch) };
  set({ draft });
  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => { idbSet(DRAFT_KEY, draft); }, 250);
}

async function run(cfg) {
  ctl = new AbortController();
  lockScreen();
  const job = S.job;
  try {
    const a = await runAnalysis(job, {
      key: cfg.key, signal: ctl.signal, ...(cfg.spots ? { spots: cfg.spots } : {}),
      onProgress: async ({ step, phase, partial }) => {
        const j = { ...S.job, partial, step: phase === "done" ? step + 1 : step, stepAt: phase === "start" ? Date.now() : S.job.stepAt, stepTimes: { ...(S.job.stepTimes || {}), ...(phase === "done" ? { [step]: Date.now() - S.job.stepAt } : {}) } };
        set({ job: j });
        if (phase === "done") await idbSet(PHOTO_JOB_KEY, j);
      },
    });
    a.durationMs = Date.now() - job.startedAt;
    const history = [a, ...S.history.filter((h) => h.id !== a.id)].slice(0, PHOTO.keep);
    set({ job: null, result: a, history, unseen: true });
    await idbSet(HIST_KEY, history);
    await idbDel(PHOTO_JOB_KEY);
  } catch (e) {
    const aborted = e?.name === "AbortError";
    const j = { ...S.job, status: aborted ? "interrupted" : "error", error: aborted ? "Analyse arrêtée." : (e?.message || String(e)) };
    set({ job: j });
    await idbSet(PHOTO_JOB_KEY, j);
  } finally { ctl = null; unlockScreen(); }
}

export async function startJob(cfg, { spotId, photos, notes }) {
  if (S.job?.status === "running") return;
  const now = Date.now();
  const job = { id: `a${now}`, model: cfg.model, spotId, notes, photos, partial: {}, status: "running", step: 1, startedAt: now, stepAt: now, stepTimes: {}, error: null };
  set({ job, result: null });
  await idbSet(PHOTO_JOB_KEY, job);
  setDraft({ ...EMPTY_DRAFT, spotId });   // les photos appartiennent désormais à l'analyse ; le spot reste choisi
  return run(cfg);
}
export function resumeJob(cfg) {
  if (!S.job || S.job.status === "running") return;
  set({ job: { ...S.job, model: S.job.model || cfg.model, status: "running", error: null, stepAt: Date.now() } });
  return run(cfg);
}
export function cancelJob() { ctl?.abort(); }
export async function dropJob() {
  ctl?.abort();
  const j = S.job;
  set({ job: null });
  await idbDel(PHOTO_JOB_KEY);
  // Les photos reviennent dans la sélection, pour relancer sans les rechoisir.
  if (j?.photos?.length) setDraft({ spotId: j.spotId, photos: j.photos, notes: j.notes || "" });
}
export function showAnalysis(a) { set({ result: a, unseen: false }); }
/** Analyse faite par l'abonnement Claude (page claude.ai), importée d'un fichier et déjà contrôlée. */
export async function addImported(a) {
  await loadPhotoState();
  const history = [a, ...S.history.filter((h) => h.id !== a.id)].slice(0, PHOTO.keep);
  set({ history, result: a, unseen: true });
  await idbSet(HIST_KEY, history);
}
export function markSeen() { if (S.unseen) set({ unseen: false }); }
export async function deleteAnalysis(id) {
  const history = S.history.filter((h) => h.id !== id);
  set({ history, result: S.result?.id === id ? null : S.result });
  await idbSet(HIST_KEY, history);
}
