/* global __STUDIO_VERSION__ */
// Page « Analyse photo » publiée sur claude.ai : la même analyse en trois passes que dans les
// guides, mais faite par l'abonnement Claude de la personne qui ouvre la page (capacité
// « sample »), sans clé ni crédit API. Le résultat part dans un fichier que le guide importe
// (onglet Photos) ; le guide refait lui-même les contrôles et le calcul des faits.
import { CONFIGS, SPOTS, selectSite } from "SITE_CONFIG";
import { PASSES, PHOTO, buildExport, nearestSpot, parisInputMs, photoDateLabel, runAnalysis, sampleInputOf, timeFacts } from "../engine/photo.js";
import { preparePhoto } from "../ui/photoPrep.js";

// La page est servie dans un squelette sans langue déclarée : la lecture d'écran doit savoir qu'elle est en français.
document.documentElement.lang = "fr";

const VERSION = typeof __STUDIO_VERSION__ === "string" ? __STUDIO_VERSION__ : "dev";
const GUIDES = [
  ["logonna", "Logonna-Daoulas", "Rade de Brest"],
  ["pirou", "Pirou Plage", "Cotentin ouest"],
  ["plouguerneau", "Plouguerneau", "Pays des Abers"],
  ["audierne", "Audierne", "Cap Sizun"],
  ["carantec", "Carantec", "Baie de Morlaix"],
  ["concarneau", "Concarneau", "Cornouaille"],
  ["crozon", "Crozon", "Baie de Douarnenez"],
];
const OTHER = "__autre__";
const $ = (id) => document.getElementById(id);
const esc = (x) => String(x ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const mmss = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* stockage indisponible */ } };

const S = {
  guide: null, spotId: null, photos: [], notes: "", manual: "",
  sample: undefined, limits: null, downloads: undefined,
  job: null, running: false, step: 0, stepAt: 0, times: {}, error: null, exported: null, copied: false, preparing: false, prepErr: null,
};
let ctl = null, tick = null, wake = null;

// ── Guide choisi : adresse (#audierne…), sinon dernier choix, sinon Logonna ──
function pickGuide(key, { fromHash = false } = {}) {
  if (!CONFIGS[key]) key = "logonna";
  if (S.running) return;
  selectSite(key);
  S.guide = key; S.spotId = SPOTS[0].id; S.job = null; S.error = null; S.exported = null;
  lsSet("studio:guide", key);
  if (!fromHash && location.hash !== `#${key}`) { try { history.replaceState(null, "", `#${key}`); } catch { /* adresse figée */ } }
  render();
}
function guideFromHash() { const h = location.hash.replace("#", ""); return CONFIGS[h] ? h : null; }

