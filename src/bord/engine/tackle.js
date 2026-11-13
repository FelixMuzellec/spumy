// Fiches techniques des leurres de ta boîte, relevées chez les fabricants ou leurs revendeurs
// le 26/10/2026. Chaque chiffre porte sa source ; ce qui n'a pas été trouvé reste « null »
// et l'interface le dit, plutôt que d'inventer un poids.
//
// Ce module ne connaît que les leurres. Le choix pour un créneau (lequel, quelle taille,
// quel poids, quelle couleur) est fait dans lures.js.

export const SPEC_SOURCES = {
  fiiishBM: { short: "fiiish.com", label: "Fiiish — Black Minnow : tailles et têtes (poids par modèle)", url: "https://fiiish.com/produits/leurres-souples/black-minnow/" },
  fiiishCPT: { short: "fiiish.com", label: "Fiiish — Crazy Paddle Tail : tailles et têtes", url: "https://fiiish.com/produits/leurres-souples/crazy-paddle-tail/" },
  fiiishMS: { short: "fiiish.com", label: "Fiiish — Master Shad : tailles et têtes Light, Medium, Heavy", url: "https://fiiish.com/produits/leurres-souples/master-shad/" },
  topfishing: { short: "top-fishing.fr", label: "Top Fishing — Black Minnow, la Fiiish complète (usage de chaque tête)", url: "https://top-fishing.fr/conseil/actu/258/258/black-minnow-la-fiiish-complete" },
  desperTetes: { short: "Desperadiens", label: "Desperadiens — Les têtes plombées (tête Shore Fiiish : zones peu profondes et calmes)", url: "https://desperadiens.e-monsite.com/pages/technique-de-peche/les-leurres/les-tetes-plombees.html" },
  ast110: { short: "nootica.com", label: "Nootica, fiche produit — Xorus Asturie 110 (15 g, flottant ; recommandé en mer calme ; le 150 pour la grosse houle)", url: "https://www.nootica.com/floating-lure-xorus-asturias-110.html" },
  ast130: { short: "leurredelapeche.fr", label: "Leurre de la pêche — Xorus Asturie 130 (13 cm, 27 g)", url: "https://www.leurredelapeche.fr/8196-poisson-nageur-xorus-asturie-130.html" },
  ast150: { short: "nootica.com", label: "Nootica — Xorus Asturie 150 (32 g)", url: "https://www.nootica.com/lure-xorus-asturias-150-ghost-lancon.html" },
  astRok: { short: "rokmax.com", label: "Rokmax — Xorus Asturie (90 : 11 g, 110 : 16,5 g, 130 : 27 g ; scion bas, il plonge sous la surface)", url: "https://www.rokmax.com/collections/all/products/xorus-asturie-bass-fishing-lure" },
  patch140: { short: "nootica.com", label: "Nootica — Xorus Patchinko 2 140 (140 mm, 25 g, flottant)", url: "https://www.nootica.com/lure-floating-xorus-patchinko-original.html" },
  zclaw: { short: "specialiste-leurres.com", label: "Spécialiste Leurres — Xorus Z Claw Evo (100 mm, 22,5 g, flottant)", url: "https://www.specialiste-leurres.com/fr/peche-aux-leurres/poissons-nageurs/stickbait/z-claw-evo.html" },
  mrjoe: { short: "nootica.com", label: "Nootica — Sakura Mr Joe coulant (105 mm 23 g, 120 mm 35 g)", url: "https://www.nootica.com/lure-surface-sinking-sakura-mr-joe-105-mm-23-gr.html" },
  artist: { short: "leurredelapeche.fr", label: "Leurre de la pêche — Jackson Artist FR80 (8 cm, 8 g)", url: "https://www.leurredelapeche.fr/7390-poisson-nageur-jackson-artist-fr80.html" },
  ds77: { short: "leurredelapeche.fr", label: "Leurre de la pêche — Megabass Dark Sleeper 77 mm (10, 14, 21 g)", url: "https://www.leurredelapeche.fr/9810-leurre-souple-megabass-dark-sleeper-77mm.html" },
  ds95: { short: "leurredelapeche.fr", label: "Leurre de la pêche — Megabass Dark Sleeper 95 mm (21, 28 g)", url: "https://www.leurredelapeche.fr/6470-leurre-souple-megabass-dark-sleeper-95mm.html" },
  ds114: { short: "leurredelapeche.fr", label: "Leurre de la pêche — Megabass Dark Sleeper 4,5\" (23, 29, 36 g)", url: "https://www.leurredelapeche.fr/16128-leurre-souple-megabass-dark-sleeper-11cm-29g.html" },
  xlayer105: { short: "leurredelapeche.fr", label: "Leurre de la pêche — Megabass Super X-Layer 10,5 cm (6 g)", url: "https://www.leurredelapeche.fr/5952-leurre-souple-megabass-super-x-layer-105cm.html" },
  xlayer150: { short: "leurredelapeche.fr", label: "Leurre de la pêche — Megabass Super Giant X-Layer 15 cm (13,5 g, gros bars)", url: "https://www.leurredelapeche.fr/5953-leurre-souple-megabass-super-giant-x-layer-15cm.html" },
  xlayerBar: { short: "peche.com", label: "peche.com — Le X Layer de Megabass, un slug incontournable pour la pêche du bar", url: "https://www.peche.com/article/34318/le-x-layer-de-megabass-un-slug-incontournable-pour-la-peche-du-bar" },
  astMania: { short: "leurres-mania.fr", label: "Leurres Mania — Xorus Asturie (110 : 16,5 g ; 130 : 25,9 g ; 150 : 31,6 g)", url: "https://www.leurres-mania.fr/asturie-xorus.html" },
  astArdent: { short: "ardent-peche.com", label: "Ardent Pêche — Xorus Asturie 110 (11 cm, 15 g, flottant)", url: "https://www.ardent-peche.com/en/p/51236-xorus-asturie-110-surface-lure.html" },
  astPhilippe: { short: "philippe-peche.fr", label: "Philippe Pêche — Xorus Asturie 130 (130 mm / 27 g / flottant)", url: "https://www.philippe-peche.fr/product/leurre-xorus-asturie-130" },
  patchSBLS: { short: "seabasslureshop.com", label: "SeabassLureShop — Xorus Patchinko 2 140 (140 mm, 25 g, flottant)", url: "https://www.seabasslureshop.com/xorus-patchinko-140.html" },
  zclawSBLS: { short: "seabasslureshop.com", label: "SeabassLureShop — Xorus Z Claw Evo (10 cm, 22,5 g, flottant, surface/sub-surface)", url: "https://www.seabasslureshop.com/z-claw-evo-10cm.html" },
  joe120: { short: "top-fishing.fr", label: "Top Fishing — Sakura Mister Joe S 120 (coulant, 35 g, nage de 0 à 2 m)", url: "https://www.top-fishing.fr/catalogue/article/leurre-sakura-mr-joe-120-mm.html" },
  joe105: { short: "leurredelapeche.fr", label: "Leurre de la pêche — Sakura Mister Joe 105 S 2.0 (10,5 cm pour 23 g)", url: "https://www.leurredelapeche.fr/13641-poisson-nageur-sakura-mister-joe-105-s-20.html" },
  dsOmnia: { short: "omniafishing.com", label: "Omnia Fishing — Megabass Dark Sleeper : 2,4\" (1/4, 3/8 oz), 3\" (3/8, 1/2, 3/4 oz), 3,8\" (3/4, 1 oz)", url: "https://omniafishing.com/p/megabass-dark-sleeper" },
  bmEbay: { short: "ebay.de (Fiiish)", label: "Fiiish — têtes Black Minnow, liste des modèles et poids (annonce eBay, identique au site Fiiish)", url: "https://www.ebay.de/itm/286691703559" },
  dmc: { short: "fishon.ae", label: "Fishon — DUO Drag Metal Cast (15, 20, 30, 40 g ; chute en glissade, lancers très longs)", url: "https://www.fishon.ae/products/duo-drag-metal-cast" },
  dmcLdlp: { short: "leurredelapeche.fr", label: "Leurre de la pêche — DUO Drag Metal Cast (4 tailles de 15 à 40 g, lancé très loin, bord ou bateau)", url: "https://www.leurredelapeche.fr/6567-jig-metallique-duo-international-drag-metal-cast.html" },
  spindle: { short: "leurredelapeche.fr", label: "Leurre de la pêche — Megabass Spindle Worm (10 et 12,5 cm)", url: "https://www.leurredelapeche.fr/10995-leurre-souple-megabass-spindle-worm-10cm.html" },
};

