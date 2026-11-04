// Liste des guides et des fichiers du site SPUMY, partagée par la construction et les tests.
export const SITES = [
  { key: "logonna", config: "src/sites/logonna.config.js", id: "logonna-daoulas", title: "SPUMY · Logonna-Daoulas", short: "SPUMY Logonna", blurb: "Rade de Brest · du fond de rade au goulet" },
  { key: "pirou", config: "src/sites/pirou.config.js", id: "pirou-plage", title: "SPUMY · Pirou Plage", short: "SPUMY Pirou", blurb: "Côte ouest du Cotentin · de Granville à Goury" },
  { key: "plouguerneau", config: "src/sites/plouguerneau.config.js", id: "plouguerneau", title: "SPUMY · Plouguerneau", short: "SPUMY Plouguerneau", blurb: "Pays des Abers · des abers au Conquet" },
  { key: "audierne", config: "src/sites/audierne.config.js", id: "audierne", title: "SPUMY · Audierne", short: "SPUMY Audierne", blurb: "Cap Sizun et baie d'Audierne · de la pointe du Raz à Penmarc'h" },
  { key: "carantec", config: "src/sites/carantec.config.js", id: "carantec", title: "SPUMY · Carantec", short: "SPUMY Carantec", blurb: "Baie de Morlaix et Haut-Léon · du Kernic à Locquirec" },
  { key: "concarneau", config: "src/sites/concarneau.config.js", id: "concarneau", title: "SPUMY · Concarneau", short: "SPUMY Concarneau", blurb: "Cornouaille · de l'Odet à la Laïta" },
  { key: "crozon", config: "src/sites/crozon.config.js", id: "crozon", title: "SPUMY · Crozon", short: "SPUMY Crozon", blurb: "Presqu'île de Crozon et baie de Douarnenez · de Dinan à Trénaouret" },
];
export const SITE_FILES = [
  "index.html", "home.js", ...SITES.map((s) => `${s.key}.html`), "manifest.json",
  "icon-192.png", "icon-512.png", "icon-maskable.png",
  ...SITES.map((s) => `${s.key}.png`), "sw.js",
];