// ── Photos ──
const hasExifTime = (p) => p.when?.source === "exif" || p.when?.source === "exif-paris";
function effPhotos() {
  const ms = parisInputMs(S.manual);   // heure de Paris, quel que soit le fuseau de l'appareil
  return S.photos.map((p) => (Number.isFinite(ms) && !hasExifTime(p) ? { ...p, when: { ms, source: "saisie", note: "heure saisie par toi" } } : p));
}
const maxPhotos = () => Math.min(PHOTO.maxPhotos, S.limits?.images?.maxCount || PHOTO.maxPhotos);
async function addFiles(files) {
  S.prepErr = null; S.preparing = true; render();
  const room = Math.max(0, maxPhotos() - S.photos.length);
  const list = [...files].slice(0, room);
  for (const f of list) {
    if (!/^image\//.test(f.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(f.name)) { S.prepErr = `${f.name} n'est pas une image.`; continue; }
    try { S.photos.push(await preparePhoto(f)); } catch (e) { S.prepErr = e.message; }
  }
  if (files.length > list.length) S.prepErr = `${maxPhotos()} photos au plus par analyse.`;
  S.preparing = false; S.exported = null; S.job = null;
  render();
}

// ── Claude par l'abonnement ──
const b64Blob = (b64) => { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: "image/jpeg" }); };
const SAMPLE_MSG = {
  not_granted: "Tu n'as pas autorisé la page à utiliser Claude. Recharge-la : elle te le redemandera.",
  sampling_disabled: "Claude n'est pas disponible pour ce compte depuis une page publiée.",
  not_declared: "La page n'a plus le droit d'utiliser Claude (déclaration retirée).",
  capability_disabled: "Claude n'est pas utilisable dans cette vue : ouvre la page dans claude.ai.",
  capability_removed: "Cette version de l'application Claude ne permet pas l'analyse : mets-la à jour ou ouvre claude.ai dans le navigateur.",
  images_unavailable: "Cette vue ne peut pas envoyer de photos à Claude : ouvre la page dans claude.ai (navigateur ou application à jour).",
  image_rejected: "Une photo a été refusée (format ou taille) : retire-la et réessaie.",
  rate_limited: "Limite d'usage de ton abonnement atteinte pour l'instant : réessaie plus tard. Les passes déjà faites sont gardées.",
  session_expired: "Session claude.ai expirée : reconnecte-toi, puis relance.",
  refused: "Claude a refusé d'analyser ces photos.",
  empty_completion: "Claude n'a rien répondu : relance la passe.",
  invalid_json: "La réponse de Claude n'était pas au format attendu : relance la passe.",
  prompt_too_large: "Trop de texte pour une seule demande : enlève une photo ou raccourcis tes notes.",
  cancelled: "Analyse arrêtée.",
  upstream_error: "Service momentanément indisponible : relance dans un instant.",
};
function sampleCaller(signal) {
  return async (body) => {
    const { text, images, effort } = sampleInputOf(body);
    const opts = { modelTier: "complex", signal, ...(effort ? { effort } : {}), ...(images.length ? { images: images.map(b64Blob) } : {}) };
    try {
      const json = await S.sample.json(text, opts);
      return { json, usage: {} };
    } catch (e) {
      const code = e?.code || "upstream_error";
      const err = new Error(SAMPLE_MSG[code] || SAMPLE_MSG.upstream_error);
      err.code = code;
      throw err;
    }
  };
}
async function analyse() {
  if (S.running || !S.sample || !S.photos.length) return;
  if (!S.job) {
    const now = Date.now();
    S.job = { id: `s${now}`, model: "abonnement", spotId: S.spotId === OTHER ? null : S.spotId, notes: S.notes, photos: effPhotos(), partial: {} };
  }
  S.running = true; S.error = null; S.exported = null; S.copied = false; S.stepAt = Date.now();
  ctl = new AbortController();
  tick = setInterval(renderProgress, 1000);
  // Écran allumé pendant l'analyse seulement : le verrou est rendu à la fin (ou dès qu'il arrive, si elle est finie).
  try { navigator.wakeLock?.request?.("screen").then((w) => { if (S.running) wake = w; else w.release().catch(() => {}); }).catch(() => {}); } catch { /* écran : pas de verrou */ }
  render();
  try {
    await runAnalysis(S.job, {
      call: sampleCaller(ctl.signal), spots: SPOTS,
      onProgress: ({ step, phase }) => {
        if (phase === "start") { S.step = step; S.stepAt = Date.now(); }
        else S.times[step] = Date.now() - S.stepAt;
        render();
      },
    });
    S.step = 4;
  } catch (e) {
    S.error = e?.message || String(e);
  } finally {
    S.running = false; ctl = null; clearInterval(tick); tick = null;
    try { wake?.release?.().catch(() => {}); } catch { /* déjà rendu */ } wake = null;
    render();
  }
}
const stop = () => ctl?.abort();
const restart = () => { if (!S.running) { S.job = null; S.times = {}; S.step = 0; S.error = null; S.exported = null; render(); } };