// Têtes : [nom, grammes]. Usage de chaque tête selon le fabricant (fiiish.com) et top-fishing.fr.
const BM_HEADS = {
  70: [["Shore", 3], ["Zincky", 3.3], ["Search", 4.5], ["Offshore", 6], ["X Deep", 12]],
  90: [["Shore", 5], ["Zincky", 5.5], ["Pug", 7], ["Search", 8], ["Offshore", 10], ["X Deep", 20]],
  105: [["Shore", 8], ["Search", 12], ["Offshore", 16], ["X Deep", 26]],
  120: [["Shallow", 6], ["Shore", 12], ["Pug", 16], ["Search", 18], ["Offshore", 25], ["Deep", 37], ["X Deep", 50]],
  140: [["Shallow", 10], ["Shore", 20], ["Search", 28], ["Offshore", 40], ["Deep", 60], ["X Deep", 80]],
  160: [["Shallow", 15], ["Shore", 30], ["Search", 45], ["Offshore", 60], ["Deep", 90], ["X Deep", 120]],
  200: [["Shallow", 30], ["Shore", 60], ["Offshore", 120], ["Med Deep", 150], ["Deep", 190], ["X Deep", 240]],
};
export const HEAD_USE = {
  Shallow: { t: "Très peu d'eau, lancer du bord ; linéaire ou à gratter, au-dessus des herbiers.", s: "fiiishBM" },
  Shore: { t: "Quelques mètres d'eau ; lancer-ramener du bord ou du bateau.", s: "topfishing" },
  Zincky: { t: "Sans plomb ; linéaire, diagonale ou à gratter.", s: "fiiishBM" },
  Pug: { t: "Garde le leurre debout sur le fond pendant les pauses.", s: "fiiishBM" },
  Search: { t: "Linéaire, diagonale ou à gratter, roulis amplifié, du bord ou du bateau.", s: "fiiishBM" },
  Offshore: { t: "Surtout pour le bateau (verticale, traction).", s: "fiiishBM" },
  Deep: { t: "Verticale en bateau, dans les fonds importants ou en présence de courants.", s: "topfishing" },
  "Med Deep": { t: "Diagonale ou verticale.", s: "fiiishBM" },
  "X Deep": { t: "Verticale en bateau : très grandes profondeurs ou courants très puissants.", s: "topfishing" },
  Dart: { t: "Usage non décrit par le fabricant.", s: "fiiishCPT" },
  Light: { t: "Usage non décrit par le fabricant.", s: "fiiishMS" },
  Medium: { t: "Usage non décrit par le fabricant.", s: "fiiishMS" },
  Heavy: { t: "Usage non décrit par le fabricant.", s: "fiiishMS" },
};

