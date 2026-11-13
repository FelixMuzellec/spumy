// v8.15 — Pêche en bateau (onglet Offshore de l'accueil) : spots, sorties, conditions, et un modèle EMPIRIQUE.
//
// Rien n'est supposé sur ce qui fait pêcher en bateau : aucune règle a priori, aucun spot pré-rempli. La note
// n'existe qu'à partir de tes sorties (prises ET capots), par une régression de Poisson du nombre de prises
// sur les conditions de la sortie, avec la durée en exposition :
//     prises ~ Poisson(durée × exp(β0 + Σ βj·xj + effet du spot))
// Les variables sont centrées-réduites ; une pénalité « ridge » tire chaque effet vers zéro tant que les
// sorties sont peu nombreuses (un effet n'apparaît que s'il revient d'une sortie à l'autre). La note
// compare le taux attendu à TA moyenne : 5 = ta moyenne, +2,5 par doublement, −2,5 par moitié.
// Module sans guide ni réseau : fonctions pures, testées (tests/unit.mjs).

export const OFF_SPOTS_KEY = "bar:offshore:spots";
export const OFF_TRIPS_KEY = "bar:offshore:trips";
export const OFF_FILE = "offshore.json";
export const MIN_TRIPS = 8;          // sorties avec conditions avant de proposer une note
export const MAX_OFF_SPOTS = 60;
export const OFF_COLOR = "#2dd4bf";

// Espèces majeures de la pêche à la ligne en Manche et Atlantique (nom courant, nom scientifique).
export const SPECIES = [
  ["bar", "Bar", "Dicentrarchus labrax"], ["lieu-jaune", "Lieu jaune", "Pollachius pollachius"], ["lieu-noir", "Lieu noir", "Pollachius virens"],
  ["cabillaud", "Cabillaud", "Gadus morhua"], ["merlan", "Merlan", "Merlangius merlangus"], ["tacaud", "Tacaud", "Trisopterus luscus"],
  ["maquereau", "Maquereau", "Scomber scombrus"], ["chinchard", "Chinchard", "Trachurus trachurus"],
  ["dorade-grise", "Dorade grise (griset)", "Spondyliosoma cantharus"], ["dorade-royale", "Dorade royale", "Sparus aurata"], ["pageot", "Pageot", "Pagellus spp."],
  ["vieille", "Vieille", "Labrus bergylta"], ["congre", "Congre", "Conger conger"], ["lingue", "Lingue", "Molva molva"],
  ["raie", "Raie", "Raja spp."], ["turbot", "Turbot", "Scophthalmus maximus"], ["barbue", "Barbue", "Scophthalmus rhombus"],
  ["plie", "Plie (carrelet)", "Pleuronectes platessa"], ["sole", "Sole", "Solea solea"], ["grondin", "Grondin", "Chelidonichthys spp."],
  ["saint-pierre", "Saint-pierre", "Zeus faber"], ["emissole", "Émissole", "Mustelus spp."], ["roussette", "Roussette", "Scyliorhinus spp."],
  ["requin-ha", "Requin-hâ", "Galeorhinus galeus"], ["thon-rouge", "Thon rouge", "Thunnus thynnus"], ["germon", "Germon", "Thunnus alalunga"],
  ["bonite", "Bonite", "Sarda sarda"], ["mulet", "Mulet", "Mugilidae"], ["seiche", "Seiche", "Sepia officinalis"], ["calmar", "Calmar (encornet)", "Loligo spp."],
  ["autre", "Autre espèce", ""],
].map(([id, name, latin]) => ({ id, name, latin }));
export const SPECIES_BY = Object.fromEntries(SPECIES.map((x) => [x.id, x]));
export const BOAT_TYPES = { epave: "Épave", roche: "Roche, plateau", banc: "Banc de sable", tombant: "Tombant", chenal: "Chenal, veine de courant", autre: "Autre" };
export const TECHNIQUES = { jig: "Jig, madaï, inchiku", souple: "Leurre souple", dur: "Leurre dur", traine: "Traîne", appat: "Appât (fond)", plumes: "Plumes, mitraillette", turlutte: "Turlutte", autre: "Autre" };