// ── Envoi au guide ──
const fileName = () => {
  const d = new Date(), p = (n) => String(n).padStart(2, "0");
  return `analyse-${S.guide}-${S.job?.spotId || "spot"}-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.json`;
};
async function saveFile() {
  if (!S.job?.partial?.lec) return;
  const exp = buildExport(S.job, { engine: VERSION });
  if (!S.downloads) { S.exported = { err: "Enregistrement de fichier indisponible ici : utilise « Copier pour le guide »." }; render(); return; }
  try {
    await S.downloads.save({ filename: fileName(), data: JSON.stringify(exp) });
    S.exported = { ok: "Fichier enregistré. Dans le guide : onglet Photos → « Importer une analyse » → choisis ce fichier." };
  } catch (e) {
    const code = e?.code;
    S.exported = { err: code === "declined" ? "Enregistrement annulé." : code === "rate_limited" ? "Une demande d'enregistrement est déjà ouverte." : "Enregistrement impossible ici : utilise « Copier pour le guide »." };
  }
  render();
}
async function copyForGuide() {
  // Le presse-papiers prend la version légère : vignettes seulement, sans les vues agrandies.
  if (!S.job?.partial?.lec) return;
  const exp = buildExport(S.job, { engine: VERSION });
  exp.photos = exp.photos.map((p) => ({ ...p, view: null }));
  const txt = JSON.stringify(exp);
  try { await navigator.clipboard.writeText(txt); S.copied = true; S.exported = { ok: "Copié. Dans le guide : onglet Photos → « Importer une analyse » → « Coller »." }; }
  catch { S.exported = { err: "Copie refusée par cette vue : utilise « Enregistrer le fichier »." }; }
  render();
}