// fam : famille de lures.js. layer : couche où il nage. kind : ce qu'il est.
// sizes : longueur (mm) → { g } pour un leurre dur, { heads } pour un souple sur tête,
// { weights } pour un souple pré-plombé. weedless : hameçon protégé des accroches.
export const CATALOGUE = {
  asturie: {
    name: "Xorus Asturie", fam: "surface", layer: "surface", kind: "stickbait flottant", float: "flottant",
    // Les revendeurs ne donnent pas tous le même poids : les deux valeurs publiées sont gardées.
    sizes: { 110: { g: 15, s: "ast110", alt: "15 g (Nootica, Ardent Pêche) ou 16,5 g (Rokmax, Leurres Mania)" },
             130: { g: 27, s: "ast130", alt: "27 g (Leurre de la pêche, Philippe Pêche, Rokmax) ou 25,9 g (Leurres Mania)" },
             150: { g: 32, s: "ast150", alt: "32 g (Nootica, Leurre de la pêche) ou 31,6 g (Leurres Mania)" } },
    facts: [
      { t: "Sa fiche produit le dit testé de la mer calme à la grosse houle, et recommande particulièrement le 110 en mer calme.", s: "ast110" },
      { t: "Le 150 est présenté comme le spécialiste des grosses houles.", s: "ast110" },
      { t: "Scion bas, il plonge juste sous la surface ; par mer calme, à l'aube et au crépuscule, récupération très lente.", s: "astRok" },
    ],
    anim: [{ t: "Récupération rapide et erratique, scion haut, à-coups irréguliers (pas un walking the dog pur).", s: "felix" },
           { t: "Par mer calme, à l'aube et au crépuscule : très lent. Scion bas pour le faire passer juste sous la surface.", s: "astRok" }],
  },
  patchinko: {
    name: "Xorus Patchinko", fam: "surface", layer: "surface", kind: "stickbait flottant", float: "flottant",
    sizes: { 140: { g: 25, s: "patchSBLS", alt: "25 g pour le Patchinko 2 140 (SeabassLureShop, Nootica, Pacific Pêche) ; une copie peut différer", note: "poids du Patchinko 2 140 d'origine" } },
    facts: [{ t: "Pénétration dans l'air étudiée en soufflerie : lancers longs.", s: "patch140" }],
    anim: [{ t: "Walking the dog : il répond à la moindre traction ; aux coups de scion il éclabousse, crève la surface, dérape et glisse.", s: "patch140" }],
  },
  zclaw: {
    name: "Xorus Z Claw Evo", fam: "surface", layer: "surface", kind: "stickbait flottant à bruiteur", float: "flottant",
    sizes: { 100: { g: 22.5, s: "zclawSBLS", alt: "22,5 g (SeabassLureShop, Ardent Pêche, Spécialiste Leurres) ; une copie peut différer" } },
    facts: [{ t: "Profil aérodynamique : lancers longs, même vent de face. S'anime en eau calme comme agitée.", s: "zclaw" }],
    anim: [{ t: "Walking the dog. Scion haut, il remonte en surface ; scion bas, il plonge légèrement.", s: "zclaw" },
           { t: "Attaques souvent dans les derniers mètres : le ramener jusqu'au bout.", s: "zclaw" }],
  },
  mrjoe: {
    name: "Sakura Mr Joe", fam: "nageur", layer: "sous-surface", kind: "stickbait coulant", float: "coulant",
    sizes: { 105: { g: 23, s: "joe105", depth: "0 à 0,8 m (Nootica)" }, 120: { g: 35, s: "joe120", depth: "0 à 2 m (Top Fishing)" } },
    facts: [{ t: "Très efficace sur les prédateurs qui suivent les stickbaits flottants sans attaquer.", s: "mrjoe" },
            { t: "Armature inox traversante.", s: "mrjoe" }],
    anim: [{ t: "Le laisser couler jusqu'à la profondeur voulue, puis récupérer avec quelques coups de scion en dents de scie.", s: "mrjoe" }],
  },
  // Marque et nage non précisées : jamais proposé seul en tête du conseil, seulement listé.
  balsa: {
    name: "Leurre balsa", fam: "nageur", layer: null, kind: "leurre en balsa, 20 g (marque et nage à préciser)", float: null,
    sizes: { 130: { g: 20, s: "felix" } }, unknown: true, facts: [], anim: [],
  },
  bavette: {
    name: "Poissons nageurs à bavette (Jackson Artist…)", fam: "nageur", layer: "sous-surface", kind: "minnows à bavette (tailles à préciser ; Artist FR80 : 8 g)", float: null,
    sizes: {}, unknown: true, facts: [{ t: "Jackson Artist FR80 : 8 cm, 8 g, petit jerk minnow silencieux.", s: "artist" }],
    anim: [{ t: "Jerkbait : coups de scion secs ; varier vitesse et pauses.", s: "merConseils", gen: true }],
  },
  blackminnow: {
    name: "Fiiish Black Minnow", fam: "shad", layer: "mi-eau à fond", kind: "shad à palette sur tête (hameçon texan)", weedless: true,
    sizes: Object.fromEntries(Object.entries(BM_HEADS).map(([k, h]) => [k, { heads: h, s: "fiiishBM", alt: "mêmes poids de têtes sur la liste Fiiish d'une annonce eBay (vérification croisée)" }])),
    facts: [{ t: "Utilisé à vitesse lente à modérée : linéaire, à gratter, verticale ou traîne lente.", s: "fiiishBM" }],
    anim: [{ t: "Linéaire lent à modéré, ou à gratter.", s: "fiiishBM" }],
  },
  cpt: {
    name: "Fiiish Crazy Paddle Tail", fam: "shad", layer: "mi-eau à fond", kind: "shad à palette sur tête",
    sizes: {
      100: { heads: [["Shore", 5], ["Offshore", 10]], s: "fiiishCPT" },
      120: { heads: [["Shore", 7], ["Dart", 10], ["Offshore", 15], ["X Deep", 25]], s: "fiiishCPT" },
      150: { heads: [["Shore", 10], ["Dart", 15], ["Offshore", 20], ["Deep", 30], ["X Deep", 40]], s: "fiiishCPT" },
      180: { heads: [["Shore", 20], ["Offshore", 35], ["Deep", 45], ["X Deep", 55]], s: "fiiishCPT" },
    },
    facts: [{ t: "Tête Shore : linéaire ou à gratter, idéale dans peu d'eau et au-dessus des herbiers.", s: "fiiishCPT" }],
    anim: [{ t: "Linéaire ou à gratter (tête Shore) ; diagonale et verticale avec les têtes plus lourdes.", s: "fiiishCPT" }],
  },
  mastershad: {
    name: "Fiiish Master Shad", fam: "shad", layer: "mi-eau", kind: "shad sur tête",
    sizes: {
      75: { heads: [["Light", 3], ["Medium", 6], ["Heavy", 9]], s: "fiiishMS" },
      100: { heads: [["Light", 8], ["Medium", 15], ["Heavy", 21]], s: "fiiishMS" },
      125: { heads: [["Light", 14], ["Medium", 25], ["Heavy", 36]], s: "fiiishMS" },
    },
    facts: [{ t: "Idéal pour cibler les poissons actifs en pleine eau ou dans les courants.", s: "fiiishMS" }],
    anim: [{ t: "Linéaire ou en dent de scie ; varier la vitesse.", s: "merConseils", gen: true }],
  },
  darksleeper: {
    name: "Megabass Dark Sleeper", fam: "shad", layer: "fond", kind: "souple pré-plombé, hameçon caché (61, 76, 97 et 114 mm = 2,4, 3, 3,8 et 4,5 pouces)",
    // Poids en onces chez Megabass, convertis (1 oz = 28,35 g) ; le 4,5 pouces n'est vendu qu'en Europe.
    sizes: { 61: { weights: [7.1, 10.6], s: "dsOmnia" }, 76: { weights: [10.6, 14.2, 21.3], s: "dsOmnia" }, 97: { weights: [21.3, 28.3], s: "dsOmnia" }, 114: { weights: [23, 29, 36], s: "ds114" } },
    facts: [{ t: "Imite les petits poissons de fond (gremille, gobie) ; profil déjà plombé, hameçon bien caché.", s: "ds95" }],
    anim: [{ t: "Laisser descendre, puis récupérer lentement en gardant le contact.", s: "ouverture", gen: true }],
  },
  spindle: {
    name: "Megabass Spindle Worm", fam: "weightless", layer: "sous-surface", kind: "souple fin (montage à préciser)",
    sizes: { 100: { s: "spindle" }, 125: { s: "spindle" } },
    facts: [{ t: "Cité pour le bar de nuit en 4\" (coloris Ayu).", s: "nuit" }],
    anim: [{ t: "Récupération très douce ou légers relevés de scion, longues pauses.", s: "ouverture", gen: true }],
  },
  dragmetal: {
    name: "DUO Drag Metal Cast", fam: "metal", layer: "mi-eau", kind: "jig de lancer compact", float: "coulant", sizeIsWeight: true,
    sizes: { 20: { g: 20, s: "dmc" }, 30: { g: 30, s: "dmc" }, 40: { g: 40, s: "dmc" } },
    facts: [{ t: "Corps compact et épais : il part « comme une fusée » et coule vite vers le fond.", s: "dmc" },
            { t: "Chute en glissade latérale ; nage régulière, twitché ou simplement mouliné.", s: "dmc" },
            { t: "Conçu pour être lancé très loin, du bord comme du bateau.", s: "dmcLdlp" }],
    anim: [{ t: "Twitché ou simplement mouliné ; il travaille aussi à la descente (glissade latérale).", s: "dmc" },
           { t: "Laisser couler, puis récupérer vite.", s: "merConseils" }],
  },
  xlayer: {
    name: "Megabass X-Layer", fam: "weightless", layer: "sous-surface", kind: "slug souple", slug: true,
    sizes: { 105: { g: 6, s: "xlayer105", note: "Super X-Layer" }, 150: { g: 13.5, s: "xlayer150", note: "Super Giant X-Layer, pour les gros bars" } },
    facts: [{ t: "Présenté comme un slug incontournable pour la pêche du bar.", s: "xlayerBar" }],
    anim: [{ t: "Récupération très douce ou légers relevés de scion, longues pauses.", s: "ouverture", gen: true }],
  },
  curlyspindle: {
    name: "Curly Spindle Worm", fam: "weightless", layer: "sous-surface", kind: "souple à queue curly (modèle à préciser)",
    sizes: {}, unknown: true, facts: [], anim: [{ t: "Récupération très douce ou légers relevés de scion, longues pauses.", s: "ouverture", gen: true }],
  },
  craw: {
    name: "Craw (écrevisse)", fam: "weightless", layer: "fond", kind: "imitation de crustacé (montage à préciser)",
    sizes: {}, unknown: true, facts: [], anim: [{ t: "Laisser descendre, puis récupérer lentement en gardant le contact.", s: "ouverture", gen: true }],
  },
};