// ── Fiches : nettoyées champ par champ (stockage, GitHub, import) ──
const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const isId = (v, pre) => new RegExp(`^${pre}-[a-z0-9]{4,24}$`).test(String(v || ""));
export const newId = (pre, now = Date.now(), rnd = Math.random) => `${pre}-${now.toString(36)}${Math.floor(rnd() * 1296).toString(36).padStart(2, "0")}`;
const stamp = (r) => (Number.isFinite(+r.updatedAt) ? +r.updatedAt : 0);

export function sanitizeBoatSpot(r) {
  if (!r || typeof r !== "object" || !isId(r.id, "b")) return null;
  const updatedAt = stamp(r);
  if (r.deleted === true) return { id: r.id, deleted: true, updatedAt };
  const name = clean(r.name, 60), lat = +r.lat, lon = +r.lon;
  if (name.length < 2 || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  const depth = Number.isFinite(+r.depth) && +r.depth > 0 && +r.depth <= 500 && r.depth !== "" && r.depth !== null ? Math.round(+r.depth) : null;
  return { id: r.id, name, lat: +lat.toFixed(6), lon: +lon.toFixed(6), type: Object.prototype.hasOwnProperty.call(BOAT_TYPES, r.type) ? r.type : "autre",
           depth, notes: clean(r.notes, 600), createdAt: Number.isFinite(+r.createdAt) ? +r.createdAt : updatedAt, updatedAt };
}
const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;
export function sanitizeTrip(r) {
  if (!r || typeof r !== "object" || !isId(r.id, "t")) return null;
  const updatedAt = stamp(r);
  if (r.deleted === true) return { id: r.id, deleted: true, updatedAt };
  if (!isId(r.spotId, "b") || !/^\d{4}-\d{2}-\d{2}$/.test(String(r.date)) || !HHMM.test(r.start) || !HHMM.test(r.end)) return null;
  const catches = (Array.isArray(r.catches) ? r.catches : []).map((c) => {
    if (!c || !SPECIES_BY[c.sp]) return null;
    const n = Math.round(+c.n);
    if (!Number.isFinite(n) || n < 1 || n > 500) return null;
    const size = Number.isFinite(+c.size) && +c.size > 0 && +c.size <= 400 && c.size !== "" && c.size !== null ? Math.round(+c.size) : null;
    return { sp: c.sp, n, size, kept: c.kept === true };
  }).filter(Boolean).slice(0, 40);
  const tech = (Array.isArray(r.tech) ? r.tech : []).filter((t) => Object.prototype.hasOwnProperty.call(TECHNIQUES, t)).slice(0, 8);
  const cond = r.cond && typeof r.cond === "object" && !Array.isArray(r.cond) ? sanitizeCond(r.cond) : null;
  return { id: r.id, spotId: r.spotId, date: r.date, start: r.start, end: r.end, catches, tech: [...new Set(tech)], notes: clean(r.notes, 600), cond,
           createdAt: Number.isFinite(+r.createdAt) ? +r.createdAt : updatedAt, updatedAt };
}
const COND_KEYS = ["wind", "gust", "dir", "wave", "waveDir", "period", "swell", "swellPeriod", "sst", "pressure", "dp24", "cloud", "coef", "tideH", "hour", "doy"];
function sanitizeCond(c) {
  const out = {};
  for (const k of COND_KEYS) if (c[k] != null && Number.isFinite(+c[k])) out[k] = +(+c[k]).toFixed(3);
  if (typeof c.src === "string") out.src = clean(c.src, 120);
  if (Number.isFinite(+c.at)) out.at = +c.at;
  return out;
}
/** Fusion de deux copies (téléphone, GitHub) : par identifiant, la plus récente gagne ; une suppression reste une suppression. */
export function mergeById(remote, local, sanitize) {
  const by = new Map();
  for (const r of [...(remote || []), ...(local || [])].map(sanitize).filter(Boolean)) {
    const cur = by.get(r.id);
    if (!cur || r.updatedAt > cur.updatedAt || (r.updatedAt === cur.updatedAt && r.deleted && !cur.deleted)) by.set(r.id, r);
  }
  return [...by.values()].sort((a, b) => a.id.localeCompare(b.id));
}

// ── Heure de Paris ──
const PARIS = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
function parisParts(ms) { const p = Object.fromEntries(PARIS.formatToParts(new Date(ms)).map((x) => [x.type, x.value])); return { date: `${p.year}-${p.month}-${p.day}`, h: +p.hour, m: +p.minute }; }
/** Instant (ms) d'une heure locale de Paris, « HH:MM » le jour dateISO. */
export function parisMs(dateISO, hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  const guess = Date.UTC(+dateISO.slice(0, 4), +dateISO.slice(5, 7) - 1, +dateISO.slice(8, 10), h, m);
  let t = guess;
  for (let i = 0; i < 2; i++) { const p = parisParts(t); const shown = Date.UTC(+p.date.slice(0, 4), +p.date.slice(5, 7) - 1, +p.date.slice(8, 10), p.h, p.m); t += guess - shown; }
  return t;
}
export const parisDate = (ms) => parisParts(ms).date;
export const parisHour = (ms) => { const p = parisParts(ms); return p.h + p.m / 60; };
/** Durée d'une sortie en heures (une fin avant le début passe minuit) ; au moins un quart d'heure. */
export function tripHours(t) {
  const a = parisMs(t.date, t.start); let b = parisMs(t.date, t.end);
  if (b <= a) b += 24 * 36e5;
  return Math.max(0.25, (b - a) / 36e5);
}
export function tripSpan(t) { const a = parisMs(t.date, t.start); let b = parisMs(t.date, t.end); if (b <= a) b += 24 * 36e5; return [a, b]; }
export const catchCount = (t, sp = "all") => (t.catches || []).reduce((s, c) => s + (sp === "all" || c.sp === sp ? c.n : 0), 0);

// ── Conditions d'une période, à partir des séries horaires d'un point (Open-Meteo, voir src/bateau/wx.js) ──
const meanOf = (xs) => { const v = xs.filter((x) => x != null && Number.isFinite(x)); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const maxOf = (xs) => { const v = xs.filter((x) => x != null && Number.isFinite(x)); return v.length ? Math.max(...v) : null; };
const circMean = (xs) => { const v = xs.filter((x) => x != null && Number.isFinite(x)); if (!v.length) return null; const r = Math.PI / 180;
  const a = Math.atan2(meanOf(v.map((d) => Math.sin(d * r))), meanOf(v.map((d) => Math.cos(d * r)))) / r; return (a + 360) % 360; };
/**
 * Conditions moyennes sur [t0, t1] (ms) : vent, rafales, vagues, houle, eau, pression (et sa variation sur 24 h), nuages,
 * marée (coefficient, heures depuis la dernière pleine mer), heure locale et jour de l'année au milieu de la période.
 * ser : { time: [s…], wind, gust, dir, pressure, cloud, wave, waveDir, period, swell, swellPeriod, sst } ; tide : { events: [{ type, ms, coef }] } ou null.
 */
export function conditionsOf(ser, t0, t1, tide = null) {
  if (!ser?.time?.length) return null;
  const idx = []; for (let i = 0; i < ser.time.length; i++) { const ms = ser.time[i] * 1000; if (ms >= t0 - 30 * 6e4 && ms <= t1 + 30 * 6e4) idx.push(i); }
  if (!idx.length) return null;
  const pick = (k) => idx.map((i) => ser[k]?.[i] ?? null);
  const mid = (t0 + t1) / 2;
  const at = (k, ms) => { let best = null, bd = Infinity; for (let i = 0; i < ser.time.length; i++) { const d = Math.abs(ser.time[i] * 1000 - ms); if (d < bd && ser[k]?.[i] != null) { bd = d; best = ser[k][i]; } } return bd <= 2 * 36e5 ? best : null; };
  const p0 = at("pressure", t0), pm24 = at("pressure", t0 - 24 * 36e5);
  const c = {
    wind: meanOf(pick("wind")), gust: maxOf(pick("gust")), dir: circMean(pick("dir")),
    wave: meanOf(pick("wave")), waveDir: circMean(pick("waveDir")), period: meanOf(pick("period")),
    swell: meanOf(pick("swell")), swellPeriod: meanOf(pick("swellPeriod")), sst: meanOf(pick("sst")),
    pressure: meanOf(pick("pressure")), dp24: p0 != null && pm24 != null ? p0 - pm24 : null, cloud: meanOf(pick("cloud")),
    hour: parisHour(mid), doy: doyOf(parisDate(mid)),
  };
  if (tide?.events?.length) {
    const pms = tide.events.filter((e) => e.type === "PM").sort((a, b) => a.ms - b.ms);
    const last = [...pms].reverse().find((e) => e.ms <= mid);
    const near = pms.reduce((b, e) => (!b || Math.abs(e.ms - mid) < Math.abs(b.ms - mid) ? e : b), null);
    if (last) c.tideH = (mid - last.ms) / 36e5;
    if (near?.coef != null) c.coef = near.coef;
  }
  for (const k of Object.keys(c)) if (c[k] == null || !Number.isFinite(c[k])) delete c[k];
  return c;
}
export function doyOf(dateISO) { const t = Date.UTC(+dateISO.slice(0, 4), +dateISO.slice(5, 7) - 1, +dateISO.slice(8, 10)); return Math.floor((t - Date.UTC(+dateISO.slice(0, 4), 0, 1)) / 864e5) + 1; }

// ── Variables du modèle ──
// Les variables cycliques (moment de la marée, heure, saison) entrent par leur sinus et leur cosinus.
const TIDE_PERIOD = 12.42;
export const VARS = [
  { k: "wind", label: "Vent moyen", unit: "km/h", d: 0 },
  { k: "gust", label: "Rafales", unit: "km/h", d: 0 },
  { k: "wave", label: "Hauteur des vagues", unit: "m", d: 1 },
  { k: "period", label: "Période des vagues", unit: "s", d: 0 },
  { k: "swell", label: "Houle", unit: "m", d: 1 },
  { k: "sst", label: "Température de l'eau", unit: "°C", d: 1 },
  { k: "pressure", label: "Pression", unit: "hPa", d: 0 },
  { k: "dp24", label: "Pression, variation sur 24 h", unit: "hPa", d: 0 },
  { k: "cloud", label: "Nébulosité", unit: "%", d: 0 },
  { k: "coef", label: "Coefficient de marée", unit: "", d: 0 },
  { k: "tideH", label: "Moment de la marée (heures après la pleine mer)", unit: "h", d: 1, cyc: TIDE_PERIOD },
  { k: "hour", label: "Heure de la journée", unit: "h", d: 0, cyc: 24 },
  { k: "doy", label: "Saison (jour de l'année)", unit: "", d: 0, cyc: 365.25 },
];
export const VAR_BY = Object.fromEntries(VARS.map((v) => [v.k, v]));
const cols = (v) => (v.cyc ? [`${v.k}:s`, `${v.k}:c`] : [v.k]);
function colValue(cond, col) {
  const [k, part] = col.split(":"), v = VAR_BY[k], x = cond?.[k];
  if (x == null || !Number.isFinite(x)) return null;
  if (!part) return x;
  const a = (2 * Math.PI * x) / v.cyc;
  return part === "s" ? Math.sin(a) : Math.cos(a);
}

// ── Algèbre minimale ──
function solve(A, b) {   // élimination de Gauss avec pivot partiel ; A symétrique définie positive ici
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c]; if (Math.abs(d) < 1e-12) return null;
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / d; if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((r, i) => r[n] / r[i]);
}

/**
 * Ajuste le modèle sur tes sorties. trips : sorties nettoyées (avec cond) ; species : "all" ou un identifiant d'espèce.
 * Renvoie { ok, n, reason } ou { ok: true, n, cols, mu, sd, beta, b0, spot, meanRate, totalCatch, hours, alpha }.
 */
export function fitModel(trips, { species = "all", alpha = 3, alphaSpot = 2, minTrips = MIN_TRIPS } = {}) {
  const data = (trips || []).filter((t) => t && !t.deleted && t.cond && Object.keys(t.cond).length);
  const n = data.length;
  const totalCatch = data.reduce((s, t) => s + catchCount(t, species), 0);
  const hours = data.reduce((s, t) => s + tripHours(t), 0);
  if (n < minTrips) return { ok: false, n, totalCatch, hours, reason: `${n} sortie${n > 1 ? "s" : ""} avec conditions sur ${minTrips} nécessaires` };
  if (!totalCatch) return { ok: false, n, totalCatch, hours, reason: "aucune prise enregistrée pour l'instant : le modèle n'a rien à relier aux conditions" };
  // Variables présentes dans au moins 60 % des sorties et qui varient ; les valeurs manquantes prennent la moyenne.
  const cs = VARS.flatMap(cols).filter((c) => {
    const v = data.map((t) => colValue(t.cond, c)).filter((x) => x != null);
    if (v.length < 0.6 * n) return false;
    const m = meanOf(v); return v.some((x) => Math.abs(x - m) > 1e-9);
  });
  const mu = {}, sd = {};
  for (const c of cs) {
    const v = data.map((t) => colValue(t.cond, c)).filter((x) => x != null), m = meanOf(v);
    mu[c] = m; sd[c] = Math.sqrt(meanOf(v.map((x) => (x - m) ** 2))) || 1;
  }
  const spots = [...new Set(data.map((t) => t.spotId))];
  const p = cs.length + spots.length;
  const X = data.map((t) => [...cs.map((c) => { const x = colValue(t.cond, c); return x == null ? 0 : (x - mu[c]) / sd[c]; }), ...spots.map((s) => (t.spotId === s ? 1 : 0))]);
  const y = data.map((t) => catchCount(t, species));
  const off = data.map((t) => Math.log(tripHours(t)));
  const pen = [...cs.map(() => alpha), ...spots.map(() => alphaSpot)];
  const meanRate = totalCatch / hours;
  let b0 = Math.log(meanRate), beta = new Array(p).fill(0);
  for (let it = 0; it < 60; it++) {
    // Newton sur (b0, beta) : gradient et hessienne de la log-vraisemblance pénalisée.
    const eta = X.map((r, i) => Math.max(-30, Math.min(30, b0 + off[i] + r.reduce((s, x, j) => s + x * beta[j], 0))));
    const m = eta.map(Math.exp);
    const q = p + 1, H = Array.from({ length: q }, () => new Array(q).fill(0)), g = new Array(q).fill(0);
    for (let i = 0; i < n; i++) {
      const row = [1, ...X[i]], r = y[i] - m[i];
      for (let a = 0; a < q; a++) { g[a] += row[a] * r; if (!row[a]) continue; for (let b = 0; b < q; b++) if (row[b]) H[a][b] += row[a] * row[b] * m[i]; }
    }
    for (let j = 0; j < p; j++) { g[j + 1] -= pen[j] * beta[j]; H[j + 1][j + 1] += pen[j]; }
    H[0][0] += 1e-9;
    const step = solve(H, g);
    if (!step) break;
    const lim = Math.max(1, ...step.map(Math.abs)) > 5 ? 5 / Math.max(...step.map(Math.abs)) : 1;   // pas borné : jamais d'explosion
    b0 += step[0] * lim; beta = beta.map((v, j) => v + step[j + 1] * lim);
    if (Math.max(...step.map(Math.abs)) * lim < 1e-7) break;
  }
  const spot = Object.fromEntries(spots.map((s, j) => [s, beta[cs.length + j]]));
  return { ok: true, n, species, cols: cs, mu, sd, beta: Object.fromEntries(cs.map((c, j) => [c, beta[j]])), b0, spot, meanRate, totalCatch, hours, alpha };
}
/** Prises par heure attendues pour des conditions et un spot (spot inconnu du modèle : effet nul). */
export function predictRate(model, cond, spotId) {
  if (!model?.ok) return null;
  let eta = model.b0 + (model.spot[spotId] || 0);
  for (const c of model.cols) { const x = colValue(cond, c); if (x != null) eta += model.beta[c] * (x - model.mu[c]) / model.sd[c]; }
  return Math.exp(Math.max(-30, Math.min(30, eta)));
}
/** Note sur 10 : 5 = ta moyenne de prises par heure, +2,5 par doublement, −2,5 par moitié. */
export function scoreOf(model, rate) {
  if (!model?.ok || rate == null || !(rate > 0)) return null;
  const s = 5 + 2.5 * Math.log2(rate / model.meanRate);
  return Math.round(Math.max(0.1, Math.min(9.9, s)) * 10) / 10;
}
/** Fiabilité dite en clair, selon le nombre de sorties. */
export const reliabilityOf = (n) => (n < 15 ? "faible" : n < 40 ? "moyenne" : "correcte");

/**
 * Courbe de régression d'une variable : prises par heure attendues quand elle varie (les autres à leur moyenne,
 * spot moyen), sur l'étendue observée de tes sorties ; plus les sorties elles-mêmes (prises par heure).
 */
export function curveOf(model, trips, k, steps = 40) {
  const v = VAR_BY[k]; if (!model?.ok || !v) return null;
  const used = cols(v).filter((c) => model.cols.includes(c));
  if (!used.length) return null;
  const obs = (trips || []).filter((t) => !t.deleted && t.cond?.[k] != null).map((t) => ({ x: t.cond[k], y: catchCount(t, model.species) / tripHours(t) }));
  let lo, hi;
  // Étendue observée seulement : le modèle ne dit rien là où tu n'as jamais pêché. Une variable cyclique n'est montrée
  // sur tout son tour (marée, journée, année) que si tes sorties en couvrent l'essentiel.
  const xs = obs.map((o) => o.x).sort((a, b) => a - b);
  if (!xs.length) return null;
  lo = xs[0]; hi = xs[xs.length - 1];
  if (v.cyc && hi - lo >= 0.75 * v.cyc) { lo = 0; hi = v.cyc; }
  if (hi - lo < 1e-9) return null;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const x = lo + ((hi - lo) * i) / steps;
    let eta = model.b0;
    for (const c of used) { const xv = colValue({ [k]: x }, c); eta += model.beta[c] * (xv - model.mu[c]) / model.sd[c]; }
    pts.push({ x, y: Math.exp(eta) });
  }
  return { k, label: v.label, unit: v.unit, lo, hi, pts, obs, cyc: !!v.cyc };
}
/** Effet de chaque variable : rapport entre le taux le plus haut et le plus bas de sa courbe, et où il est le plus haut. */
export function effectsOf(model, trips) {
  if (!model?.ok) return [];
  return VARS.map((v) => {
    const cv = curveOf(model, trips, v.k); if (!cv) return null;
    const ys = cv.pts.map((p) => p.y), max = Math.max(...ys), min = Math.min(...ys);
    const best = cv.pts[ys.indexOf(max)].x;
    return { k: v.k, label: v.label, unit: v.unit, d: v.d, ratio: max / min, best, lo: cv.lo, hi: cv.hi, rising: !v.cyc ? cv.pts[cv.pts.length - 1].y >= cv.pts[0].y : null, cyc: !!v.cyc };
  }).filter(Boolean).sort((a, b) => b.ratio - a.ratio);
}
