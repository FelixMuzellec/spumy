# Revue régionale du bar : comportement et alimentation

Phase 7 V3, priorité n° 1 du cadrage (Félix, 24 nov. 2026, 10 h 57). Version 1 du 25 novembre 2026 ; elle complète le référentiel biologique de la phase 5 (`docs/halieutique/REFERENTIEL-BIOLOGIQUE.md`) sans le répéter.

Ce document décrit ; il ne note pas. Les connaissances qu'il fonde sont dans `data/knowledge/bar-bord.json`, chacune avec sa zone de validité (pare-feu PF-33, contrôlé par `tests/knowledge.mjs`). La proposition de révision du moteur qui en découle est un changement à valider, jamais appliqué dans `src/` (PF-19).

## 1. Méthode

- **Sources lues le 25 nov.** (texte intégral quand l'accès était libre, sinon la partie lue est dite) :
    - de Pontual et al. 2023 (ICES JMS 80), version Archimer, jusqu'au début de la discussion ;
    - Goossens et al. 2024 (*Scientific Reports* 14 : 13180), version Archimer, environ les deux tiers ;
    - Goossens et al. 2023 (ICES JMS 80 : 1899-1910), résumé et début du texte ;
    - Fritsch 2005 (thèse UBO et Ifremer), chapitres B à D, p. 61 à 147 ; les p. 37 à 61 et la fin ne sont pas lues ;
    - Léauté 1986 (baie de Somme), en entier ;
    - Ifremer 2011, dossier « Le bar, une espèce convoitée », en entier ;
    - pages des projets BARGIP NOURRICERIES et BARFRAY (France Filière Pêche).
- **Sources non lues** (la page demandait une autorisation à laquelle personne ne pouvait répondre, ou le serveur renvoyait en boucle) :
    - de Pontual et al. 2019 (Iroise) ;
    - l'article de *Movement Ecology* 2024 sur les migrations autour du Royaume-Uni ;
    - la thèse de Carroll (2014, pays de Galles).
  Elles restent à lire (§ 6).
- **Zones** : Bretagne nord ; Iroise et cap Sizun ; Bretagne sud ; rades et rias (rade de Brest, abers, rias du sud) ; Cotentin jusqu'à Cherbourg. Une zone de validité sert au moteur par la position du spot. Elle n'apparaît jamais à l'écran comme un secteur (PF-09).
- **Biais déclarés** :
    - les poissons marqués de Bargip mesurent plus de 41,5 cm et ont été pris par des professionnels en juin ou en septembre ;
    - aucun marquage sur la côte ouest du Cotentin (Pirou, Portbail) ni en rade de Brest : ce qui s'y applique est INFÉRÉ des zones voisines ;
    - un débarquement de pêche suit l'effort, la météo et le marché, pas seulement l'abondance.

## 2. Ce que la revue établit, zone par zone

| Zone | Présence et résidence | Frai | Statut |
| --- | --- | --- | --- |
| Bretagne nord (Saint-Quay-Portrieux, Saint-Malo) | 71 % des bars marqués en juin partent frayer dans le golfe de Gascogne ; fidélité au site d'été 81 % ; fidélité à la frayère 92 % ; deux résidents dans l'aire nord sur les poissons suivis (de Pontual 2023) | Manche ouest : de début janvier à fin avril-début mai, pic de mi-février à fin mars (Fritsch 2005, p. 71 et 77-78) | VÉRIFIÉ, 1 |
| Iroise et cap Sizun (Audierne) | 67 % vers le golfe de Gascogne ; fidélité au site d'été 96 % ; cinq poissons restés dans l'aire nord ou près du lieu de marquage. L'Iroise est une zone de mélange (de Pontual 2023) | mêmes dates qu'en Manche ouest (registres de Saint-Malo à Audierne) ; pontes signalées en avril et mai en Bretagne (Boulineau-Coatanea 1969, cité par Fritsch) | VÉRIFIÉ, 1 ; la mention d'avril et mai est de seconde main |
| Bretagne sud | Au sud du 48ᵉ parallèle : stock du golfe de Gascogne, où les résidents sont les plus nombreux (centre du golfe : La Turballe, Noirmoutier, Oléron ; de Pontual 2023) | Golfe de Gascogne : janvier à mars (cartes de l'Ifremer, phase 5) | VÉRIFIÉ, 1 pour le golfe ; INFÉRÉ pour la côte bretonne au sud du 48ᵉ |
| Rades et rias (rade de Brest) | Estuaire de l'Aulne : bars de 0 à 1 an dans les parties hautes et peu salées ; de 2 à 3 ans dans tout l'estuaire ; dès 4 ans, comportement d'adulte, lié à la côte pendant la belle saison (BARGIP NOURRICERIES) | — | VÉRIFIÉ, 2 (page de projet) |
| Cotentin est (Saint-Vaast-la-Hougue) | La plupart des bars marqués restent dans l'aire nord (Manche et mer du Nord), avec des incursions d'hiver vers le 48ᵉ parallèle (de Pontual 2023). La synthèse de 2018 disait que des bars de Saint-Vaast ont frayé en mer Celtique (phase 5) | — | VÉRIFIÉ, 1 |
| Cotentin, au printemps | De mars à mai, des bars venus de la mer du Nord séjournent surtout en Manche ouest, autour du Cotentin et des îles Anglo-Normandes (Goossens 2024). C'est un indice de passage au large, pas d'une présence au bord | — | VÉRIFIÉ, 1 (positions estimées) |
| Cotentin ouest (Pirou, Portbail) | aucun marquage ; limite génétique entre les deux sous-populations au Cotentin en été (BARFRAY) | — | **INFÉRÉ** des zones voisines |

### 2.1 Calendrier côtier

Débarquements de bar des ligneurs français, à l'hameçon (Fritsch 2005, p. 134) :
- moins de 10 t par mois en mars et avril ;
- environ 50 t en juin, le maximum ;
- de 30 à 40 t en septembre et octobre ;
- environ 15 t par mois de novembre à février.

Les palangres ont le même creux en mars-avril et leur maximum en août. Les filets, eux, pêchent surtout d'octobre à janvier.

Lecture : le creux du printemps tombe pendant et juste après la ponte au large. C'est à ce moment que la côte est la plus vide de migrants. Les mois d'hiver ne sont pas les plus pauvres pour la pêche à l'hameçon.

C'est un **indice** (niveau 1, VOISINE). Il ne s'agit pas d'une mesure d'abondance au bord.

### 2.2 Hiver et abri

- Des bars restent l'hiver près de la côte : 13 sur 57 dans le port de Zeebrugge, jusqu'à 2,8 °C (Goossens 2023). Les minimums enregistrés en Manche ouest descendent à 6,5 °C (Goossens 2024 ; de Pontual 2023).
- En Bretagne, les résidents d'hiver suivis sont peu nombreux. Aucune étude ne suit des bars en rade de Brest, dans les abers ou dans les havres du Cotentin en hiver.
- L'hypothèse « abri » du moteur (écart de saison réduit de moitié en rade, ria ou havre) garde donc le niveau 4. Elle a un indice régional faible : cinq poissons à Audierne. La température de l'air n'est pas celle de l'eau : le moteur lit l'eau.

### 2.3 Alimentation

- **Juvéniles** :
    - les bars de l'année mangent surtout de petits crustacés : des amphipodes sous 65 mm environ, puis la crevette grise (baie de Somme, septembre 1982, 135 poissons ; Léauté 1986) ;
    - dans les prés salés du Mont-Saint-Michel, ils mangent des mysidacés au flot et un amphipode au jusant (Laffaille 2001).
- **Adultes** :
    - régime « très varié » : crustacés, céphalopodes, petits pélagiques, juvéniles de diverses espèces (Ifremer 2011) ;
    - au large du golfe de Gascogne, en automne et en hiver : des poissons pélagiques (Spitz 2013, phase 5).
- **Lacune maintenue** : aucun calendrier des proies des adultes à la côte en Bretagne ni dans le Cotentin. Le calendrier des proies par guide (`proies-calendrier`) reste INFÉRÉ, de niveau 5.

### 2.4 Activité selon l'heure, la marée et la météo

Rien de nouveau en milieu naturel dans les sources lues :
- le signal de marée est visible sur environ 35 % des marques, en Manche comme dans le golfe de Gascogne, sans détail par zone (de Pontual 2023) ;
- aucune étude jour et nuit du bar adulte en mer n'a été trouvée.

Les règles « lumière basse », « ciel couvert », vent, rafales et pression restent sans zone de validité (AUCUNE). PF-33 le montre pour chacune.

## 3. Zones de validité des règles du moteur

Contrôle : `tests/knowledge.mjs`, essai de sabotage dans `tests/pare-feux-sabotage.mjs`.

| Statut | Connaissances |
| --- | --- |
| RÉGIONALE | migration-saisonniere, saison-coefficients (le calendrier ; les valeurs sont sans source), abri-hiver (indice faible), seuils-thermiques (les minimums ; les paliers sont sans source), frai-manche-ouest, migration-par-zone, printemps-cotentin, structure-stock-saisonniere, nourricerie-aulne, regime-juveniles-crustaces |
| VOISINE | maree-flot, proies-calendrier, calendrier-ligneurs |
| AUCUNE | frai-temperature (zone du modèle non relue), eau-chaude, lumiere-basse, ciel-couvert, coefficient-plage-utile, vent-exposition, rafales-penalite, pression |

## 4. Contradictions et nuances

- **Minimum de présence** :
    - la V2 met le creux en février (0,5) ;
    - les débarquements à l'hameçon le mettent en mars-avril ;
    - la ponte en Manche ouest culmine de mi-février à fin mars.
  Pas de contradiction sur le principe (départ au large pour frayer) ; un décalage d'environ un mois sur le creux.
- **Stock nord ou golfe de Gascogne** : la limite réglementaire est le 48ᵉ parallèle. Or la plupart des bars de Bretagne nord et d'Iroise frayent dans le golfe de Gascogne. Leur calendrier de frai est donc celui du golfe, pas celui de la mer du Nord : c'est la position du spot et la population qui s'y nourrit qui comptent.
- **Cotentin** : à l'est (Saint-Vaast), les bars restent surtout dans l'aire nord ; à l'ouest, aucune donnée. La limite génétique d'été passe au Cotentin. Les spots de Pirou ne doivent pas recevoir sans preuve le calendrier breton, ni celui de Saint-Vaast.

## 5. Effet attendu sur le moteur

Proposition chiffrée, avec son impact sur les 66 spots : `docs/moteur-bord/07-REVISION-PHASE-7.md`. En bref :
- creux de saison déplacé de février vers mars-avril pour les spots dont la population migre (Bretagne nord, Iroise) ;
- creux moins profond pour le Cotentin est ;
- Confiance plus basse au Cotentin ouest (aucun marquage) ;
- abri gardé au niveau 4.

## 6. Lacunes et suite

- À lire :
    - de Pontual 2019 (Iroise : profondeurs selon la marée, résidence) ;
    - *Movement Ecology* 2024 ;
    - Carroll 2014 ;
    - Fritsch 2005, p. 37 à 61 (calendrier des gonades) ;
    - cartes des frayères de Manche (Dambrine et al. 2020).
- Inconnues à porter au registre des demandes à Félix (§ 0.6) : présence du bar en hiver dans les rades et les havres qu'il pêche, avec la température de l'eau quand elle est connue. C'est la voie empirique (journal), jamais copiée dans le dépôt (PF-17).

## Sources

- de Pontual H. et al. (2023), ICES JMS 80 : 1606-1618 : https://archimer.ifremer.fr/doc/00841/95273/103029.pdf
- Goossens J. et al. (2024), *Scientific Reports* 14 : 13180 : https://archimer.ifremer.fr/doc/00893/100500/110924.pdf
- Goossens J. et al. (2023), ICES JMS 80(7) : 1899-1910 : https://doi.org/10.1093/icesjms/fsad116
- Fritsch M. (2005), thèse UBO et Ifremer : https://archimer.ifremer.fr/doc/00000/1088/738.pdf
- Léauté J.-P. (1986), *Rev. Trav. Inst. Pêches marit.* 48 : 55-63 : https://archimer.ifremer.fr/doc/00000/1789/1421.pdf
- Laffaille P. et al. (2001), *Estuaries* 24 : 116-125 : https://hal.archives-ouvertes.fr/hal-00736433
- Ifremer (2011), « Le bar, une espèce convoitée » : https://peche.ifremer.fr/content/download/38859/file/Zoom_bar_revision2011_def.pdf
- France Filière Pêche, projet BARGIP NOURRICERIES : https://www.francefilierepeche.fr/projets/bargip-nourriceries/
- France Filière Pêche, projet BARFRAY : https://www.francefilierepeche.fr/projets/barfray-etude-frayeres-deplacements-bar-europeen/