// Ta canne : 14 à 42 g de puissance de lancer (ce que tu as décrit). Le conseil ne propose
// jamais un leurre plus lourd, et signale ce qui est plus léger que la plage.
export const CANNE = { min: 14, max: 42 };

// ── Ta boîte, telle que tu l'as décrite (26/10/2026 ; couleurs nommées le 10/10/2026) ──
// Souples : « un peu toutes les tailles et tous les poids » ; couleurs : « un peu de tout ».
// Le conseil choisit donc librement la taille, la tête et la couleur dans le catalogue du
// fabricant. Pour les leurres durs, les tailles sont celles que tu as citées.
// colors : couleurs nommées { name, tone } (tone = naturel | blanc | transition | soleil | vif | sombre) ;
// anyColor : « un peu de tout », la couleur conseillée est donnée par sa teinte.
export const BOITE = [
  { id: "ast110", cat: "asturie", size: 110, colors: [{ name: "Cabot", tone: "transition" }, { name: "Mackerel", tone: "naturel" }],
    note: "2 bars à Moulin Mer le 27/12/2025, avant le coucher (avec l'Asturie 130 Blanc)." },
  { id: "ast130", cat: "asturie", size: 130, colors: [{ name: "Ghost Iwashi", tone: "soleil" }, { name: "Blanc", tone: "blanc" }, { name: "Cabot", tone: "transition" }, { name: "Anchois", tone: "naturel" }] },
  { id: "ast150", cat: "asturie", size: 150, anyColor: true },
  { id: "patch140", cat: "patchinko", size: 140, anyColor: true, note: "Vrai Xorus ou copie : « on n'est pas au gramme près »." },
  { id: "zclaw", cat: "zclaw", size: 100, colors: [{ name: "Blanc nacré", tone: "blanc" }], anyColor: true, note: "1 bar à Moulin Mer le 08/08/2026, au coucher du soleil." },
  { id: "joe105", cat: "mrjoe", size: 105, anyColor: true },
  { id: "joe120", cat: "mrjoe", size: 120, anyColor: true },
  { id: "balsa130", cat: "balsa", size: 130, anyColor: true },
  { id: "bavette", cat: "bavette", allSizes: true, anyColor: true },
  { id: "cpt", cat: "cpt", allSizes: true, anyColor: true },
  { id: "ms", cat: "mastershad", allSizes: true, anyColor: true },
  { id: "bm", cat: "blackminnow", allSizes: true, anyColor: true },
  { id: "spindle", cat: "spindle", allSizes: true, anyColor: true },
  { id: "xlayer", cat: "xlayer", allSizes: true, anyColor: true },
  { id: "dmc", cat: "dragmetal", allSizes: true, anyColor: true, note: "De 20 à 40 g (26/10/2026)." },
  { id: "curly", cat: "curlyspindle", allSizes: true, anyColor: true },
  { id: "ds", cat: "darksleeper", allSizes: true, anyColor: true },
  { id: "craw", cat: "craw", allSizes: true, anyColor: true },
];

