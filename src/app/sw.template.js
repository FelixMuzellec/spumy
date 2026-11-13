// Service worker : réseau d'abord (les mises à jour arrivent tout de suite),
// cache en secours (l'application s'ouvre sans réseau, marée comprise).
// Les appels météo et GitHub ne sont jamais mis en cache ici : l'application
// gère elle-même sa mémoire de la dernière météo téléchargée.
const CACHE = "guide-bar-__BUILD__";
// Une seule application : l'accueil, les guides, le manifeste commun et les icônes.
// Liste écrite par scripts/build.mjs à partir des fichiers du site.
const SHELL = ["__SHELL__"];

self.addEventListener("install", (e) => {
  // Fichier par fichier : un seul fichier absent (dépôt incomplet) ne vide plus tout le cache.
  // cache: "reload" : la copie hors ligne vient du serveur, jamais d'une version périmée du cache HTTP.
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => {})))).then(() => self.skipWaiting()));
});
// Caches des versions précédentes de SPUMY : supprimés à l'activation, puis à chaque ouverture de page. Une page
// encore servie par l'ancien service worker pendant la mise à jour peut en effet recréer l'ancien cache juste
// après sa suppression. Seuls les caches de SPUMY (« guide-bar-… ») sont touchés : l'origine
// felixmuzellec.github.io est commune à tous les sites GitHub Pages du compte, leurs caches ne nous regardent pas.
const prune = () => caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("guide-bar-") && k !== CACHE).map((k) => caches.delete(k))));
self.addEventListener("activate", (e) => {
  e.waitUntil(prune().then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== self.location.origin) return;
  if (e.request.mode === "navigate") e.waitUntil(prune().catch(() => {}));
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(e.request, { signal: ctrl.signal, cache: "no-cache" });
      clearTimeout(t);
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    } catch {
      const hit = await cache.match(e.request, { ignoreSearch: true });
      if (hit) return hit;
      throw new Error("hors ligne et absent du cache");
    }
  })());
});
