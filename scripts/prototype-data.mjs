// Phase 11 — Données du prototype BORD : une vraie journée archivée passée au vrai moteur v2.
//
// Le prototype (src/prototype/) ne calcule rien : il affiche ce que ce script écrit. La journée vient des archives
// d'Open-Meteo du dépôt (data/epreuve/archives/<guide>.json.gz, phase 8) ; le moteur est celui de l'application
// (src/engine.js, construit pour le guide). Rien n'est inventé : si une valeur manque, elle manque à l'écran.
//
// Usage : node scripts/prototype-data.mjs [guide=logonna] [date=2026-05-16]
// Sortie : src/prototype/data/bord.json
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { ARCHIVES, readDays } from "./epreuve-journees.mjs";
import { SITES } from "./sites.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const [guide = "logonna", date = "2026-05-16"] = process.argv.slice(2);
const site = SITES.find((s) => s.key === guide);
if (!site) throw new Error(`guide inconnu : ${guide}`);

fs.mkdirSync(path.join(root, "tests/.build"), { recursive: true });
const file = path.join(root, "tests/.build", `proto_${guide}.mjs`);
await build({ entryPoints: [path.join(root, "src/engine.js")], bundle: true, format: "esm", platform: "node", outfile: file, jsx: "automatic",
  external: ["react", "react/jsx-runtime", "react-dom"], logLevel: "warning",
  plugins: [{ name: "site", setup(b) { b.onResolve({ filter: /^SITE_CONFIG$/ }, () => ({ path: path.join(root, site.config) })); } }] });
const E = await import(file + `?t=${Date.now()}`);

const live = readDays(ARCHIVES, guide)?.days?.[date];
if (!live || live.error) throw new Error(`pas de journée archivée ${guide} ${date}`);

const day = E.rankDay(date, live, { engine: "v2", hours: E.DEFAULT_HOURS, clock: Date.parse(`${date}T05:00:00Z`), pertinence: true, ensemble: true });
const r1 = (x) => (x == null ? null : Math.round(x * 10) / 10);
const r0 = (x) => (x == null ? null : Math.round(x));
const tide = E.makeTideFor(date)();
const sun = E.solarTimes(date);
const fmtH = (dec) => (dec == null ? null : `${String(Math.floor(dec)).padStart(2, "0")}h${String(Math.round((dec % 1) * 60)).padStart(2, "0")}`.replace("h60", "h59"));

// Série horaire de la journée (heure de Paris) pour un spot : vent, rafales, vagues, nuages, pluie, eau.
function hourly(spotId) {
  const z = live.series?.[spotId] || live.series?._base;
  if (!z?.t) return [];
  const fmt = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" });
  const out = [];
  z.t.forEach((t, i) => {
    const parts = Object.fromEntries(fmt.formatToParts(new Date(t * 1000)).map((p) => [p.type, p.value]));
    if (`${parts.year}-${parts.month}-${parts.day}` !== date) return;
    const h = +parts.hour;
    if (h < 5 || h > 23) return;
    out.push({ h, wind: r0(z.wind?.[i]), gust: r0(z.gust?.[i]), dir: r0(z.dir?.[i]), wave: r1(z.wave?.[i]), cloud: r0(z.cloud?.[i]), rain: r1(z.rain?.[i]), sst: r1(z.sst?.[i]) });
  });
  return out;
}

