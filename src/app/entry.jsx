// Lot 3.5 — Point d'entrée unique de SPUMY (app.js), chargé par l'accueil et par chacun des sept guides.
//
// La page dit ce qu'elle est : <html data-page="guide" data-site="logonna" data-site-id="logonna-daoulas">
// ou <html data-page="home">. Le code de l'accueil et celui des guides sont dans le même fichier, mais
// chacun n'est évalué que sur sa page (import dynamique : esbuild ne l'initialise qu'au premier appel).
//   guide   : sa fiche (<guide>.json) est téléchargée, puis le moteur et l'interface du bord démarrent.
//   accueil : les sept fiches sont téléchargées, le moteur de chaque guide est créé (une seule copie du
//             code, une instance par guide), puis la carte, la recherche des notes et l'onglet Offshore.
// Hors ligne, les fiches viennent du cache du service worker, comme les pages.
/* global __SITE_DATA__, __HOME_GUIDES__ */
const page = document.documentElement.dataset;
// ?v=<empreinte> : une fiche modifiée n'est jamais lue depuis une copie périmée du cache du navigateur.
const dataUrl = (key) => `${key}.json?v=${__SITE_DATA__[key] || "0"}`;

async function getJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} : HTTP ${r.status}`);
  return r.json();
}

// Écran sans React : la fiche n'a pas pu être lue, rien d'autre n'a démarré. Le journal n'est pas touché.
function bootFailed(err) {
  const root = document.getElementById("root");
  if (!root) return;
  root.textContent = "";
  const box = document.createElement("div");
  box.setAttribute("role", "alert");
  box.style.cssText = "max-width:560px;margin:0 auto;padding:24px 16px;color:#e2e8f0;font:16px/1.5 system-ui,sans-serif";
  const h = document.createElement("h1"); h.style.fontSize = "20px"; h.textContent = "Le guide n'a pas pu se charger";
  const p = document.createElement("p");
  p.textContent = "Sa fiche n'a pas pu être lue (pas de réseau, et pas encore gardée sur ce téléphone ?). Ton journal n'est pas touché. Vérifie la connexion, puis recharge.";
  const d = document.createElement("p"); d.style.cssText = "font-size:13px;color:#94a3b8"; d.textContent = `Détail : ${String(err?.message || err)}`;
  const b = document.createElement("button");
  b.textContent = "Recharger";
  b.style.cssText = "display:block;width:100%;min-height:48px;margin:10px 0;border-radius:10px;border:1px solid #38bdf8;background:#0b2a42;color:#fff;font-size:16px;font-weight:700";
  b.addEventListener("click", () => location.reload());
  const a = document.createElement("a"); a.href = "index.html"; a.textContent = "Retour à l'accueil"; a.style.cssText = "color:#38bdf8;text-decoration:underline";
  box.append(h, p, d, b, a);
  root.append(box);
}

async function startGuide() {
  const key = page.site;
  let data;
  try { data = await getJson(dataUrl(key)); } catch (e) { bootFailed(e); return; }
  globalThis.__SPUMY_SITE__ = data;
  globalThis.__SPUMY_PAGE__ = { key, id: page.siteId || data.SITE.id };
  await import("./main.jsx");
}

async function startHome() {
  // Une fiche illisible n'empêche pas l'accueil : ce guide reste sans note, comme quand sa météo manque.
  const [{ makeSiteApi }, ...datas] = await Promise.all([
    import("SITE_API_FACTORY"),
    ...__HOME_GUIDES__.map((g) => getJson(dataUrl(g.key)).catch(() => null)),
  ]);
  __HOME_GUIDES__.forEach((g, i) => { if (datas[i]) { try { makeSiteApi(datas[i], g.key); } catch { /* guide sans moteur : sans note */ } } });
  await import("./home.jsx");
}

if (page.page === "guide") startGuide();
else startHome();
