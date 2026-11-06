// Configuration du site Pirou Plage : tout ce qui est propre au lieu (spots, zones, ports de marée,
// principes). Le moteur (src/engine.jsx) est commun aux deux applications.
export const SITE = {
  id: "pirou-plage",
  name: "Pirou Plage",
  region: "Côte ouest du Cotentin",
  dept: "50770",
  headerLabel: "COTENTIN OUEST",
  lat: 49.1748, lon: -1.5902,   // requis pour le calcul solaire réel
  tidePort: "Granville",
  tideSources: "maree.info, marine.meteoconsult.fr, shom.fr (Granville et Régnéville-sur-Mer)",
  weatherSources: "meteociel.fr, meteofrance.com, windguru",
  // La côte ouest s'étire sur 90 km de Granville au cap de la Hague.
  // Trois ancrages distincts : le vent et la houle n'y sont pas les mêmes.
  zones: {
    local: { label: "Côte des havres", anchor: "Pirou / Gouville-sur-Mer (50)", sea: "open" },
    inter: { label: "Côte des Isles",  anchor: "Portbail / Barneville-Carteret", sea: "open" },
    far:   { label: "La Hague",        anchor: "Auderville / cap de la Hague", sea: "open" },
    // Granville est au SUD : rattachée aux spots du nord par le seul temps de
    // trajet, elle héritait d'une météo relevée 61 km plus haut. Zone propre.
    sud:   { label: "Baie sud",        anchor: "Granville (50400)", sea: "open" },
  },
  // Marnage moyen morte-eau ↔ vive-eau, pour le contrôle de cohérence.
  marnage: { neap: 5.5, spring: 11.5 },
  // Calendrier des proies : ce qui commande la taille et le profil du leurre.
  preyCalendar: [
    { name:"Vers, coques et bivalves remis en suspension", couche:"fond", months:[1,2,3,4,5,6,7,8,9,10,11,12], weight:3,
      size:"—", guidance:"Le flot qui recouvre l'estran remet en suspension le garde-manger du sable (déduit). Pêcher lentement, très près du fond, dans les 40-80 premiers centimètres d'eau." },
    { name:"Lançon / équille", couche:"sous-surface", months:[4,5,6,7,8,9], weight:5,
      size:"8-15 cm", guidance:"Proie dominante de l'été sur estran sableux. Profils fins et allongés, animation rapide. Long bill minnow et souples élancés." },
    { name:"Crevette grise", couche:"sous-surface", months:[1,2,3,4,5,6,7,8,9,10,11,12], weight:2,
      size:"3-7 cm", guidance:"Abondante dans les havres et sur les platiers. Profil court, animation lente, coloris translucides ou naturels." },
    { name:"Sprat", couche:"mi-eau", months:[10,11,12,1,2,3,4], weight:4,
      size:"8-12 cm", guidance:"Source peche.com : en présence de sprats d'une dizaine de centimètres, shads de 10 cm plombés de 12 à 25 g selon profondeur et courant." },
    { name:"Sardine", couche:"mi-eau", months:[3,4,6,7,8,9,10], weight:4,
      size:"15-20 cm", guidance:"Source peche.com : en présence de sardines, monter en taille — Black Minnow 140 sur tête de 20 g en linéaire. peche.com situe leur passage dans la Hague « vers les mois de mars et avril » ; les mois d'été viennent de ton guide d'origine. Les oiseaux restent le meilleur indicateur de chasse." },
    { name:"Alevins de mulet", couche:"surface", months:[6,7,8,9], weight:3,
      size:"3-8 cm", guidance:"Bancs en surface dans les havres et sur les bordures. Petit stickbait ou souple weightless en bordure de banc." },
    { name:"Crabe mou (période de mue)", couche:"fond", months:[5,6,7,8,9], weight:3,
      size:"3-6 cm", guidance:"Sur les platiers rocheux de Portbail, Carteret et la Hague (déduit). Souple compact, animation très lente au ras du fond." },
  ],
  // ── Marée : calculée localement (v5) ─────────────────────────────
  // Chaque spot a son port de marée. Pas de table officielle à Pirou : les
  // spots situés entre deux ports SHOM sont interpolés selon leur latitude.
  tide: {
    defaultPort: "pirou",
    ports: {
    granville: { label: "Granville", kind: "secondary", ref: "sthelier", lagH: 2.22,
      hw: { t: [-8.2092, -0.14058], h: [7.1749, 1.13991] }, lw: { t: [-6.6482, 3.05752], h: [6.976, 1.15325] },
      accuracy: "contrôlée contre les tables SHOM : ±4,4 min · ±9 cm (un mois de contrôle)" },
    portbail: { label: "Portbail", kind: "secondary", ref: "dielette", lagH: 2.49,
      hw: { t: [-27.7814, 1.79479], h: [6.4078, 1.17358] }, lw: { t: [-26.297, 3.88113], h: [6.0932, 1.10946] },
      accuracy: "contrôlée contre les tables SHOM : ±5,1 min · ±8 cm (un mois de contrôle)" },
    dielette: { label: "Diélette", kind: "secondary", ref: "dielette", lagH: 2.75,
      hw: { t: [-2.8473, 0.28362], h: [5.474, 1.00639] }, lw: { t: [-2.5548, 0.63108], h: [5.3563, 0.98401] },
      accuracy: "contrôlée contre les tables SHOM : ±4,5 min · ±6 cm (un mois de contrôle)" },
    goury: { label: "Goury", kind: "secondary", ref: "dielette", lagH: 3.07,
      hw: { t: [7.2185, 1.79474], h: [5.3078, 0.66158] }, lw: { t: [-6.6344, 1.79186], h: [5.2246, 0.91397] },
      accuracy: "contrôlée contre les tables SHOM : ±6,3 min · ±6 cm (un mois de contrôle)" },
    pirou: { label: "Pirou (interpolé)", kind: "interp", a: "granville", b: "portbail", w: 0.664,
      accuracy: "Interpolé Granville/Portbail. Contrôle d'octobre 2026 contre une table tierce publiée pour Pirou (cabaigne.net) : pleines mers à ±12 min si coef ≥ 60, jusqu'à ±40 min en morte-eau ; basses mers +20 à +35 min en vive-eau (écart en partie dû à la table tierce), jusqu'à ±60 min en morte-eau ; hauteurs ±0,2 m" },
    regneville: { label: "Régnéville (interpolé)", kind: "interp", a: "granville", b: "portbail", w: 0.364,
      accuracy: "Interpolé Granville/Portbail, non contrôlé sur place. Même méthode qu'à Pirou, où l'écart mesuré est : pleines mers ±12 min si coef ≥ 60, jusqu'à ±40 min en morte-eau ; basses mers jusqu'à ±60 min ; hauteurs ±0,2 à 0,3 m" },
    agon: { label: "Agon (interpolé)", kind: "interp", a: "granville", b: "portbail", w: 0.364,
      accuracy: "Interpolé Granville/Portbail, non contrôlé sur place. Même méthode qu'à Pirou, où l'écart mesuré est : pleines mers ±12 min si coef ≥ 60, jusqu'à ±40 min en morte-eau ; basses mers jusqu'à ±60 min ; hauteurs ±0,2 à 0,3 m" },
    gouville: { label: "Gouville (interpolé)", kind: "interp", a: "granville", b: "portbail", w: 0.496,
      accuracy: "Interpolé Granville/Portbail, non contrôlé sur place. Même méthode qu'à Pirou, où l'écart mesuré est : pleines mers ±12 min si coef ≥ 60, jusqu'à ±40 min en morte-eau ; basses mers jusqu'à ±60 min ; hauteurs ±0,2 à 0,3 m" },
    carteret: { label: "Carteret (interpolé)", kind: "interp", a: "portbail", b: "dielette", w: 0.147,
      accuracy: "Interpolé Portbail/Diélette, non contrôlé sur place. Même méthode qu'à Pirou, où l'écart mesuré est : pleines mers ±12 min si coef ≥ 60, jusqu'à ±40 min en morte-eau ; basses mers jusqu'à ±60 min ; hauteurs ±0,2 à 0,3 m" },
    surtainville: { label: "Surtainville (interpolé)", kind: "interp", a: "portbail", b: "dielette", w: 0.528,
      accuracy: "Interpolé Portbail/Diélette, non contrôlé sur place. Même méthode qu'à Pirou, où l'écart mesuré est : pleines mers ±12 min si coef ≥ 60, jusqu'à ±40 min en morte-eau ; basses mers jusqu'à ±60 min ; hauteurs ±0,2 à 0,3 m" },
    sciotot: { label: "Sciotot (interpolé)", kind: "interp", a: "portbail", b: "dielette", w: 0.835,
      accuracy: "Interpolé Portbail/Diélette, non contrôlé sur place. Même méthode qu'à Pirou, où l'écart mesuré est : pleines mers ±12 min si coef ≥ 60, jusqu'à ±40 min en morte-eau ; basses mers jusqu'à ±60 min ; hauteurs ±0,2 à 0,3 m" },
    },
  },
  sstTypical: [8.2, 17.8],
};