// ── Rendu ──
// Remplit un bloc sans perdre le focus clavier : le bouton qui l'avait (même guide, même photo) le retrouve ;
// une photo retirée le passe à la suivante, ou au bouton d'ajout. Rien n'est réécrit si le contenu n'a pas changé.
function refill(el, html) {
  if (el._html === html) return;
  const a = document.activeElement, had = a && el.contains(a);
  const key = had ? (a.dataset.guide != null ? `[data-guide="${a.dataset.guide}"]` : a.dataset.del != null ? `[data-del="${a.dataset.del}"]` : null) : null;
  el.innerHTML = html; el._html = html;
  if (!had) return;
  const back = (key && el.querySelector(key)) || [...el.querySelectorAll("button")].at(-1) || $("add");
  back?.focus();
}
function render() {
  if (!S.guide) return;
  const cfg = CONFIGS[S.guide];
  refill($("guides"), GUIDES.map(([k, n, r]) => `<button type="button" class="guide${k === S.guide ? " on" : ""}" data-guide="${k}" aria-pressed="${k === S.guide}"${S.running ? " disabled" : ""}><b>${esc(n)}</b><span>${esc(r)}</span></button>`).join(""));
  const sel = $("spot");
  sel.innerHTML = cfg.SPOTS.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("") + `<option value="${OTHER}">Autre spot, hors du guide</option>`;
  sel.value = S.spotId; sel.disabled = S.running;
  // Indice GPS : spot le plus proche de la première photo géolocalisée.
  const g = S.photos.find((p) => p.exif?.lat != null);
  const n = g ? nearestSpot(g.exif.lat, g.exif.lon, cfg.SPOTS) : null;
  $("gps").innerHTML = n ? `Photo ${S.photos.indexOf(g) + 1} prise à ${esc(String(Math.round(n.km * 10) / 10).replace(".", ","))} km du spot le plus proche : <b>${esc(n.spot.name)}</b>.${n.spot.id !== S.spotId && n.km <= 3 ? ` <button type="button" class="link" id="use-gps" data-spot="${esc(n.spot.id)}"${S.running ? " disabled" : ""}>Choisir ce spot</button>` : n.km > 3 ? " Loin des spots de ce guide : vérifie le guide et le spot." : ""}` : "";
  $("gps").hidden = !n;

  const P = effPhotos();
  $("count").textContent = `${S.photos.length}/${maxPhotos()}`;
  $("add").disabled = S.preparing || S.running || S.photos.length >= maxPhotos() || S.sample === null;
  $("add").textContent = S.preparing ? "Préparation…" : S.photos.length ? "Ajouter des photos" : "Choisir des photos";
  $("prep-err").textContent = S.prepErr || ""; $("prep-err").hidden = !S.prepErr;
  refill($("thumbs"), P.map((p, i) => `<figure><img src="${p.thumb}" alt="Photo ${i + 1}"><button type="button" class="x" data-del="${i}" aria-label="Retirer la photo ${i + 1}"${S.running ? " disabled" : ""}>✕</button><figcaption><b>Photo ${i + 1}</b> · ${Number.isFinite(p.when?.ms) ? esc(photoDateLabel(p.when.ms)) : "heure inconnue"}<br>${esc(p.when?.note || "")}</figcaption></figure>`).join(""));
  $("manual-wrap").hidden = !S.photos.some((p) => !hasExifTime(p));
  $("manual").disabled = S.running; $("notes").readOnly = S.running;   // v8.9 : rien ne bouge pendant l'analyse
  // Marée et lumière au moment des photos : calculées ici, comme dans le guide.
  const spot = S.spotId === OTHER ? null : cfg.SPOTS.find((s) => s.id === S.spotId) || null;
  const tf = S.photos.length ? timeFacts(spot, P) : [];
  $("tide").innerHTML = tf.map((t) => `<li>${esc(t.t)}</li>`).join("");
  $("tide-wrap").hidden = !tf.length;

  // Disponibilité de Claude
  const av = $("avail");
  if (S.sample === undefined) { av.className = "note"; av.textContent = "Connexion à Claude…"; }
  else if (S.sample === null) { av.className = "note bad"; av.innerHTML = "Ouvre cette page dans <b>claude.ai</b>, connecté à ton compte : l'analyse passe par ton abonnement Claude. Copiée ailleurs, la page ne peut pas appeler Claude."; }
  else if (!S.limits?.images) { av.className = "note bad"; av.textContent = SAMPLE_MSG.images_unavailable; }
  else { av.className = "note ok"; av.textContent = "Claude est disponible : l'analyse compte dans l'usage de ton abonnement, sans crédit API. Ta première analyse demandera ton accord."; }

  const done = S.job?.partial?.lec;
  const go = $("go");
  go.disabled = S.running || !S.sample || !S.limits?.images || !S.photos.length;
  go.textContent = S.job && !done && Object.keys(S.job.partial || {}).some((k) => ["inv", "ver"].includes(k)) ? "Reprendre l'analyse" : "Analyser avec Claude";
  go.hidden = !!done;
  $("stop").hidden = !S.running;
  $("restart").hidden = S.running || !S.job;
  renderProgress();
  $("err").textContent = S.error || ""; $("err").hidden = !S.error;
  renderResult();
  renderNotesHint();
}
function renderNotesHint() {
  const h = $("notes-stale");
  if (h) h.hidden = !(S.job?.partial?.lec && S.notes !== (S.job.notes || ""));
}
function renderProgress() {
  const box = $("passes");
  if (!S.job) { box.hidden = true; return; }
  box.hidden = false;
  const P = S.job.partial || {};
  const doneOf = (n) => (n === 1 ? !!P.inv : n === 2 ? !!P.ver : !!P.lec);
  box.innerHTML = PASSES.map((p) => {
    const d = doneOf(p.n), cur = S.running && S.step === p.n;
    const t = d && S.times[p.n] ? ` · ${mmss(S.times[p.n])}` : cur ? ` · ${mmss(Date.now() - S.stepAt)}` : "";
    return `<li class="${d ? "done" : cur ? "cur" : ""}"><span class="dot" aria-hidden="true"></span><span>${p.n}. ${esc(p.label)}${d ? " — faite" : cur ? " — en cours" : ""}${t}</span></li>`;
  }).join("");
}
function renderResult() {
  const box = $("result");
  const P = S.job?.partial;
  if (!P?.lec) { box.hidden = true; return; }
  box.hidden = false;
  const L = P.lec.result;
  const spotName = S.job.spotId ? (SPOTS.find((s) => s.id === S.job.spotId)?.name || "") : "Spot hors du guide";
  $("res-head").innerHTML = `<b>${esc(spotName)}</b> · ${P.ver.kept.length} observation${P.ver.kept.length > 1 ? "s" : ""} gardée${P.ver.kept.length > 1 ? "s" : ""} après vérification${P.ver.removed.length ? `, ${P.ver.removed.length} retirée${P.ver.removed.length > 1 ? "s" : ""}` : ""}`;
  $("res-syn").textContent = L.synthese || "";
  $("res-postes").innerHTML = (L.postes || []).map((x) => `<li><b>${esc(x.nom)}</b> — ${esc(x.pourquoi)} <span class="refs">${esc(x.refs.join(", "))}</span></li>`).join("") || "<li>Aucun poste fondé sur des faits sûrs.</li>";
  $("res-secu").innerHTML = (L.securite || []).map((x) => `<li>${esc(x.texte)} <span class="refs">${esc(x.refs.join(", "))}</span></li>`).join("");
  $("res-secu-wrap").hidden = !(L.securite || []).length;
  $("save").disabled = S.running; $("copy").disabled = S.running;
  const ex = $("exported");
  ex.hidden = !S.exported; ex.className = `note ${S.exported?.ok ? "ok" : "bad"}`; ex.textContent = S.exported?.ok || S.exported?.err || "";
}

