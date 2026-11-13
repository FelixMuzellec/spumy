// Fusion du journal sans perte, commune à la sauvegarde GitHub (sync.jsx) et au transfert de données (transfer.js).

/** Union par identifiant ; à identifiant égal, les champs locaux complètent le distant. */
export function mergeEntries(remote, local) {
  const by = new Map();
  for (const e of remote || []) if (e && e.id != null) by.set(String(e.id), e);
  for (const e of local || []) if (e && e.id != null) by.set(String(e.id), { ...(by.get(String(e.id)) || {}), ...e });
  return [...by.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.id).localeCompare(String(b.id)));
}