// ── Corrections de ta boîte, faites dans l'application (communes à tous les guides) ──
// poids : { "asturie:130": 26.4 } (pesé par toi) ; balsa : { nage } ; bavettes : [{ nom, len, g }].
export const BOX_KEY = "bar:boite";
const fmtG = (g) => String(Math.round(g * 10) / 10).replace(".", ",");
const BALSA = {
  surface: { fam: "surface", layer: "surface", float: "flottant", kind: "leurre de surface en balsa",
    anim: [{ t: "Walking the dog : coups de scion réguliers, environ deux par seconde.", s: "stickbait", gen: true }] },
  "sous-surface": { fam: "nageur", layer: "sous-surface", float: "flottant", kind: "poisson nageur en balsa, nage sous la surface",
    anim: [{ t: "Jerkbait : coups de scion secs ; varier vitesse et pauses.", s: "merConseils", gen: true }] },
  coulant: { fam: "nageur", layer: "sous-surface", float: "coulant", kind: "leurre en balsa coulant",
    anim: [{ t: "Laisser couler, puis récupérer en gardant le contact.", s: "merConseils", gen: true }] },
};
/** Fiche d'origine d'une taille, avant toute correction. */
export const origSize = (cat, len) => CATALOGUE[cat]?.sizes?.[len] || null;
/**
 * Catalogue avec tes corrections : un NOUVEL objet, le catalogue d'origine n'est jamais modifié.
 * Même objet de corrections → même catalogue (mémorisé), pour ne pas recalculer à chaque affichage.
 */
