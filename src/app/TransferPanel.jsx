// Réglages → « Toutes mes données » : enregistrer un fichier de tout ce que cet appareil garde, et l'importer à
// une autre adresse ou sur un autre téléphone (voir transfer.js). Passage à spumy.github.io, 13 nov. 2026.
import { useRef, useState } from "react";
import { color, radius, touch } from "../design/tokens.js";
import { collectAll, importAll, readTransfer, saveFile, summarize } from "./transfer.js";

const btn = (c, solid) => ({ minHeight: touch.min, padding: "0 14px", borderRadius: radius.sm, border: `1px solid ${c}`, background: solid ? `${c}22` : "none", color: solid ? color.strong : c, fontSize: 13, cursor: "pointer" });

export function TransferPanel() {
  const [msg, setMsg] = useState(null);   // { ok, text }
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const file = useRef(null);

  const exportAll = async () => {
    setBusy(true); setMsg(null);
    try {
      const d = await collectAll();
      const s = summarize(d.localStorage, d.indexedDB);
      saveFile(`spumy-donnees-${d.exportedAt.slice(0, 10)}.json`, JSON.stringify(d));
      setMsg({ ok: true, text: `Fichier enregistré : ${s.text}. Garde-le pour toi : il contient ton journal et tes spots.` });
    } catch (e) { setMsg({ ok: false, text: `Enregistrement impossible : ${e?.message || e}` }); }
    setBusy(false);
  };
  const onFile = async (ev) => {
    const f = ev.target.files?.[0]; ev.target.value = ""; if (!f) return;
    setBusy(true); setMsg(null);
    try {
      const d = readTransfer(await f.text());
      const a = await importAll(d);
      const parts = [`${a.sessions} session${a.sessions > 1 ? "s" : ""} ajoutée${a.sessions > 1 ? "s" : ""} au journal`];
      if (a.spots) parts.push(`${a.spots} spot${a.spots > 1 ? "s" : ""}`);
      if (a.photos) parts.push(`${a.photos} analyse${a.photos > 1 ? "s" : ""} photo`);
      if (a.settings) parts.push(`${a.settings} réglage${a.settings > 1 ? "s" : ""}`);
      setMsg({ ok: true, text: `Importé : ${parts.join(", ")}.${a.kept ? " Les réglages déjà présents sur cet appareil sont gardés." : ""} Le jeton GitHub et la clé Claude ne voyagent pas : renseigne-les ici.` });
      setDone(true);
    } catch (e) { setMsg({ ok: false, text: `Import impossible : ${e?.message || e}` }); }
    setBusy(false);
  };

  return (
    <section aria-label="Toutes mes données" style={{ margin: "0 0 12px" }}>
      <div style={{ color: color.text, fontWeight: 700, marginBottom: 6 }}>Toutes mes données</div>
      <p style={{ margin: "0 0 8px" }}>
        Pour changer d'adresse ou de téléphone : enregistre un fichier de tout ce que garde cet appareil (journal de chaque
        guide, tes spots, ta boîte, tes réglages, tes analyses photo), puis importe-le à la nouvelle adresse. Rien n'est écrasé :
        les données s'ajoutent à celles qui y sont déjà.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button disabled={busy} onClick={exportAll} style={btn(color.accent, true)}>Enregistrer toutes mes données</button>
        <button disabled={busy} onClick={() => file.current?.click()} style={btn(color.accent)}>Importer un fichier de données</button>
        <input ref={file} type="file" accept="application/json,.json" aria-label="Fichier de données à importer" style={{ display: "none" }} onChange={onFile} />
        {done && <button onClick={() => location.reload()} style={btn(color.good)}>Recharger pour voir tes données</button>}
      </div>
      {msg && <p role="status" style={{ margin: "8px 0 0", color: msg.ok ? color.good : color.bad }}>{msg.text}</p>}
    </section>
  );
}
