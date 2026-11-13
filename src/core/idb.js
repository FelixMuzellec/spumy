// Petit magasin clé → valeur sur IndexedDB (photos en cours d'analyse, historique avec images).
// localStorage est limité à quelques Mo : trop peu pour des photos. Sans IndexedDB
// (navigation privée stricte), repli en mémoire pour la session.
const DB = "guide-bar", STORE = "kv";
const mem = new Map();
let dbp = null;
function open() {
  if (!dbp) dbp = new Promise((ok, ko) => {
    if (typeof indexedDB === "undefined") return ko(new Error("IndexedDB indisponible"));
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  }).catch((e) => { dbp = Promise.reject(e); dbp.catch(() => {}); throw e; });
  return dbp;
}
const tx = async (mode, fn) => {
  const db = await open();
  return new Promise((ok, ko) => {
    const t = db.transaction(STORE, mode), st = t.objectStore(STORE);
    const req = fn(st);
    t.oncomplete = () => ok(req?.result ?? null);
    t.onerror = () => ko(t.error);
    t.onabort = () => ko(t.error);
  });
};
export async function idbGet(k) { try { return await tx("readonly", (s) => s.get(k)); } catch { return mem.has(k) ? mem.get(k) : null; } }
export async function idbSet(k, v) { try { await tx("readwrite", (s) => s.put(v, k)); return true; } catch { mem.set(k, v); return false; } }
export async function idbDel(k) { try { await tx("readwrite", (s) => s.delete(k)); } catch { /* repli */ } mem.delete(k); }
