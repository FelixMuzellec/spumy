// Configuration du site Crozon (presqu'île de Crozon et baie de Douarnenez, Finistère) : tout ce qui est propre
// au lieu (spots, zones, ports de marée, principes). Le moteur (src/core, src/bord) est commun aux guides.
//
// Recherche du 29/10/2026. Chaque fait porte sa source ; ce qui n'en a pas est marqué « déduit »
// (confidence:"inference"). Le secteur est le trou entre le guide de Logonna (Pen-Hir, Espagnols) et celui
// d'Audierne (Brézellec) : aucun spot en commun.
// Retenus avec au moins deux sources indépendantes : pointe de Dinan, pointe de Morgat, plages de Trez Bellec
// et de Pentrez. Retenus avec une seule source de pêche (signalé dans la fiche, à confirmer sur place) :
// pointe de Lostmarc'h, pointe de Leydé, pointe de Trénaouret.
// Non retenus : cap de la Chèvre (« pas très accessible et pas de fond » selon un pêcheur, carnalor 2012),
// pointe de Saint-Hernot (« désormais fermée aux piétons », visorando), port du Rosmeur (les sources parlent
// de pêche à l'appât, pas au leurre), île de l'Aber, plages du Ris et de Trezmalaouen (une seule source),
// pointe de Luguénez (source de chasse sous-marine seulement).
// Tout le secteur est au nord du 48e parallèle (zone CIEM 7) : 3 bars par jour, pêcher-relâcher en février-mars.
export const SITE = {
  id: "crozon",
  name: "Crozon",
  region: "Presqu'île de Crozon et baie de Douarnenez, Finistère",
  dept: "29160",
  headerLabel: "CROZON · DOUARNENEZ",
  // Position du port de Morgat (Google Maps) : requise pour le calcul solaire réel.
  lat: 48.2234656, lon: -4.4975814,
  tidePort: "Morgat",
  tideSources: "constantes TICON-4 (Brest) ; ports secondaires ajustés sur les tables publiées par marine.meteoconsult.fr (données SHOM) : Morgat, Douarnenez",
  weatherSources: "Open-Meteo (AROME, ECMWF), modèle de vagues Open-Meteo",
  zones: {
    local: { label: "Presqu'île de Crozon", anchor: "Crozon / Morgat (29160)", sea: "open" },
    inter: { label: "Nord et fond de la baie de Douarnenez", anchor: "Telgruc-sur-Mer / Saint-Nic (29560, 29550)", sea: "open" },
    far:   { label: "Douarnenez et Cap Sizun nord", anchor: "Douarnenez / Beuzec-Cap-Sizun (29100, 29790)", sea: "open" },
  },
  // Marnage moyen morte-eau ↔ vive-eau à Morgat (coefficients 45 et 95) : moyenne 2026 du calcul de marée,
  // cohérente avec les tables d'octobre et novembre 2026.
  marnage: { neap: 2.7, spring: 5.6 },
  preyCalendar: [
    { name:"Crevette (bouquet, grise)", couche:"sous-surface", months:[1,2,3,4,5,6,7,8,9,10,11,12], weight:2,
      size:"3-7 cm", guidance:"Profil court et discret. Souple 8-10 cm animé lentement sur les bordures de roche et de goémon." },
    { name:"Lançon / équille", couche:"sous-surface", months:[4,5,6,7,8,9], weight:5,
      size:"8-15 cm", guidance:"La proie reine de l'été sur les plages de sable. Profils fins et allongés : souple fin, stickbait élancé." },
    { name:"Alevins de mulet", couche:"surface", months:[6,7,8,9], weight:3,
      size:"3-8 cm", guidance:"Bancs en surface près des bordures et des ports. Petit stickbait ou souple weightless au bord du banc." },
    { name:"Gobies et blennies", couche:"fond", months:[1,2,3,4,5,6,7,8,9,10,11,12], weight:2,
      size:"5-10 cm", guidance:"Proie de fond permanente des côtes rocheuses. Souple plombé ou texan gratté sur les plaques de sable entre les roches." },
    { name:"Sardine", couche:"mi-eau", months:[6,7,8,9,10], weight:4,
      size:"15-20 cm", guidance:"Source peche.com : en présence de sardines, monter en taille (souple de 14 cm sur tête de 20 g en linéaire). Les oiseaux restent le meilleur indicateur de chasse." },
    { name:"Sprat", couche:"mi-eau", months:[10,11,12,1,2,3], weight:4,
      size:"8-12 cm", guidance:"Bancs d'hiver. Shad de 10 cm plombé de 12 à 25 g selon profondeur et courant (peche.com). Suivre les oiseaux." },
  ],
  seedJournal: [],
  // ── Marée : calculée localement ─────────────────────────────────
  // Aucun marégraphe TICON-4 en baie de Douarnenez : Morgat et Douarnenez sont ajustés sur Brest avec les tables
  // d'octobre 2026, puis contrôlés sur novembre 2026 (mois jamais utilisé pour l'ajustement).
  tide: {
    defaultPort: "morgat",
    ports: {
      morgat: { label: "Morgat", kind: "secondary", ref: "brest", lagH: -0.16,
        hw: { t: [-9.96709, 0.03835], h: [3.90296, 0.94187] }, lw: { t: [-11.7253, -1.11737], h: [3.88416, 0.95311] },
        accuracy: "contrôlée contre les tables SHOM : ±4,0 min · ±3 cm (novembre 2026, mois de contrôle)" },
      douarnenez: { label: "Douarnenez", kind: "secondary", ref: "brest", lagH: -0.16,
        hw: { t: [-15.51192, 1.31544], h: [3.90579, 0.91951] }, lw: { t: [-13.13936, -1.02455], h: [3.88936, 0.98573] },
        accuracy: "contrôlée contre les tables SHOM : ±3,8 min · ±3 cm (novembre 2026, mois de contrôle)" },
    },
  },
  sstTypical: [10, 17],
};

