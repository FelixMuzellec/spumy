// Configuration du site Concarneau (Cornouaille, Finistère sud) : tout ce qui est propre au lieu
// (spots, zones, ports de marée, principes). Le moteur (src/core, src/bord) est commun aux guides.
//
// Recherche du 29/10/2026. Chaque fait porte sa source ; ce qui n'en a pas est marqué « déduit »
// (confidence:"inference"). Spots retenus : ceux que citent au moins deux sources indépendantes.
// Ajoutés après l'audit du 29/10/2026 (deux sources et une position) : Beg Meil, pointes de Kerjean et
// de Rospico. Non retenus : pointe de la Jument (position du poste non trouvée), Cabellou, Loctudy,
// Île-Tudy, Lesconil, Guilvinec, Raguénez (une seule source ou aucune), baie de Kerogan et « vire-court »
// de l'Odet (accès difficile, vase molle).
// Tout le secteur est au sud du 48e parallèle (zone CIEM 8) : 2 bars par jour toute l'année.
export const SITE = {
  id: "concarneau",
  name: "Concarneau",
  region: "Cornouaille, Finistère sud",
  dept: "29900",
  headerLabel: "CORNOUAILLE",
  // Position du marégraphe de Concarneau (TICON-4) : requise pour le calcul solaire réel.
  lat: 47.873549, lon: -3.907207,
  tidePort: "Concarneau",
  tideSources: "constantes TICON-4 (Concarneau) ; ports secondaires ajustés sur les tables publiées par marine.meteoconsult.fr (données SHOM) : Bénodet, Port-Manec'h, Le Pouldu",
  weatherSources: "Open-Meteo (AROME, ECMWF), modèle de vagues Open-Meteo",
  zones: {
    local: { label: "Concarneau, baie de la Forêt et Trégunc", anchor: "Concarneau / Fouesnant / Trégunc (29900, 29170, 29910)", sea: "open" },
    inter: { label: "Fouesnant et l'Odet", anchor: "Fouesnant / Bénodet (29170, 29950)", sea: "open" },
    far:   { label: "Aven, Bélon et Laïta", anchor: "Névez / Clohars-Carnoët (29920, 29360)", sea: "open" },
  },
  // Marnage moyen morte-eau ↔ vive-eau à Concarneau (coefficients 45 et 95) : moyenne 2026 du calcul de marée.
  marnage: { neap: 2.1, spring: 4.3 },
  preyCalendar: [
    { name:"Crevette (bouquet, grise)", couche:"sous-surface", months:[1,2,3,4,5,6,7,8,9,10,11,12], weight:2,
      size:"3-7 cm", guidance:"Profil court et discret. Souple 8-10 cm animé lentement sur les bordures, en estuaire surtout." },
    { name:"Lançon / équille", couche:"sous-surface", months:[4,5,6,7,8,9], weight:5,
      size:"8-15 cm", guidance:"La proie reine de l'été sur les fonds de sable. Profils fins et allongés : souple fin, stickbait élancé." },
    { name:"Crabe (vert, mou en période de mue)", couche:"fond", months:[5,6,7,8,9], weight:3,
      size:"3-6 cm", guidance:"Source peche-poissons.com (2026) : imitations de crabe « très efficaces sur les bars d'estuaire » (Odet, Aven, Bélon, Laïta). Souple compact très lent au ras du fond." },
    { name:"Alevins de mulet", couche:"surface", months:[6,7,8,9], weight:3,
      size:"3-8 cm", guidance:"Bancs en surface près des bordures et des ports. Petit stickbait ou souple weightless au bord du banc." },
    { name:"Sardine", couche:"mi-eau", months:[6,7,8,9,10], weight:4,
      size:"15-20 cm", guidance:"Source peche.com : en présence de sardines, monter en taille (souple de 14 cm sur tête de 20 g en linéaire). Les oiseaux restent le meilleur indicateur de chasse." },
    { name:"Sprat", couche:"mi-eau", months:[10,11,12,1,2,3], weight:4,
      size:"8-12 cm", guidance:"Bancs d'hiver. Shad de 10 cm plombé de 12 à 25 g selon profondeur et courant (peche.com). Suivre les oiseaux." },
  ],
  seedJournal: [],
  // ── Marée : calculée localement ─────────────────────────────────
  // Concarneau : station harmonique TICON-4. Les autres ports sont ajustés sur les tables
  // d'octobre 2026, puis contrôlés sur novembre 2026 (mois jamais utilisé pour l'ajustement).
  tide: {
    defaultPort: "concarneau",
    ports: {
      concarneau: { label: "Concarneau", kind: "harmonic", station: "concarneau", z0: 2.995, lagH: -0.29,
        accuracy: "contrôlée contre les tables SHOM : ±4,4 min · ±4 cm (novembre 2026)" },
      benodet: { label: "Bénodet", kind: "secondary", ref: "concarneau", lagH: -0.26,
        hw: { t: [-7.76794, 3.25717], h: [3.12278, 1.03175] }, lw: { t: [-5.64286, 1.43262], h: [3.10136, 0.99354] },
        accuracy: "contrôlée contre les tables SHOM : ±3,7 min · ±4 cm (novembre 2026, mois de contrôle)" },
      portmanech: { label: "Port-Manec'h", kind: "secondary", ref: "concarneau", lagH: -0.33,
        hw: { t: [-7.00644, 1.47412], h: [2.92245, 1.01465] }, lw: { t: [-7.12218, 1.42011], h: [2.85755, 0.92833] },
        accuracy: "contrôlée contre les tables SHOM : ±3,6 min · ±4 cm (novembre 2026, mois de contrôle)" },
      lepouldu: { label: "Le Pouldu", kind: "secondary", ref: "concarneau", lagH: -0.34,
        hw: { t: [2.60195, -1.76583], h: [3.00709, 0.99746] }, lw: { t: [-5.31464, 0.19244], h: [3.02466, 0.97792] },
        accuracy: "contrôlée contre les tables SHOM : ±3,6 min · ±3 cm (novembre 2026, mois de contrôle)" },
    },
  },
  sstTypical: [11, 18],
};

