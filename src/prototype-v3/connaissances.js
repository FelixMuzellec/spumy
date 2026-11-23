// FICHIER GÉNÉRÉ par scripts/connaissances-v6.mjs depuis data/knowledge : ne pas modifier à la main.
/** Échelle des niveaux de preuve (bar-bord.json, « echelle »). */
export const ECHELLE = {
 "1": "Scientifique ou institutionnel : publication scientifique, Ifremer, SHOM, Météo-France, MNHN (INPN), Région (inventaire du patrimoine), textes réglementaires",
 "2": "Observation documentée : article, guide, ouvrage ou page attribuable (auteur ou éditeur identifié)",
 "3": "Retour local identifiable : pêcheur nommé ou pseudonyme suivi (forum, blog, liste de spots), office de tourisme citant un pêcheur, ton journal",
 "4": "Hypothèse : déduction du guide, propre à un lieu ou à une situation, à vérifier",
 "5": "Heuristique : règle générale de pêcheur ou de modèle, appliquée sans source propre"
};
/** Connaissances sourcées sur le bar (règles générales). */
export const KNOW = {
 "seuils-thermiques": {
  "enonce": "Présence côtière selon la température de l'eau : au plus bas sous 7,5 °C, résiduelle sous 9,5 °C, en retour sous 11,5 °C, pleine de 13,5 à 19 °C, réduite au-delà.",
  "niveau": 4,
  "sources": [
   {
    "ref": "de Pontual H. et al. (2023). Seasonal migration, site fidelity, and population structure of European seabass (Dicentrarchus labrax). ICES Journal of Marine Science 80 : 1606-1618 (programme Bargip, Ifremer)",
    "url": "https://doi.org/10.1093/icesjms/fsad087",
    "niveau": 1
   },
   {
    "ref": "Edwards J. E. et al. (2025). Multi-year tracking of European sea bass shows large-scale connectivity, summer site fidelity, and repeatability in migration timing. ICES Journal of Marine Science 82(10) : fsaf190",
    "url": "https://doi.org/10.1093/icesjms/fsaf190",
    "niveau": 1
   }
  ]
 },
 "eau-chaude": {
  "enonce": "Au-delà de 19 °C, le bar décale son activité vers la nuit et les crépuscules.",
  "niveau": 5,
  "sources": []
 },
 "lumiere-basse": {
  "enonce": "Le bar mord davantage en lumière basse (aube, crépuscule) qu'en plein jour.",
  "niveau": 2,
  "sources": [
   {
    "ref": "peche.com — Quelle couleur choisir selon l'eau et la météo ? (L. Duclos, 03/06/2026)",
    "url": "https://www.peche.com/article/52017/peche-aux-leurres-quelle-couleur-choisir-selon-l-eau-et-la-meteo",
    "niveau": 2
   },
   {
    "ref": "Millot S., Bégout M.-L. (2009). Individual fish rhythm directs group feeding: a case study with sea bass juveniles (Dicentrarchus labrax) under self-demand feeding conditions. Aquatic Living Resources (en ligne le 23/10/2009) — juvéniles en bassin",
    "url": "https://www.cambridge.org/core/journals/aquatic-living-resources/article/individual-fish-rhythm-directs-group-feeding-a-case-studywith-sea-bass-juveniles-dicentrarchus-labrax-under-selfdemand-feeding-conditions/E0BE5D25E180587973B3100430A477BA",
    "niveau": 1
   },
   {
    "ref": "Chen I.-H. et al. (2023). Food anticipatory behaviour on European seabass in sea cages. Frontiers in Marine Science 10 : 1168953 — poissons en cage",
    "url": "https://doi.org/10.3389/fmars.2023.1168953",
    "niveau": 1
   }
  ]
 },
 "ciel-couvert": {
  "enonce": "Par ciel couvert, le bar se montre moins méfiant de jour ; par ciel clair, l'inverse.",
  "niveau": 5,
  "sources": [
   {
    "ref": "peche.com — Quelle couleur choisir selon l'eau et la météo ? (L. Duclos, 03/06/2026)",
    "url": "https://www.peche.com/article/52017/peche-aux-leurres-quelle-couleur-choisir-selon-l-eau-et-la-meteo",
    "niveau": 2
   }
  ]
 },
 "maree-flot": {
  "enonce": "Le bar suit le flot sur les estrans et les bordures et se poste aux sorties d'eau au jusant ; les fenêtres de marée de chaque spot en dépendent.",
  "niveau": 2,
  "sources": [
   {
    "ref": "Edwards J. E. et al. (2025). Multi-year tracking of European sea bass shows large-scale connectivity, summer site fidelity, and repeatability in migration timing. ICES Journal of Marine Science 82(10) : fsaf190",
    "url": "https://doi.org/10.1093/icesjms/fsaf190",
    "niveau": 1
   },
   {
    "ref": "de Pontual H. et al. (2023). Seasonal migration, site fidelity, and population structure of European seabass (Dicentrarchus labrax). ICES Journal of Marine Science 80 : 1606-1618 (programme Bargip, Ifremer)",
    "url": "https://doi.org/10.1093/icesjms/fsad087",
    "niveau": 1
   },
   {
    "ref": "peche.com — La pêche du bar dans les vagues (11/06/2021)",
    "url": "https://www.peche.com/article/37249/la-peche-du-bar-dans-les-vagues-des-conditions-difficiles-souvent-payantes",
    "niveau": 2
   }
  ]
 },
 "coefficient-plage-utile": {
  "enonce": "Chaque spot a une plage utile de coefficient : trop faible, l'eau ne travaille pas ; trop fort, le courant devient impraticable du bord.",
  "niveau": 4,
  "sources": []
 },
 "courant-coefficient": {
  "enonce": "La vitesse du courant de marée croît avec le coefficient (atlas du SHOM).",
  "niveau": 2,
  "sources": [
   {
    "ref": "bateaux.com — Savoir lire un atlas des courants de marée du SHOM (O. Tourchon, 08/10/2020) : vitesse croissante avec le coefficient",
    "url": "https://www.bateaux.com/article/34870/decouvrir-la-carte-des-courants-de-maree",
    "niveau": 2
   }
  ]
 },
 "vent-exposition": {
  "enonce": "Un vent de mer modéré qui lève du clapot sur un spot exposé est favorable ; un vent de terre aplatit et clarifie l'eau, ce qui rend le poisson plus méfiant.",
  "niveau": 2,
  "sources": [
   {
    "ref": "peche.com — La pêche du bar dans les vagues (11/06/2021)",
    "url": "https://www.peche.com/article/37249/la-peche-du-bar-dans-les-vagues-des-conditions-difficiles-souvent-payantes",
    "niveau": 2
   }
  ]
 },
 "rafales-penalite": {
  "enonce": "Au-delà de 50 km/h de rafales, lancer, tenue de ligne et sécurité se dégradent : la note baisse (jusqu'à −2).",
  "niveau": 5,
  "sources": []
 },
 "pression": {
  "enonce": "Une pression haute et stable, ou une baisse lente, serait favorable ; une chute rapide ou une très haute pression le serait moins.",
  "niveau": 5,
  "sources": [
   {
    "ref": "lesbredouilleurs.com, peche.com, pecheurdumorin.fr, ici.fr, dailypresse.com, ultimate-fishing.net (cités dans model.js)",
    "url": null,
    "niveau": 5
   }
  ]
 },
 "pluie-turbidite": {
  "enonce": "Après plus de 5 mm de pluie en 36 h, l'eau est probablement teintée près des rivières ; au-delà de 15 mm, nettement.",
  "niveau": 4,
  "sources": []
 },
 "houle-turbidite": {
  "enonce": "Une houle d'au moins 1,5 m charge l'eau sur la côte ouverte.",
  "niveau": 4,
  "sources": []
 },
 "gros-coefficient-turbidite": {
  "enonce": "Les gros coefficients (95 et plus) peuvent troubler l'eau.",
  "niveau": 4,
  "sources": []
 }
};
/** Niveau de preuve de chaque rubrique de terrain des spots de Pirou (preuves-niveaux.json). */
export const NIVEAUX = {"agon":{"bars":2,"courant":4,"exposition":4,"fond":2,"structure":4,"terrain":4},"carteret":{"bars":4,"courant":4,"exposition":4,"fond":2,"structure":4,"terrain":4},"goury":{"bars":2,"courant":2,"exposition":4,"fond":2,"structure":2,"terrain":4},"gouville":{"bars":4,"courant":4,"exposition":4,"fond":1,"structure":2,"terrain":4},"granville":{"bars":4,"courant":4,"exposition":5,"fond":4,"structure":2,"terrain":4},"pirou":{"bars":3,"courant":4,"exposition":4,"fond":2,"structure":3,"terrain":4},"portbail":{"bars":4,"courant":4,"exposition":4,"fond":2,"structure":4,"terrain":4},"regneville":{"bars":3,"courant":5,"exposition":4,"fond":2,"structure":4,"terrain":4},"sciotot":{"bars":4,"courant":4,"exposition":4,"fond":2,"structure":4,"terrain":4},"surtainville":{"bars":5,"courant":4,"exposition":4,"fond":4,"structure":4,"terrain":4}};