const status = (x) => (!x.eligible ? "nr" : x.verify?.length ? "verify" : "ok");
const spots = day.map((x) => {
  const v2 = x.v2 || {};
  const best = v2.best || null;
  const bw = (x.windows || []).find((w) => w.id === (v2.bestWindowId || x.bestWindowId)) || null;
  const f = best?.f || v2.f || null;
  const lure = x.eligible && bw ? E.lureAdvice(x, bw, live, date, {}) : null;
  const sp = E.SPOTS.find((s) => s.id === x.id) || {};
  return {
    id: x.id, name: x.name, subtitle: x.subtitle || "", type: x.type || "", distMin: x.distMin ?? null,
    lat: x.lat ?? x.coords?.[0] ?? null, lon: x.lon ?? x.coords?.[1] ?? null,
    status: status(x), rank: v2.rank ?? null,
    nrReason: x.eligible ? null : (x.reason || x.wxReason || null),
    verify: (x.verify || []).map((v) => v.t),
    fav: x.eligible ? (v2.fav ?? x.score ?? null) : null,
    favLine: f?.line || null,
    cond: f?.cond ?? null,
    presence: f?.pres ? { factor: f.pres.factor, label: f.pres.label } : null,
    crit: (f?.crit || []).map((c) => ({ k: c.k, label: c.label, pts: r1(c.pts), max: c.max, why: c.why, niveau: c.niveau })),
    pert: v2.pert ? { score: v2.pert.score, parts: (v2.pert.parts || []).map((p) => ({ label: p.label, pts: r1(p.pts), max: p.max, why: p.why })),
                      top: (v2.pert.top || []).slice(0, 3).map((t) => ({ name: t.name, weight: t.weight, color: t.color, famLabel: t.famLabel, why: t.why })) } : null,
    conf: v2.conf ? { score: v2.conf.score, label: v2.conf.label, parts: (v2.conf.parts || []).map((p) => ({ label: p.label, pts: r1(p.pts), max: p.max, why: p.why })) } : null,
    best: bw ? { start: bw.startFmt, end: bw.endFmt, label: bw.label, light: bw.light?.band || null, lightLabel: bw.light?.label || null, coeff: bw.coeff ?? null, tide: bw.tidePhaseType || null } : null,
    windows: (x.windows || []).filter((w) => !w.outOfHours).map((w) => ({ start: w.startDecimal, end: w.endDecimal, startFmt: w.startFmt, endFmt: w.endFmt,
      fav: w.f?.fav ?? null, ok: !!w.eligible, verify: (w.verify || []).length > 0, light: w.light?.band || null, label: w.label })),
    lure: lure ? {
      summary: lure.summary, family: lure.best?.court || null, familyLabel: lure.best?.label || null,
      pick: lure.pick ? { name: lure.pick.name, weight: lure.pick.weight?.text || null, color: lure.pick.color?.name || null, named: !!lure.pick.color?.named } : null,
      alts: (lure.alts || []).slice(0, 3).map((a) => ({ name: a.name, weight: a.weight?.text || null, color: a.color?.name || null })),
      color: lure.color?.label || null, colorWhy: (lure.color?.why || []).slice(0, 2).map((w) => w.t),
      size: lure.size?.text || null, weight: lure.weight?.text || null, weightWhy: (lure.weight?.why || []).slice(0, 2).map((w) => w.t),
      anim: (lure.anim || []).slice(0, 3).map((a) => a.t),
    } : null,
    access: Array.isArray(sp.access) ? sp.access.slice(0, 2).map((a) => (typeof a === "string" ? a : a.t)) : (typeof sp.access === "string" ? [sp.access] : []),
    securite: (sp.securite || []).slice(0, 3).map((s) => s.t),
    hourly: hourly(x.id),
  };
});

const first = day.find((x) => x.eligible);
const out = {
  meta: {
    guide, guideName: E.SITE.name || E.SITE.label || guide, date,
    source: `Journée réelle archivée (Open-Meteo, ${(live.models || []).join(", ") || "modèle inconnu"}), passée au moteur v2 de l'application`,
    generatedBy: "scripts/prototype-data.mjs",
    ens: first?.v2?.ens || null,
  },
  live: {
    resume: live.resume || null, windDir: live.wind_dir, windForce: live.wind_force, windKmh: r0(live.wind_kmh), gustKmh: r0(live.gust_kmh),
    sky: live.sky, wave: r1(live.houle), sst: r1(live.sst), pressure: r0(live.pressure), pressureTrend: live.pressure_trend, rainMm: r1(live.rain_mm),
    models: live.models || [], zones: live.zones || null,
  },
  tide: { port: tide.label || tide.port, coefs: tide.coefs, events: (tide.dayEvents || []).map((e) => ({ type: e.type, time: fmtH(e.dec), dec: r1(e.dec), h: r1(e.h), coef: e.coef ?? null })),
          curve: (tide.curve || []).filter((p, i) => i % 2 === 0).map((p) => [p.hour, Math.round(p.height * 100) / 100]) },
  sun: { dawn: fmtH(sun.dawn), sunrise: fmtH(sun.sunrise), sunset: fmtH(sun.sunset), dusk: fmtH(sun.dusk) },
  spots,
};
const dest = path.join(root, "src/prototype/data/bord.json");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out, null, 1) + "\n");
console.log(`${guide} ${date} : ${spots.length} spots, premier ${first?.name} (${first?.v2?.fav}) → ${path.relative(root, dest)} (${(fs.statSync(dest).size / 1024).toFixed(0)} Ko)`);