// ═══════════════════════════════════════════════════════════════════
// PRINCIPES DE PÊCHE DU SECTEUR (sourcés)
// ═══════════════════════════════════════════════════════════════════
export const GENERAL_PRINCIPLES = {
  title: "Principes de la pêche du bar du bord en Cornouaille",
  items: [
    {
      rule: "Les estuaires : bar à vue et imitations de crabe ; la marée, règle générale à recaler",
      source: "peche-poissons.com — J.-B. Vidal, « Bar en Bretagne… où, quand, comment ? » (19/10/2026)",
      explain: "L'Odet, l'Aven, le Bélon et la Laïta sont cités parmi « les estuaires bretons et notamment finistériens », « très prisés par les pêcheurs de bars notamment à vue » ; « les gros bars sédentaires apprécient ces biotopes riches en crustacés » et « les imitations de crabes sont très efficaces sur les bars d'estuaire ». Pour la marée, la source donne une règle générale pour le bar, pas propre aux estuaires : « souvent les 3 premières heures de montantes et 3 dernières heures de descendantes », coefficients « de 50 à 80 », les phases « vont dépendre de chaque coin ».",
    },
    {
      rule: "L'Odet aval : le secteur le plus régulier, et la basse mer à ne pas rater",
      source: "ultimate-fishing.net — N. Cadiou, « Pêche du bar sur l'estuaire de l'Odet, un challenge » (02/02/2023)",
      explain: "Le secteur aval et l'embouchure, entre Bénodet et Sainte-Marine, sont « probablement la plus régulière en terme de présence des bars » : ils se pêchent à toute hauteur et à tout coefficient, la basse mer étant « un moment à ne pas rater ». En amont, le « vire-court » a « des courants puissants » et des bordures rocheuses d'accès difficile ; la baie de Kerogan a une « vase très molle » où l'on peut s'enfoncer profondément.",
    },
    {
      rule: "Pointes rocheuses : eau brassée, aube et crépuscule, marée montante",
      source: "deconcarneauapontaven.com — office de tourisme, « Les trois univers pêche »",
      explain: "Le bar préfère les pointes rocheuses (Kerjean, la Jument, Rospico), à l'eau oxygénée brassée par le courant ou les vagues ; pêcher au lever ou au coucher du soleil, à marée montante. Les grandes plages de Trévignon et de Dourveil se pêchent au surfcasting.",
    },
    {
      rule: "Toutes les plages tiennent du poisson : le bon moment s'apprend",
      source: "peche-poissons.com — J.-B. Vidal (19/10/2026)",
      explain: "« Dans le Finistère Sud toutes les plages tiennent du poisson. » En quelques sorties, on comprend si une plage pêche mieux en montante ou en descendante : le journal du guide sert à cela.",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// 10 SPOTS — chaque champ marqué par niveau de confiance
// Distances : estimées (vol d'oiseau depuis le port de Concarneau × 1,4, à 50 km/h), avec le tour de la
// baie de la Forêt pour Fouesnant. À corriger avec ton expérience.
// ═══════════════════════════════════════════════════════════════════
export const SPOTS = [

  // ══════════════════════════════════════════════════════════
  // 1. CONCARNEAU — SUD DES SABLES BLANCS
  // ══════════════════════════════════════════════════════════
  {
    id:"sablesblancs", tidePort:"concarneau", zone:"local", isLocal:true, dangerLevel:1,
    name:"Concarneau : sud des Sables Blancs", subtitle:"Plage des Sables Blancs et plages au sud",
    distance:"≈ 5 min", distMin:3, coords:"47°52,8'N 3°55,9'W", lat:47.8802, lon:-3.9314,
    type:"PLAGE + ROCHERS", color:"#22c55e",
    terrain:{
      fond:"Plage de sable, la plus connue de Concarneau (office de tourisme) ; le poste cité est le sud de la plage et la plage suivante (cannes-peche). Nature du fond devant les rochers non décrite.",
      encombrement:2,
      gratter:"texan",
      prof:{ cls:"peu", why:"Plage de sable de fond de baie : peu d'eau au bord (déduit, aucune sonde)." },
      couches:["surface", "sous-surface", "mi-eau", "fond"],
      montage:"Souple sur tête légère ou texan le long des rochers du sud de la plage ; surface à l'aube.",
      conseils:["Le poste est le sud de la plage des Sables Blancs et la plage encore plus au sud (cannes-peche).", "Plage très fréquentée l'été : pêcher tôt le matin ou au crépuscule."],
      confidence:"inference",
      source:"cannes-peche, mieuxpecher, office de tourisme de Concarneau",
      faits:[
        { t:"« Concarneau (sud de la plage des Sables Blancs et plage encore plus au sud) » parmi les coins à bar du bord.", s:"cannes-peche.blog4ever.com — « Les coins de pêche à bar / loup (du bord) » (Alain, 07/11/2016)" },
        { t:"« Concarneau » : « Les bordures de plage », « Pointe du Cabellou » (liste sans détail, qui ne nomme pas les Sables Blancs).", s:"mieuxpecher.com — « Coins de Pêche – Finistère SUD » (Norbert, 17/06/2018, mod. 28/02/2022)" },
        { t:"La plage la plus connue et la plus accessible de Concarneau, eaux claires ; surveillée l'été (5 juillet – 31 août, 13 h 30 – 17 h 30).", s:"deconcarneauapontaven.com — Plage des Sables Blancs" },
        { t:"Position : 47°52,812' N, 3°55,884' W.", s:"marine.meteoconsult.fr — météo plage, Sables Blancs (Concarneau)" },
      ],
    },
    coefBand:[30,45,80,100],
    houleMax:1.8,
    exposedAngles:[202.5,225,247.5], shelteredAngles:[22.5,45,67.5],
    weatherNote:"Plage de la baie de la Forêt tournée vers l'ouest et le sud-ouest (déduit de la carte) : vent et houle de SO de face, vent de NE de dos.",
    sources:[
      "cannes-peche.blog4ever.com — Concarneau : sud des Sables Blancs",
      "mieuxpecher.com — « Coins de Pêche – Finistère SUD »",
      "deconcarneauapontaven.com — Plage des Sables Blancs",
      "marine.meteoconsult.fr — Sables Blancs (position)",
    ],
    topology:{
      fond:{ text:"Plage (office de tourisme) ; sable déduit de son nom et de la carte.", confidence:"inference" },
      structure:{ text:"Plage, rochers au sud, plage suivante (cannes-peche).", confidence:"verified" },
      exposition:{ text:"Ouest à sud-ouest. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"Pas de mesure ; fond de baie (déduit).", confidence:"inference" },
      bars:{ text:"Poste cité pour le bar du bord (cannes-peche) ; bordures de plages de Concarneau (mieuxpecher).", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"FLOT + AUBE ET CRÉPUSCULE",
      montantOuDescendant:"Pour les pointes rocheuses du secteur, l'office de tourisme conseille la marée montante au lever et au coucher du soleil : appliqué ici aux rochers du sud de la plage, par déduction. Le bon moment de chaque plage s'apprend (Vidal).",
      description:"Plage de fond de baie : le flot couvre le pied des rochers du sud de la plage.",
      windows:[
        { id:"sb1", label:"Montant (BM+1 → BM+5,5)", phase:"bm", offsetBefore:1.0, offsetAfter:5.5, tidePhaseType:"montant", priority:"prime",
          note:"Pied des rochers du sud de la plage. Souple léger ou texan." },
        { id:"sb2", label:"Début de descendant", phase:"pm", offsetBefore:0.0, offsetAfter:2.0, tidePhaseType:"descendant", priority:"bon",
          note:"Sortie des rochers, surface à l'aube ou au crépuscule." },
      ],
      lifeHack:"Le marégraphe de référence est dans le port de Concarneau, à 2 km : l'heure de marée est celle du poste.",
    },
    lures:[
      { name:"Souple 10-12 cm tête plombée", color:"Naturel", weight:"tête 7-15 g", technique:"Le long des rochers du sud de la plage." },
      { name:"Stickbait 110-130 mm", color:"Ghost / sardine", weight:"14-27 g", technique:"Aube ou crépuscule, mer calme." },
    ],
    access:"Plage des Sables Blancs, à Concarneau ; le poste est à son extrémité sud (cannes-peche).",
    securite:[],
  },

  // ══════════════════════════════════════════════════════════
  // 2. CAP COZ (Fouesnant)
  // ══════════════════════════════════════════════════════════
  {
    id:"capcoz", tidePort:"concarneau", zone:"local", isLocal:true, dangerLevel:1,
    name:"Pointe du Cap Coz", subtitle:"Flèche et digue, Fouesnant, baie de la Forêt",
    distance:"≈ 15 min", distMin:14, coords:"47°53,3'N 3°58,9'W", lat:47.8879168, lon:-3.9815139,
    type:"FLÈCHE + PLAGE ABRITÉE", color:"#4ade80",
    terrain:{
      fond:"Flèche de sable très fine orientée ouest-est, qui ferme en partie le nord de la baie de la Forêt (coastalwiki) ; pointe et digue rocheuse (cannes-peche) ; estran rocheux qui découvre sur les bordures (carnet-de-peche.com).",
      encombrement:2,
      gratter:"texan",
      prof:{ cls:"estran", why:"Plage « très plate » (tourismebretagne) et estran rocheux qui découvre : très peu d'eau à marée basse." },
      couches:["surface", "sous-surface", "mi-eau", "fond"],
      montage:"Leurres en bordure, souple léger ou texan le long de la flèche et de la digue.",
      conseils:["« Le bar longe la flèche à la montante » (carnet-de-peche.com) : pêcher la bordure au flot.", "Poste « facile et abrité » des vents dominants par la pointe de Beg-Meil."],
      confidence:"inference",
      source:"cannes-peche, mieuxpecher, carnet-de-peche.com, tourismebretagne, coastalwiki",
      faits:[
        { t:"« Fouesnant (pointe et digue rocheuse du Cap-coz) » parmi les coins à bar du bord.", s:"cannes-peche.blog4ever.com (Alain, 07/11/2016)" },
        { t:"« Cap Coz » parmi les coins de pêche du Finistère sud.", s:"mieuxpecher.com — « Coins de Pêche – Finistère SUD »" },
        { t:"« Le bar longe la flèche à la montante » ; « l'estran rocheux qui découvre donne du terrain sur les bordures » ; « Leurres en bordure, surfcasting côté baie » ; « Poste facile et abrité ».", s:"carnet-de-peche.com — Cap Coz (page sans auteur)" },
        { t:"Plage exposée plein sud, au fond de la baie de la Forêt, abritée du vent par la pointe de Beg-Meil ; grande étendue de sable fin très plate ; surveillée en juillet et août.", s:"tourismebretagne.com — Plage du Cap-Coz (47,8879168 / -3,9815139)" },
        { t:"« A very slender spit oriented from west to east » qui ferme en partie le nord de la baie de la Forêt.", s:"coastalwiki.org — Cap Coz (Fouesnant)" },
        { t:"« La pêche est interdite dans le port. Cependant il semble toléré d'y pêcher côté mer » ; « Pêche à la calée sur la petite jetée et surfcasting : Poissons de roche, bars, daurades. »", s:"chtipecheur.com — « Spots de pêche de Bretagne » (JC59110, 06/03/2022)" },
      ],
    },
    coefBand:[30,45,80,100],
    houleMax:2.0,
    exposedAngles:[157.5,180,202.5], shelteredAngles:[337.5,0,22.5],
    weatherNote:"Plage exposée plein sud (tourismebretagne), abritée des vents dominants d'ouest par la pointe de Beg-Meil : un vent de sud est de face, un vent de nord de dos.",
    sources:[
      "cannes-peche.blog4ever.com — Cap-Coz : pointe et digue rocheuse",
      "mieuxpecher.com — « Coins de Pêche – Finistère SUD » : Cap Coz",
      "carnet-de-peche.com — Cap Coz",
      "tourismebretagne.com — Plage du Cap-Coz",
      "coastalwiki.org — Cap Coz (Fouesnant)",
      "chtipecheur.com — « Spots de pêche de Bretagne » : Cap Coz",
    ],
    topology:{
      fond:{ text:"Sable fin très plat, estran rocheux sur les bordures (tourismebretagne, carnet-de-peche).", confidence:"verified" },
      structure:{ text:"Flèche de sable ouest-est, pointe et digue rocheuse (coastalwiki, cannes-peche).", confidence:"verified" },
      exposition:{ text:"Plein sud, abritée de l'ouest par Beg-Meil (tourismebretagne).", confidence:"verified" },
      courant:{ text:"Courant de marée le long de la flèche ; heure non chiffrée.", confidence:"inference" },
      bars:{ text:"Pointe et digue citées (cannes-peche, mieuxpecher) ; bar le long de la flèche au flot (carnet-de-peche).", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"MONTANTE LE LONG DE LA FLÈCHE",
      montantOuDescendant:"« Le bar longe la flèche à la montante » (carnet-de-peche.com).",
      description:"Flèche de sable abritée : le flot ramène le poisson le long de la bordure.",
      windows:[
        { id:"cc1", label:"Montant", phase:"bm", offsetBefore:1.0, offsetAfter:5.0, tidePhaseType:"montant", priority:"prime",
          note:"Le long de la flèche et de la digue, leurres en bordure." },
        { id:"cc2", label:"Pleine mer", phase:"pm", offsetBefore:-1.0, offsetAfter:1.0, tidePhaseType:"variable", priority:"bon",
          note:"Bout de la pointe, surface par mer calme." },
      ],
      lifeHack:"Le port de Concarneau est de l'autre côté de la baie, à 6 km : même heure de marée.",
    },
    lures:[
      { name:"Souple 10-12 cm tête légère", color:"Naturel / blanc", weight:"tête 5-10 g", technique:"En bordure de la flèche, au flot." },
      { name:"Stickbait 90-110 mm", color:"Ghost / sardine", weight:"10-16 g", technique:"Mer calme, aube ou crépuscule." },
    ],
    access:"Depuis Fouesnant par la D45, direction Cap Coz ; stationnement et sentier côtier (GR34) jusqu'à la pointe (carnet-de-peche.com). Pêche interdite dans le port, côté mer seulement (chtipecheur).",
    securite:[
      { t:"Rochers glissants et estran rocheux submergé à marée montante.", s:"carnet-de-peche.com — Cap Coz" },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // POINTE DE BEG MEIL (Fouesnant)
  // ══════════════════════════════════════════════════════════
  {
    id:"begmeil", tidePort:"concarneau", zone:"local", isLocal:false, dangerLevel:2,
    name:"Pointe de Beg Meil", subtitle:"Pointe et criques, Fouesnant",
    // Position : Google Maps (29/10/2026) ; chtipecheur donne 47°51'17"N 3°58'47"O.
    // Temps de route : 5,5 km à vol d'oiseau, mais la route fait le tour de la baie de la Forêt.
    distance:"≈ 25 min", distMin:25, coords:"47°51,3'N 3°58,5'W", lat:47.855052, lon:-3.9749,
    type:"POINTE ROCHEUSE + CRIQUES", color:"#86efac",
    terrain:{
      fond:"Pointe et criques le long du sentier côtier (déduit de la carte) ; aucune source ne décrit le fond.",
      encombrement:2,
      gratter:"texan",
      prof:{ cls:"peu", why:"Pointe de fond de baie, criques : profondeur non décrite (déduit, aucune sonde)." },
      couches:["surface", "sous-surface", "mi-eau"],
      montage:"Stickbait ou souple léger le long des roches de la pointe ; texan près du fond.",
      conseils:["Fréquentée l'été par beau temps (chtipecheur) : pêcher tôt ou au crépuscule.", "Peu de détails publiés : poste à confirmer par ton journal."],
      confidence:"inference",
      source:"mieuxpecher, chtipecheur",
      faits:[
        { t:"« Beg Meil » parmi les coins de pêche du Finistère sud.", s:"mieuxpecher.com — « Coins de Pêche – Finistère SUD » (Norbert, 2018, mod. 2022)" },
        { t:"Plage et pointe du Beg Meil : « Les lieux sont connus pour le bar et parait il le congre » ; « En période estivale et lorsque qu'il y fait beau et chaud, l'endroit est fréquenté par de nombreux plagistes » (47°51'17\"N 3°58'47\"O).", s:"chtipecheur.com — « Spots de pêche de Bretagne » (JC59110, 06/03/2022)" },
      ],
    },
    coefBand:[30,45,80,100], houleMax:1.6,
    exposedAngles:[112.5,135,157.5,180], shelteredAngles:[292.5,315,337.5],
    weatherNote:"Pointe ouest de l'entrée de la baie de la Forêt, tournée vers l'est et le sud (déduit de la carte) : vent de sud-est de face, vent de nord-ouest de dos.",
    sources:[
      "mieuxpecher.com — « Coins de Pêche – Finistère SUD » : Beg Meil",
      "chtipecheur.com — « Spots de pêche de Bretagne » : plage et pointe du Beg Meil",
    ],
    topology:{
      fond:{ text:"Non décrit par les sources.", confidence:"inference" },
      structure:{ text:"Pointe et criques du sentier côtier (déduit de la carte).", confidence:"inference" },
      exposition:{ text:"Est à sud. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"Pas de mesure.", confidence:"inference" },
      bars:{ text:"« Connus pour le bar » (chtipecheur) ; cité par mieuxpecher.", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"MONTANTE (RÈGLE DU SECTEUR POUR LES POINTES)",
      montantOuDescendant:"Aucune source propre au poste. Pour les pointes rocheuses du secteur, l'office de tourisme conseille la marée montante, au lever ou au coucher du soleil.",
      description:"Pointe de baie : le flot remplit les criques.",
      windows:[
        { id:"bm1", label:"Montant (BM+1 → BM+5)", phase:"bm", offsetBefore:1.0, offsetAfter:5.0, tidePhaseType:"montant", priority:"prime",
          note:"Règle du secteur pour les pointes rocheuses (office de tourisme). Stickbait ou souple léger." },
        { id:"bm2", label:"Pleine mer (PM−1 → PM+1)", phase:"pm", offsetBefore:-1.0, offsetAfter:1.0, tidePhaseType:"variable", priority:"bon",
          note:"Criques pleines, surface par mer calme." },
      ],
      lifeHack:"Le marégraphe de Concarneau est en face, de l'autre côté de la baie : même heure de marée.",
    },
    lures:[
      { name:"Stickbait 90-110 mm", color:"Ghost / sardine", weight:"10-16 g", technique:"Aube ou crépuscule, mer calme." },
      { name:"Souple 10-12 cm tête légère", color:"Naturel", weight:"tête 5-10 g", technique:"Le long des roches de la pointe." },
    ],
    access:"Pointe de Beg Meil, à Fouesnant ; sentier côtier depuis le parking de la pointe.",
    securite:[
      { t:"Roches de pointe : ne pas descendre au ras de l'eau par houle.", s:"prudence du guide (pointe rocheuse)" },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 3. POINTE DE MOUSTERLIN (Fouesnant)
  // ══════════════════════════════════════════════════════════
  {
    id:"mousterlin", tidePort:"benodet", zone:"inter", isLocal:false, dangerLevel:2,
    name:"Pointe de Mousterlin", subtitle:"Platier rocheux, Fouesnant",
    // Position : la pointe (Google Maps et chtipecheur, 47°50'40"N 4°02'25"O) ; la plage de fishipedia est à 600 m.
    // Temps de route : 11 km à vol d'oiseau, mais la route fait le tour de la baie de la Forêt par Fouesnant.
    distance:"≈ 25 min", distMin:24, coords:"47°50,7'N 4°02,4'W", lat:47.844487, lon:-4.040351,
    type:"POINTE + PLATIER ROCHEUX", color:"#f59e0b",
    terrain:{
      fond:"Dunes, marais et « un vaste platier rocheux » qui découvre largement dès le coefficient 75 ; sable vers Bénodet (carnet-de-peche.com).",
      encombrement:3,
      gratter:"non",
      prof:{ cls:"estran", why:"Platier qui « découvre très loin aux grandes marées » (carnet-de-peche.com) : très peu d'eau à marée basse." },
      couches:["surface", "sous-surface", "mi-eau"],
      montage:"Souple léger ou surface sur les bordures du platier ; pas de pêche au fond sur la roche.",
      conseils:["« Les bordures du platier au début de la montante » (carnet-de-peche.com).", "Toujours garder une porte de sortie : la mer qui monte coupe le retour."],
      confidence:"inference",
      source:"mieuxpecher, carnet-de-peche.com, fishipedia, visorando",
      faits:[
        { t:"« Pointe de Mousterlin à Fouesnant » parmi les coins de pêche du Finistère sud.", s:"mieuxpecher.com — « Coins de Pêche – Finistère SUD »" },
        { t:"« La pointe de Mousterlin est renommée pour la pêche du bar et du congre » ; « c'est à l'exutoire des eaux pluviales que l'on retrouve les pêcheurs » (47°50'52\"N 4°02'08\"O).", s:"chtipecheur.com — « Spots de pêche de Bretagne » (JC59110, 06/03/2022)" },
        { t:"« Le poste est réputé pour le bar et le congre » ; leurres sur « les bordures du platier au début de la montante » ; « le sable qui part vers Bénodet donne du terrain au surfcasting ».", s:"carnet-de-peche.com — Pointe de Mousterlin (page sans auteur)" },
        { t:"« Le platier découvre très loin aux grandes marées et la remontée d'eau coupe le retour » : « garde toujours une porte de sortie ».", s:"carnet-de-peche.com — Pointe de Mousterlin" },
        { t:"Plage de Mousterlin : marée importante, baignade non surveillée ; vives et raies possibles.", s:"fishipedia.fr — Plage de Mousterlin (47,848434 / -4,0458173)" },
        { t:"Le tombolo de Mousterlin se voit depuis la pointe de Groasguen, à Bénodet.", s:"visorando.com — « Tour de Bénodet »" },
      ],
    },
    coefBand:[30,45,80,100],
    houleMax:1.6,
    exposedAngles:[180,202.5,225], shelteredAngles:[0,22.5,45],
    weatherNote:"Pointe sud de Fouesnant, ouverte au sud et au sud-ouest (déduit de la carte) : houle de SO de face, vent de NE de dos.",
    sources:[
      "mieuxpecher.com — « Coins de Pêche – Finistère SUD » : pointe de Mousterlin",
      "carnet-de-peche.com — Pointe de Mousterlin",
      "fishipedia.fr — Plage de Mousterlin",
      "visorando.com — « Tour de Bénodet »",
      "chtipecheur.com — « Spots de pêche de Bretagne » : pointe de Mousterlin",
    ],
    topology:{
      fond:{ text:"Vaste platier rocheux, sable vers Bénodet (carnet-de-peche).", confidence:"verified" },
      structure:{ text:"Pointe, platier, dunes et marais ; tombolo (carnet-de-peche, visorando).", confidence:"verified" },
      exposition:{ text:"Sud à sud-ouest. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"Pas de mesure.", confidence:"inference" },
      bars:{ text:"« Réputé pour le bar et le congre » (carnet-de-peche) ; « renommée pour la pêche du bar et du congre », pêcheurs à l'exutoire des eaux pluviales (chtipecheur) ; cité par mieuxpecher.", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"DÉBUT DE MONTANTE SUR LE PLATIER",
      montantOuDescendant:"« Les bordures du platier au début de la montante » (carnet-de-peche.com).",
      description:"Le platier découvre loin : le début du flot ramène le bar sur ses bordures, puis coupe le retour.",
      windows:[
        { id:"mo1", label:"Début de montante (BM → BM+2,5)", phase:"bm", offsetBefore:0.0, offsetAfter:2.5, tidePhaseType:"montant", priority:"prime",
          note:"Bordures du platier, souple léger ou surface. Repartir avant d'être coupé." },
        { id:"mo2", label:"Montant", phase:"bm", offsetBefore:2.5, offsetAfter:5.0, tidePhaseType:"montant", priority:"bon",
          note:"Depuis le haut de l'estran, la mer couvre le platier." },
      ],
      lifeHack:"Par grand coefficient, le platier découvre « très loin » : la marche du retour compte dans le créneau.",
    },
    lures:[
      { name:"Souple 10-12 cm weightless ou tête légère", color:"Naturel", weight:"sans plomb à 5 g", technique:"Bordures du platier au début du flot." },
      { name:"Stickbait 110-130 mm", color:"Ghost / sardine", weight:"14-27 g", technique:"Mer calme, aube ou crépuscule." },
    ],
    access:"Parking de la pointe de Mousterlin, à Fouesnant, puis sentier côtier (carnet-de-peche.com).",
    securite:[
      { t:"Le platier découvre très loin aux grandes marées et la mer qui monte coupe le retour : garder une porte de sortie.", s:"carnet-de-peche.com — Pointe de Mousterlin (le platier « découvre largement dès les coefficients de 75 »)", when:{ coefAbove:75 } },
      { t:"Vives et raies possibles sur le sable : regarder où l'on marche.", s:"fishipedia.fr — Plage de Mousterlin" },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 4. EMBOUCHURE DE L'ODET (Bénodet – Sainte-Marine)
  // ══════════════════════════════════════════════════════════
  {
    id:"odet", tidePort:"benodet", zone:"inter", isLocal:false, dangerLevel:1,
    name:"Embouchure de l'Odet", subtitle:"Bénodet – Sainte-Marine, secteur aval",
    riviere:"Odet",
    // Position : parking du port de plaisance de Bénodet, point d'accès ; la pointe du Coq est 1,1 km au sud par la corniche.
    distance:"≈ 25 min", distMin:26, coords:"47°52,9'N 4°06,9'W", lat:47.881574, lon:-4.11529,
    type:"EMBOUCHURE + ESTUAIRE", color:"#16a34a",
    terrain:{
      fond:"Estuaire aval et embouchure de l'Odet, entre Bénodet et Sainte-Marine (Cadiou, 2023). Nature du fond non décrite pour le bord.",
      encombrement:2,
      gratter:"texan",
      prof:{ cls:"peu", why:"Bordures d'estuaire : profondeur non décrite pour le bord (déduit)." },
      couches:["surface", "sous-surface", "mi-eau", "fond"],
      montage:"Dark Sleeper lent sur le fond avec des pauses, Sleeper Gill un peu plus haut dans la couche, Z-Claw en surface animé lentement en travers du courant (Cadiou) ; imitation de crabe au ras du fond (Vidal).",
      conseils:["Le secteur aval est « probablement la plus régulière en terme de présence des bars » ; la basse mer est « un moment à ne pas rater » (Cadiou).", "Bars d'estuaire : imitations de crabe (Vidal)."],
      confidence:"inference",
      source:"N. Cadiou (ultimate-fishing.net, 2023), mieuxpecher, J.-B. Vidal, visorando",
      faits:[
        { t:"Secteur aval et embouchure : « probablement la plus régulière en terme de présence des bars », à toute hauteur et tout coefficient ; la basse mer, « un moment à ne pas rater » ; l'embouchure « est un secteur clé » entre Bénodet et Sainte-Marine.", s:"ultimate-fishing.net — N. Cadiou, « Pêche du bar sur l'estuaire de l'Odet, un challenge » (02/02/2023)" },
        { t:"Leurres : Dark Sleeper pour « pêcher lentement sur le fond avec des pauses », Sleeper Gill pour « pêcher un peu plus haut dans la couche d'eau » (bordures et pointes de roches immergées), Z-Claw (leurre de surface) « animé lentement en travers du courant ».", s:"ultimate-fishing.net — N. Cadiou (2023)" },
        { t:"« La rivière et l'estuaire de l'Odet » parmi les coins de pêche du Finistère sud.", s:"mieuxpecher.com — « Coins de Pêche – Finistère SUD »" },
        { t:"L'Odet parmi « les estuaires bretons et notamment finistériens » « très prisés par les pêcheurs de bars notamment à vue » ; imitations de crabe « très efficaces sur les bars d'estuaire ».", s:"peche-poissons.com — J.-B. Vidal (19/10/2026)" },
        { t:"Du parking du port de plaisance de Bénodet, la corniche de l'estuaire mène en 1,3 km à la pointe du Coq et son petit phare ; bac vers Sainte-Marine en juillet-septembre.", s:"visorando.com — « Tour de Bénodet » (départ 47,881574 / -4,11529)" },
      ],
    },
    coefBand:[30,45,85,105],
    houleMax:2.0,
    exposedAngles:[157.5,180,202.5], shelteredAngles:[337.5,0,22.5],
    weatherNote:"Embouchure ouverte au sud (déduit de la carte) : la houle de sud entre dans l'estuaire, le vent de nord descend la rivière.",
    sources:[
      "ultimate-fishing.net — N. Cadiou, « Pêche du bar sur l'estuaire de l'Odet, un challenge » (2023)",
      "mieuxpecher.com — « Coins de Pêche – Finistère SUD » : l'Odet",
      "peche-poissons.com — J.-B. Vidal (19/10/2026) : estuaires",
      "visorando.com — « Tour de Bénodet »",
    ],
    topology:{
      fond:{ text:"Estuaire aval (Cadiou).", confidence:"verified" },
      structure:{ text:"Embouchure entre Bénodet et Sainte-Marine, corniche de l'estuaire, pointe du Coq (Cadiou, visorando).", confidence:"verified" },
      exposition:{ text:"Ouverte au sud. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"Courant d'estuaire ; la cale de Bénodet est « exposée au courant principal » (Cadiou) ; maximal à mi-marée (règle des douzièmes).", confidence:"verified" },
      bars:{ text:"Secteur le plus régulier de l'Odet (Cadiou) ; estuaire réputé (Vidal, mieuxpecher).", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"BASSE MER + DÉBUT DE MONTANTE",
      montantOuDescendant:"La basse mer est « un moment à ne pas rater » (Cadiou) ; règle générale des estuaires : trois premières heures de montante et trois dernières de descendante (Vidal).",
      description:"L'embouchure se pêche à toute marée ; autour de la basse mer, le poisson se concentre dans le chenal.",
      windows:[
        { id:"od1", label:"Basse mer (BM−1,5 → BM+1,5)", phase:"bm", offsetBefore:-1.5, offsetAfter:1.5, tidePhaseType:"variable", priority:"prime",
          note:"« Un moment à ne pas rater » (Cadiou). Dark Sleeper lent avec pauses." },
        { id:"od2", label:"Montant (BM+1,5 → BM+3)", phase:"bm", offsetBefore:1.5, offsetAfter:3.0, tidePhaseType:"montant", priority:"bon",
          note:"Premières heures de flot (règle générale de Vidal). Z-Claw en surface, animé lentement en travers du courant (Cadiou)." },
      ],
      lifeHack:"Retard sur le marégraphe de Bénodet (Cadiou) : + 20 min pour le haut du secteur aval, + 20 à 35 min pour le secteur intermédiaire, + 35 à 45 min en baie de Kerogan, + 45 min à 1 h à Quimper. L'heure du guide vaut pour l'embouchure.",
    },
    lures:[
      { name:"Fiiish Dark Sleeper", color:"Naturel", weight:"selon le courant", technique:"Lent, avec des pauses, près du fond (Cadiou)." },
      { name:"Z Claw Evo", color:"Naturel", weight:"22,5 g (100 mm, flottant)", technique:"Leurre de surface, « animé lentement en travers du courant » (Cadiou)." },
      { name:"Imitation de crabe", color:"Vert / brun", weight:"texan 5-10 g", technique:"Bars d'estuaire (Vidal, 2026)." },
    ],
    access:"Parking du port de plaisance de Bénodet, puis corniche de l'estuaire vers la pointe du Coq (visorando). L'été, le stationnement à Bénodet « peut vite tourner au cauchemar » (Cadiou).",
    securite:[
      { t:"La cale de Bénodet est « exposée au courant principal » (Cadiou, à propos de la mise à l'eau) : le courant y porte fort par grand coefficient.", s:"ultimate-fishing.net — N. Cadiou (2023)" },
      { t:"Plus haut dans l'estuaire, la baie de Kerogan a « une vase très molle et de vrais risques de s'enfoncer profondément » : rester sur le haut de la bordure (Cadiou), jamais seul (prudence du guide).", s:"ultimate-fishing.net — N. Cadiou (2023) · prudence du guide" },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 5. POINTE DE TRÉVIGNON (Trégunc)
  // ══════════════════════════════════════════════════════════
  {
    id:"trevignon", tidePort:"concarneau", zone:"local", isLocal:false, dangerLevel:2,
    name:"Pointe de Trévignon", subtitle:"Roches et digue, Trégunc",
    // Position : la pointe (Google Maps, 29/10/2026) ; la position d'atout-pecheur est à 800 m.
    distance:"≈ 15 min", distMin:17, coords:"47°47,5'N 3°51,2'W", lat:47.7916, lon:-3.854083,
    type:"POINTE ROCHEUSE + DIGUE", color:"#f97316",
    terrain:{
      fond:"Pointe rocheuse (cannes-peche), digue du port (office de tourisme) ; grande plage de sable voisine pour le surfcasting (office de tourisme, atout-pecheur).",
      encombrement:3,
      gratter:"non",
      prof:{ cls:"peu", why:"Roches de pointe : profondeur non décrite (déduit, aucune sonde)." },
      couches:["surface", "sous-surface", "mi-eau"],
      montage:"Stickbait ou souple tenu au-dessus des roches ; pas de pêche au fond.",
      conseils:["Pointes rocheuses : l'eau brassée par le courant ou les vagues, au lever ou au coucher du soleil, à marée montante (office de tourisme).", "La plage de Trévignon se pêche aussi au surfcasting."],
      confidence:"inference",
      source:"cannes-peche, mieuxpecher, atout-pecheur, office de tourisme de Concarneau – Pont-Aven",
      faits:[
        { t:"« Trégunc (Pointe de Trévignon – roches) » parmi les coins à bar du bord.", s:"cannes-peche.blog4ever.com (Alain, 07/11/2016)" },
        { t:"« La pointe de Trévignon » parmi les coins de pêche du Finistère sud.", s:"mieuxpecher.com — « Coins de Pêche – Finistère SUD »" },
        { t:"« Très bon spot pour le surf casting » : bar, daurades ; appâts à ramasser sur place.", s:"atout-pecheur.fr — Pointe de Trévignon (classée à Névez 29920 par le site ; 47,798146 / -3,849823)" },
        { t:"Le bar préfère les pointes rocheuses, à l'eau oxygénée brassée par le courant ou les vagues ; lever ou coucher du soleil, marée montante. Seiches à la tombée de la nuit sur la digue de Trévignon ; surfcasting sur les grandes plages de Trévignon et de Dourveil.", s:"deconcarneauapontaven.com — « Les trois univers pêche »" },
      ],
    },
    coefBand:[30,45,85,105],
    houleMax:1.6,
    exposedAngles:[157.5,180,202.5,225,247.5], shelteredAngles:[22.5,45,67.5],
    weatherNote:"Pointe avancée au sud de Trégunc, face aux Glénan (déduit de la carte) : exposée du sud-sud-est à l'ouest-sud-ouest, abritée par vent de nord-est.",
    sources:[
      "cannes-peche.blog4ever.com — Trégunc : pointe de Trévignon, roches",
      "mieuxpecher.com — « Coins de Pêche – Finistère SUD »",
      "atout-pecheur.fr — Pointe de Trévignon",
      "deconcarneauapontaven.com — « Les trois univers pêche »",
    ],
    topology:{
      fond:{ text:"Roches de pointe, plage de sable voisine (cannes-peche, office de tourisme).", confidence:"verified" },
      structure:{ text:"Pointe, digue et port de Trévignon (office de tourisme).", confidence:"verified" },
      exposition:{ text:"Sud à ouest-sud-ouest. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"Eau brassée par le courant ou les vagues sur les pointes (office de tourisme) ; heure non estimée.", confidence:"verified" },
      bars:{ text:"Roches citées (cannes-peche, mieuxpecher), bar au surfcasting (atout-pecheur), pointes rocheuses (office de tourisme).", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"MONTANTE + LEVER ET COUCHER DU SOLEIL",
      montantOuDescendant:"Conseil de l'office de tourisme pour les pointes rocheuses du secteur : marée montante, au lever ou au coucher du soleil.",
      description:"Pointe rocheuse : l'eau brassée et la lumière faible font le poste.",
      windows:[
        { id:"tv1", label:"Montant", phase:"bm", offsetBefore:1.0, offsetAfter:5.0, tidePhaseType:"montant", priority:"prime",
          note:"Conseil de la source : montante, aube ou crépuscule. Stickbait dans l'écume." },
        { id:"tv2", label:"Pleine mer", phase:"pm", offsetBefore:-1.0, offsetAfter:1.0, tidePhaseType:"variable", priority:"bon",
          note:"Roches couvertes, depuis un poste haut." },
      ],
      lifeHack:"Vise un montant qui tombe au lever ou au coucher du soleil : c'est la règle de la source.",
    },
    lures:[
      { name:"Stickbait 110-130 mm", color:"Ghost / sardine", weight:"14-27 g", technique:"Dans l'eau brassée, aube ou crépuscule." },
      { name:"Souple 12 cm tête plombée", color:"Blanc / naturel", weight:"tête 10-21 g", technique:"Tenu au-dessus des roches." },
    ],
    access:"Pointe et port de Trévignon, à Trégunc (office de tourisme : digue de Trévignon).",
    securite:[
      { t:"Roches de pointe : jamais au ras de l'eau par houle.", s:"prudence du guide (pointe rocheuse exposée)" },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // POINTE DE KERJEAN (Trégunc)
  // ══════════════════════════════════════════════════════════
  {
    id:"kerjean", tidePort:"concarneau", zone:"local", isLocal:false, dangerLevel:2,
    name:"Pointe de Kerjean", subtitle:"Pointe rocheuse et plage de Don, Trégunc",
    // Position : Google Maps (29/10/2026).
    distance:"≈ 20 min", distMin:18, coords:"47°47,6'N 3°49,7'W", lat:47.793678, lon:-3.828032,
    type:"POINTE ROCHEUSE", color:"#fb923c",
    terrain:{
      fond:"Pointe rocheuse (office de tourisme) entre les plages de Kersidan et de Don (déduit de la carte).",
      encombrement:3,
      gratter:"non",
      prof:{ cls:"peu", why:"Roches de pointe : profondeur non décrite (déduit, aucune sonde)." },
      couches:["surface", "sous-surface", "mi-eau"],
      montage:"Stickbait ou souple tenu au-dessus des roches ; pas de pêche au fond.",
      conseils:["Pointes rocheuses : l'eau « brassée par le courant ou les vagues », au lever ou au coucher du soleil, à marée montante (office de tourisme)."],
      confidence:"inference",
      source:"office de tourisme de Concarneau – Pont-Aven, mieuxpecher, cannes-peche",
      faits:[
        { t:"Le bar préfère les « pointes rocheuses (Kerjean, la Jument, Rospico) », à l'eau « brassée par le courant ou les vagues » ; « au lever du jour ou à la tombée de la nuit, et à marée montante ».", s:"deconcarneauapontaven.com — « Les trois univers pêche »" },
        { t:"« Pointe de Kerjean » parmi les coins de pêche du Finistère sud.", s:"mieuxpecher.com — « Coins de Pêche – Finistère SUD »" },
        { t:"« Kerjean (Plage de Don) » parmi les coins à bar du bord.", s:"cannes-peche.blog4ever.com — « Les coins de pêche à bar / loup (du bord) » (Alain, 07/11/2016)" },
      ],
    },
    coefBand:[30,45,85,105], houleMax:1.6,
    exposedAngles:[157.5,180,202.5,225], shelteredAngles:[337.5,0,22.5],
    weatherNote:"Pointe de la côte sud de Trégunc, tournée vers le large (déduit de la carte) : exposée du sud-sud-est au sud-ouest, abritée par vent de nord.",
    sources:[
      "deconcarneauapontaven.com — « Les trois univers pêche » : pointes rocheuses (Kerjean, la Jument, Rospico)",
      "mieuxpecher.com — « Coins de Pêche – Finistère SUD » : pointe de Kerjean",
      "cannes-peche.blog4ever.com — Kerjean (plage de Don)",
    ],
    topology:{
      fond:{ text:"Pointe rocheuse (office de tourisme).", confidence:"verified" },
      structure:{ text:"Pointe entre deux plages (déduit de la carte).", confidence:"inference" },
      exposition:{ text:"Sud. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"Eau brassée par le courant ou les vagues sur les pointes (office de tourisme) ; heure non estimée.", confidence:"verified" },
      bars:{ text:"Nommée pour le bar par l'office de tourisme ; citée par mieuxpecher et cannes-peche.", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"MONTANTE + LEVER ET COUCHER DU SOLEIL",
      montantOuDescendant:"Conseil de l'office de tourisme pour cette pointe et ses voisines : marée montante, au lever ou au coucher du soleil.",
      description:"Pointe rocheuse : l'eau brassée et la lumière faible font le poste.",
      windows:[
        { id:"kj1", label:"Montant (BM+1 → BM+5)", phase:"bm", offsetBefore:1.0, offsetAfter:5.0, tidePhaseType:"montant", priority:"prime",
          note:"Conseil de la source : montante, aube ou crépuscule. Stickbait dans l'écume." },
        { id:"kj2", label:"Pleine mer (PM−1 → PM+1)", phase:"pm", offsetBefore:-1.0, offsetAfter:1.0, tidePhaseType:"variable", priority:"bon",
          note:"Roches couvertes, depuis un poste haut." },
      ],
      lifeHack:"Vise un montant qui tombe au lever ou au coucher du soleil : c'est la règle de la source.",
    },
    lures:[
      { name:"Stickbait 110-130 mm", color:"Ghost / sardine", weight:"14-27 g", technique:"Dans l'eau brassée, aube ou crépuscule." },
      { name:"Souple 12 cm tête plombée", color:"Blanc / naturel", weight:"tête 10-21 g", technique:"Tenu au-dessus des roches." },
    ],
    access:"Pointe de Kerjean, à Trégunc, par le sentier côtier (GR34) ; plage de Don à côté.",
    securite:[
      { t:"Roches de pointe : jamais au ras de l'eau par houle.", s:"prudence du guide (pointe rocheuse exposée)" },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // POINTE DE ROSPICO (Névez)
  // ══════════════════════════════════════════════════════════
  {
    id:"rospico", tidePort:"portmanech", zone:"far", isLocal:false, dangerLevel:2,
    name:"Pointe de Rospico", subtitle:"Pointe et anse de Rospico, Névez",
    // Position : Google Maps (29/10/2026). Port de marée : Port-Manec'h, à 2 km à l'est.
    distance:"≈ 25 min", distMin:24, coords:"47°47,4'N 3°45,7'W", lat:47.789967, lon:-3.761323,
    type:"POINTE ROCHEUSE", color:"#facc15",
    terrain:{
      fond:"Pointe rocheuse (office de tourisme) et petite anse de sable (déduit de la carte).",
      encombrement:3,
      gratter:"non",
      prof:{ cls:"peu", why:"Roches de pointe et petite anse : profondeur non décrite (déduit, aucune sonde)." },
      couches:["surface", "sous-surface", "mi-eau"],
      montage:"Stickbait ou souple tenu au-dessus des roches ; pas de pêche au fond.",
      conseils:["Pointes rocheuses : l'eau « brassée par le courant ou les vagues », au lever ou au coucher du soleil, à marée montante (office de tourisme)."],
      confidence:"inference",
      source:"office de tourisme de Concarneau – Pont-Aven, mieuxpecher",
      faits:[
        { t:"Le bar préfère les « pointes rocheuses (Kerjean, la Jument, Rospico) », à l'eau « brassée par le courant ou les vagues » ; « au lever du jour ou à la tombée de la nuit, et à marée montante ».", s:"deconcarneauapontaven.com — « Les trois univers pêche »" },
        { t:"« La pointe de Rospico » parmi les coins de pêche du Finistère sud.", s:"mieuxpecher.com — « Coins de Pêche – Finistère SUD »" },
      ],
    },
    coefBand:[30,45,85,105], houleMax:1.6,
    exposedAngles:[157.5,180,202.5,225], shelteredAngles:[337.5,0,22.5],
    weatherNote:"Pointe de la côte sud de Névez, tournée vers le large (déduit de la carte) : exposée du sud-sud-est au sud-ouest, abritée par vent de nord.",
    sources:[
      "deconcarneauapontaven.com — « Les trois univers pêche » : pointes rocheuses (Kerjean, la Jument, Rospico)",
      "mieuxpecher.com — « Coins de Pêche – Finistère SUD » : la pointe de Rospico",
    ],
    topology:{
      fond:{ text:"Pointe rocheuse (office de tourisme).", confidence:"verified" },
      structure:{ text:"Pointe et petite anse (déduit de la carte).", confidence:"inference" },
      exposition:{ text:"Sud. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"Eau brassée par le courant ou les vagues sur les pointes (office de tourisme) ; heure non estimée.", confidence:"verified" },
      bars:{ text:"Nommée pour le bar par l'office de tourisme ; citée par mieuxpecher.", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"MONTANTE + LEVER ET COUCHER DU SOLEIL",
      montantOuDescendant:"Conseil de l'office de tourisme pour cette pointe et ses voisines : marée montante, au lever ou au coucher du soleil.",
      description:"Pointe rocheuse : l'eau brassée et la lumière faible font le poste.",
      windows:[
        { id:"rs1", label:"Montant (BM+1 → BM+5)", phase:"bm", offsetBefore:1.0, offsetAfter:5.0, tidePhaseType:"montant", priority:"prime",
          note:"Conseil de la source : montante, aube ou crépuscule. Stickbait dans l'écume." },
        { id:"rs2", label:"Pleine mer (PM−1 → PM+1)", phase:"pm", offsetBefore:-1.0, offsetAfter:1.0, tidePhaseType:"variable", priority:"bon",
          note:"Roches couvertes, depuis un poste haut." },
      ],
      lifeHack:"Le port de marée est Port-Manec'h, à 2 km : même heure de marée.",
    },
    lures:[
      { name:"Stickbait 110-130 mm", color:"Ghost / sardine", weight:"14-27 g", technique:"Dans l'eau brassée, aube ou crépuscule." },
      { name:"Souple 12 cm tête plombée", color:"Blanc / naturel", weight:"tête 10-21 g", technique:"Tenu au-dessus des roches." },
    ],
    access:"Anse de Rospico, à Névez ; parking près de la plage, sentier côtier (GR34) vers la pointe.",
    securite:[
      { t:"Roches de pointe : jamais au ras de l'eau par houle.", s:"prudence du guide (pointe rocheuse exposée)" },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 6. EMBOUCHURES DE L'AVEN ET DU BÉLON (Port-Manec'h)
  // ══════════════════════════════════════════════════════════
  {
    id:"portmanech", tidePort:"portmanech", zone:"far", isLocal:false, dangerLevel:2,
    name:"Embouchures de l'Aven et du Bélon", subtitle:"Port-Manec'h, Névez",
    riviere:"Aven",
    distance:"≈ 25 min", distMin:24, coords:"47°48,3'N 3°44,6'W", lat:47.805058, lon:-3.742622,
    type:"EMBOUCHURE (AVEN, BÉLON)", color:"#a3e635",
    terrain:{
      fond:"Plage de Port-Manec'h à l'embouchure de l'Aven : criques, sable et galets (plages.tv) ; sentier côtier avec un rocher vertical, le « Doigt de Dieu », et des marches taillées dans la roche (visorando).",
      encombrement:2,
      gratter:"texan",
      prof:{ cls:"peu", why:"Embouchure d'estuaire : profondeur non décrite (déduit)." },
      couches:["surface", "sous-surface", "mi-eau", "fond"],
      montage:"Imitation de crabe ou souple léger le long des bordures ; surface au flot.",
      conseils:["Règle générale de Vidal pour le bar : souvent les trois premières heures de montante et les trois dernières de descendante, à recaler sur place.", "Bar à vue possible : Vidal dit les estuaires « très prisés par les pêcheurs de bars notamment à vue »."],
      confidence:"inference",
      source:"mieuxpecher, J.-B. Vidal, visorando, plages.tv",
      faits:[
        { t:"« Embouchure de l'Aven et du Belon » parmi les coins de pêche du Finistère sud.", s:"mieuxpecher.com — « Coins de Pêche – Finistère SUD »" },
        { t:"L'Aven et le Bélon parmi « les estuaires bretons et notamment finistériens » « très prisés par les pêcheurs de bars notamment à vue » ; imitations de crabe « très efficaces sur les bars d'estuaire ».", s:"peche-poissons.com — J.-B. Vidal (19/10/2026)" },
        { t:"Parking près de la chapelle Saint-Nicolas (Port-Manec'h) ; vue sur le port, la plage et l'embouchure ; rocher du Doigt de Dieu ; passage « quite steep with steps carved into the rock ».", s:"visorando.com — « Autour de Port Manec'h » (47,805058 / -3,742622)" },
        { t:"Plage à l'embouchure de l'Aven, corniche du Pouldon ; places de parking limitées ; accès signalé difficile.", s:"plages.tv — Plage de Port-Manec'h – Saint-Nicolas" },
      ],
    },
    coefBand:[30,45,80,100],
    houleMax:2.0,
    exposedAngles:[157.5,180,202.5], shelteredAngles:[337.5,0,22.5],
    weatherNote:"Embouchure ouverte au sud (déduit de la carte) : la houle de sud entre dans l'estuaire, le vent de nord est de dos.",
    sources:[
      "mieuxpecher.com — « Coins de Pêche – Finistère SUD » : embouchures de l'Aven et du Bélon",
      "peche-poissons.com — J.-B. Vidal (19/10/2026) : estuaires",
      "visorando.com — « Autour de Port Manec'h »",
      "plages.tv — Plage de Port-Manec'h",
    ],
    topology:{
      fond:{ text:"Criques, sable et galets (plages.tv).", confidence:"verified" },
      structure:{ text:"Embouchure de l'Aven, celle du Bélon à l'est (mieuxpecher) ; sentier côtier rocheux (visorando).", confidence:"verified" },
      exposition:{ text:"Ouverte au sud. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"Courant d'estuaire, maximal à mi-marée (règle des douzièmes).", confidence:"inference" },
      bars:{ text:"Embouchures citées (mieuxpecher) ; estuaires réputés pour le bar (Vidal).", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"3 PREMIÈRES HEURES DE MONTANTE · 3 DERNIÈRES DE DESCENDANTE (RÈGLE GÉNÉRALE)",
      montantOuDescendant:"Règle générale de la source pour le bar (« souvent » les 3 premières heures de montante et les 3 dernières de descendante ; « les phases de marée […] vont dépendre de chaque coin ») : Vidal, 2026. Non propre à ce poste : à recaler avec ton journal.",
      description:"Le flot fait entrer le poisson dans l'Aven et le Bélon, le jusant le fait ressortir.",
      windows:[
        { id:"pm1", label:"3 premières heures de montante", phase:"bm", offsetBefore:0.0, offsetAfter:3.0, tidePhaseType:"montant", priority:"prime",
          note:"Règle générale de la source (Vidal). Bordures, imitation de crabe." },
        { id:"pm2", label:"3 dernières heures de descendante", phase:"bm", offsetBefore:-3.0, offsetAfter:0.0, tidePhaseType:"descendant", priority:"prime",
          note:"Règle générale de la source (Vidal). Veine qui sort de l'embouchure." },
      ],
      lifeHack:"Le port de marée est Port-Manec'h même : l'heure de marée est celle du poste.",
    },
    lures:[
      { name:"Imitation de crabe", color:"Vert / brun", weight:"texan 5-10 g", technique:"Bars d'estuaire (Vidal, 2026)." },
      { name:"Souple 10 cm tête légère", color:"Naturel", weight:"tête 5-10 g", technique:"Le long des bordures de l'embouchure." },
    ],
    access:"Parking près de la chapelle Saint-Nicolas, à Port-Manec'h (Névez), puis sentier côtier (visorando) ; places limitées l'été (plages.tv).",
    securite:[
      { t:"Sentier raide, marches taillées dans la roche entre le port et la côte : bonnes chaussures.", s:"visorando.com — « Autour de Port Manec'h »" },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 7. ESTUAIRE DE LA LAÏTA (Le Pouldu)
  // ══════════════════════════════════════════════════════════
  {
    id:"laita", tidePort:"lepouldu", zone:"far", isLocal:false, dangerLevel:2,
    name:"Estuaire de la Laïta", subtitle:"Port du Pouldu, Clohars-Carnoët",
    riviere:"Laïta",
    distance:"≈ 50 min", distMin:51, coords:"47°46,4'N 3°31,8'W", lat:47.77255, lon:-3.5298,
    type:"ESTUAIRE (LAÏTA)", color:"#34d399",
    terrain:{
      fond:"Estuaire de la Laïta et son embouchure, barre de sable à l'est de l'embouchure, bancs et chenal qui évoluent « parfois rapidement » ; zone rocheuse à l'ouest, où passe le chenal (association des pêcheurs plaisanciers de Clohars-Carnoët).",
      encombrement:2,
      gratter:"texan",
      prof:{ cls:"peu", why:"Estuaire à barre de sable ; le chenal d'accès est « complètement fermé » quand la hauteur d'eau calculée à Concarneau descend à 0,55 m (APPPCC) : peu d'eau à marée basse." },
      couches:["surface", "sous-surface", "mi-eau", "fond"],
      montage:"Imitation de crabe ou souple léger le long des bordures de l'estuaire.",
      conseils:["Règle générale de Vidal pour le bar : souvent les trois premières heures de montante et les trois dernières de descendante, à recaler sur place.", "Depuis le port du Pouldu, belvédère sur l'embouchure par le sentier côtier (visorando)."],
      confidence:"inference",
      source:"mieuxpecher, J.-B. Vidal, association des pêcheurs plaisanciers de Clohars-Carnoët, visorando",
      faits:[
        { t:"« L'estuaire de de la Laïta » (sic) parmi les coins de pêche du Finistère sud.", s:"mieuxpecher.com — « Coins de Pêche – Finistère SUD »" },
        { t:"La Laïta parmi « les estuaires bretons et notamment finistériens » « très prisés par les pêcheurs de bars notamment à vue » ; imitations de crabe « très efficaces sur les bars d'estuaire ».", s:"peche-poissons.com — J.-B. Vidal (19/10/2026)" },
        { t:"« La présence d'une barre à l'embouchure de la rivière Laïta limite l'entrée au port du Pouldu » ; la barre est à l'est de l'embouchure, le chenal dans la zone rocheuse à l'ouest ; bancs et chenal « subissent des évolutions parfois rapides ».", s:"apppcc.jimdofree.com — Association des pêcheurs plaisanciers de Clohars-Carnoët, « L'embouchure de la Laïta »" },
        { t:"Port du Pouldu sur la Laïta, passeur vers Guidel-Plages de mai à septembre ; belvédère sur l'embouchure, mât de pilote (1847), fort, plage des Grands Sables.", s:"visorando.com — « Terre et mer par le Pouldu »" },
        { t:"Port du Pouldu : 47,77255 / -3,5298.", s:"waterways.navship.org — Laïta" },
      ],
    },
    coefBand:[30,45,80,100],
    houleMax:2.0,
    exposedAngles:[180,202.5,225], shelteredAngles:[0,22.5,45],
    weatherNote:"Embouchure ouverte au sud-ouest (déduit de la carte) : la houle de SO bute sur la barre, le vent de NE descend la rivière.",
    sources:[
      "mieuxpecher.com — « Coins de Pêche – Finistère SUD » : estuaire de la Laïta",
      "peche-poissons.com — J.-B. Vidal (19/10/2026) : estuaires",
      "apppcc.jimdofree.com — « L'embouchure de la Laïta »",
      "visorando.com — « Terre et mer par le Pouldu »",
      "waterways.navship.org — Laïta (position du port)",
      "lorientbretagnesudtourisme.fr — Plage du Bas Pouldu (courants du chenal)",
    ],
    topology:{
      fond:{ text:"Barre de sable mobile à l'est, roches et chenal à l'ouest (APPPCC).", confidence:"verified" },
      structure:{ text:"Estuaire, port du Pouldu, embouchure, plages (visorando, APPPCC).", confidence:"verified" },
      exposition:{ text:"Sud-ouest. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"Courant d'estuaire ; la barre dépend « du débit de la rivière, des courants, du vent et de l'état de la mer » (APPPCC).", confidence:"verified" },
      bars:{ text:"Estuaire cité (mieuxpecher) et réputé pour le bar (Vidal).", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"3 PREMIÈRES HEURES DE MONTANTE · 3 DERNIÈRES DE DESCENDANTE (RÈGLE GÉNÉRALE)",
      montantOuDescendant:"Règle générale de la source pour le bar (« souvent » les 3 premières heures de montante et les 3 dernières de descendante ; « les phases de marée […] vont dépendre de chaque coin ») : Vidal, 2026. Non propre à ce poste : à recaler avec ton journal.",
      description:"Estuaire à barre : le flot fait entrer le poisson par le chenal, le jusant le fait ressortir.",
      windows:[
        { id:"la1", label:"3 premières heures de montante", phase:"bm", offsetBefore:0.0, offsetAfter:3.0, tidePhaseType:"montant", priority:"prime",
          note:"Règle générale de la source (Vidal). Bordures de l'estuaire, imitation de crabe." },
        { id:"la2", label:"3 dernières heures de descendante", phase:"bm", offsetBefore:-3.0, offsetAfter:0.0, tidePhaseType:"descendant", priority:"prime",
          note:"Règle générale de la source (Vidal). Sortie du chenal." },
      ],
      lifeHack:"Le port de marée est Le Pouldu même : l'heure de marée est celle du poste.",
    },
    lures:[
      { name:"Imitation de crabe", color:"Vert / brun", weight:"texan 5-10 g", technique:"Bars d'estuaire (Vidal, 2026)." },
      { name:"Souple 10 cm tête légère", color:"Naturel", weight:"tête 5-10 g", technique:"Bordures du chenal." },
    ],
    access:"Port du Pouldu (Clohars-Carnoët), sentier côtier vers le belvédère de l'embouchure (visorando).",
    securite:[
      { t:"Courants violents dans le chenal de la Laïta : la baignade y est interdite, « en raison de courants violents signalés par des panneaux ». Ne pas entrer dans l'eau à l'embouchure.", s:"lorientbretagnesudtourisme.fr — Plage du Bas Pouldu (Guidel), rive est de l'embouchure" },
      { t:"Roches à fleur d'eau et roches sous l'eau à l'ouest de l'embouchure (Beg ar Kergouaranton) ; bancs de sable mobiles.", s:"apppcc.jimdofree.com — « L'embouchure de la Laïta »" },
    ],
  },
];