// ═══════════════════════════════════════════════════════════════════
// PRINCIPES DE PÊCHE DU SECTEUR (sourcés)
// ═══════════════════════════════════════════════════════════════════
export const GENERAL_PRINCIPLES = {
  title: "Principes de la pêche du bar du bord en baie de Douarnenez",
  items: [
    {
      rule: "Les pointes : des zones de passage, à balayer",
      source: "pecheaubar.com — « La Pêche au bar en Bretagne : Douarnenez » (mod. 15/10/2026)",
      explain: "« Toutes les pointes peuvent être considérées comme des zones de passage, vous trouverez une solution pour descendre sur la plupart d'entre elles. » « Le but ici est de balayer une zone ou nous savons que les bars vont passer à un moment ou à un autre » ; « On privilégiera alors des leurres à bavette classiques qui peignent toute la couche d'eau » ; « Souvent le passage ne durera qu'un quart d'heure ». Repérer à marée basse les roches creuses et les failles où « certains bars élisent temporairement domicile ».",
    },
    {
      rule: "Plateaux rocheux : courant de travers, forts coefficients, petite houle",
      source: "pecheaubar.com — « La Pêche au bar en Bretagne : Douarnenez »",
      explain: "Chercher des « plateaux rocheux perpendiculaires à la côte et légèrement immergés (entre 50 cm et 3 m) » ; le courant « devra aborder le plateau par le travers », « surtout lors des forts coefficients » ; « Une petite à moyenne houle semble encore donner une autre dimension à ce type de poste ». Le repérage à marée basse est « essentiel ».",
    },
    {
      rule: "Les plages : fond de baie et côte nord, de préférence battues par la houle",
      source: "pecheaubar.com — « La Pêche au bar en Bretagne : Douarnenez » ; peche-poissons.com — J.-B. Vidal (19/10/2026)",
      explain: "Les plages, « peu nombreuses sur la façade sud », « sont surtout situées en fond de baie et sur le secteur nord » ; « Ce sont des secteurs assez réguliers où se concentrent souvent d'importants bancs de bars » ; « vous aurez intérêt à opter pour une plage battue par la houle (dans la limite du raisonnable) ». Vidal : « J'ai pris des bars sur chaque plage où j'ai pu pêcher entre Crozon et Quimperlé. » Les deux sources décrivent ici le surfcasting ou la pêche en général : au leurre, la règle des vagues du guide s'applique.",
    },
    {
      rule: "Coup du soir sur les rochers : de grands leurres pour les gros bars",
      source: "Le blog de Breizh pêche 29 — G. Rognant, guide de pêche, « Coup du soir en baie de Douarnenez » (01/05/2009)",
      explain: "Sortie du bord sur les rochers, au coucher du soleil, shad travaillé dans les vagues à quelques mètres : « seuls les leurres de bonne taille (plus 15 cm) prennent des poissons de plus de deux kilos » ; avec des leurres plus petits, des bars de 45 à 50 cm.",
    },
    {
      rule: "La marée : une règle générale, à recaler poste par poste",
      source: "peche-poissons.com — J.-B. Vidal, « Bar en Bretagne… où, quand, comment ? » (19/10/2026)",
      explain: "Règle générale pour le bar en Bretagne, pas propre à ce secteur : « souvent les 3 premières heures de montantes et 3 dernières heures de descendantes », coefficients « de 50 à 80 » ; les phases « vont dépendre de chaque coin ». Quand une fiche n'a pas de source locale pour la marée, ses créneaux viennent de cette règle et le disent.",
    },
    {
      rule: "Sécurité : falaises et déferlantes",
      source: "pecheaubar.com — « La Pêche au bar en Bretagne : Douarnenez »",
      explain: "« De nombreux secteurs sont dangereux : risques de chute depuis la falaise ou déferlantes méchantes… » ; les pêches de roche sont « à aborder de préférence depuis le bord ».",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// 7 SPOTS — chaque champ marqué par niveau de confiance
// Distances : estimées depuis Crozon (vol d'oiseau × 1,4, à 50 km/h) ; pour Douarnenez et le cap Sizun, par la
// route du fond de baie (Plomodiern, Plonévez-Porzay), segments à vol d'oiseau × 1,2. À corriger avec ton expérience.
// ═══════════════════════════════════════════════════════════════════
export const SPOTS = [

  // ══════════════════════════════════════════════════════════
  // 1. POINTE DE DINAN (Crozon, côte atlantique)
  // ══════════════════════════════════════════════════════════
  {
    id:"dinan", tidePort:"morgat", zone:"local", isLocal:true, dangerLevel:3,
    name:"Pointe de Dinan", subtitle:"Château de Dinan, Crozon, côte atlantique",
    distance:"≈ 10 min", distMin:10, coords:"48°13,9'N 4°34,3'W", lat:48.231902, lon:-4.570842,
    type:"POINTE ROCHEUSE / FALAISE", color:"#f97316",
    terrain:{
      fond:"Éboulis, langues de sable et laminaires au pied de la falaise, de 5 à 15 m de fond (lechasseursousmarin.com) ; pointe prolongée par l'arche du « château de Dinan ».",
      encombrement:3,
      gratter:"non",
      prof:{ cls:"tombant", why:"« Profondeur 5 à 15 m » sur le parcours de chasse sous-marine de la pointe (lechasseursousmarin.com)." },
      couches:["surface", "sous-surface", "mi-eau"],
      montage:"Leurre de surface ou souple pour le bar (carnet-de-peche.com) ; pêche en surplomb (carnalor, 2012) : pas de grattage dans les éboulis et les laminaires.",
      conseils:[
        "Le poste cité par un pêcheur : « à la pointe de Dinan à gauche là où il y a la grosse grotte » (carnalor, 2012).",
        "Début de descendante, à l'aube et au crépuscule en été, « surtout au coefficient » (carnet-de-peche.com).",
        "Spot engagé : falaise, ressac et retour de vague, zone isolée ; descendre « prudemment » par des sentes raides (carnet-de-peche.com).",
      ],
      confidence:"verified",
      source:"mieuxpecher, carnet-de-peche.com, carnalor (forum), lechasseursousmarin.com",
      faits:[
        { t:"« Les environs du château de Dinan à Crozon » parmi les coins de pêche du bord.", s:"mieuxpecher.com — « Coins de pêche – Finistère NORD » (Norbert, 10/05/2018, mod. 16/10/2018)" },
        { t:"Bar, lieu jaune et vieille ; leurres de surface ou souples pour le bar ; « surtout au coefficient et en début de descendante d'été à l'aube/au crépuscule » ; difficulté 5/5, « du costaud, difficulté justifiée » ; falaise, ressac et retour de vague, zone isolée.", s:"carnet-de-peche.com — Pointe de Dinan (page sans auteur)" },
        { t:"« a la pointe de dinan a gauche la ou il y a la grosse grotte je dis bien cote gauche » ; on y pêche « en surplomb », « gaffe aux lames ».", s:"carnalor.com — forum, sujet « crozon rade de brest » (Guy535, 15/03/2012)" },
        { t:"Bars et mulets « solitaires », bars dans les laminaires ; « Profondeur 5 à 15 m », parmi « les éboulis et les langues de sable » ; « Force du courant nul à faible ».", s:"lechasseursousmarin.com — Pointe de Dinan (S. Rigolle et S. Chillou, 26/11/2025)" },
        { t:"Accès : route de Camaret vers Dinan, parking au bout ; environ 500 m à pied par le GR34 jusqu'à la pointe ; « Descends prudemment vers les postes rocheux en contrebas (sentes raides) ».", s:"carnet-de-peche.com — Pointe de Dinan" },
        { t:"Position de la pointe : 48,231902 / -4,570842 ; parking de la pointe sur la D308.", s:"Google Maps — Pointe de Dinan, Parking Pointe de Dinan" },
      ],
    },
    coefBand:[40,60,95,110],
    houleMax:1.5,
    exposedAngles:[247.5,270,292.5,315], shelteredAngles:[67.5,90,112.5],
    weatherNote:"Pointe de la côte atlantique de la presqu'île, tournée vers l'ouest (déduit de la carte) : vent et houle d'ouest de face, vent d'est de dos. Houle maximale de 1,5 m : seuil prudent du guide pour un spot en surplomb (« gaffe aux lames »).",
    sources:[
      "mieuxpecher.com — « Coins de pêche – Finistère NORD » : château de Dinan",
      "carnet-de-peche.com — Pointe de Dinan",
      "carnalor.com — forum « crozon rade de brest » (Guy535, 2012)",
      "lechasseursousmarin.com — Pointe de Dinan",
      "Google Maps — position de la pointe et du parking",
    ],
    topology:{
      fond:{ text:"Éboulis, langues de sable, laminaires, 5 à 15 m (lechasseursousmarin).", confidence:"verified" },
      structure:{ text:"Pointe à falaises et arche du château de Dinan ; grande grotte côté gauche (carnalor).", confidence:"verified" },
      exposition:{ text:"Ouest, face à l'Iroise. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"« Nul à faible » (lechasseursousmarin).", confidence:"verified" },
      bars:{ text:"Bar au leurre de surface ou souple (carnet-de-peche) ; bars dans les laminaires (lechasseursousmarin).", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"DÉBUT DE DESCENDANTE, AUBE ET CRÉPUSCULE",
      montantOuDescendant:"« Surtout au coefficient et en début de descendante d'été à l'aube/au crépuscule » (carnet-de-peche.com).",
      description:"Pointe en surplomb sur 5 à 15 m d'eau : le début du jusant, aux heures de faible lumière.",
      windows:[
        { id:"dn1", label:"Début de descendant (PM → PM+3)", phase:"pm", offsetBefore:0.0, offsetAfter:3.0, tidePhaseType:"descendant", priority:"prime",
          note:"La phase citée par la fiche (carnet-de-peche.com), à l'aube ou au crépuscule." },
        { id:"dn2", label:"Montant, règle générale (BM → BM+3)", phase:"bm", offsetBefore:0.0, offsetAfter:3.0, tidePhaseType:"montant", priority:"bon",
          note:"Règle générale du bar en Bretagne (Vidal), non propre à ce poste." },
      ],
      lifeHack:"Marée de Morgat, port contrôlé le plus proche (5,5 km) : l'heure du poste en diffère de quelques minutes au plus (déduit).",
    },
    lures:[
      { name:"Stickbait 110-130 mm", color:"Naturel / ghost", weight:"14-27 g", technique:"Aube et crépuscule, en début de descendante (carnet-de-peche.com)." },
      { name:"Souple 12-15 cm tête plombée", color:"Naturel", weight:"tête 15-25 g", technique:"Le long des éboulis, sans gratter : laminaires et roches." },
    ],
    access:"Route de Camaret vers Dinan, parking au bout (D308) ; environ 500 m à pied par le GR34 jusqu'à la pointe, puis des sentes raides vers les postes rocheux (carnet-de-peche.com).",
    securite:[
      { t:"Falaise, ressac et retour de vague, zone isolée : descendre prudemment par les sentes raides.", s:"carnet-de-peche.com — Pointe de Dinan" },
      { t:"On pêche en surplomb : « gaffe aux lames ».", s:"carnalor.com (Guy535, 15/03/2012)" },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 2. POINTE DE LOSTMARC'H (Crozon, côte atlantique)
  // ══════════════════════════════════════════════════════════
  {
    id:"lostmarch", tidePort:"morgat", zone:"local", isLocal:true, dangerLevel:3,
    name:"Pointe de Lostmarc'h", subtitle:"Éperon entre deux plages, Crozon, côte atlantique",
    distance:"≈ 10 min", distMin:9, coords:"48°12,7'N 4°33,4'W", lat:48.212332, lon:-4.55735,
    type:"POINTE ROCHEUSE / FALAISE", color:"#fb923c",
    terrain:{
      fond:"Pointe de laves sous-marines en coussins et de brèches, avec une plage de galets suspendue dans des cavités (réserve naturelle) ; plages de sable de part et d'autre (Google Maps). Fond devant la pointe non décrit.",
      encombrement:2,
      gratter:"non",
      prof:{ cls:"tombant", why:"Pointe à falaises de la côte atlantique : eau profonde au pied supposée (déduit, aucune sonde)." },
      couches:["surface", "sous-surface", "mi-eau"],
      montage:"Leurres de passage qui peignent la couche d'eau (règle des pointes du secteur, pecheaubar) ; pas de grattage sur un fond non décrit.",
      conseils:[
        "Une seule source de pêche (mieuxpecher, liste sans détail) : poste à confirmer sur place.",
        "Réserve naturelle : la pêche y est autorisée selon la réglementation en vigueur ; ne rien prélever sur les roches.",
      ],
      confidence:"inference",
      source:"mieuxpecher, réserve naturelle de la presqu'île de Crozon, Google Maps",
      faits:[
        { t:"« Les abords de la Pointe de Lostmarc'h à Crozon » parmi les coins de pêche du bord (liste sans détail).", s:"mieuxpecher.com — « Coins de pêche – Finistère NORD » (Norbert, 2018)" },
        { t:"« La pêche (à pied, sous-marine, …) est autorisée selon la réglementation en vigueur » ; interdits : « Extraction et prélèvement de roches », feu, camping, véhicules à moteur.", s:"Réserve naturelle régionale de la presqu'île de Crozon — fiche du site de Lostmarc'h (2018)" },
        { t:"« coulées de lave sous-marines avec un débit en « coussins » » et brèches sur l'éperon sud ; plage de galets suspendue dans des cavités karstiques.", s:"Réserve naturelle régionale de la presqu'île de Crozon — fiche du site de Lostmarc'h" },
        { t:"Position de la pointe : 48,212332 / -4,55735 ; parking de la plage de Lostmarc'h à 48,2145 / -4,5454.", s:"Google Maps — Pointe de Lostmarc'h, Parking plage de Lostmarc'h" },
      ],
    },
    coefBand:[30,50,80,100],
    houleMax:1.5,
    exposedAngles:[225,247.5,270,292.5], shelteredAngles:[45,67.5,90],
    weatherNote:"Éperon de la côte atlantique tourné vers l'ouest et le sud-ouest (déduit de la carte) : houle d'ouest de face. Houle maximale de 1,5 m : seuil prudent du guide (falaises, aucune source sur la houle).",
    sources:[
      "mieuxpecher.com — « Coins de pêche – Finistère NORD » : pointe de Lostmarc'h",
      "Réserve naturelle régionale de la presqu'île de Crozon — fiche Lostmarc'h",
      "Google Maps — positions",
    ],
    topology:{
      fond:{ text:"Laves en coussins et brèches (réserve) ; fond sous l'eau non décrit.", confidence:"inference" },
      structure:{ text:"Éperon rocheux entre deux plages (réserve, Google Maps).", confidence:"verified" },
      exposition:{ text:"Ouest à sud-ouest. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"Pas de source.", confidence:"inference" },
      bars:{ text:"Une seule source, sans détail (mieuxpecher).", confidence:"inference" },
    },
    tidalRules:{
      typeHeure:"RÈGLE GÉNÉRALE (À RECALER)",
      montantOuDescendant:"Aucune source locale : règle générale du bar en Bretagne (Vidal), les 3 premières heures de montante et les 3 dernières de descendante.",
      description:"Pointe sans source sur la marée : créneaux de la règle générale.",
      windows:[
        { id:"lm1", label:"Montant, règle générale (BM → BM+3)", phase:"bm", offsetBefore:0.0, offsetAfter:3.0, tidePhaseType:"montant", priority:"prime",
          note:"Règle générale (Vidal), non propre à ce poste." },
        { id:"lm2", label:"Fin de descendant, règle générale (BM−3 → BM)", phase:"bm", offsetBefore:-3.0, offsetAfter:0.0, tidePhaseType:"descendant", priority:"bon",
          note:"Règle générale (Vidal), non propre à ce poste." },
      ],
      lifeHack:"Note dans ton journal la phase de tes touches : c'est la seule façon de recaler ce poste.",
    },
    lures:[
      { name:"Poisson nageur à bavette 120-140 mm", color:"Naturel", weight:"18-25 g", technique:"Balayer la zone de passage devant la pointe (règle des pointes, pecheaubar)." },
      { name:"Stickbait 110-130 mm", color:"Ghost / sardine", weight:"14-27 g", technique:"Aube ou crépuscule, mer maniable." },
    ],
    access:"Parking de la plage de Lostmarc'h, puis le sentier vers la pointe (Google Maps) ; la fiche de la réserve donne l'accès depuis Crozon par la route du cap de la Chèvre, puis Kerglintin et Lostmarc'h.",
    securite:[
      { t:"« De nombreux secteurs sont dangereux : risques de chute depuis la falaise ou déferlantes méchantes… » (secteur de Douarnenez et Crozon).", s:"pecheaubar.com — « La Pêche au bar en Bretagne : Douarnenez »" },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 3. POINTE DE MORGAT (Kador) ET ABORDS DU PORT
  // ══════════════════════════════════════════════════════════
  {
    id:"morgat", tidePort:"morgat", zone:"local", isLocal:true, dangerLevel:2,
    name:"Pointe de Morgat", subtitle:"Pointe du Kador et abords du port, Crozon",
    distance:"≈ 5 min", distMin:4, coords:"48°13,3'N 4°29,6'W", lat:48.2210367, lon:-4.492986,
    type:"POINTE ROCHEUSE + PORT", color:"#38bdf8",
    terrain:{
      fond:"Îlots et pied de falaise, limite roche–sable, de 2 à 10 m de fond (lechasseursousmarin.com) ; grottes marines en contrebas de la pointe (CNCM, « Les sentiers de Morgat »).",
      encombrement:2,
      gratter:"texan",
      prof:{ cls:"peu", why:"« Profondeur 2 à 10 m » le long de la pointe (lechasseursousmarin.com) : peu d'eau près des roches, davantage au large des îlots." },
      couches:["surface", "sous-surface", "mi-eau", "fond"],
      montage:"Souple sur tête légère ou texan le long de la limite roche–sable ; surface au pied des îlots.",
      conseils:[
        "« Bars et mulets en vadrouille, notamment à pleine mer » au pied des îlots (lechasseursousmarin.com).",
        "Courant faible : un poste abrité de la presqu'île quand l'ouest est trop fort (déduit de la carte).",
      ],
      confidence:"verified",
      source:"mieuxpecher, lechasseursousmarin.com, CNCM (sentiers de Morgat), visorando",
      faits:[
        { t:"« La Pointe et les abords du port de plaisance de Morgat » parmi les coins de pêche du bord.", s:"mieuxpecher.com — « Coins de pêche – Finistère NORD » (Norbert, 2018)" },
        { t:"« bars et mulets en vadrouille, notamment à pleine mer » au pied des îlots ; « Profondeur 2 à 10 m » ; « Force du courant faible » ; prospection « proche de la limite roche sable ».", s:"lechasseursousmarin.com — Pointe de Morgat (H. Maldent, 25/11/2025)" },
        { t:"Le GR34 part du port de Morgat, face au vieux môle, et monte au fort et à la maison-phare du Kador ; en contrebas, des grottes marines (grotte Sainte-Marine, grotte des Normands, cheminées du diable) ; sentier « dévié en raison de l'érosion de ces cheminées ».", s:"CNCM — « Les sentiers de Morgat » (2020)" },
        { t:"Position de la pointe (Beg ar Gador) : 48,2210367 / -4,492986.", s:"Google Maps — Pointe de Morgat ou Beg ar Gador" },
      ],
    },
    coefBand:[30,45,80,100],
    houleMax:2.0,
    exposedAngles:[90,112.5,135,157.5], shelteredAngles:[270,292.5,315],
    weatherNote:"La pointe ferme l'anse de Morgat, ouverte à l'est et au sud-est sur la baie de Douarnenez (déduit de la carte) : vent d'est de face, vent d'ouest abrité par la presqu'île.",
    sources:[
      "mieuxpecher.com — « Coins de pêche – Finistère NORD » : pointe et port de Morgat",
      "lechasseursousmarin.com — Pointe de Morgat",
      "CNCM — « Les sentiers de Morgat »",
      "Google Maps — position",
    ],
    topology:{
      fond:{ text:"Limite roche–sable, 2 à 10 m (lechasseursousmarin).", confidence:"verified" },
      structure:{ text:"Pointe à falaises et grottes, îlots, port de plaisance (CNCM, lechasseursousmarin).", confidence:"verified" },
      exposition:{ text:"Est à sud-est, abritée de l'ouest. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"« Faible » (lechasseursousmarin).", confidence:"verified" },
      bars:{ text:"Pointe et abords du port cités (mieuxpecher) ; bars notamment à pleine mer (lechasseursousmarin).", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"AUTOUR DE LA PLEINE MER",
      montantOuDescendant:"Bars « notamment à pleine mer » au pied des îlots (lechasseursousmarin.com) ; le reste du cycle n'est pas documenté.",
      description:"Pointe abritée, peu de courant : la pleine mer remplit le pied des îlots et des roches.",
      windows:[
        { id:"mg1", label:"Pleine mer (PM−2 → PM+1)", phase:"pm", offsetBefore:-2.0, offsetAfter:1.0, tidePhaseType:"variable", priority:"prime",
          note:"Pied des îlots et limite roche–sable (lechasseursousmarin.com)." },
        { id:"mg2", label:"Montant, règle générale (BM → BM+3)", phase:"bm", offsetBefore:0.0, offsetAfter:3.0, tidePhaseType:"montant", priority:"bon",
          note:"Règle générale du bar en Bretagne (Vidal), non propre à ce poste." },
      ],
      lifeHack:"Marée de Morgat : le port de référence est au pied du poste.",
    },
    lures:[
      { name:"Souple 10-12 cm tête plombée", color:"Naturel", weight:"tête 7-15 g", technique:"Limite roche–sable, à pleine mer." },
      { name:"Stickbait 110-130 mm", color:"Ghost / sardine", weight:"14-27 g", technique:"Au pied des îlots, aube ou crépuscule." },
    ],
    access:"Depuis le port de Morgat : le GR34 part face au vieux môle (escalier) et monte au fort et à la maison-phare du Kador (CNCM).",
    securite:[
      { t:"Sentier côtier dévié à cause de l'érosion des « cheminées » (grottes verticales) : suivre les déviations sur place.", s:"CNCM — « Les sentiers de Morgat » ; visorando — « Tour du cap de la Chèvre depuis Morgat »" },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 4. PLAGE DE TREZ BELLEC (Telgruc-sur-Mer)
  // ══════════════════════════════════════════════════════════
  {
    id:"trezbellec", tidePort:"morgat", zone:"inter", isLocal:false, dangerLevel:1,
    name:"Plage de Trez Bellec", subtitle:"Telgruc-sur-Mer, nord de la baie de Douarnenez",
    distance:"≈ 15 min", distMin:15, coords:"48°12,9'N 4°22,5'W", lat:48.2141993, lon:-4.3742625,
    type:"PLAGE", color:"#22c55e",
    terrain:{
      fond:"Plage de sable bordée d'un liseré de galets, au sable « particulièrement dur et plat à marée basse » ; tournée vers la baie de Douarnenez, « protégée des courants, mais pas des courants d'air » (plages.tv).",
      encombrement:1,
      gratter:"oui",
      prof:{ cls:"estran", why:"Sable « dur et plat à marée basse » (plages.tv) : très peu d'eau au bord à basse mer." },
      couches:["surface", "sous-surface", "mi-eau", "fond"],
      montage:"Souple léger ou leurre de surface dans les vagues du bord ; le sable permet de gratter.",
      conseils:[
        "Plage citée pour le bar au surfcasting (chtipecheur) et par un pêcheur de la presqu'île (carnalor) : au leurre, chercher les jours de petite houle (règle des plages du secteur, pecheaubar).",
        "Plage de char à voile, de kitesurf et de surf : pêcher tôt ou tard.",
      ],
      confidence:"verified",
      source:"chtipecheur, carnalor (forum), plages.tv, pecheaubar",
      faits:[
        { t:"« Plages du Ris, Trezmalaouen, Pentrez et Trezbellec » : surfcasting, bars.", s:"chtipecheur.com — « Spots de pêche de Bretagne » (JC59110, mod. 16/04/2026)" },
        { t:"« s'il y a du bar essayez l'ile de l'aber avant crozon » ; « la plage de Telgruc , de l'aber , trez bien a coté ».", s:"carnalor.com — forum « crozon rade de brest » (Guy535, 19/03/2012)" },
        { t:"Sable « bordé d'un liseré de galets qui seul perdure à marée très haute » ; « tournée vers la baie de Douarnenez » ; « protégée des courants, mais pas des courants d'air » ; sable « dur et plat à marée basse » ; pêche possible.", s:"plages.tv — Plage de Trez Bellec à Telgruc-sur-Mer" },
        { t:"Position : 48,2141993 / -4,3742625.", s:"Google Maps — Plage de Trez-Bellec" },
      ],
    },
    coefBand:[30,50,80,100],
    houleMax:2.5,
    exposedAngles:[180,202.5,225,247.5], shelteredAngles:[0,22.5,45],
    weatherNote:"Plage du nord de la baie, tournée vers le sud et le sud-ouest (déduit de la carte et de plages.tv) : vent et houle de sud-ouest de face, vent de nord de dos.",
    sources:[
      "chtipecheur.com — « Spots de pêche de Bretagne » : plages de la baie de Douarnenez",
      "carnalor.com — forum « crozon rade de brest » (Guy535, 2012)",
      "plages.tv — Plage de Trez Bellec",
      "Google Maps — position",
    ],
    topology:{
      fond:{ text:"Sable dur et plat, liseré de galets (plages.tv).", confidence:"verified" },
      structure:{ text:"Grande plage de sable du nord de la baie.", confidence:"verified" },
      exposition:{ text:"Sud à sud-ouest, face à la baie. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"« Protégée des courants » (plages.tv).", confidence:"verified" },
      bars:{ text:"Plage à bars au surfcasting (chtipecheur) ; citée par un pêcheur local (carnalor).", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"RÈGLE GÉNÉRALE (À RECALER)",
      montantOuDescendant:"Aucune source sur la phase : règle générale du bar en Bretagne (Vidal). Le bon moment de chaque plage s'apprend en quelques sorties.",
      description:"Plage plate : le flot ramène le poisson sur le bord.",
      windows:[
        { id:"tb1", label:"Montant, règle générale (BM → BM+3)", phase:"bm", offsetBefore:0.0, offsetAfter:3.0, tidePhaseType:"montant", priority:"prime",
          note:"Règle générale (Vidal), non propre à cette plage." },
        { id:"tb2", label:"Fin de descendant, règle générale (BM−3 → BM)", phase:"bm", offsetBefore:-3.0, offsetAfter:0.0, tidePhaseType:"descendant", priority:"bon",
          note:"Règle générale (Vidal), non propre à cette plage." },
      ],
      lifeHack:"Marée de Morgat (13 km) : l'heure du poste en diffère de quelques minutes au plus (déduit).",
    },
    lures:[
      { name:"Souple 10-12 cm tête légère", color:"Naturel / blanc", weight:"tête 7-15 g", technique:"Dans les vagues du bord, à la montante." },
      { name:"Stickbait 110-130 mm", color:"Ghost", weight:"14-27 g", technique:"Aube ou crépuscule, petite houle." },
    ],
    access:"Plage de Trez Bellec, D208, Telgruc-sur-Mer ; parkings (plages.tv).",
    securite:[],
  },

  // ══════════════════════════════════════════════════════════
  // 5. PLAGE DE PENTREZ (Saint-Nic)
  // ══════════════════════════════════════════════════════════
  {
    id:"pentrez", tidePort:"douarnenez", zone:"inter", isLocal:false, dangerLevel:1,
    name:"Plage de Pentrez", subtitle:"Saint-Nic, fond de la baie de Douarnenez",
    distance:"≈ 25 min", distMin:25, coords:"48°11,7'N 4°18,3'W", lat:48.195427, lon:-4.304321,
    type:"PLAGE", color:"#4ade80",
    terrain:{
      fond:"Grande plage de sable fin de 4 km avec Lestrevet, très large à marée basse ; falaises à grottes au nord vers l'anse de Caméros (plages.tv) ; l'une des plages « les plus plates » du secteur (pecheaubar).",
      encombrement:1,
      gratter:"oui",
      prof:{ cls:"estran", why:"Plage « très très large par grande marée » (plages.tv), parmi « les plus plates » (pecheaubar) : très peu d'eau au bord à basse mer." },
      couches:["surface", "sous-surface", "mi-eau", "fond"],
      montage:"Souple léger ou leurre de surface dans les vagues ; le sable permet de gratter.",
      conseils:[
        "Les sources la citent pour le surfcasting (« pêche lourde à reculer », pecheaubar ; chtipecheur) : au leurre, la règle des plages battues par la houle s'applique (pecheaubar).",
        "Zone de kitesurf, spot de surf et de char à voile, surveillée l'été (plages.tv) : pêcher tôt ou tard.",
      ],
      confidence:"verified",
      source:"pecheaubar, chtipecheur, plages.tv",
      faits:[
        { t:"« On pratiquera de préférence une pêche lourde à reculer sur les plages les plus plates (Pentrez par exemple) ».", s:"pecheaubar.com — « La Pêche au bar en Bretagne : Douarnenez » (mod. 15/10/2026)" },
        { t:"« Plages du Ris, Trezmalaouen, Pentrez et Trezbellec » : surfcasting, bars.", s:"chtipecheur.com — « Spots de pêche de Bretagne » (JC59110, mod. 16/04/2026)" },
        { t:"« une belle et grande plage de Pentrez de 4 km de sable fin » ; environ 2,5 km de sable continu à marée haute ; surveillée l'été ; zone de kitesurf, spot de surf, char à voile ; pêche possible.", s:"plages.tv — Plage de Pentrez à Saint-Nic" },
        { t:"Position : 48,195427 / -4,304321.", s:"Google Maps — Plage de Pentrez" },
      ],
    },
    coefBand:[30,50,80,100],
    houleMax:2.5,
    exposedAngles:[247.5,270,292.5], shelteredAngles:[67.5,90,112.5],
    weatherNote:"Plage du fond de baie tournée vers l'ouest, vers l'entrée de la baie (déduit de la carte) : la houle d'ouest y arrive de face, le vent d'est est de dos.",
    sources:[
      "pecheaubar.com — « La Pêche au bar en Bretagne : Douarnenez » : Pentrez",
      "chtipecheur.com — « Spots de pêche de Bretagne » : plages de la baie de Douarnenez",
      "plages.tv — Plage de Pentrez",
      "Google Maps — position",
    ],
    topology:{
      fond:{ text:"Sable fin, très plat (plages.tv, pecheaubar).", confidence:"verified" },
      structure:{ text:"Plage de 4 km, falaises à grottes au nord (plages.tv).", confidence:"verified" },
      exposition:{ text:"Ouest, vers l'entrée de la baie. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"Pas de source.", confidence:"inference" },
      bars:{ text:"Plage à bars au surfcasting (pecheaubar, chtipecheur).", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"RÈGLE GÉNÉRALE (À RECALER)",
      montantOuDescendant:"Aucune source sur la phase : règle générale du bar en Bretagne (Vidal). Le bon moment de chaque plage s'apprend en quelques sorties.",
      description:"Plage très plate : le flot couvre vite l'estran.",
      windows:[
        { id:"pz1", label:"Montant, règle générale (BM → BM+3)", phase:"bm", offsetBefore:0.0, offsetAfter:3.0, tidePhaseType:"montant", priority:"prime",
          note:"Règle générale (Vidal), non propre à cette plage." },
        { id:"pz2", label:"Fin de descendant, règle générale (BM−3 → BM)", phase:"bm", offsetBefore:-3.0, offsetAfter:0.0, tidePhaseType:"descendant", priority:"bon",
          note:"Règle générale (Vidal), non propre à cette plage." },
      ],
      lifeHack:"Plage très plate : à la montante, reculer avec le flot, qui monte vite sur un estran aussi large.",
    },
    lures:[
      { name:"Souple 10-12 cm tête légère", color:"Naturel / blanc", weight:"tête 7-15 g", technique:"Dans les vagues du bord, à la montante." },
      { name:"Stickbait 110-130 mm", color:"Ghost", weight:"14-27 g", technique:"Aube ou crépuscule, petite houle." },
    ],
    access:"Chemin des Dunes, Saint-Nic ; parkings gratuits et payants (plages.tv).",
    securite:[
      { t:"Zone de kitesurf et de char à voile à marée basse : partager l'estran.", s:"plages.tv — Plage de Pentrez" },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 6. POINTE DE LEYDÉ (Douarnenez, Tréboul)
  // ══════════════════════════════════════════════════════════
  {
    id:"leyde", tidePort:"douarnenez", zone:"far", isLocal:false, dangerLevel:2,
    name:"Pointe de Leydé", subtitle:"Sentier des Roches Blanches, Tréboul (Douarnenez)",
    distance:"≈ 50 min", distMin:50, coords:"48°06,5'N 4°21,8'W", lat:48.1091391, lon:-4.3629178,
    type:"POINTE ROCHEUSE", color:"#a78bfa",
    terrain:{
      fond:"Pointe rocheuse au bout du sentier des Roches Blanches (GR34), à l'ouest de Tréboul (Google Maps). Fond non décrit.",
      encombrement:2,
      gratter:"non",
      prof:{ cls:"peu", why:"Aucune sonde : pointe de la côte sud de la baie, profondeur supposée moyenne (déduit)." },
      couches:["surface", "sous-surface", "mi-eau"],
      montage:"Leurres de passage qui peignent la couche d'eau (règle des pointes du secteur, pecheaubar) ; pas de grattage sur un fond non décrit.",
      conseils:[
        "Une seule source de pêche (mieuxpecher, liste sans détail) : poste à confirmer sur place.",
        "La houle de la baie y arrive : un pic de surf porte son nom (« Les Roches Blanches – le Leydé », surf-forecast).",
      ],
      confidence:"inference",
      source:"mieuxpecher, surf-forecast, Google Maps",
      faits:[
        { t:"« La Pointe de Leydé » parmi les coins de pêche du bord (liste sans détail).", s:"mieuxpecher.com — « Coins de pêche – Finistère NORD » (Norbert, 2018)" },
        { t:"Pic de surf « Les Roches Blanches – le Leydé ».", s:"surf-forecast.com — Les Roches Blanches (le Leydé)" },
        { t:"Position de la pointe : 48,1091391 / -4,3629178 ; petit parking gratuit, route des Roches Blanches, accès direct au GR34.", s:"Google Maps — Pointe de Leydé, parking route des Roches Blanches" },
      ],
    },
    coefBand:[30,50,80,100],
    houleMax:2.0,
    exposedAngles:[292.5,315,337.5,0], shelteredAngles:[135,157.5,180],
    weatherNote:"Pointe de la côte sud de la baie, tournée vers le nord-ouest et l'entrée de la baie (déduit de la carte) : vent et houle de nord-ouest de face, vent de sud de dos.",
    sources:[
      "mieuxpecher.com — « Coins de pêche – Finistère NORD » : pointe de Leydé",
      "surf-forecast.com — Les Roches Blanches (le Leydé)",
      "Google Maps — position, parking",
    ],
    topology:{
      fond:{ text:"Non décrit.", confidence:"inference" },
      structure:{ text:"Pointe rocheuse du sentier des Roches Blanches (Google Maps).", confidence:"verified" },
      exposition:{ text:"Nord-ouest, vers l'entrée de la baie. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"Pas de source.", confidence:"inference" },
      bars:{ text:"Une seule source, sans détail (mieuxpecher).", confidence:"inference" },
    },
    tidalRules:{
      typeHeure:"RÈGLE GÉNÉRALE (À RECALER)",
      montantOuDescendant:"Aucune source locale : règle générale du bar en Bretagne (Vidal).",
      description:"Pointe sans source sur la marée : créneaux de la règle générale.",
      windows:[
        { id:"ly1", label:"Montant, règle générale (BM → BM+3)", phase:"bm", offsetBefore:0.0, offsetAfter:3.0, tidePhaseType:"montant", priority:"prime",
          note:"Règle générale (Vidal), non propre à ce poste." },
        { id:"ly2", label:"Fin de descendant, règle générale (BM−3 → BM)", phase:"bm", offsetBefore:-3.0, offsetAfter:0.0, tidePhaseType:"descendant", priority:"bon",
          note:"Règle générale (Vidal), non propre à ce poste." },
      ],
      lifeHack:"Note dans ton journal la phase de tes touches : c'est la seule façon de recaler ce poste.",
    },
    lures:[
      { name:"Poisson nageur à bavette 120-140 mm", color:"Naturel", weight:"18-25 g", technique:"Balayer la zone de passage devant la pointe (règle des pointes, pecheaubar)." },
      { name:"Souple 12-15 cm tête plombée", color:"Naturel", weight:"tête 10-20 g", technique:"Coup du soir dans les vagues, grands leurres (Rognant, baie de Douarnenez)." },
    ],
    access:"Parking gratuit route des Roches Blanches (Douarnenez), puis le GR34 jusqu'à la pointe (Google Maps).",
    securite:[
      { t:"« De nombreux secteurs sont dangereux : risques de chute depuis la falaise ou déferlantes méchantes… »", s:"pecheaubar.com — « La Pêche au bar en Bretagne : Douarnenez »" },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 7. POINTE DE TRÉNAOURET (Beuzec-Cap-Sizun)
  // ══════════════════════════════════════════════════════════
  {
    id:"trenaouret", tidePort:"douarnenez", zone:"far", isLocal:false, dangerLevel:2,
    name:"Pointe de Trénaouret", subtitle:"Beuzec-Cap-Sizun, côte sud de la baie",
    distance:"≈ 1 h", distMin:60, coords:"48°05,4'N 4°30,1'W", lat:48.090686, lon:-4.5022019,
    type:"POINTE ROCHEUSE", color:"#c084fc",
    terrain:{
      fond:"Pointe de la côte nord du cap Sizun, avec une plage côté ouest (visorando) ; côte « très découpée » (lechasseursousmarin.com, pointe de Luguénez voisine). Fond devant la pointe non décrit.",
      encombrement:2,
      gratter:"non",
      prof:{ cls:"peu", why:"Aucune sonde sur la pointe ; 2 à 20 m sur la pointe voisine de Luguénez (lechasseursousmarin.com) : profondeur non connue au poste (déduit)." },
      couches:["surface", "sous-surface", "mi-eau"],
      montage:"Leurres de passage qui peignent la couche d'eau (règle des pointes du secteur, pecheaubar) ; pas de grattage sur un fond non décrit.",
      conseils:[
        "Une seule source de pêche (mieuxpecher), qui donne le moment : « en début de montante ». Poste à confirmer sur place.",
        "Sur la pointe voisine de Luguénez, des chasseurs sous-marins signalent « bars, dorades grises, mulets, vieilles » (lechasseursousmarin.com).",
      ],
      confidence:"inference",
      source:"mieuxpecher, visorando, lechasseursousmarin.com, Google Maps",
      faits:[
        { t:"« Pointe de Trénaouret en début de montante » parmi les coins de pêche du bord.", s:"mieuxpecher.com — « Coins de pêche – Finistère NORD » (Norbert, 2018)" },
        { t:"« la Pointe de Trénaouret offre un beau point de vue, avec en particulier une belle plage côté Ouest » ; départ du parking de la pointe du Millier, escaliers vers la côte, cale de Pors Lanvers, puis le GR34 qui « alterne montée et descente ».", s:"visorando — « De la Pointe du Millier à la Pointe de Trénaouret par côte et champs »" },
        { t:"Pointe de Luguénez – Pors Lesven, à 2,5 km à l'ouest : « Toute cette côte sud très découpée de la baie de Douarnenez » ; « bars, dorades grises, mulets, vieilles, congres et homards » ; « Profondeur 2 à 20 m », courant faible.", s:"lechasseursousmarin.com — Pointe de Luguénez – Pors Lesven (F. Talarmin, 20/11/2025)" },
        { t:"Position de la pointe : 48,090686 / -4,5022019.", s:"Google Maps — Pointe de Trénaouret" },
      ],
    },
    coefBand:[30,50,80,100],
    houleMax:2.0,
    exposedAngles:[315,337.5,0,22.5], shelteredAngles:[157.5,180,202.5],
    weatherNote:"Pointe de la côte sud de la baie, tournée vers le nord (déduit de la carte) : vent et houle de nord-ouest à nord de face, vent de sud de dos.",
    sources:[
      "mieuxpecher.com — « Coins de pêche – Finistère NORD » : pointe de Trénaouret",
      "visorando — « De la Pointe du Millier à la Pointe de Trénaouret »",
      "lechasseursousmarin.com — Pointe de Luguénez – Pors Lesven",
      "Google Maps — position",
    ],
    topology:{
      fond:{ text:"Non décrit au poste ; côte très découpée (lechasseursousmarin, Luguénez).", confidence:"inference" },
      structure:{ text:"Pointe avec une plage côté ouest (visorando).", confidence:"verified" },
      exposition:{ text:"Nord. Déduit de la carte.", confidence:"inference" },
      courant:{ text:"Faible sur la pointe voisine de Luguénez (lechasseursousmarin).", confidence:"inference" },
      bars:{ text:"Une seule source de pêche, avec la phase (mieuxpecher) ; bars en plongée sur la pointe voisine (lechasseursousmarin).", confidence:"inference" },
    },
    tidalRules:{
      typeHeure:"DÉBUT DE MONTANTE",
      montantOuDescendant:"« Pointe de Trénaouret en début de montante » (mieuxpecher).",
      description:"La seule phase citée pour ce poste : le début du flot.",
      windows:[
        { id:"tr1", label:"Début de montant (BM → BM+2,5)", phase:"bm", offsetBefore:0.0, offsetAfter:2.5, tidePhaseType:"montant", priority:"prime",
          note:"« En début de montante » (mieuxpecher)." },
        { id:"tr2", label:"Fin de descendant, règle générale (BM−3 → BM)", phase:"bm", offsetBefore:-3.0, offsetAfter:0.0, tidePhaseType:"descendant", priority:"bon",
          note:"Règle générale (Vidal), non propre à ce poste." },
      ],
      lifeHack:"Marée de Douarnenez (13 km) : l'heure du poste en diffère de quelques minutes au plus (déduit).",
    },
    lures:[
      { name:"Poisson nageur à bavette 120-140 mm", color:"Naturel", weight:"18-25 g", technique:"Balayer la zone de passage devant la pointe, en début de montante." },
      { name:"Stickbait 110-130 mm", color:"Ghost / sardine", weight:"14-27 g", technique:"Aube ou crépuscule, mer maniable." },
    ],
    access:"Parking de la pointe du Millier (Beuzec-Cap-Sizun), escaliers vers la côte, cale de Pors Lanvers, puis le GR34 jusqu'à la pointe (visorando).",
    securite:[
      { t:"« De nombreux secteurs sont dangereux : risques de chute depuis la falaise ou déferlantes méchantes… »", s:"pecheaubar.com — « La Pêche au bar en Bretagne : Douarnenez »" },
    ],
  },
];