// ═══════════════════════════════════════════════════════════════════
// GENERAL FISHING PRINCIPLES (sourced, apply to all spots)
// Sources : peche.com, despoissonssigrands.com, cpiecotentin.com
// ═══════════════════════════════════════════════════════════════════
export const GENERAL_PRINCIPLES = {
  title: "Principes généraux — pêche du bar du bord en Cotentin ouest",
  items: [
    {
      rule: "Coefficient 70-90 : la préférence d'un pêcheur du Cotentin",
      source: "despoissonssigrands.com — « Pêche du bar en automne : retour sur une excellente sortie dans le Cotentin » (récit d'une sortie en bateau)",
      explain: "« J'apprécie un coefficient de marée entre 70 et 90. » Au-dessus, « le courant est très fort » : en bateau, « certains spots du nord de la côte sont quasiment impossibles à pêcher », la dérive dépassant 6 nœuds. C'est une préférence personnelle, tirée d'une sortie en bateau ; faute de source propre à chaque spot du bord, le guide s'en sert comme plage de référence.",
    },
    {
      rule: "Cap de la Hague : la fin de la descendante et le début de la remontante",
      source: "peche.com — B. Le Provost, « Pêche du bar du bord dans le Cotentin : comment réussir son ouverture depuis la côte » (23/03/2026)",
      explain: "L'auteur, pour le cap de la Hague : au plus fort du courant il est compliqué de pêcher correctement ; il préfère « la fin de la descendante et le début de la remontante, jusqu'à 2 h à 2 h 30 après le basculement ». C'est sa pratique dans cette zone ; le guide la reprend par déduction à Carteret, Granville et Sciotot.",
    },
    {
      rule: "Le flot qui recouvre l'estran est le moteur de la côte des havres",
      source: "cpiecotentin.com · déduction du guide",
      explain: "« De Pirou à Barneville-Carteret s'étendent de grandes plages sableuses, entrecoupées par quatre havres » (CPIE). Le marnage met à nu des kilomètres d'estran ; que les bars entrent avec les premiers centimètres d'eau pour ce garde-manger est une déduction du guide, que ton journal confirmera ou non.",
    },
    {
      rule: "Prospecter très peu profond sur les bancs de sable au montant",
      source: "Guide pêche Latitude Manche (Conseil départemental de la Manche)",
      explain: "Sur les bancs de la pointe de sable d'Agon, à marée montante, on recherche les bars présents dans 50 cm d'eau, aux leurres plongeants type long bill minnow ou au buldo. Corollaire de sécurité explicite dans la même source : attention à ne pas se laisser entourer par la marée.",
    },
    {
      rule: "Adapter la taille du leurre à la proie du moment",
      source: "peche.com — sorties Cotentin",
      explain: "En présence de sprats d'une dizaine de centimètres, des shads de 10 cm plombés de 12 à 25 g selon profondeur et courant. En présence de sardines, monter en taille. Les oiseaux restent le meilleur indicateur de chasse.",
    },
    {
      rule: "Matériel : longueur de canne pour lancer loin des leurres légers",
      source: "peche.com — Pêche du bar du bord dans le Cotentin",
      explain: "Cannes de 2,30 m à 2,40 m, puissances de 5/15 g à 10/30 g (peche.com, pour la Hague rocheuse). Sur les estrans plats, pouvoir lancer loin des leurres légers est une déduction du guide.",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// 10 SPOTS — chaque champ marqué par niveau de confiance
//   confidence: "verified" = info sourcée / "local_knowledge" = savoir terrain Félix / "inference" = déduction raisonnée
// ═══════════════════════════════════════════════════════════════════
export const SPOTS = [

  // ══════════════════════════════════════════════════════════
  // 1. PIROU PLAGE — base
  // ══════════════════════════════════════════════════════════
  {
    id:"pirou", tidePort:"pirou", isLocal:true, zone:"local", dangerLevel:2,
    name:"Pirou Plage", subtitle:"Estran, épis et tables, Pirou",
    distance:"sur place", distMin:0, coords:"49°10'N 1°35'W",
    type:"ESTRAN SABLEUX + TABLES", color:"#22c55e",
    // Fiche terrain : ce que le fond permet ou interdit, et comment monter le leurre.
    terrain:{
      fond:"Sable dominant sur l'estran ; tables ostréicoles et bouchots en secteurs.",
      encombrement:2,
      gratter:"oui",
      // Profondeur estimée d'après la fiche (aucune sonde) : fixe la base du poids des têtes.
      prof:{ cls:"estran", why:"Estran très plat qui découvre loin (fiche)." },
      couches:["surface", "sous-surface", "mi-eau", "fond"],
      montage:"Tête plombée légère sur le sable ; weightless au-dessus des tables, où un plombé accroche.",
      conseils:["Sur le sable, pêcher près du fond dans les 40 à 80 premiers centimètres d'eau du flot.", "Aux tables, passer au-dessus des structures, jamais entre les pieds.", "Spot de ton guide d'origine : une seule source parle du bar ici (forum Pêche en mer Cotentin, non revérifiable le 29/10/2026) ; ton journal fera foi."],
      confidence:"inference",
      source:"Déduit de la description du fond de ce spot",
      // Faits précis tirés de sources citées (recherche du 10/10/2026).
      faits:[
        { t:"« De Pirou à Barneville-Carteret s'étendent de grandes plages sableuses, entrecoupées par quatre havres. »", s:"CPIE du Cotentin — où pêcher" },
        { t:"Des pêcheurs locaux pêchent le bar au leurre souple sur les bouchots et les tables à huîtres de Pirou plage.", s:"Forum Pêche en mer Cotentin — « pêche au bar »" },
      ],
    },
    coefBand:[50,70,90,110],
    // Plateau 70-90 : préférence d'un pêcheur du Cotentin (despoissonssigrands.com, récit de sortie en bateau), faute de source propre au spot ; les pentes de part et d'autre sont des hypothèses de modèle.
    houleMax:2.0,
    exposedAngles:[247.5,270,292.5], shelteredAngles:[67.5,90,112.5],
    weatherNote:"Plein ouest, aucune protection. Le vent d'O/SO monte directement sur l'estran ; le vent d'E aplatit et clarifie.",
    sources:[
      "pechemercotentin.forumactif.org — sujet « pêche au bar »",
      "cpiecotentin.com — 'De Pirou à Barneville-Carteret s'étendent de grandes plages sableuses, entrecoupées par quatre havres, qui découvrent à marée basse sur des estrans rocheux'",
      "pechemercotentin.forumactif.org — pêcheurs locaux au leurre souple sur Pirou plage, travaillant les bouchots et tables à huîtres, bons poissons en avril",
      "peche.com — Pêche du bar du bord dans le Cotentin (technique générale du flot sur estran)",
    ],
    topology:{
      fond:{ text:"Sable dominant, estran très plat découvrant loin, secteurs de tables ostréicoles et bouchots. Fosses de retour parallèles au rivage creusées par la houle.", confidence:"verified" },
      structure:{ text:"Les tables et bouchots forment un récif artificiel : abri, biomasse fixée, ralentissement du courant. Les pêcheurs locaux du secteur les citent explicitement comme zone de travail au leurre souple.", confidence:"verified" },
      exposition:{ text:"Face plein ouest, fetch de plus de 100 km. Rien ne casse la houle d'O/NO. Le vent d'est terrestre aplatit la mer et éclaircit l'eau.", confidence:"local_knowledge" },
      courant:{ text:"Courant de marée parallèle à la côte, modéré sur l'estran ouvert, accéléré dans les fosses de retour et entre les rangées de tables.", confidence:"inference" },
      bars:{ text:"Bars de bordure entrant avec le flot pour exploiter vers, coques et crevettes remis en suspension. Poissons souvent calibrés, chasses possibles en fin de journée. Prises documentées au printemps par les pêcheurs du secteur.", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"MONTANT SUR ESTRAN + CRÉPUSCULES",
      montantOuDescendant:"Montant nettement dominant : c'est le flot recouvrant l'estran qui déclenche l'entrée des bars. Le descendant fonctionne surtout dans les fosses de retour, quand l'eau se vidange.",
      description:"Spot de base, accessible en permanence. On pêche le flot qui remonte l'estran, en avançant avec lui, et on travaille les tables dès qu'elles sont recouvertes de 40 à 80 cm d'eau.",
      windows:[
        { id:"pi1", label:"Mi-montant → PM-1h", phase:"pm", offsetBefore:-3.5, offsetAfter:-1.0, tidePhaseType:"montant", priority:"prime",
          note:"Le flot recouvre l'estran et les tables. Suivre l'eau qui monte, lancer devant soi dans 40-80 cm. Shad 10 cm plombé léger ou souple weightless." },
        { id:"pi2", label:"Début de montant sur BM", phase:"bm", offsetBefore:0.5, offsetAfter:2.5, tidePhaseType:"montant", priority:"prime",
          note:"Les tout premiers centimètres d'eau sur l'estran découvert. Bars très peu profonds, souvent à moins de 20 m du bord. Approche discrète obligatoire." },
        { id:"pi3", label:"Descendant dans les fosses", phase:"pm", offsetBefore:1.5, offsetAfter:3.5, tidePhaseType:"descendant", priority:"bon",
          note:"L'eau se vidange par les fosses de retour et y concentre les proies. Prospecter parallèlement au rivage, pas perpendiculairement." },
      ],
      lifeHack:"Repérer les fosses et les baïnes à basse mer par grand coefficient : ce sont les veines que les bars empruntent au flot. Une photo aérienne à BM vaut dix sessions à l'aveugle.",
    },
    lures:[
      { name:"Shad souple 10-12 cm tête plombée légère", color:"Ayu / naturel / paillettes par grand soleil", weight:"7-14 g", technique:"Linéaire lent dans 40-80 cm d'eau sur l'estran recouvert. Adapter à la proie : shad 10 cm sur sprats, plus grand si sardines." },
      { name:"Souple weightless sur les tables", color:"Naturel / blanc", weight:"7-10 g monté sans plomb", technique:"Passage à fleur d'eau au-dessus des structures, là où un leurre plombé accrocherait. Le coût faible autorise les zones encombrées." },
      { name:"Stickbait 110-140 mm", color:"Ghost / Iwashi / blanc en basse lumière", weight:"14-25 g", technique:"Walking the dog au crépuscule sur le flot, le long des épis. Patchinko 125 ou Asturie 110 en référence perso." },
    ],
    access:"Accès direct depuis Pirou Plage, parkings en front de mer. Aucune difficulté.",
    // Sécurité : consignes affichées dans le verdict et l'onglet Accès (« when » = active selon le jour).
    securite:[{ t:"Estran plat à fort marnage : le flot gagne vite et peut passer par les bâches et les chenaux. Repérer sa ligne de retour avant de s'avancer.", s:"prudence générale (déduit)"}],
  },

  // ══════════════════════════════════════════════════════════
  // 2. RÉGNÉVILLE — havre de la Sienne
  // ══════════════════════════════════════════════════════════
  {
    id:"regneville", tidePort:"regneville", isLocal:true, zone:"local", dangerLevel:2,
    name:"Régnéville", subtitle:"Havre et embouchure de la Sienne",
    // v8.9 : 17,7 km à vol d'oiseau, et le havre ne se traverse pas : par la route, environ 35 min.
    distance:"≈ 35 min", distMin:35, coords:"49°01'N 1°34'W",
    type:"EMBOUCHURE / HAVRE", color:"#4ade80",
    // Fiche terrain : ce que le fond permet ou interdit, et comment monter le leurre.
    terrain:{
      fond:"Sable et sablo-vase, chenal de vidange marqué ; roche affleurante par endroits à basse mer.",
      encombrement:1,
      gratter:"oui",
      // Profondeur estimée d'après la fiche (aucune sonde) : fixe la base du poids des têtes.
      prof:{ cls:"peu", why:"Chenal de vidange du havre ; la fiche règle le plomb sur le courant plus que sur la profondeur." },
      couches:["surface", "sous-surface", "mi-eau", "fond"],
      montage:"Tête plombée réglée sur le courant du chenal ; texan sur les bancs (référence Black Minnow).",
      conseils:["Ne jamais traverser le havre à pied seul : la traversée se fait à marée basse et accompagnée (Attitude Manche).", "Le plombage se règle sur la vitesse du courant, pas sur la profondeur.", "Spot de ton guide d'origine : aucune source publiée vérifiée ne le cite pour le bar (29/10/2026) ; ton journal fera foi."],
      confidence:"inference",
      source:"Déduit de la description du fond de ce spot",
      // Faits précis tirés de sources citées (recherche du 10/10/2026).
      faits:[
        { t:"Le havre de la Sienne se traverse à pied à marée basse seulement, accompagné : « trop dangereux seul ». Il est séparé de la mer par l'espace naturel classé de la pointe d'Agon.", s:"Attitude Manche via Cirkwi — Le havre de Sienne" },
      ],
    },
    coefBand:[50,70,90,110],
    // Plateau 70-90 : préférence d'un pêcheur du Cotentin (despoissonssigrands.com, récit de sortie en bateau), faute de source propre au spot ; les pentes de part et d'autre sont des hypothèses de modèle.
    houleMax:1.5,
    exposedAngles:[247.5,270], shelteredAngles:[45,67.5,90,112.5],
    weatherNote:"Havre partiellement abrité par le cordon dunaire. Reste ouvert au secteur ouest à pleine mer.",
    sources:[
      "cirkwi.com — Le havre de Sienne (Attitude Manche)",
      "sylco-peche-brehal.fr — 'La Sienne est une très belle rivière' ; le secteur est présenté comme zone de pêche du bord reconnue de la côte des havres",
      "cpiecotentin.com — géomorphologie de la côte des havres, estrans rocheux découvrant à marée basse",
      "peche.com — principe général des embouchures et du flot sur estran",
    ],
    topology:{
      fond:{ text:"Sable et sablo-vase, chenal de vidange bien marqué, bancs mobiles de part et d'autre. L'estran rocheux affleure par endroits à basse mer.", confidence:"verified" },
      structure:{ text:"Embouchure de la Sienne : le havre stocke une masse d'eau considérable à chaque marée et la restitue par un chenal étroit. Configuration d'entonnoir, la plus lisible du secteur.", confidence:"local_knowledge" },
      exposition:{ text:"Le cordon dunaire casse la houle d'ouest sur la partie interne. La sortie de chenal reste exposée par vent d'O soutenu.", confidence:"local_knowledge" },
      courant:{ text:"Très fort dans le chenal en vive-eau, bien plus que sur l'estran ouvert. C'est le moteur du spot et sa principale contrainte.", confidence:"inference" },
      bars:{ text:"Poste d'interception classique : le bar se cale en sortie de chenal et filtre le flux sortant chargé de proies. Gradient de salinité attractif. Le secteur est cité comme zone de pêche appréciée des locaux.", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"DESCENDANT ÉTABLI",
      montantOuDescendant:"Descendant nettement dominant : c'est la vidange du havre qui concentre la nourriture. Le montant fonctionne en fin de flot, quand les bars remontent dans le havre.",
      description:"Le spot le plus régulier du secteur sur la marée descendante. On pêche la veine du chenal en dérive, contact permanent avec le leurre.",
      windows:[
        { id:"re1", label:"PM+1h → PM+4h30 (jusant)", phase:"pm", offsetBefore:1.0, offsetAfter:4.5, tidePhaseType:"descendant", priority:"prime",
          note:"Vidange pleine du havre. Lancer en amont, laisser dériver le souple dans la veine. Adapter le plombage à la vitesse : 12 à 25 g." },
        { id:"re2", label:"Fin de montant", phase:"pm", offsetBefore:-2.5, offsetAfter:-0.5, tidePhaseType:"montant", priority:"bon",
          note:"Les bars remontent dans le havre avec le flot. Prospection plus large, plus lente, moins de courant." },
        // v8.9 : créneau « étale de BM dans le chenal » retiré : il plaçait le pêcheur au bord du chenal d'un havre
        // « trop dangereux seul » (source de la fiche), au basculement, sans source pour le justifier.
      ],
      lifeHack:"Ne jamais traverser le chenal, même à basse mer apparente : les bancs sont mobiles et le flot reprend par l'arrière. Repérer un point de repli visible avant de commencer.",
    },
    lures:[
      { name:"Shad souple tête plombée lourde", color:"Naturel / blanc en eau teintée", weight:"12-25 g selon courant", technique:"Dérive dans la veine du chenal, contact permanent. Le plombage se règle sur la vitesse du courant, pas sur la profondeur." },
      { name:"Black Minnow 120", color:"Ayu / kaki", weight:"tête 12-18 g", technique:"Référence Cotentin citée par peche.com pour la pêche du bord. Hameçon texan limitant les croches sur les bancs." },
      { name:"Minnow à bavette 110-130 mm", color:"Dos sombre en eau teintée", weight:"14-20 g", technique:"Récupération lente en travers du flux sortant, quand l'eau est chargée et que le souple passe inaperçu." },
    ],
    access:"Parkings du havre de Régnéville. Marche sur banc de sable jusqu'aux postes. Bottes ou waders selon le poste.",
    // Sécurité : consignes affichées dans le verdict et l'onglet Accès (« when » = active selon le jour).
    securite:[{ t:"Ne jamais traverser le havre à pied seul : traversée à marée basse et accompagnée seulement (« trop dangereux seul »).", s:"Attitude Manche via Cirkwi — Le havre de Sienne"},
      { t:"Ne jamais traverser le chenal, même à basse mer apparente : les bancs sont mobiles et le flot reprend par l'arrière. Repérer un point de repli visible.", s:"fiche du spot (conseil)"}],
  },

  // ══════════════════════════════════════════════════════════
  // 3. GOUVILLE-SUR-MER — Le Sénéquet
  // ══════════════════════════════════════════════════════════
  {
    id:"gouville", tidePort:"gouville", isLocal:true, zone:"local", dangerLevel:3,
    name:"Gouville-sur-Mer", subtitle:"Parcs et estran (le Sénéquet est au large : pas un poste du bord)",
    distance:"20 min", distMin:20, coords:"49°05'N 1°36'W",
    type:"PARCS + ESTRAN ROCHEUX", color:"#4ade80",
    // Fiche terrain : ce que le fond permet ou interdit, et comment monter le leurre.
    terrain:{
      fond:"Estran mixte : sable, roches affleurantes, parcs ostréicoles étendus. Le phare du Sénéquet est « situé à plusieurs kilomètres du rivage » (Tendance Ouest).",
      encombrement:2,
      gratter:"texan",
      // Profondeur estimée d'après la fiche (aucune sonde) : fixe la base du poids des têtes.
      prof:{ cls:"estran", why:"« Vaste estran rocheux et sableux » de 3 866 ha (INPN) : très peu d'eau à marée basse." },
      couches:["surface", "sous-surface", "mi-eau", "fond"],
      montage:"Weightless entre les tables ; tête plombée légère seulement sur le sable dégagé, près du bord.",
      conseils:["La zone des parcs interdit le plombé : on y pêche en surface ou juste dessous."],
      confidence:"inference",
      source:"Déduit de la description du fond de ce spot",
      // Faits précis tirés de sources citées (recherche du 10/10/2026).
      faits:[
        { t:"ZNIEFF marine « Estran rocheux de Gouville à Agon-Coutainville » : « vaste estran rocheux et sableux » de 3 866 ha, du phare du Sénéquet à la tour du Ronquet.", s:"INPN — ZNIEFF 25M000020" },
        { t:"On y trouve des herbiers de zostères (Zostera marina et noltei), des récifs d'hermelles temporaires et des platiers à algues rouges ; granulométrie de la vase aux blocs.", s:"INPN — ZNIEFF 25M000020" },
        { t:"Le phare du Sénéquet est « situé à plusieurs kilomètres du rivage de Gouville », « accessible uniquement lors des épisodes de grandes marées » ; le 1er mars 2025, une personne y a été retrouvée morte dans les rochers, la marée montante menaçant d'isoler le groupe.", s:"tendanceouest.com — C. Caradec, « Manche. Grandes marées : une personne retrouvée morte près du phare du Sénéquet » (02/03/2025)" },
      ],
    },
    coefBand:[50,70,90,110],
    // Plateau 70-90 : préférence d'un pêcheur du Cotentin (despoissonssigrands.com, récit de sortie en bateau), faute de source propre au spot ; les pentes de part et d'autre sont des hypothèses de modèle.
    houleMax:1.8,
    exposedAngles:[247.5,270,292.5], shelteredAngles:[67.5,90],
    weatherNote:"Exposition ouest franche. Les parcs cassent partiellement le clapot par vent modéré.",
    sources:[
      "inpn.mnhn.fr — ZNIEFF marine 25M000020 Estran rocheux de Gouville à Agon-Coutainville",
      "sylco-peche-brehal.fr — 'Le Sénéquet à Gouville-sur-Mer' cité comme très apprécié des pêcheurs locaux (page non revérifiée le 29/10/2026)",
      "tendanceouest.com — accident du Sénéquet (02/03/2025)",
      "cpiecotentin.com — estrans rocheux découvrant à marée basse sur ce linéaire",
      "peche.com — principes des plateaux rocheux et du flot sur estran",
    ],
    topology:{
      fond:{ text:"« Vaste estran rocheux et sableux » (INPN) ; parcs ostréicoles étendus.", confidence:"verified" },
      structure:{ text:"Les tables ostréicoles structurent l'estran côté terre. Le Sénéquet, à plusieurs kilomètres au large, n'est accessible qu'aux grandes marées : ce n'est pas un poste du guide.", confidence:"verified" },
      exposition:{ text:"Ouest franc. Vent d'E/NE terrestre = mer plate et eau claire, exigeant de la discrétion. Vent d'O = houle courte sur l'estran, souvent favorable jusqu'à 4 Beaufort.", confidence:"local_knowledge" },
      courant:{ text:"Courant parallèle à la côte, accéléré autour du plateau et entre les rangées de parcs.", confidence:"inference" },
      bars:{ text:"Spot de ton guide d'origine, cité comme apprécié des pêcheurs locaux (sylco, non revérifié). Le bar longe les rangées de tables au flot comme il longerait une bordure rocheuse (déduit).", confidence:"local_knowledge" },
    },
    tidalRules:{
      typeHeure:"MONTANT SUR LES PARCS",
      montantOuDescendant:"Montant dominant pour les parcs et l'estran (ton guide d'origine).",
      description:"Les parcs se pêchent au flot en suivant l'eau ; au jusant, les roches affleurantes proches du bord (déduit). Jamais vers le Sénéquet.",
      windows:[
        { id:"go1", label:"Mi-montant → PM-1h", phase:"pm", offsetBefore:-3.5, offsetAfter:-1.0, tidePhaseType:"montant", priority:"prime",
          note:"Parcs recouverts, bars en chasse le long des rangées. Souple weightless ou tête plombée très légère pour éviter les croches." },
        { id:"go2", label:"Mi-descendant, roches proches du bord", phase:"pm", offsetBefore:1.5, offsetAfter:3.5, tidePhaseType:"descendant", priority:"bon",
          note:"L'eau se retire des roches affleurantes proches du bord (déduit). Ne pas suivre la mer vers le large." },
        { id:"go3", label:"Début de flot (BM+0,5 → BM+2,5)", phase:"bm", offsetBefore:0.5, offsetAfter:2.5, tidePhaseType:"montant", priority:"prime",
          note:"Premiers centimètres sur l'estran, depuis le haut de plage. La lumière du créneau est calculée à part." },
      ],
      lifeHack:"Les parcs coupent : semelles épaisses obligatoires. Et le flot remonte entre les tables plus vite qu'il n'y paraît — garder toujours une ligne de retraite dégagée.",
    },
    lures:[
      { name:"Souple weightless entre les tables", color:"Naturel / Ayu", weight:"7-10 g sans plomb", technique:"Passage à fleur d'eau au-dessus des structures. La zone encombrée interdit le plombé." },
      { name:"Shad 10-12 cm tête plombée", color:"Naturel", weight:"10-18 g", technique:"Sur le sable dégagé près du bord. Récupération lente avec pauses." },
      { name:"Stickbait 120-140 mm", color:"Ghost / Iwashi", weight:"16-25 g", technique:"Surface au crépuscule sur les parcs recouverts, quand des chasses marquent." },
    ],
    access:"Nombreux accès plage à Gouville, parkings des cabines. Marche variable selon le coefficient.",
    // Sécurité : consignes affichées dans le verdict et l'onglet Accès (« when » = active selon le jour).
    securite:[{ t:"Ne pas suivre la mer vers le Sénéquet : le phare est « à plusieurs kilomètres du rivage », accessible seulement aux grandes marées ; une personne y est morte le 1er mars 2025, le groupe menacé d'être isolé par la marée montante.", s:"tendanceouest.com (02/03/2025)" },
      { t:"Le flot remonte entre les tables plus vite qu'il n'y paraît : garder une ligne de retraite dégagée. Parcs coupants : semelles épaisses.", s:"fiche du spot (conseil)"}],
  },

  // ══════════════════════════════════════════════════════════
  // 4. POINTE D'AGON
  // ══════════════════════════════════════════════════════════
  {
    id:"agon", tidePort:"agon", isLocal:true, zone:"local", dangerLevel:3,
    name:"Pointe d'Agon", subtitle:"Banc de sable et confluence du havre",
    distance:"25 min", distMin:25, coords:"49°01'N 1°35'W",
    type:"POINTE SABLEUSE / VEINE", color:"#84cc16",
    // Fiche terrain : ce que le fond permet ou interdit, et comment monter le leurre.
    terrain:{
      fond:"Banc de sable pur et mobile, fosses latérales creusées par le courant.",
      encombrement:1,
      gratter:"oui",
      // Profondeur estimée d'après la fiche (aucune sonde) : fixe la base du poids des têtes.
      prof:{ cls:"peu", why:"Banc de sable et fosses latérales creusées par le courant (fiche)." },
      couches:["surface", "sous-surface", "mi-eau", "fond"],
      montage:"Long bill minnow en très peu d'eau ; souple lourd en dérive dans la veine.",
      conseils:["Ne jamais traverser le havre à pied seul : la traversée se fait à marée basse et accompagnée (Attitude Manche).", "Les bancs bougent à chaque tempête : relire la pointe à marée basse."],
      confidence:"inference",
      source:"Déduit de la description du fond de ce spot",
      // Faits précis tirés de sources citées (recherche du 10/10/2026).
      faits:[
        { t:"L'estran rocheux et sableux de la ZNIEFF Gouville–Agon s'étend jusqu'à la tour du Ronquet, au large d'Agon-Coutainville.", s:"INPN — ZNIEFF 25M000020" },
        { t:"Le havre de la Sienne se traverse à pied à marée basse seulement, accompagné : « trop dangereux seul ».", s:"Attitude Manche via Cirkwi — Le havre de Sienne" },
      ],
    },
    coefBand:[50,70,90,110],
    // Plateau 70-90 : préférence d'un pêcheur du Cotentin (despoissonssigrands.com, récit de sortie en bateau), faute de source propre au spot ; les pentes de part et d'autre sont des hypothèses de modèle.
    houleMax:1.7,
    exposedAngles:[247.5,270,292.5], shelteredAngles:[90,112.5],
    weatherNote:"Pointe très exposée à l'ouest, sans aucun abri. Le vent y est toujours plus fort que sur la plage voisine.",
    sources:[
      "inpn.mnhn.fr — ZNIEFF marine 25M000020",
      "cirkwi.com — Le havre de Sienne (Attitude Manche)",
      "Guide pêche Latitude Manche — 'Sur les bancs de sable de la pointe d'Agon, à marée montante, on peut utiliser des leurres plongeants type long bill minnow ou un buldo pour rechercher les bars présents dans 50 cm d'eau' ; avertissement explicite : 'attention à ne pas se laisser entourer à marée montante'",
      "sylco-peche-brehal.fr — le phare du Ronquet en face d'Agon-Coutainville, très apprécié des pêcheurs locaux",
      "cpiecotentin.com — géomorphologie des havres et pointes sableuses",
    ],
    topology:{
      fond:{ text:"Banc de sable pur, mobile, prolongeant la pointe. Fosses latérales creusées par le courant de vidange du havre de la Sienne.", confidence:"verified" },
      structure:{ text:"La pointe sépare le havre de la mer ouverte et concentre le courant sur son extrémité. Configuration de confluence : deux masses d'eau, une veine puissante.", confidence:"local_knowledge" },
      exposition:{ text:"Face ouest, aucune protection. La pointe prend le vent avant tout le reste du secteur.", confidence:"local_knowledge" },
      courant:{ text:"Fort, notamment au jusant quand le havre se vide. La veine contourne la pointe et crée un remous exploitable en aval.", confidence:"inference" },
      bars:{ text:"Source Latitude Manche directe : bars présents dans 50 cm d'eau sur les bancs à marée montante, à rechercher aux leurres plongeants. Poste d'interception classique sur la veine au jusant.", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"MONTANT SUR BANCS + JUSANT SUR VEINE",
      montantOuDescendant:"Les deux, mais pas au même endroit : le montant se pêche sur les bancs en très peu d'eau, le jusant se pêche dans la veine de vidange.",
      description:"Spot à double régime. La sécurité commande : la pointe s'isole vite et le flot la contourne par l'arrière.",
      windows:[
        { id:"ag1", label:"Montant sur les bancs", phase:"pm", offsetBefore:-4.0, offsetAfter:-1.5, tidePhaseType:"montant", priority:"prime",
          note:"Source Latitude Manche : bars dans 50 cm d'eau, leurre plongeant type long bill minnow. Avancer avec l'eau, jamais s'attarder." },
        { id:"ag2", label:"PM+1h → PM+3h30 (veine)", phase:"pm", offsetBefore:1.0, offsetAfter:3.5, tidePhaseType:"descendant", priority:"prime",
          note:"Vidange du havre contournant la pointe. Souple lourd en dérive dans la veine, prospection du remous aval." },
        { id:"ag3", label:"Début de flot (BM+0,5 → BM+2)", phase:"bm", offsetBefore:0.5, offsetAfter:2.0, tidePhaseType:"montant", priority:"bon",
          note:"Premier flot sur les bancs. Stickbait si la mer le permet ; ne jamais se laisser entourer (Latitude Manche)." },
      ],
      lifeHack:"Danger réel d'encerclement, signalé noir sur blanc par le guide départemental. Fixer une heure de repli AVANT de partir et s'y tenir, même si ça mord.",
    },
    lures:[
      { name:"Long bill minnow / leurre plongeant", color:"Naturel argent", weight:"14-22 g", technique:"Source Latitude Manche directe : prospection des bancs en très peu d'eau à marée montante." },
      { name:"Souple lourd en dérive", color:"Blanc / naturel", weight:"14-25 g", technique:"Dans la veine de vidange au jusant. Le plombage se règle sur le courant." },
      { name:"Stickbait 125-140 mm", color:"Ghost / blanc en basse lumière", weight:"16-25 g", technique:"Surface au crépuscule quand la mer est maniable." },
    ],
    access:"Parking d'Agon-Coutainville puis longue marche sur la pointe. Compter le trajet retour dans le calcul de marée.",
    // Sécurité : consignes affichées dans le verdict et l'onglet Accès (« when » = active selon le jour).
    securite:[{ t:"Marée montante sur les bancs : attention à ne pas se laisser entourer.", s:"Latitude Manche, guide de pêche", when: { phase:"montant"}},
      { t:"La pointe s'isole vite et le flot la contourne par l'arrière.", s:"fiche du spot"},
      { t:"Ne jamais traverser le havre à pied seul (« trop dangereux seul »).", s:"Attitude Manche via Cirkwi — Le havre de Sienne"}],
  },

  // ══════════════════════════════════════════════════════════
  // 5. PORTBAIL — havre
  // ══════════════════════════════════════════════════════════
  {
    id:"portbail", tidePort:"portbail", isLocal:false, zone:"inter", dangerLevel:2,
    name:"Portbail", subtitle:"Havre, chenal et platier rocheux",
    distance:"35 min", distMin:35, coords:"49°20'N 1°43'W",
    type:"HAVRE + PLATIER", color:"#38bdf8",
    // Fiche terrain : ce que le fond permet ou interdit, et comment monter le leurre.
    terrain:{
      fond:"Chenal sableux étroit bordé de platiers rocheux.",
      encombrement:2,
      gratter:"texan",
      // Profondeur estimée d'après la fiche (aucune sonde) : fixe la base du poids des têtes.
      prof:{ cls:"peu", why:"Chenal sableux étroit bordé de platiers (fiche)." },
      couches:["surface", "sous-surface", "mi-eau", "fond"],
      montage:"Tête plombée dans le chenal sableux ; texan dès qu'on aborde le platier.",
      conseils:["Le platier recouvert se pêche au-dessus (minnow à bavette), le chenal au fond.", "Spot de ton guide d'origine : une seule source, qui ne fait que le nommer (mieuxpecher : « L'Olonde près de PortBail »)."],
      confidence:"inference",
      source:"Déduit de la description du fond de ce spot",
      // Faits précis tirés de sources citées (recherche du 10/10/2026).
      faits:[
        { t:"À Portbail, le platier rocheux porte moules, coquilles Saint-Jacques et étrilles.", s:"CPIE du Cotentin — où pêcher" },
      ],
    },
    coefBand:[50,70,90,108],
    // Plateau 70-90 : préférence d'un pêcheur du Cotentin (despoissonssigrands.com, récit de sortie en bateau), faute de source propre au spot ; les pentes de part et d'autre sont des hypothèses de modèle.
    houleMax:1.6,
    exposedAngles:[247.5,270], shelteredAngles:[67.5,90,112.5],
    weatherNote:"Havre abrité côté interne, sortie de chenal exposée à l'ouest.",
    sources:[
      "cpiecotentin.com — 'À Portbail, le platier rocheux offre moule, coquille Saint-Jacques, étrille et bouquet' ; havre appartenant aux quatre havres de la côte ouest",
      "peche.com — principes généraux des embouchures et des plateaux rocheux",
    ],
    topology:{
      fond:{ text:"Chenal sableux étroit bordé de platiers rocheux. Le platier est documenté comme riche en crustacés et coquillages — donc en nourriture pour le bar.", confidence:"verified" },
      structure:{ text:"Havre plus étroit que celui de la Sienne : le flux de vidange y est plus concentré, donc les postes sont plus lisibles. Le pont marque un étranglement supplémentaire.", confidence:"inference" },
      exposition:{ text:"Partie interne bien abritée par le cordon dunaire. La sortie de chenal reste ouverte au secteur ouest.", confidence:"inference" },
      courant:{ text:"Soutenu dans le chenal, faible sur les platiers. L'écart entre les deux crée les postes.", confidence:"inference" },
      bars:{ text:"Configuration d'entonnoir favorable au postage. La richesse documentée du platier en crustacés soutient une biomasse locale exploitable par le bar.", confidence:"inference" },
    },
    tidalRules:{
      typeHeure:"DESCENDANT ÉTABLI + PLATIER À MI-MARÉE",
      montantOuDescendant:"Descendant dominant sur le chenal. Le platier se pêche à mi-marée dans les deux sens.",
      description:"Même logique que Régnéville, à échelle plus réduite et plus lisible. Bon spot de repli quand l'ouest souffle trop pour les pointes.",
      windows:[
        { id:"po1", label:"PM+1h → PM+4h30", phase:"pm", offsetBefore:1.0, offsetAfter:4.5, tidePhaseType:"descendant", priority:"prime",
          note:"Vidange du havre par le chenal. Dérive de souple, contact permanent." },
        { id:"po2", label:"Fin de flot sur platier (PM−2,5 → PM−0,5)", phase:"pm", offsetBefore:-2.5, offsetAfter:-0.5, tidePhaseType:"montant", priority:"bon",
          note:"Platier recouvert de peu d'eau, bars en chasse sur les cassures. Souple léger ou minnow." },
        { id:"po3", label:"Basse mer et premier flot (BM−0,5 → BM+1,5)", phase:"bm", offsetBefore:-0.5, offsetAfter:1.5, tidePhaseType:"montant", priority:"bon",
          note:"Le chenal concentre mécaniquement le poisson quand le reste est à découvert." },
      ],
      lifeHack:"Repérer le platier à basse mer par grand coefficient : les cassures et cuvettes qu'on y voit sont exactement les postes qu'on pêchera à mi-marée.",
    },
    lures:[
      { name:"Shad souple tête plombée", color:"Naturel / blanc", weight:"12-20 g", technique:"Dérive dans le chenal, plombage réglé sur le courant." },
      { name:"Black Minnow 120", color:"Kaki / Ayu", weight:"tête 12-18 g", technique:"Référence Cotentin du bord. Texan limitant les croches sur platier." },
      { name:"Minnow à bavette", color:"Naturel / dos sombre", weight:"14-20 g", technique:"Sur le platier recouvert, récupération lente." },
    ],
    access:"Parkings du havre et du bourg. Berges praticables, platier accessible à basse mer.",
    // Sécurité : consignes affichées dans le verdict et l'onglet Accès (« when » = active selon le jour).
    securite:[{ t:"Platier accessible à basse mer seulement : surveiller la montée depuis le platier.", s:"fiche du spot (accès)"}],
  },

  // ══════════════════════════════════════════════════════════
  // 6. CAP DE CARTERET
  // ══════════════════════════════════════════════════════════
  {
    id:"carteret", tidePort:"carteret", isLocal:false, zone:"inter", dangerLevel:3,
    name:"Cap de Carteret", subtitle:"Cap rocheux, phare, tombant",
    distance:"40 min", distMin:40, coords:"49°22'N 1°48'W",
    type:"CAP ROCHEUX", color:"#0ea5e9",
    // Fiche terrain : ce que le fond permet ou interdit, et comment monter le leurre.
    terrain:{
      fond:"Roche franche, platier rocheux au pied du cap, tombant vers le large.",
      encombrement:3,
      gratter:"non",
      // Profondeur estimée d'après la fiche (aucune sonde) : fixe la base du poids des têtes.
      prof:{ cls:"tombant", why:"Tombant vers le large au pied du cap (fiche)." },
      couches:["surface", "sous-surface", "mi-eau"],
      montage:"Black Minnow monté texan ; souple lourd compté pour longer le pied de roche sans le racler.",
      conseils:["Pêcher le remous en aval du cap, là où le courant ralentit.", "Spot de ton guide d'origine : une seule source, qui ne fait que le nommer (mieuxpecher : « Cap de Carteret à Barneville »)."],
      confidence:"inference",
      source:"Déduit de la description du fond de ce spot",
      // Faits précis tirés de sources citées (recherche du 10/10/2026).
      faits:[
        { t:"De Carteret à Urville-Nacqueville « alternent baies sableuses et caps rocheux », avec des platiers rocheux au pied des caps.", s:"CPIE du Cotentin — où pêcher" },
      ],
    },
    coefBand:[50,70,88,100], coefHardMax:108,
    // Plateau 70-90 : préférence d'un pêcheur du Cotentin (despoissonssigrands.com, sortie en bateau). Le courant « très fort »
    // au-delà de 90 et la dérive de plus de 6 nœuds (en bateau) visent « certains spots du nord de la côte » : l'appliquer
    // à Carteret est une extrapolation, signalée comme telle.
    courantFort: { above: 90, t: "au cap, le courant s'accélère fortement (fiche) ; au-delà de 90, « le courant est très fort » selon un pêcheur du Cotentin, qui décrit en bateau une dérive de plus de 6 nœuds sur des spots du nord (extrapolé à Carteret)." },
    houleMax:1.5,
    exposedAngles:[247.5,270,292.5,315], shelteredAngles:[90,112.5],
    weatherNote:"Cap exposé de tous les secteurs ouest. Houle réfléchie sur la roche par mer formée.",
    sources:[
      "cpiecotentin.com — 'Plus au nord, de Carteret à Urville-Nacqueville, alternent baies sableuses et caps rocheux au pied desquels se trouvent des platiers rocheux'",
      "peche.com — Trouver les bons spots pour pêcher le bar : les plateaux rocheux",
      "despoissonssigrands.com — au-delà du coefficient 90, « le courant est très fort » ; en bateau, « certains spots du nord de la côte sont quasiment impossibles à pêcher » (dérive supérieure à 6 nœuds) — https://despoissonssigrands.com/lescarnetsdepeche/peche-du-bar-en-automne-retour-sur-une-excellente-sortie-dans-le-cotentin",
    ],
    topology:{
      fond:{ text:"Roche franche, platier rocheux au pied du cap, tombant vers le large. Rupture nette dans une côte majoritairement sableuse.", confidence:"verified" },
      structure:{ text:"Cap marquant l'entrée de la baie de Carteret. Le courant s'accélère fortement à son extrémité et crée des remous exploitables en aval.", confidence:"inference" },
      exposition:{ text:"Très exposé au secteur ouest. Le vent d'est offre le seul abri réel.", confidence:"inference" },
      courant:{ text:"Fort, en augmentation rapide avec le coefficient. Au-delà de 90, une source Cotentin (récit en bateau) décrit des spots du nord quasiment impossibles à pêcher ; Carteret n'y est pas nommé.", confidence:"inference" },
      bars:{ text:"Profondeur, oxygénation et courant permanent : configuration de plateau rocheux favorable aux gabarits supérieurs à la moyenne du secteur sableux voisin.", confidence:"inference" },
    },
    tidalRules:{
      typeHeure:"FIN DE JUSANT + DÉBUT DE FLOT",
      montantOuDescendant:"Les deux, mais autour des basculements. Au plus fort du courant le cap devient difficilement pêchable — règle générale du Cotentin.",
      description:"Spot de qualité plutôt que de quantité. Les fenêtres sont courtes et encadrées par la violence du courant.",
      windows:[
        { id:"ca1", label:"Fin de jusant → BM+2h30", phase:"bm", offsetBefore:-1.5, offsetAfter:2.5, tidePhaseType:"montant", priority:"prime",
          note:"Pratique de l'auteur de peche.com au cap de la Hague (fin de descendante, début de remontante, jusqu'à 2 h-2 h 30 après le basculement), reprise ici par déduction." },
        { id:"ca2", label:"PM-2h30 → PM", phase:"pm", offsetBefore:-2.5, offsetAfter:0.0, tidePhaseType:"montant", priority:"bon",
          note:"Fin de flot le long du tombant. Souple lourd, prospection verticale du pied de roche." },
        { id:"ca3", label:"Étale de PM + tout début de jusant", phase:"pm", offsetBefore:0.0, offsetAfter:1.5, tidePhaseType:"descendant", priority:"bon",
          note:"Courant modéré, fenêtre confortable pour travailler la surface si la mer le permet." },
      ],
      lifeHack:"Ne pas descendre bas sur la roche : la houle réfléchie sur un cap arrive par séries irrégulières. Le meilleur poste est rarement le plus bas.",
    },
    lures:[
      { name:"Black Minnow 120 / 140", color:"Kaki / Ayu", weight:"tête 12-20 g", technique:"Référence explicite peche.com pour le bord en Cotentin. Le 140 quand des sardines sont présentes." },
      { name:"Stickbait 140-165 mm", color:"Ghost / Iwashi", weight:"25-40 g", technique:"Dans le courant du cap, animation ample. Vérifier la plage de la canne avant." },
      { name:"Souple lourd sur tombant", color:"Naturel / blanc", weight:"18-28 g", technique:"Prospection du pied de roche quand le poisson ne monte pas." },
    ],
    access:"Sentier des douaniers depuis Carteret, descentes rocheuses techniques. Chaussures de rando obligatoires.",
    // Sécurité : consignes affichées dans le verdict et l'onglet Accès (« when » = active selon le jour).
    securite:[{ t:"Coefficient au-delà de 90 : « le courant est très fort » ; en bateau, certains spots du nord de la côte deviennent « quasiment impossibles à pêcher » (dérive de plus de 6 nœuds). Carteret n'est pas nommé, mais le cap est exposé : rester haut et prudent.", s:"despoissonssigrands.com (sortie en bateau, spots du nord) — appliqué à Carteret par extrapolation", when: { coefAbove:90}},
      { t:"Ne pas descendre bas sur la roche : la houle réfléchie sur le cap arrive par séries irrégulières. Chaussures de randonnée, descentes techniques.", s:"fiche du spot (conseil et accès)"}],
  },

  // ══════════════════════════════════════════════════════════
  // 7. GRANVILLE — Pointe du Roc
  // ══════════════════════════════════════════════════════════
  {
    id:"granville", tidePort:"granville", isLocal:false, zone:"sud", dangerLevel:3,
    name:"Granville", subtitle:"Pointe du Roc, marnage maximal",
    // Position : pointe du Roc (Google Maps, 29/10/2026).
    distance:"50 min", distMin:50, coords:"48°50,0'N 1°36,9'W", lat:48.834018, lon:-1.614315,
    type:"PROMONTOIRE ROCHEUX", color:"#0ea5e9",
    // Fiche terrain : ce que le fond permet ou interdit, et comment monter le leurre.
    terrain:{
      fond:"Roche franche, platiers découvrant très largement, tombants portuaires.",
      encombrement:3,
      gratter:"non",
      // Profondeur estimée d'après la fiche (aucune sonde) : fixe la base du poids des têtes.
      prof:{ cls:"tombant", why:"Tombants portuaires ; platiers qui découvrent très largement (fiche)." },
      couches:["surface", "sous-surface", "mi-eau"],
      montage:"Texan sur la roche ; prospection verticale des tombants en restant au-dessus du fond.",
      conseils:["Avec le marnage de Granville, repérer à basse mer les cassures qui seront recouvertes au flot.", "Spot de ton guide d'origine : une seule source, qui ne fait que nommer « Pointe du Roc » et « Cap Lihou » (mieuxpecher)."],
      confidence:"inference",
      source:"Déduit de la description du fond de ce spot",
    },
    coefBand:[50,70,88,105], coefHardMax:112,
    // Plateau 70-90 : préférence d'un pêcheur du Cotentin (despoissonssigrands.com, récit de sortie en bateau), faute de source propre au spot ; les pentes de part et d'autre sont des hypothèses de modèle. Fin de plateau à 88 : marnage maximal de la côte, les fenêtres se resserrent en vive-eau (hypothèse).
    houleMax:1.8,
    exposedAngles:[247.5,270,292.5], shelteredAngles:[67.5,90,112.5],
    weatherNote:"Promontoire exposé mais offrant des postes sur plusieurs orientations : on trouve presque toujours un côté abrité.",
    sources:[
      "shom.fr / maree.info — Granville, port de référence du secteur, parmi les plus forts marnages d'Europe continentale",
      "peche.com — Trouver les bons spots pour pêcher le bar : les plateaux rocheux",
      "despoissonssigrands.com — gestion du courant en Cotentin selon le coefficient",
    ],
    topology:{
      fond:{ text:"Roche franche, platiers découvrant très largement par grand coefficient, tombants portuaires.", confidence:"inference" },
      structure:{ text:"Promontoire avancé au sud de la côte ouest, port en pied. Le marnage exceptionnel transforme complètement le paysage entre BM et PM.", confidence:"verified" },
      exposition:{ text:"Plusieurs orientations disponibles autour de la pointe : c'est le principal atout du spot par vent fort.", confidence:"inference" },
      courant:{ text:"Parmi les plus violents de la côte du fait du marnage. Fenêtres courtes, centrées sur les étales et les débuts de courant.", confidence:"inference" },
      bars:{ text:"Roche, courant et profondeur accessible du bord. Configuration favorable, mais fenêtres étroites imposées par la violence du courant.", confidence:"inference" },
    },
    tidalRules:{
      typeHeure:"ÉTALES + DÉBUTS DE COURANT",
      montantOuDescendant:"Les deux, autour des basculements. Le plein courant est difficilement exploitable du bord.",
      description:"Le marnage énorme est à la fois l'atout et le piège : un poste accessible à basse mer disparaît en une heure.",
      windows:[
        { id:"gr1", label:"BM → BM+2h30", phase:"bm", offsetBefore:-0.5, offsetAfter:2.5, tidePhaseType:"montant", priority:"prime",
          note:"Début de flot sur les platiers découverts. Pratique de l'auteur de peche.com au cap de la Hague, reprise ici par déduction." },
        { id:"gr2", label:"PM-2h30 → PM", phase:"pm", offsetBefore:-2.5, offsetAfter:0.0, tidePhaseType:"montant", priority:"bon",
          note:"Fin de flot sur les tombants. Souple lourd le long de la roche." },
        { id:"gr3", label:"PM → PM+2h", phase:"pm", offsetBefore:0.0, offsetAfter:2.0, tidePhaseType:"descendant", priority:"bon",
          note:"Début de jusant, courant encore maîtrisable. Surface possible si mer calme." },
      ],
      lifeHack:"Le marnage atteint 12,6 m en 2026 (calcul de marée du guide, 21 mars). Photographier son poste à l'arrivée et noter l'heure : c'est le seul repère fiable pour juger de la montée.",
    },
    lures:[
      { name:"Souple lourd sur tombant", color:"Naturel / blanc", weight:"18-28 g", technique:"Prospection verticale des tombants portuaires et du pied de roche." },
      { name:"Black Minnow 120", color:"Kaki", weight:"tête 15-20 g", technique:"Polyvalent sur roche, texan limitant les croches." },
      { name:"Stickbait 140 mm", color:"Ghost / Iwashi", weight:"25-30 g", technique:"Sur les platiers à l'étale de basse mer, quand la mer est plate." },
    ],
    access:"Accès urbain, plusieurs postes autour de la pointe et du port. Stationnement facile.",
    // Sécurité : consignes affichées dans le verdict et l'onglet Accès (« when » = active selon le jour).
    securite:[{ t:"Marnage jusqu'à 12,6 m en vive-eau (calcul de marée du guide, 2026) : un poste accessible à basse mer peut disparaître vite. Photographier son poste et noter l'heure à l'arrivée.", s:"calcul de marée du guide · fiche du spot (conseil)"}],
  },

  // ══════════════════════════════════════════════════════════
  // 8. ANSE DE SCIOTOT — Flamanville / Les Pieux
  // ══════════════════════════════════════════════════════════
  {
    id:"sciotot", tidePort:"sciotot", isLocal:false, zone:"far", dangerLevel:2,
    name:"Anse de Sciotot", subtitle:"Flamanville / Les Pieux",
    // Position : plage de Sciotot (Google Maps, 29/10/2026) ; l'ancienne position était à 3 km au large.
    // Temps de route revu : 40 km à vol d'oiseau depuis Pirou, après Surtainville sur la même route.
    distance:"≈ 1h10", distMin:68, coords:"49°29,8'N 1°50,9'W", lat:49.496737, lon:-1.847926,
    type:"ANSE ENTRE CAPS", color:"#a78bfa",
    // Fiche terrain : ce que le fond permet ou interdit, et comment monter le leurre.
    terrain:{
      fond:"Sable dans l'anse, roche et platiers aux deux extrémités.",
      encombrement:2,
      gratter:"texan",
      // Profondeur estimée d'après la fiche (aucune sonde) : fixe la base du poids des têtes.
      prof:{ cls:"peu", why:"Anse de sable, roche et platiers aux extrémités (fiche)." },
      couches:["surface", "sous-surface", "mi-eau", "fond"],
      montage:"Tête plombée au centre de l'anse sableuse ; texan aux extrémités rocheuses.",
      conseils:["Deux pêches distinctes : linéaire sur le sable, au-dessus des cassures aux extrémités.", "Spot de ton guide d'origine : aucune source publiée vérifiée ne le cite pour le bar (29/10/2026) ; ton journal fera foi."],
      confidence:"inference",
      source:"Déduit de la description du fond de ce spot",
      // Faits précis tirés de sources citées (recherche du 10/10/2026).
      faits:[
        { t:"Barre rocheuse au niveau de la Roquette, dans l'anse.", s:"Normandie Tourisme — Plage de Sciotot" },
        { t:"Réglementation locale : « le mode de pêche à l'hameçon (paillots…), lors de la période autorisée (16/09 au 14/06) est strictement interdit au droit de la cale jusqu'à la barre rocheuse au niveau de la Roquette » ; pêche interdite dans la zone de baignade surveillée. Vérifier en mairie si le lancer est concerné.", s:"Normandie Tourisme — Plage de Sciotot" },
      ],
    },
    coefBand:[50,70,90,108],
    // Plateau 70-90 : préférence d'un pêcheur du Cotentin (despoissonssigrands.com, récit de sortie en bateau), faute de source propre au spot ; les pentes de part et d'autre sont des hypothèses de modèle.
    houleMax:2.0,
    exposedAngles:[247.5,270,292.5], shelteredAngles:[67.5,90],
    weatherNote:"Anse encadrée de caps : la houle d'ouest y entre mais s'y amortit partiellement.",
    sources:[
      "normandie-tourisme.fr — Plage de Sciotot (réglementation de la pêche)",
      "cpiecotentin.com — alternance de baies sableuses et de caps rocheux avec platiers au pied, de Carteret à Urville-Nacqueville",
      "peche.com — Pêche du bar du bord dans le Cotentin (technique du flot sur estran)",
    ],
    topology:{
      fond:{ text:"Sable dans l'anse, roche et platiers aux deux extrémités. Configuration mixte offrant deux types de postes.", confidence:"verified" },
      structure:{ text:"Anse entre le cap du Rozel au sud et le cap de Flamanville au nord. Les caps piègent partiellement la houle et créent des zones de calme relatif exploitables par vent d'ouest modéré.", confidence:"inference" },
      exposition:{ text:"Ouvert à l'ouest mais les deux caps amortissent. Meilleur repli du secteur nord par vent d'O/SO soutenu.", confidence:"inference" },
      courant:{ text:"Modéré dans l'anse, accéléré au droit des caps.", confidence:"inference" },
      bars:{ text:"Les cassures rocheuses des extrémités concentrent la biomasse ; l'anse sableuse se pêche au flot comme le reste de la côte.", confidence:"inference" },
    },
    tidalRules:{
      typeHeure:"MONTANT + CASSURES DES CAPS",
      montantOuDescendant:"Montant dominant sur l'anse. Les caps se pêchent autour des basculements.",
      description:"Spot polyvalent et relativement sûr, utile quand les pointes exposées sont impêchables.",
      windows:[
        { id:"sc1", label:"Mi-montant → PM-1h", phase:"pm", offsetBefore:-3.5, offsetAfter:-1.0, tidePhaseType:"montant", priority:"prime",
          note:"Le flot recouvre l'estran de l'anse. Suivre l'eau, prospecter large." },
        { id:"sc2", label:"BM → BM+2h30 sur les caps", phase:"bm", offsetBefore:-0.5, offsetAfter:2.5, tidePhaseType:"montant", priority:"prime",
          note:"Cassures rocheuses des extrémités au début du flot. Souple le long de la roche." },
        { id:"sc3", label:"Début de jusant", phase:"pm", offsetBefore:0.5, offsetAfter:2.5, tidePhaseType:"descendant", priority:"bon",
          note:"L'eau se retire des cassures et expose les proies. Prospection des bordures." },
      ],
      lifeHack:"Vérifier les accès autorisés avant de partir : le site industriel voisin impose des zones réglementées dont le tracé peut évoluer.",
    },
    lures:[
      { name:"Shad souple 10-12 cm", color:"Naturel / paillettes par grand soleil", weight:"12-20 g", technique:"Prospection de l'anse au flot et des cassures aux extrémités." },
      { name:"Black Minnow 120", color:"Kaki / Ayu", weight:"tête 12-18 g", technique:"Référence Cotentin du bord, polyvalent sable et roche." },
      { name:"Stickbait 125-140 mm", color:"Ghost / blanc en basse lumière", weight:"18-25 g", technique:"Surface sur l'anse quand la mer est formée sans être démontée." },
    ],
    access:"Parking de la plage de Sciotot, accès direct. Caps accessibles à pied par l'estran à marée descendante. Réglementation locale de la pêche à l'hameçon entre la cale et la barre rocheuse de la Roquette (voir fiche terrain) ; pêche interdite dans la zone de baignade surveillée l'été.",
    // Sécurité : consignes affichées dans le verdict et l'onglet Accès (« when » = active selon le jour).
    securite:[{ t:"Zones réglementées autour du site industriel voisin, tracé susceptible d'évoluer ; pêche interdite dans la zone de baignade surveillée l'été.", s:"fiche du spot (accès) · Normandie Tourisme"},
      { t:"Les caps se rejoignent par l'estran à marée descendante : le flot peut couper le retour au pied des caps. Repartir avant la remontée.", s:"fiche du spot (accès) · prudence du guide (déduit)", when:{ phase:"montant" } }],
  },

  // ══════════════════════════════════════════════════════════
  // 9. SURTAINVILLE / LE ROZEL
  // ══════════════════════════════════════════════════════════
  {
    id:"surtainville", tidePort:"surtainville", isLocal:false, zone:"far", dangerLevel:2,
    name:"Surtainville", subtitle:"Longue plage exposée, Le Rozel",
    // Temps de route revu : 35 km à vol d'oiseau depuis Pirou (règle du guide : ≈ 58 min).
    distance:"≈ 1h", distMin:58, coords:"49°27'N 1°49'W",
    type:"PLAGE EXPOSÉE", color:"#a78bfa",
    // Fiche terrain : ce que le fond permet ou interdit, et comment monter le leurre.
    terrain:{
      fond:"Sable, estran plat et très long, fosses parallèles au rivage.",
      encombrement:1,
      gratter:"oui",
      // Profondeur estimée d'après la fiche (aucune sonde) : fixe la base du poids des têtes.
      prof:{ cls:"estran", why:"Estran plat et très long, fosses parallèles au rivage (fiche)." },
      couches:["surface", "sous-surface", "mi-eau", "fond"],
      montage:"Tête plombée légère en linéaire lent dans la première fosse.",
      conseils:["Les fosses se déplacent après chaque tempête : les repérer à marée basse.", "Spot de ton guide d'origine : aucune source publiée vérifiée ne le cite pour le bar ; le poste voisin cité est « Cap de Rozel à la montante » (mieuxpecher)."],
      confidence:"inference",
      source:"Déduit de la description du fond de ce spot",
      // Faits précis tirés de sources citées (recherche du 10/10/2026).
      faits:[
        { t:"Site Natura 2000 « Banc et récifs de Surtainville » : 6 331 ha de bancs de sable et 281 ha de récifs ; leur position par rapport au bord n'est pas précisée.", s:"INPN — Natura 2000 FR2502018" },
      ],
    },
    coefBand:[50,70,90,110],
    // Plateau 70-90 : préférence d'un pêcheur du Cotentin (despoissonssigrands.com, récit de sortie en bateau), faute de source propre au spot ; les pentes de part et d'autre sont des hypothèses de modèle.
    houleMax:2.2,
    exposedAngles:[247.5,270,292.5], shelteredAngles:[67.5,90],
    weatherNote:"Plage franchement exposée à l'ouest, aucune protection sur des kilomètres.",
    sources:[
      "inpn.mnhn.fr — Natura 2000 FR2502018 Banc et récifs de Surtainville",
      "cpiecotentin.com — grandes plages sableuses de la côte ouest, estrans découvrant largement",
      "peche.com — Pêche du bar du bord dans le Cotentin : le flot recouvre l'estran et les bars le suivent",
    ],
    topology:{
      fond:{ text:"Sable, estran plat et très long. Fosses parallèles au rivage creusées par la houle dominante.", confidence:"inference" },
      structure:{ text:"Longue plage rectiligne sans structure dure marquante. Ce sont les fosses et les barres qui font les postes, et elles se déplacent au fil des tempêtes.", confidence:"inference" },
      exposition:{ text:"Plein ouest, fetch très long. Le premier spot du secteur à devenir impêchable par vent d'O soutenu.", confidence:"inference" },
      courant:{ text:"Parallèle au rivage, modéré, avec des courants de retour dans les baïnes par forte houle.", confidence:"inference" },
      bars:{ text:"Le bar patrouille dans la première fosse au montant, souvent à moins de vingt mètres du bord. Configuration classique de plage exposée.", confidence:"inference" },
    },
    tidalRules:{
      typeHeure:"MONTANT DANS LA PREMIÈRE FOSSE",
      montantOuDescendant:"Montant très dominant. Le descendant vide les fosses et disperse le poisson.",
      description:"Spot simple mais exigeant en lecture : tout se joue sur la localisation des fosses, qui changent d'une saison à l'autre.",
      windows:[
        { id:"su1", label:"Début → mi-montant", phase:"bm", offsetBefore:0.5, offsetAfter:3.0, tidePhaseType:"montant", priority:"prime",
          note:"Première fosse en eau. Lancer parallèlement au rivage, pas vers le large — le poisson est près du bord." },
        { id:"su2", label:"Mi-montant → PM-1h", phase:"pm", offsetBefore:-3.0, offsetAfter:-1.0, tidePhaseType:"montant", priority:"prime",
          note:"Le flot gagne le haut de plage. Suivre l'eau, prospecter les creux." },
        { id:"su3", label:"Début de jusant", phase:"pm", offsetBefore:0.5, offsetAfter:2.5, tidePhaseType:"descendant", priority:"bon",
          note:"Vidange par les baïnes, concentration temporaire des proies." },
      ],
      lifeHack:"Repérer les fosses à basse mer par grand coefficient et les photographier : elles sont invisibles à marée haute et ce sont pourtant les seuls postes.",
    },
    lures:[
      { name:"Shad souple tête plombée légère", color:"Naturel / blanc", weight:"10-18 g", technique:"Prospection de la première fosse en linéaire lent, parallèlement au rivage." },
      { name:"Long bill minnow", color:"Naturel argent", weight:"14-22 g", technique:"Efficace en très peu d'eau sur estran sableux, comme sur les bancs d'Agon." },
      { name:"Stickbait 125 mm", color:"Ghost / blanc", weight:"16-22 g", technique:"Au ras du bord au petit jour, quand la mer n'est pas trop formée." },
    ],
    access:"Parkings de plage à Surtainville et au Rozel, accès direct par les dunes.",
    // Sécurité : consignes affichées dans le verdict et l'onglet Accès (« when » = active selon le jour).
    securite:[{ t:"Estran plat : le flot gagne vite. Repérer sa ligne de retour avant de s'avancer vers les fosses.", s:"prudence générale (déduit)"}],
  },

  // ══════════════════════════════════════════════════════════
  // 10. GOURY / CAP DE LA HAGUE — Raz Blanchard
  // ══════════════════════════════════════════════════════════
  {
    id:"goury", tidePort:"goury", isLocal:false, zone:"far", dangerLevel:3,
    name:"Goury", subtitle:"Cap de la Hague, entrée du Raz Blanchard",
    // Position : port de Goury (Google Maps, 29/10/2026). Temps de route revu : 65 km à vol d'oiseau depuis Pirou.
    distance:"≈ 1h40", distMin:100, coords:"49°42,9'N 1°56,7'W", lat:49.715018, lon:-1.945278,
    type:"RAZ / COURANT EXTRÊME", color:"#ef4444",
    // Fiche terrain : ce que le fond permet ou interdit, et comment monter le leurre.
    terrain:{
      fond:"Roche franche, estran rocheux, tombants profonds, courant du raz.",
      encombrement:3,
      gratter:"non",
      // Profondeur estimée d'après la fiche (aucune sonde) : fixe la base du poids des têtes.
      prof:{ cls:"tombant", why:"Tombants profonds, courant du raz (fiche)." },
      couches:["surface", "sous-surface", "mi-eau"],
      montage:"Black Minnow ou souple lourd en dérive, tenu au-dessus des roches ; stickbait à l'étale.",
      conseils:["Fenêtres courtes autour des étales : le reste du temps, le courant interdit toute pêche précise."],
      confidence:"inference",
      source:"Déduit de la description du fond de ce spot",
      // Faits précis tirés de sources citées (recherche du 10/10/2026).
      faits:[
        { t:"Pointe de la Hague : sorties du soir sous les falaises ; shads de 10 cm plombés de 12 à 25 g selon le courant pour imiter le sprat, laissés descendre « de 1 à 2 mètres maximum » ; Black Minnow coloris Ayu très efficace ; suivre les oiseaux.", s:"peche.com — « Sortie de pêche estivale à la recherche des bars du Cotentin »" },
        { t:"Les bars de chasse sont souvent calibrés ; il est « rare de faire de gros poissons lors des chasses ».", s:"peche.com" },
      ],
    },
    // v8.9 : plateau abaissé à 65-80 — peche.com conseille pour la Hague des coefficients « n'excédant pas 80 » ; plus proposé au-delà de 90.
    coefBand:[50,65,80,90], coefHardMax:90,
    // Raz Blanchard. Plateau 70-90 : préférence d'un pêcheur du Cotentin (despoissonssigrands.com) ; au-delà, « le courant
    // est très fort » et, en bateau, la dérive dépasse 6 nœuds sur les spots du nord. Du bord, aucune source ne fixe de
    // limite : ne plus proposer le spot au-delà de 90 est un choix de prudence du guide.
    coefHardMaxWhy: "au-delà de 90, « le courant est très fort » au Raz Blanchard (despoissonssigrands.com) : spot non proposé, par prudence.",
    houleMax:1.5,
    exposedAngles:[270,292.5,315,0], shelteredAngles:[157.5,180],
    weatherNote:"Point le plus exposé de la côte. Mer croisée fréquente, vent renforcé par l'effet de cap.",
    sources:[
      "peche.com — Sortie de pêche estivale à la recherche des bars du Cotentin",
      "peche.com — Pêche du bar du bord dans le Cotentin : 'Le mythique Cap de la Hague est connu pour abriter l'un des courants les plus puissants au monde avec le fameux Raz Blanchard. Cette zone très mouvementée est un excellent spot pour la pêche du bar'",
      "despoissonssigrands.com — « Le phare de Goury marque l'entrée du Raz Blanchard. Ce violent courant est un excellent spot pour la pêche du bar » ; coefficient préféré « entre 70 et 90 » ; au-delà, en bateau, dérive « supérieure à 6 nœuds » sur des spots du nord — https://despoissonssigrands.com/lescarnetsdepeche/peche-du-bar-en-automne-retour-sur-une-excellente-sortie-dans-le-cotentin",
      "peche.com — technique : privilégier la fin de la descendante et le début de la remontante, jusqu'à 2h-2h30 après le basculement",
    ],
    topology:{
      fond:{ text:"Roche franche, estran rocheux, tombants profonds. Fonds extrêmement brassés par le courant du raz.", confidence:"verified" },
      structure:{ text:"Le phare de Goury marque l'entrée du Raz Blanchard, l'un des courants les plus puissants au monde. Remous permanents, veines et contre-courants sur toute la zone.", confidence:"verified" },
      exposition:{ text:"Exposé du sud-ouest au nord. Aucun abri réel. Mer croisée quand le vent contrarie le courant.", confidence:"inference" },
      courant:{ text:"Extrême. peche.com (bord, Cotentin) : au plus fort du courant, il est compliqué de pêcher correctement. despoissonssigrands.com (en bateau) : au-delà du coefficient 90, la dérive dépasse 6 nœuds sur des spots du nord.", confidence:"verified" },
      bars:{ text:"Zone qualifiée d'excellent spot pour la pêche du bar par deux sources indépendantes. Oxygénation et biomasse maximales, poissons de passage, gabarits supérieurs. Mais fenêtres praticables étroites.", confidence:"verified" },
    },
    tidalRules:{
      typeHeure:"FIN DE JUSANT → BM+2h30",
      montantOuDescendant:"La règle est explicite dans la source : fin de la descendante et début de la remontante, jusqu'à 2h à 2h30 après le basculement. À ce moment le flot recouvre l'estran et les bars le suivent.",
      description:"Le spot le plus puissant et le plus dangereux de la liste. Les fenêtres sont dictées par le courant, pas par les préférences du pêcheur.",
      windows:[
        { id:"gy1", label:"Fin de jusant → BM+2h30", phase:"bm", offsetBefore:-1.5, offsetAfter:2.5, tidePhaseType:"montant", priority:"prime",
          note:"Pratique de l'auteur de peche.com au cap de la Hague. Attention : le jusant du raz est à son maximum « vers l'heure de la basse mer de Cherbourg » (Wikipédia) — poste haut, à l'abri du courant. Black Minnow 120 sur tête 12-18 g." },
        { id:"gy2", label:"Pleine mer (plein courant du raz)", phase:"pm", offsetBefore:-1.0, offsetAfter:1.0, tidePhaseType:"variable", priority:"bon",
          note:"Pas une étale : le courant du raz Blanchard est à son maximum « aux environs de l'heure de la pleine mer de Cherbourg » (Wikipédia). Poste haut, leurre lourd, coefficient modéré seulement." },
        { id:"gy3", label:"Début de jusant (PM+1 → PM+2,5)", phase:"pm", offsetBefore:1.0, offsetAfter:2.5, tidePhaseType:"descendant", priority:"bon",
          note:"Le courant du raz faiblit vers la mi-marée, où il renverse (Wikipédia). Par coefficient modéré : peche.com conseille pour la Hague de ne pas dépasser 80." },
      ],
      lifeHack:"Le coefficient est ici un facteur de sécurité autant que de pêche. Au-delà de 90, « le courant est très fort » ; en bateau, des spots du nord deviennent quasiment impossibles à pêcher. Du bord, le guide ne propose plus le spot, par prudence.",
    },
    lures:[
      { name:"Black Minnow 120 / 140", color:"Kaki / Ayu", weight:"tête 12-20 g", technique:"Référence explicite peche.com pour le bord en Cotentin. Le 140 quand les sardines sont présentes, monté sur tête de 20 g en linéaire." },
      { name:"Souple lourd en dérive", color:"Blanc / naturel", weight:"20-30 g", technique:"Pour tenir dans le courant quand il reprend. Vérifier la plage de la canne." },
      { name:"Stickbait 140-165 mm", color:"Ghost / Iwashi", weight:"25-40 g", technique:"Dans les remous à l'étale, animation ample. Fenêtre courte." },
    ],
    access:"Port de Goury à Auderville, estran rocheux alentour. Descente engagée, roche glissante.",
    // Sécurité : consignes affichées dans le verdict et l'onglet Accès (« when » = active selon le jour).
    securite:[{ t:"Coefficient au-delà de 90 : « le courant est très fort » ; en bateau, la dérive dépasse 6 nœuds sur des spots du nord. Du bord, au pied du Raz Blanchard : spot non proposé, par prudence.", s:"despoissonssigrands.com (sortie en bateau) · choix de prudence du guide", when: { coefAbove:90}},
      { t:"Descente engagée, roche glissante : jamais seul, gilet.", s:"fiche du spot (accès)"}],
  },

];