const MEMO = new WeakMap();
export function catalogWith(ov) {
  if (!ov || typeof ov !== "object") return CATALOGUE;
  if (MEMO.has(ov)) return MEMO.get(ov);
  const K = { ...CATALOGUE };
  const b = BALSA[ov.balsa?.nage];
  if (b) K.balsa = { ...K.balsa, ...b, kind: `${b.kind}, 20 g`, unknown: false };
  const rows = (Array.isArray(ov.bavettes) ? ov.bavettes : []).filter((x) => x && +x.len > 0 && +x.g > 0);
  if (rows.length) {
    K.bavette = { ...K.bavette, unknown: false, layer: "sous-surface", fam: "nageur",
      kind: `poissons nageurs à bavette : ${rows.map((x) => `${x.nom ? `${x.nom} ` : ""}${x.len} mm`).join(", ")}`,
      sizes: Object.fromEntries(rows.map((x) => [+x.len, { g: +x.g, s: "toi", note: x.nom || null, alt: `${fmtG(+x.g)} g donné par toi` }])) };
  }
  for (const [key, g] of Object.entries(ov.poids || {})) {
    const [cat, len] = key.split(":"), c = K[cat], sp = c?.sizes?.[len];
    if (!sp || !(+g > 0) || sp.heads || sp.weights) continue;
    K[cat] = { ...c, sizes: { ...c.sizes, [len]: { ...sp, g: +g, s: "toi", alt: `${fmtG(+g)} g pesé par toi${sp.g != null ? ` (fiche : ${fmtG(sp.g)} g)` : ""}` } } };
  }
  MEMO.set(ov, K);
  return K;
}
