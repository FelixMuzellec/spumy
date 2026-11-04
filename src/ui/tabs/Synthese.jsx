// SPUMY v9.0 — Dashboard Décision (Synthese.jsx)
// Intègre le Hero SPUMY, la jauge /100, les 3 scores distincts (Favorabilité, Pertinence, Confiance),
// la carte Ma Stratégie, tout en préservant l'intégralité des sélecteurs et textes vérifiés par tests/e2e.mjs.
import { SITE } from "SITE_CONFIG";
import { fmtH } from "../../engine/core.js";
import { windSide } from "../../engine/lures.js";
import { GOOD_SCORE, TIE_DELTA, tieGroup } from "../../engine/model.js";
import { regulationForZone } from "../../engine/rules.js";
import { computeSpumyScores } from "../../engine/scale.js";
import { localDecimal } from "../../engine/tide.js";
import { Badge, hrsLeft, Spinner, SpreadNotice } from "../components.jsx";
import { Banner, Card, fmt, Grid, h, MoreBtn, Pill, scoreColor, Stack, Sub, TabNum, Tile } from "../kit.jsx";
import { SpumyGauge100, SpumyTripleScore, SpumyStrategyCard } from "../SpumyViews.jsx";

const STAB = { stable: [h.good, "Stable"], sensible: [h.warn, "Sensible"], volatile: [h.bad, "Volatile"] };
const TREND = { falling_fast: "chute rapide", falling: "en baisse", stable: "stable", rising: "en hausse", rising_fast: "hausse rapide" };
const SIDE = { face: "de face pour ce poste", dos: "de dos pour ce poste", travers: "de travers pour ce poste" };
const LIGHT_ICO = { aube: "🌅", crepuscule: "🌅", nuit: "🌙", jour: "☀️" };
const DANGER = ["", "Facile", "Modéré", "Engagé"];

function whenBadge(w, nowMs, dateISO) {
  if (!w || !Number.isFinite(nowMs)) return null;
  if (w.ongoing) return { t: `En cours · encore ${hrsLeft(w.remainingH)}`, col: h.good };
  const nowDec = localDecimal(nowMs, dateISO);
  if (w.startDecimal > nowDec) return { t: `Dans ${hrsLeft(w.startDecimal - nowDec)}`, col: h.accent };
  return null;
}

