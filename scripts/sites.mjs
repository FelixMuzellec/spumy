// Liste des guides et des fichiers du site, partagée par la construction et les tests.
export const SITES = [
  { key: "logonna", config: "data/sites/logonna.config.js", id: "logonna-daoulas", title: "SPUMY · Logonna-Daoulas", short: "Logonna", blurb: "Rade de Brest · du fond de rade au goulet" },
  { key: "pirou", config: "data/sites/pirou.config.js", id: "pirou-plage", title: "SPUMY · Pirou Plage", short: "Pirou", blurb: "Côte ouest du Cotentin · de Granville à Goury" },
  { key: "plouguerneau", config: "data/sites/plouguerneau.config.js", id: "plouguerneau", title: "SPUMY · Plouguerneau", short: "Plouguerneau", blurb: "Pays des Abers · des abers au Conquet" },
  { key: "audierne", config: "data/sites/audierne.config.js", id: "audierne", title: "SPUMY · Audierne", short: "Audierne", blurb: "Cap Sizun et baie d'Audierne · de la pointe du Raz à Penmarc'h" },
  { key: "carantec", config: "data/sites/carantec.config.js", id: "carantec", title: "SPUMY · Carantec", short: "Carantec", blurb: "Baie de Morlaix et Haut-Léon · du Kernic à Locquirec" },
  { key: "concarneau", config: "data/sites/concarneau.config.js", id: "concarneau", title: "SPUMY · Concarneau", short: "Concarneau", blurb: "Cornouaille · de l'Odet à la Laïta" },
  { key: "crozon", config: "data/sites/crozon.config.js", id: "crozon", title: "SPUMY · Crozon", short: "Crozon", blurb: "Presqu'île de Crozon et baie de Douarnenez · de Dinan à Trénaouret" },
];
// Lot 3.5 : app.js (l'application, unique) remplace home.js et le code intégré à chaque guide ; <guide>.json = la fiche.
export const SITE_FILES = ["index.html", "app.js", ...SITES.map((s) => `${s.key}.html`), ...SITES.map((s) => `${s.key}.json`), "manifest.json", "icon-192.png", "icon-512.png", "icon-maskable.png", "apple-touch-icon.png",
  ...SITES.map((s) => `${s.key}.png`), "sw.js"];
