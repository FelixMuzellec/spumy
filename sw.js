// Service worker : réseau d'abord (les mises à jour arrivent tout de suite),
// cache en secours (l'application s'ouvre sans réseau, marée comprise).
// Les appels météo et GitHub ne sont jamais mis en cache ici : l'application
// gère elle-même sa mémoire de la dernière météo téléchargée.
const CACHE = "guide-bar-76f03e5d211f";
// Une seule application : l'accueil, les guides, le manifeste commun et les icônes.
// Liste écrite par scripts/build.mjs à partir des fichiers du site.
const SHELL = ["./","./index.html","./app.js","./logonna.html","./pirou.html","./plouguerneau.html","./audierne.html","./carantec.html","./concarneau.html","./crozon.html","./logonna.json","./pirou.json","./plouguerneau.json","./audierne.json","./carantec.json","./concarneau.json","./crozon.json","./manifest.json","./icon-192.png","./icon-512.png","./icon-maskable.png","./apple-touch-icon.png","./logonna.png","./pirou.png","./plouguerneau.png","./audierne.png","./carantec.png","./concarneau.png","./crozon.png","./logo-spumy.webp","./logo-spumy-clair.webp","./inshore.webp","./offshore.webp","./roboto-condensed.woff2","./roboto-condensed-ext.woff2"];

self.addEventListener("install", (e) => {
  // Fichier par fichier : un seul fichier absent (dépôt incomplet) ne vide plus tout le cache.
  // cache: "reload" : la copie hors ligne vient du serveur, jamais d'une version périmée du cache HTTP.
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => {})))).then(() => self.skipWaiting()));
});
// Caches des versions précédentes de SPUMY : supprimés à l'activation, puis à chaque ouverture de page. Une page
// encore servie par l'ancien service worker pendant la mise à jour peut en effet recréer l'ancien cache juste
// après sa suppression. Seuls les caches de SPUMY (« guide-bar-… », nom interne) sont touchés, et seulement pour les
// entrées situées sous la portée de CE service worker (le cache entier s'il ne contient qu'elles) : l'origine
// felixmuzellec.github.io est commune à tous les sites GitHub Pages du compte, et l'ancien guide (/guide-peche-bar/)
// nomme ses caches de la même façon ; sa copie hors ligne reste intacte.
const SCOPE = self.registration.scope, SCOPE_PATH = new URL(SCOPE).pathname;
const prune = () => caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("guide-bar-") && k !== CACHE).map(async (k) => {
  const c = await caches.open(k), reqs = await c.keys();
  const mine = reqs.filter((r) => r.url.startsWith(SCOPE));
  if (!mine.length) return;
  if (mine.length === reqs.length) await caches.delete(k);
  else await Promise.all(mine.map((r) => c.delete(r)));
})));
self.addEventListener("activate", (e) => {
  e.waitUntil(prune().then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== self.location.origin) return;
  // Le prototype de la phase 11 (prototype/, assets/, docs/) n'est pas l'application : jamais dans son cache hors ligne.
  const rel = u.pathname.startsWith(SCOPE_PATH) ? u.pathname.slice(SCOPE_PATH.length) : u.pathname;
  if (/^(prototype|assets|docs)\//.test(rel)) return;
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