// ── Événements ──
document.addEventListener("click", (e) => {
  const t = e.target.closest("button"); if (!t) return;
  if (t.dataset.guide) pickGuide(t.dataset.guide);
  else if (t.dataset.del != null) { if (S.running) return; S.photos.splice(+t.dataset.del, 1); S.job = null; S.exported = null; render(); }
  else if (t.id === "use-gps") { if (S.running) return; S.spotId = t.dataset.spot; S.job = null; render(); }
  else if (t.id === "add") $("file").click();
  else if (t.id === "go") analyse();
  else if (t.id === "stop") stop();
  else if (t.id === "restart") restart();
  else if (t.id === "save") saveFile();
  else if (t.id === "copy") copyForGuide();
});
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.id === "file") { addFiles(t.files); t.value = ""; }
  else if (S.running && (t.id === "spot" || t.id === "manual")) render();
  else if (t.id === "spot") { S.spotId = t.value; S.job = null; S.exported = null; render(); }
  else if (t.id === "manual") { S.manual = t.value; S.job = null; render(); }
});
// Notes : une analyse finie est gardée telle quelle (avec les notes qu'elle a reçues) ; une analyse inachevée
// repart de zéro, et l'écran le montre aussitôt.
document.addEventListener("input", (e) => {
  if (e.target.id !== "notes") return;
  S.notes = e.target.value;
  if (!S.job || S.running) return;
  if (S.job.partial?.lec) { renderNotesHint(); return; }
  S.job = null; S.exported = null; render();
});
window.addEventListener("hashchange", () => { const k = guideFromHash(); if (k && k !== S.guide) pickGuide(k, { fromHash: true }); });

// ── Démarrage ──
pickGuide(guideFromHash() || lsGet("studio:guide") || "logonna", { fromHash: !!guideFromHash() });
(async () => {
  const api = typeof window !== "undefined" && window.claude && typeof window.claude.use === "function" ? window.claude : null;
  if (!api) { S.sample = null; S.downloads = null; render(); return; }
  try { S.sample = await api.use("sample"); } catch { S.sample = null; }
  try { S.limits = S.sample ? await S.sample.limits() : null; } catch { S.limits = null; }
  try { S.downloads = await api.use("downloads"); } catch { S.downloads = null; }
  render();
})();