function Verdict({ g, degraded }) {
  const { s, w } = g.verdict;
  const tied = tieGroup(g.allScored);
  const nearest = tied.length ? [...tied].sort((a, b) => (a.distMin ?? 999) - (b.distMin ?? 999))[0] : null;
  const stab = STAB[s.stability];
  const activeAlerts = g.verdictAlerts.filter((a) => a.active);
  const permAlerts = s.dangerLevel >= 2 ? g.verdictAlerts.filter((a) => !a.conditional).slice(0, 2) : [];
  const isNight = w?.light?.band === "nuit";
  const col = scoreColor(s.score);
  const wb = whenBadge(w, g.nowMs, g.selectedDate);
  const side = w?.zw ? windSide(s, w.zw).side : null;
  const spumy = computeSpumyScores(s, w, { sstConf: g.live?.sst_confidence, calib: g.calib });

  return (
    <Card
      tone={col}
      kicker={tied.length > 1 ? "Meilleur choix · à égalité" : "Meilleur choix"}
      right={
        <span style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {s.dangerLevel >= 2 && <Badge color={s.dangerLevel === 3 ? h.bad : h.warn} title="Difficulté du spot">{DANGER[s.dangerLevel]}</Badge>}
          {stab && <Badge color={stab[0]} title="Robustesse du classement face à l'incertitude du vent">{stab[1]}</Badge>}
        </span>
      }
    >
      {degraded && (
        <div style={{ marginBottom: 10 }}>
          <Banner tone={h.warn} role="alert">
            <b>Sans météo</b> : conseil sur la marée et la lumière seules. Vent et houle inconnus ; les spots engagés ne sont pas proposés.
          </Banner>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: h.strong, lineHeight: 1.15 }}>{s.name}</h2>
          {w && <div style={{ fontSize: 21, fontWeight: 800, color: h.strong, marginTop: 5, ...TabNum }}>{w.startFmt} → {w.endFmt}</div>}
          {wb && <div style={{ fontSize: 15, fontWeight: 700, color: wb.col, marginTop: 2 }}>{wb.t}</div>}
          {w && (
            <div style={{ fontSize: 15, color: h.text, marginTop: 2 }}>
              {w.label}{w.light && w.light.band !== "inconnu" ? ` · ${LIGHT_ICO[w.light.band] || ""} ${w.light.label.toLowerCase()}` : ""}
            </div>
          )}
          {w?.clipped && (
            <div style={{ fontSize: 13.5, color: h.muted, marginTop: 2 }}>
              Créneau de marée {w.tideStartFmt} → {w.tideEndFmt}, ramené à tes heures de pêche.
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: col, lineHeight: 1, ...TabNum }}>{fmt(s.score)}</div>
          <div style={{ fontSize: 13, color: h.muted }}>sur 10 · {spumy.favorability100}/100</div>
        </div>
      </div>

      {/* Jauges SPUMY /100 + 3 scores distincts */}
      <div style={{
        marginTop: 12, padding: "12px", borderRadius: 12, background: "rgba(7,17,32,0.75)",
        border: `1px solid ${h.line}`, display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "center",
      }}>
        <SpumyGauge100 score100={spumy.favorability100} label={spumy.band.label} color={spumy.band.color} size={112} />
        <div style={{ display: "grid", gap: 6, fontSize: 13.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span style={{ color: h.muted }}>💨 Vent</span>
            <b style={{ color: h.strong, ...TabNum }}>{w?.zw?.wind_kmh != null ? `${w.zw.wind_kmh} km/h` : g.live ? `${g.live.wind_kmh} km/h` : "–"}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span style={{ color: h.muted }}>⚓ Marée</span>
            <b style={{ color: h.strong }}>{w?.tidePhaseType === "descendant" ? "Descendante" : "Montante"}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span style={{ color: h.muted }}>🌡️ Eau</span>
            <b style={{ color: h.strong, ...TabNum }}>{g.sst != null ? `${fmt(g.sst)} °C` : "–"}</b>
          </div>
        </div>
      </div>

      <SpumyTripleScore spumy={spumy} />

      {w?.zw?.fromSpot && (
        <div style={{ fontSize: 15, color: "#7dd3fc", marginTop: 9, ...TabNum }}>
          🌬 {w.zw.wind_dir} {w.zw.wind_kmh} km/h (F{w.zw.wind_force})
          {side ? <b style={{ color: side === "face" && w.zw.wind_force >= 4 ? h.warn : "#bae6fd" }}> · {SIDE[side]}</b> : ""}
          {w.zw.gust_kmh != null ? ` · rafales ${w.zw.gust_kmh}` : ""} · 🌊 {w.zw.houleKnown ? `${fmt(w.zw.houle)} m` : "houle inconnue"}
          {w.coeff != null ? ` · coef ${w.coeff}` : ""}
        </div>
      )}
      {w?.zw && <SpreadNotice zw={w.zw} />}
      {(() => {
        const wx = String(s.wxReason || "").split(" · ").filter((p) => !/^(🌙|🌅|☀)/.test(p)).join(" · ");
        return wx ? <Sub style={{ color: h.text }}>{wx}</Sub> : null;
      })()}

      {tied.length > 1 && (
        <Sub>
          <b style={{ color: h.strong }}>≈ Égalité</b> (écart sous la précision du modèle, {fmt(TIE_DELTA)} point) : {tied.map((x) => `${x.name} ${fmt(x.score)}`).join(" · ")}.
          {nearest && nearest.id !== s.id ? (
            <> Le plus proche, <b style={{ color: h.strong }}>{nearest.name}</b> ({nearest.distance}), vaut autant avec moins de route.</>
          ) : <> C'est aussi le plus proche.</>}
        </Sub>
      )}

      {activeAlerts.map((a, i) => (
        <div key={i} style={{ marginTop: 9 }}>
          <Banner tone={h.bad} role="alert">⚠ <b>Aujourd'hui :</b> {a.t}</Banner>
        </div>
      ))}

      {(permAlerts.length > 0 || s.dangerLevel === 3 || (isNight && s.dangerLevel >= 2)) && (
        <div style={{
          marginTop: 9, padding: "9px 11px", borderRadius: 10,
          border: `1px solid ${s.dangerLevel === 3 ? h.bad : h.warn}88`,
          background: `${s.dangerLevel === 3 ? h.bad : h.warn}14`, fontSize: 14, lineHeight: 1.5, color: h.strong,
        }}>
          <b>{s.dangerLevel === 3 ? "⚠ Spot engagé" : "Sécurité"}</b>
          {permAlerts.map((a, i) => (
            <div key={i}>• {a.t} <span style={{ fontSize: 12.5, color: h.muted }}>— {a.s}</span></div>
          ))}
          {s.dangerLevel === 3 && <div>• Jamais seul ; gilet ; heure de retour laissée à un proche. <span style={{ fontSize: 12.5, color: h.muted }}>— prudence du guide</span></div>}
          {isNight && s.dangerLevel >= 2 && <div>• De nuit : n'y aller qu'après un repérage de jour. <span style={{ fontSize: 12.5, color: h.muted }}>— prudence du guide</span></div>}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        <button
          onClick={() => g.goToSpot(s.id)}
          style={{
            flex: "1 1 140px", minHeight: 48, borderRadius: 10, border: `1px solid ${h.accent}88`,
            background: `${h.accent}18`, color: h.strong, fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}
        >
          Fiche du spot
        </button>
        {g.selectedDate === g.todayISO && !g.session && (
          <button
            onClick={() => g.startSession(s.id)}
            style={{
              flex: "1 1 140px", minHeight: 48, borderRadius: 10, border: `1px solid ${h.violet}`,
              background: `${h.violet}26`, color: "#ede9fe", fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}
          >
            🎣 Je pêche ici
          </button>
        )}
      </div>
    </Card>
  );
}

function LureSummary({ g }) {
  const a = g.verdictLure;
  if (!a) return null;
  const p = a.pick;
  return (
    <Card kicker="Leurre conseillé pour ce créneau" title={p ? p.name : a.best.court}>
      {p ? (
        <div style={{ display: "grid", gap: 6, fontSize: 14.5 }}>
          <div><span style={{ color: h.muted }}>Poids · </span><b>{p.weight?.text || "—"}</b></div>
          <div><span style={{ color: h.muted }}>Couleur · </span>{p.color.named ? <b>{p.color.name}</b> : p.color.name}</div>
          <div><span style={{ color: h.muted }}>Nage · </span>{p.layerLabel}</div>
          {p.warn.length > 0 && <div style={{ color: h.warn }}>{p.warn.join(" ; ")}</div>}
          {a.alts[0] && <div><span style={{ color: h.muted }}>{a.alts[0].role} · </span>{a.alts[0].name} · {a.alts[0].weight?.text}</div>}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 6, fontSize: 14.5 }}>
          <div><span style={{ color: h.muted }}>Couleur · </span>{a.color.label}</div>
          <div><span style={{ color: h.muted }}>Montage · </span>{a.weight.text}</div>
        </div>
      )}
      <div style={{ fontSize: 12, color: h.faint, marginTop: 8 }}>
        Choisi dans ta boîte d'après le courant, le vent, la mer, la lumière et la saison ; raisons et sources dans l'onglet Leurres.
      </div>
      <MoreBtn onClick={() => g.goTab("leurres")}>Tout le conseil leurres</MoreBtn>
    </Card>
  );
}

function DaytimeOption({ g }) {
  const { s, w, lure } = g.daytime;
  return (
    <Card
      kicker="Si tu pêches en plein jour"
      title={`${s.name} · ${w.startFmt} → ${w.endFmt}`}
      right={<span style={{ fontSize: 20, fontWeight: 800, color: scoreColor(w.score), ...TabNum }} title="Note de ce créneau">{fmt(w.score)}</span>}
    >
      <div style={{ display: "grid", gap: 5, fontSize: 14.5 }}>
        <div>{w.label}</div>
        <div><span style={{ color: h.muted }}>Leurre · </span>{lure.pick ? `${lure.pick.name}${lure.pick.color.named ? ` ${lure.pick.color.name}` : ""}` : lure.best.court}</div>
        <div><span style={{ color: h.muted }}>Poids · </span>{lure.weight.text}</div>
      </div>
      <Sub>En plein jour, le bar est moins actif qu'en basse lumière : la note de ce créneau est plus basse que celle du verdict.</Sub>
      <MoreBtn onClick={() => g.goLure(s.id, w.id)}>Le conseil leurres de ce créneau</MoreBtn>
    </Card>
  );
}

export function WeekStrip({ g }) {
  const { week, weekRows } = g;
  const reloadBtn = (
    <button
      onClick={() => g.loadWeek(true)}
      aria-label="Retélécharger la semaine"
      style={{ background: "none", border: `1px solid ${h.line}`, borderRadius: 8, color: h.accent, fontSize: 13.5, cursor: "pointer", minHeight: 44, padding: "0 10px" }}
    >
      ↻ Semaine
    </button>
  );
  if (!weekRows) {
    return (
      <Card kicker="Tendance de la semaine" title="Les 7 prochains jours">
        {week.loading ? <Spinner msg="Prévision des 7 prochains jours…" /> : (
          <button
            onClick={() => g.loadWeek()}
            style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${h.accent}66`, background: `${h.accent}14`, color: h.strong, fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}
          >
            Afficher la semaine
          </button>
        )}
        {week.error && <Sub style={{ color: "#fca5a5" }}>{week.error}</Sub>}
      </Card>
    );
  }
  const ok = weekRows.filter((r) => r.s);
  const best = ok.length ? ok.reduce((a, b) => (b.s.score > a.s.score ? b : a)) : null;
  const tiedBest = best ? ok.filter((r) => best.s.score - r.s.score <= TIE_DELTA + 1e-9) : [];
  const dayShort = (iso) => new Date(iso + "T12:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" });
  const maxS = Math.max(10, ...ok.map((r) => r.s.score));
  const pick = (d) => { g.pickDate(d); try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch { /* ignore */ } };
  const starDates = new Set((tiedBest.length > 1 ? tiedBest : best ? [best] : []).map((r) => r.date));
  const allGreen = ok.length >= 3 && ok.length === weekRows.length && ok.every((r) => r.s.score >= GOOD_SCORE);
  const signed = (v) => `${v > 0 ? "+" : "−"}${fmt(Math.abs(v))}`;
  const dayLong = (iso) => new Date(iso + "T12:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <Card
      kicker="Tendance de la semaine"
      title={best ? (tiedBest.length > 1 ? `Meilleurs jours, à égalité : ${tiedBest.map((r) => dayShort(r.date)).join(" ou ")}` : `Meilleur jour : ${dayLong(best.date)}`) : "Aucun créneau praticable cette semaine"}
      right={reloadBtn}
    >
      {best && (
        <div style={{ fontSize: 14.5, color: h.text, marginTop: -2, marginBottom: 10 }}>
          <b style={{ color: h.strong }}>{best.s.name}</b>
          {best.w ? <span style={TabNum}> · {best.w.startFmt} → {best.w.endFmt}{best.w.light && best.w.light.band !== "inconnu" ? ` · ${LIGHT_ICO[best.w.light.band] || ""} ${best.w.light.label.toLowerCase()}` : ""}</span> : ""}
          {" · note "}<b style={{ color: scoreColor(best.s.score), ...TabNum }}>{fmt(best.s.score)}</b>
          {best.s.dangerLevel === 3 ? <span style={{ color: h.bad }}> · ⚠ spot engagé</span> : ""}
          {best.noKill ? <span style={{ color: h.warn }}> · no-kill</span> : ""}
          {Number.isFinite(best.nGood) && <span style={TabNum}> · {best.nGood} spot{best.nGood > 1 ? "s" : ""} au vert sur {best.nSpots}</span>}
          {best.factors && (best.factors.plus.length > 0 || best.factors.minus.length > 0) && (
            <div style={{ fontSize: 13.5, color: h.muted, marginTop: 4, lineHeight: 1.45, ...TabNum }}>
              {best.factors.plus.length > 0 && <span>Ce qui porte la note : {best.factors.plus.map((p) => `${p.label} (${signed(p.v)})`).join(", ")}.</span>}
              {best.factors.minus.length > 0 && <span> Freins : {best.factors.minus.map((p) => `${p.label} (${signed(p.v)})`).join(", ")}.</span>}
            </div>
          )}
        </div>
      )}
      {allGreen && (
        <Sub style={{ marginTop: -4, marginBottom: 10 }}>
          Toute la semaine est au vert : le vert veut dire « rien ne bloque » (marée dans la plage utile, vent et houle tenables), pas « ça mord à coup sûr ». Pour choisir : la note (au-delà de 8, plusieurs atouts s'additionnent), le nombre de spots au vert ce jour-là, et la ★. Sous {fmt(TIE_DELTA)} point d'écart, deux jours se valent.
        </Sub>
      )}
      <div role="group" aria-label="Note du meilleur créneau, jour par jour" style={{ display: "grid", gridTemplateColumns: `repeat(${weekRows.length},minmax(0,1fr))`, gap: 4 }}>
        {weekRows.map((r) => {
          const d = new Date(r.date + "T12:00");
          const on = r.date === g.selectedDate;
          const sc = r.s ? r.s.score : null;
          const col = sc != null ? scoreColor(sc) : h.faint;
          const isBest = starDates.has(r.date);
          const a11y = `${dayLong(r.date)} : ${r.s ? `${r.s.name}, note ${fmt(sc)}${r.w ? `, ${r.w.startFmt} à ${r.w.endFmt}` : ""}${Number.isFinite(r.nGood) ? `, ${r.nGood} spot${r.nGood > 1 ? "s" : ""} au vert sur ${r.nSpots}` : ""}${isBest ? ", meilleur jour" : ""}` : (r.err || "aucun créneau praticable")}`;
          return (
            <button
              key={r.date}
              onClick={() => pick(r.date)}
              aria-pressed={on}
              aria-label={a11y}
              title={a11y}
              style={{
                position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "6px 0 7px", minHeight: 44, borderRadius: 9, border: `1px solid ${on ? h.accent : h.line2}`,
                background: on ? "#0f2540" : "transparent", color: h.text, cursor: "pointer",
              }}
            >
              {isBest && <span aria-hidden="true" data-star="1" style={{ position: "absolute", top: 1, right: 3, fontSize: 11, color: h.warn, lineHeight: 1 }}>★</span>}
              <span style={{ fontSize: 12, color: on ? h.accent : h.muted, textTransform: "capitalize" }}>{d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "")}</span>
              <span style={{ fontSize: 12, color: on ? h.muted : h.faint, ...TabNum }}>{d.getDate()}</span>
              <span aria-hidden="true" style={{ width: "62%", height: 34, display: "flex", alignItems: "flex-end", borderRadius: 4, background: h.line2 }}>
                <span style={{ width: "100%", height: `${sc != null ? Math.max(8, (sc / maxS) * 100) : 0}%`, background: col, borderRadius: 4 }} />
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, color: col, ...TabNum }}>{sc != null ? fmt(sc) : "–"}</span>
              {r.s && Number.isFinite(r.nGood) && <span aria-hidden="true" style={{ fontSize: 11, color: h.muted, ...TabNum }}>{r.nGood}/{r.nSpots}</span>}
              {r.w?.light && LIGHT_ICO[r.w.light.band] && <span aria-hidden="true" style={{ fontSize: 12 }}>{LIGHT_ICO[r.w.light.band]}{r.s?.dangerLevel === 3 ? "⚠" : ""}</span>}
              {r.noKill && <span style={{ fontSize: 11, color: h.warn }}>no-kill</span>}
            </button>
          );
        })}
      </div>
      {ok.length > 0 && <Sub style={{ marginTop: 6 }}>★ meilleur jour · sous la note : spots au vert (note ≥ {GOOD_SCORE}) sur le nombre de spots du guide, ce jour-là.</Sub>}
      <details style={{ marginTop: 10 }}>
        <summary style={{ cursor: "pointer", color: h.accent, fontSize: 14.5, fontWeight: 600, minHeight: 44, display: "flex", alignItems: "center" }}>Détail jour par jour</summary>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {weekRows.map((r) => {
            const label = new Date(r.date + "T12:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
            const on = r.date === g.selectedDate;
            return (
              <button
                key={r.date}
                onClick={() => pick(r.date)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 4px", border: "none", borderTop: `1px solid ${h.line2}`, background: on ? "#0f2540" : "none", color: h.text, cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ width: 84, flexShrink: 0, fontSize: 14, color: on ? h.accent : h.muted, textTransform: "capitalize" }}>{label}</span>
                {r.s ? (
                  <>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 14, lineHeight: 1.35 }}>
                      {starDates.has(r.date) && <span style={{ color: h.warn }}>★ </span>}
                      <b style={{ color: h.strong }}>{r.s.name}</b>
                      {r.w ? <span style={{ color: h.muted }}> · {r.w.startFmt} → {r.w.endFmt}{r.w.light && LIGHT_ICO[r.w.light.band] ? ` ${LIGHT_ICO[r.w.light.band]}` : ""}</span> : ""}
                      {r.s.dangerLevel === 3 ? <span style={{ color: h.bad }}> · ⚠ engagé</span> : ""}
                      {r.noKill ? <span style={{ color: h.warn }}> · no-kill</span> : ""}
                      {Number.isFinite(r.nGood) && (
                        <span style={{ display: "block", fontSize: 12.5, color: h.muted, ...TabNum }}>
                          {r.nGood} spot{r.nGood > 1 ? "s" : ""} au vert sur {r.nSpots}{r.factors?.plus.length ? ` · ${r.factors.plus.map((p) => p.label).join(", ")}` : ""}
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: 17, fontWeight: 800, color: scoreColor(r.s.score), ...TabNum }}>{fmt(r.s.score)}</span>
                  </>
                ) : <span style={{ flex: 1, fontSize: 14, color: h.muted }}>{r.err || "Aucun créneau praticable"}</span>}
              </button>
            );
          })}
        </div>
      </details>
      <Sub>Même calcul que la vue du jour : touche un jour pour l'afficher. Écart de {fmt(TIE_DELTA)} point ou moins : égalité. Au-delà de 2 à 3 jours, le vent prévu est une tendance.</Sub>
    </Card>
  );
}

export function Synthese({ g }) {
  const { live, loading, error, verdict, reg, tide, sun, sst, presenceInfo, pressure, pressureInfo, dataWarnings } = g;
  const tideSub = (tide.dayEvents || []).slice(0, 4).map((e) => `${e.type} ${fmtH(e.dec)}`).join(" · ");
  const splitNoKill = g.regZones?.length > 1 && regulationForZone(g.selectedDate, "nord").noKill;

  return (
    <Stack>
      {splitNoKill ? (
        <Banner tone={h.warn} role="alert">
          ⚖ <b>No-kill obligatoire jusqu'au 31 mars sur les spots au nord du 48e parallèle</b> ; au sud, {regulationForZone(g.selectedDate, "sud").quota} bars par pêcheur et par jour. Chaque fiche de spot indique son régime.
        </Banner>
      ) : reg.noKill && (
        <Banner tone={h.warn} role="alert">
          ⚖ <b>No-kill obligatoire jusqu'au 31 mars</b> : tout bar est relâché.
        </Banner>
      )}
      {g.jStatus === "unavailable" && (
        <Banner>
          Sauvegarde indisponible ({g.jReason || "raison non communiquée"}) : le journal ne sera pas conservé. Exporte-le avant de fermer.
        </Banner>
      )}
      <div aria-live="polite" aria-busy={loading ? "true" : "false"}>
        {loading && <Card><Spinner msg="Téléchargement de la météo, spot par spot… La marée est calculée sur l'appareil." /></Card>}
      </div>
      {error && (
        <Card tone={h.bad} kicker={live ? "Météo non mise à jour" : "Météo indisponible"}>
          <div role="alert" style={{ fontSize: 15, color: h.strong, fontWeight: 700, lineHeight: 1.45 }}>
            {/^Pas de réseau/.test(error) ? "Pas de réseau" : "La météo n'a pas pu être téléchargée"}
            {live ? " — la dernière météo téléchargée reste affichée." : " — conseil sur la marée et la lumière seules."}
          </div>
          <details style={{ marginTop: 6 }}>
            <summary style={{ cursor: "pointer", minHeight: 40, display: "flex", alignItems: "center", color: h.muted, fontSize: 13.5 }}>Détail</summary>
            <p style={{ margin: 0, fontSize: 13.5, color: "#fecaca", whiteSpace: "pre-line", lineHeight: 1.5 }}>{error}</p>
          </details>
          <button
            onClick={() => g.doFetch(g.selectedDate, { force: true })}
            style={{ marginTop: 8, minHeight: 44, padding: "0 14px", borderRadius: 9, border: `1px solid ${h.bad}`, background: `${h.bad}22`, color: h.strong, fontSize: 14.5, cursor: "pointer" }}
          >
            Réessayer
          </button>
        </Card>
      )}

      {!loading && verdict && (live || error) && <Verdict g={g} degraded={!live} />}
      {!loading && (live || error) && !verdict && (
        g.allScored.some((s) => (s.windows || []).some((w) => w.eligible && (w.past || w.tooLate))) && g.selectedDate === g.todayISO ? (
          <Banner tone={h.warn}>
            Les bons créneaux d'aujourd'hui sont passés.{" "}
            <button
              onClick={() => g.pickDate(g.isoAddDays(g.todayISO, 1))}
              style={{ minHeight: 44, marginLeft: 4, padding: "0 12px", borderRadius: 8, border: `1px solid ${h.accent}`, background: `${h.accent}18`, color: h.strong, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              Voir demain ›
            </button>
          </Banner>
        ) : (
          <Banner tone={h.bad}>
            Aucun spot praticable selon le modèle (houle ou courant hors limites, ou aucun créneau dans tes heures). L'onglet Spots détaille la raison spot par spot.
          </Banner>
        )
      )}

      {!loading && live && verdict && <LureSummary g={g} />}
      {!loading && live && verdict && g.verdictLure && <SpumyStrategyCard advice={g.verdictLure} onMore={() => g.goTab("leurres")} />}
      {!loading && live && verdict && g.daytime && <DaytimeOption g={g} />}
      <WeekStrip g={g} />

      <section aria-labelledby="cond-h">
        <h2 id="cond-h" style={{ fontSize: 17, fontWeight: 800, color: h.strong, margin: "6px 2px 10px" }}>Conditions du jour</h2>
        <Grid min={150}>
          <Tile icon="🌬" label="Vent moyen du jour" value={live ? `${live.wind_dir} ${live.wind_kmh} km/h` : "–"} sub={live ? `${live.gust_kmh != null ? `rafales ${live.gust_kmh} · ` : ""}6 h-22 h, spot local` : "météo non chargée"} onClick={() => g.goTab("meteo")} />
          <Tile icon="🌊" label={SITE.zones?.local?.sea === "rade" ? "Mer (rade)" : "Houle"} value={live ? (live.houle != null ? `${fmt(live.houle)} m` : "inconnue") : "–"} sub={SITE.zones?.local?.sea === "rade" ? "mer du vent, plan d'eau abrité" : "au large du spot local"} onClick={() => g.goTab("meteo")} />
          <Tile icon="↕" label="Marée" value={tide.coefs?.length ? `coef ${tide.coefs.join(" · ")}` : "–"} sub={tideSub || tide.label} onClick={() => g.goTab("maree")} />
          <Tile icon="☀" label="Soleil" value={`${fmtH(sun.sunrise)} → ${fmtH(sun.sunset)}`} sub="lever → coucher, heure de Paris" onClick={() => g.goTab("saison")} />
          <Tile icon="🌡" label="Eau et saison" value={sst != null ? `${fmt(sst)} °C` : "–"} sub={presenceInfo.label} onClick={() => g.goTab("saison")} />
          <Tile icon="◔" label="Pression" value={pressure ? `${pressure} hPa` : "–"} sub={pressureInfo ? TREND[live?.pressure_trend] || pressureInfo.trendLabel : ""} onClick={() => g.goTab("meteo")} />
        </Grid>
        {dataWarnings.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <Banner tone={h.bad}>{dataWarnings.length} alerte{dataWarnings.length > 1 ? "s" : ""} de cohérence des données : voir l'onglet Météo.</Banner>
          </div>
        )}
      </section>

      {verdict && verdict.next.length > 0 && (
        <Card title="Autres choix">
          {verdict.next.map((x, i) => (
            <button
              key={x.s.id}
              onClick={() => g.goToSpot(x.s.id)}
              style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 0", border: "none", borderTop: i ? `1px solid ${h.line2}` : "none", background: "none", color: h.text, cursor: "pointer", textAlign: "left" }}
            >
              <span style={{ minWidth: 0 }}>
                <b style={{ color: h.strong, fontSize: 15 }}>#{i + 2} {x.s.name}</b><br />
                <span style={{ fontSize: 13.5, color: h.muted }}>{x.w ? `${x.w.startFmt} → ${x.w.endFmt} · ` : ""}{x.s.distance}</span>
              </span>
              <span style={{ fontSize: 20, fontWeight: 800, color: scoreColor(x.s.score), ...TabNum }}>{fmt(x.s.score)}</span>
            </button>
          ))}
          <MoreBtn onClick={() => g.goTab("spots")}>Classement complet et carte</MoreBtn>
        </Card>
      )}

      <button
        onClick={() => g.goTab("regles")}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 14px", borderRadius: 12, border: `1px solid ${h.line}`, background: h.card, color: h.text, cursor: "pointer", textAlign: "left" }}
      >
        <span>⚖ <b>{reg.headline}</b>{reg.stale ? <span style={{ color: h.warn }}> · règles 2026, à revérifier</span> : ""}</span>
        <Pill color={h.accent}>Règles ›</Pill>
      </button>
    </Stack>
  );
}
