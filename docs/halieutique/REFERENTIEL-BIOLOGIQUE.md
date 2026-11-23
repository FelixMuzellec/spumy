# Référentiel biologique

Phase 5 V3, sous-tâche 5.5 (référentiel § 9.1.2 et § 9.1.3). Version 1 du 23 novembre 2026 : le bar, espèce unique du BORD, puis les cinq autres espèces du BATEAU (§ 4). Le lieu noir reste presque vide.

Ce référentiel décrit ; il ne note pas. Aucune variable n'entre dans la Favorabilité sur la seule foi de ce document : c'est le travail des phases 6 à 9.

## 1. Périmètre et méthode

- **Espèces** : la liste réelle de la V2 (audit fonctionnel, § 3).
    - BORD : le bar.
    - BATEAU : lieu jaune, lieu noir, maquereau, bar, vieille et saint-pierre.
    - Aucune autre espèce n'est ajoutée.
- **Niveaux de preuve** : échelle des connaissances V2 (`data/knowledge/bar-bord.json`, champ `echelle`). Le niveau 1 correspond à une source scientifique ou institutionnelle, le niveau 5 à une heuristique.
- **Statuts** :
    - VÉRIFIÉ : la source a été lue, au moins son résumé public ;
    - INFÉRÉ : déduit de sources lues ;
    - HYPOTHÈSE : rien ne la soutient ;
    - INCONNU : lacune.
- **Base de départ** : les 27 connaissances BORD de la V2, déjà sourcées, avec leurs limites. Elles ne sont pas répétées ici, seulement citées par leur identifiant (`migration-saisonniere`, `frai-temperature`…).
- **Recherches du 23 nov.** : télémétrie et activité au cours de la journée, marée et alimentation des juvéniles, période et lieux de frai, régime alimentaire côtier.

## 2. Le bar (*Dicentrarchus labrax*) en Manche et en Bretagne

### 2.1 Deux stocks, séparés au 48ᵉ parallèle

Le programme Bargip de l'Ifremer distingue :
- le stock « mers Celtiques » : mer Celtique, Manche et sud de la mer du Nord ;
- le stock « golfe de Gascogne », de la baie d'Audierne (48ᵉ parallèle) vers le sud.

**VÉRIFIÉ**, niveau 1, Ifremer, synthèse Bargip de 2018.

Conséquence pour les spots : la même limite partage déjà la réglementation V2. Les spots du sud du Cap Sizun (Penhors, la Torche, Penmarc'h) et du guide de Concarneau relèvent du stock de Gascogne ; tous les autres, du stock nord. Une saison de frai ou une date de retour ne se transposent pas d'un stock à l'autre sans preuve.

### 2.2 Cycle annuel

| Période | Ce qui est établi | Statut et niveau | Limite |
| --- | --- | --- | --- |
| Hiver | La plupart des adultes frayent au large ; une partie reste résidente (`migration-saisonniere`) | VÉRIFIÉ, 1 | Résidents plus rares que les migrants, observés surtout au centre du golfe de Gascogne |
| Frai, stock de Gascogne | Cartes mensuelles des frayères de **janvier à mars**, d'après les positions de pêche des navires (Ifremer, jeu de données Sextant) | VÉRIFIÉ, 1 | Frayères au large ; ne dit rien de la présence des adultes à la côte |
| Frai, stock nord | Ponte en plusieurs lots (au moins deux, parfois trois ou quatre, Fritsch 2005, p. 33) ; ovocytes en hydratation dès début avril, fin de la saison en mai, d'après la population du sud-ouest du Royaume-Uni (Mayer et al., cités par Fritsch, p. 43-45). Février à juin, dans des eaux d'au moins 9 °C environ, d'après un modèle de dérive larvaire (`frai-temperature`, Graham 2023) | VÉRIFIÉ, 1 | Seuil du modèle, pas une observation des adultes. Cartes des frayères Manche et mer Celtique : Ifremer (Dambrine, Woillez, Huret, de Pontual, 2020), **mois à relire** |
| Printemps | Retour sur des zones d'alimentation côtières, les mêmes d'une année sur l'autre (`migration-saisonniere` ; Edwards 2025 : 130 adultes de 40 à 75 cm suivis en télémétrie acoustique) | VÉRIFIÉ, 1 | Dates de retour publiées pour Cork (mi-avril, Doyle 2017), aucune pour le Finistère ni le Cotentin : **INCONNU** localement |
| Été | Présence côtière et fidélité estivale au site (Edwards 2025 ; Doyle 2017) | VÉRIFIÉ, 1 | — |
| Automne | Départ vers le large : à Cork, vers la mi-octobre (Doyle 2017). Synthèse de Fritsch (2005, § I.4.5, p. 16) : les adultes quittent les zones d'alimentation estivales dès septembre-octobre, vers des zones d'hivernage plus au sud, surtout en Manche ouest | VÉRIFIÉ, 1 pour Cork ; 2 pour la synthèse | Synthèse de travaux surtout britanniques ; aucune date propre au Finistère ni au Cotentin |
| Fin d'hiver | Remontée vers le nord ou le nord-est dès février, et arrivée sur les zones estivales vers mai-juin. En été, les déplacements sont bien plus courts, limités à la bande côtière (Fritsch 2005, p. 16) | VÉRIFIÉ, 2 (synthèse) | Calendrier général, pas propre à un spot |

**Granularité** : les études ne permettent pas un calendrier mois par mois pour ces côtes (§ 9.1.2, « ne pas forcer une granularité mensuelle artificielle »). Les coefficients mensuels de présence de la V2 (`saison-coefficients`) restent une HYPOTHÈSE de niveau 4.

### 2.3 Juvéniles et nourriceries

- Les œufs et les larves dérivent des frayères du large vers la côte. Les juvéniles grandissent dans des nourriceries surtout estuariennes, pendant leurs trois premières années (Ifremer, Bargip). **VÉRIFIÉ**, niveau 1.
- En baie du Mont-Saint-Michel, les bars de l'année entrent dans les chenaux des prés salés au flot, lors des vives-eaux (43 % des marées). Ils y mangent 1 à 2 heures, au moins 8 % de leur poids, et repartent au jusant (Laffaille et al., 2001, *Estuaries* 24 : 116-125). **VÉRIFIÉ**, niveau 1.
    - Repas au flot : des mysidacés.
    - Repas au jusant : un amphipode des prés salés.
- Dans les nourriceries anglaises, les juvéniles utilisent tous les habitats disponibles à marée haute plutôt que d'en choisir un (Freeman et al., 2024, *Journal of Fish Biology*). Leur régime montre une spécialisation individuelle, plus faible au printemps (étude de Southampton, contenus stomacaux et isotopes, cycle annuel). **VÉRIFIÉ**, niveau 1.
- **Portée pour SPUMY** : ces poissons sont sous la taille légale de 42 cm. Ces résultats décrivent le fonctionnement d'un havre ou d'un estuaire au flot, et la présence de proies ; ils ne prédisent pas la prise d'un bar maillé.

### 2.4 Marée et courants

| Constat | Statut et niveau |
| --- | --- |
| Grands bars vus traversant des vasières submergées à pleine mer (Edwards 2025) | VÉRIFIÉ, 1 |
| Signal de marée dans les profondeurs enregistrées pour environ 35 % des marques (de Pontual 2023) | VÉRIFIÉ, 1 |
| Juvéniles entrant au flot et sortant au jusant (Laffaille 2001) | VÉRIFIÉ, 1 |
| « Le bar suit le flot sur les estrans et se poste aux sorties d'eau au jusant » (`maree-flot`) | INFÉRÉ : soutenu pour le principe, pas pour chaque spot |
| Fenêtres de marée propres à chaque spot | sources de pêche, niveaux 2 à 4, à documenter par phase en 5.7 (§ 7.5) |

### 2.5 Rythme au cours de la journée

- En captivité, l'alimentation culmine à l'aube ou au crépuscule selon les individus (Millot et Bégout, 2009 ; Chen et al., 2023, en cage). Dans un enclos en mer, les groupes nagent plus lentement et sont moins serrés la nuit (Wageningen, étude du bruit). **VÉRIFIÉ**, niveau 1, **en captivité**.
- **Aucune étude d'activité de jour et de nuit du bar adulte en milieu naturel n'a été trouvée** (recherche du 23 nov.). La synthèse de Fritsch (2005, p. 12) dit seulement qu'il chasse de jour comme de nuit. La règle « lumière basse » (`lumiere-basse`) reste un savoir de pêcheur, de niveau 2 à 4. **Lacune.**

### 2.6 Température

- Tolérance d'environ 2 à 32 °C ; le refroidissement d'hiver laisse chaque année un arrêt de croissance sur les écailles (Fritsch 2005, p. 13-15). En Bretagne, taille moyenne à 5 ans : environ 40 cm pour les femelles et 39 cm pour les mâles, donc sous la taille légale de 42 cm (Fritsch 2005, p. 13). VÉRIFIÉ, 2.
- Des adultes ont été suivis jusqu'à 6,5 °C (de Pontual 2023). D'autres ont hiverné dans un port à 6,9 °C (Goossens 2023, cité par Edwards 2025). **VÉRIFIÉ**, niveau 1.
- Les paliers V2 de présence côtière (7,5, 9,5, 11,5, 13,5 et 19 °C, `seuils-thermiques`) : **aucune source**. HYPOTHÈSE, niveau 4.
- « Au-delà de 19 °C, activité décalée vers la nuit » (`eau-chaude`) : aucune source. HYPOTHÈSE, niveau 5.

### 2.7 Alimentation et proies

- Adultes du large, en automne et en hiver, golfe de Gascogne : surtout des poissons pélagiques (maquereau, chinchard, anchois, sardine). Les crustacés font environ 3 % de la biomasse (Spitz et al., 2013, *ICES Journal of Marine Science* 70 : 452-461). **VÉRIFIÉ**, niveau 1, pour le large.
- Juvéniles : prédateurs opportunistes (Pickett et Pawson, 1994, cité par Spitz 2013). **VÉRIFIÉ**, niveau 1.
- Adultes en général : régime dominé par les crabes (crustacés décapodes brachyoures) et les poissons. Chasse de jour comme de nuit, sur le fond ou en pleine eau (synthèse de Fritsch, 2005, § I.4.1, p. 12, d'après Boulineau-Coatanea, 1969). VÉRIFIÉ, niveau 2 : synthèse sans découpage par saison.
- **Calendrier des proies des adultes à la côte, en Manche et en Bretagne : aucune étude saisonnière trouvée.** Le calendrier des proies V2 par guide (`proies-calendrier`) reste INFÉRÉ, niveau 5. **Lacune.**

### 2.8 Habitat et profondeur

Le bar est surtout côtier, et migre au large et plus profond en hiver (Pickett et Pawson, 1994, cité par Spitz 2013). **VÉRIFIÉ**, niveau 1. Le détail par poste (fond, structures, profondeur) relève des fiches de spots (5.7).

### 2.9 Conditions atmosphériques

- **Pression** : aucune étude sur le bar ; seulement des blogs (`pression`, niveau 5). Conformément au § 9.1.3, elle n'est pas un prédicteur du modèle initial. Elle reste un contexte, et un signal de redondance avec le vent et les fronts.
- **Vent, houle, turbidité** : règles V2 de niveaux 4 et 5 (`vent-exposition`, `houle-turbidite`, `pluie-turbidite`, `gros-coefficient-turbidite`). Aucune étude trouvée sur la réponse du bar. HYPOTHÈSES.
- Effets à séparer (§ 9.1.3) : ce qui agit sur le poisson (turbidité, proies), et ce qui agit sur le pêcheur (lancer, tenue de la ligne, sécurité). La phase 6 devra séparer ces deux effets.

## 3. Lacunes et contradictions

| Sujet | État | Effet sur le moteur (phases 6 à 9) |
| --- | --- | --- |
| Dates de retour et de départ à la côte (Finistère, Cotentin) | **INCONNU** localement ; calendrier général : départ dès septembre-octobre, remontée dès février, zones d'été vers mai-juin (Fritsch 2005), et Cork | la présence saisonnière reste une HYPOTHÈSE, et la Confiance baisse |
| Activité de jour et de nuit des adultes en milieu naturel | **INCONNU** ; études en captivité, et une synthèse qui dit « de jour comme de nuit » | le poids de la lumière reste empirique |
| Régime des adultes à la côte, par saison | **INCONNU** ; en général, crabes et poissons (synthèse de Fritsch 2005) | le conseil de leurres s'appuie sur la proie documentée du spot, sinon reste qualitatif |
| Paliers de température de la V2 | **aucune source** ; des poissons suivis sous les paliers | à ne pas garder comme seuils sans preuve |
| Mois de frai | **nuance** : Gascogne janvier à mars (cartes de l'Ifremer) ; stock nord février à juin (modèle) | stocks séparés au 48ᵉ parallèle ; pas une contradiction, mais deux calendriers |
| Pression | aucune preuve | exclue du modèle initial (§ 9.1.3) |

## 4. Espèces du BATEAU (version 1, 23 nov. 2026)

Base : les 35 connaissances BATEAU de la V2 (`data/knowledge/bateau.json`), et les recherches du 23 novembre.

### 4.1 Lieu jaune (*Pollachius pollachius*)

| Thème | Ce qui est établi | Statut et niveau |
| --- | --- | --- |
| Habitat et profondeur | Benthopélagique, de 40 à 200 m, le plus souvent de 40 à 100 m. Les grands individus se tiennent au large, sur les fonds rocheux, les épaves et les plateformes (FishBase). Également sur les roches, les épaves et les forêts de laminaires, isolé ou en petits bancs (MarLIN) | VÉRIFIÉ, 2 (bases de référence) |
| Frai | Jusqu'à environ 100 m de profondeur, de janvier à avril, avec un pic en mars (Wheeler 1969, cité par MarLIN) | VÉRIFIÉ, 2 (source ancienne, citée de seconde main) |
| Déplacements | Télémétrie acoustique et marques archives en Manche (Gonse et al., 2024, *Journal of Fish Biology*). 30 lieus détectés sur 83, aucun grand déplacement d'une rive à l'autre de la Manche, déplacements côtiers le long de la Bretagne. La mer d'Iroise compte toute l'année, surtout l'été | VÉRIFIÉ, 1 |
| Régime | Prédateur ; niveau trophique 4,3 (FishBase) | VÉRIFIÉ, 2 |
| Réglementation | Voir § 4.6 | — |

### 4.2 Lieu noir (*Pollachius virens*)

- **Taille minimale : 35 cm** (tableau officiel des tailles 2026, d'après l'arrêté du 26 octobre 2012). VÉRIFIÉ, 2 : tableau d'une source secondaire, à relire sur Légifrance.
- Biologie dans les eaux de Bretagne et de Manche : **aucune source lue à ce jour**. Lacune, à combler dans la prochaine session (habitat des jeunes à la côte, saison, profondeur).

### 4.3 Maquereau (*Scomber scombrus*)

| Thème | Ce qui est établi | Statut et niveau |
| --- | --- | --- |
| Hiver | En Manche et en mer Celtique, l'hiver se passe près du fond, en bancs serrés là où le relief est coupé de bancs et de fosses (Steven, 1948, *JMBA*) | VÉRIFIÉ, 1 (étude ancienne) |
| Printemps | Grands bancs convergeant vers les frayères ; au sud-ouest de l'Angleterre, pas de migration unique vers le rivage pour frayer (Steven 1948). Œufs au début de la saison (mars et avril) jusqu'à au moins 400 m, puis surtout au-dessus de la thermocline en mai et juin, à l'ouest des îles Britanniques et dans le golfe de Gascogne (CIEM, 1996) | VÉRIFIÉ, 1 |
| Été | Phase de dispersion : bancs éclatés, poissons dispersés dans les eaux côtières (Steven 1948) | VÉRIFIÉ, 1 (étude ancienne, à confirmer par des données récentes) |
| Température | La migration et la répartition suivent la température (Jansen et al., 2012, *PLoS ONE*). Les œufs dépendent de la profondeur, de la latitude, de la température et de la salinité (Costas, 2025, *Frontiers*) | VÉRIFIÉ, 1 |
| Taille minimale | 20 cm (présentation de la pêche récréative de Saint-Pabu, juin 2026) | VÉRIFIÉ, 2 : à relire sur Légifrance |

### 4.4 Vieille (*Labrus bergylta*)

| Thème | Ce qui est établi | Statut et niveau |
| --- | --- | --- |
| Rythme de la journée | Nettement diurne : 92 % des poissons détectés plus souvent et parcourant de plus longues distances de jour ; 76 % avec un domaine vital plus grand de jour. Zone centrale d'environ 0,019 km² (Villegas-Ríos et al., télémétrie acoustique en Galice, 25 poissons, 71 jours) | VÉRIFIÉ, 1 (Galice, transposition à la Bretagne INFÉRÉE) |
| Fidélité au site | Fidélité très fine et durable ; les mâles défendent de petits territoires pendant le frai (Mucientes et al., 2019) | VÉRIFIÉ, 1 |
| Saison | Espaces d'activité plus grands de jour, avec un maximum de la fin du printemps à l'été, en lien avec la reproduction (Brand, 2025, mémoire, Galice) | VÉRIFIÉ, 2 (mémoire de master) |
| Portée pour le moteur | Une pêche de jour, sur un poste précis et stable ; la nuit n'est pas un créneau pour cette espèce | INFÉRÉ |

### 4.5 Saint-pierre (*Zeus faber*)

| Thème | Ce qui est établi | Statut et niveau |
| --- | --- | --- |
| Profondeur | De 5 à 400 m, le plus souvent de 50 à 150 m (FishBase) | VÉRIFIÉ, 2 |
| Saison en Manche | Stock centré au sud et à l'ouest des îles Britanniques, s'étendant vers le nord et l'est aux 3ᵉ et 4ᵉ trimestres. Le pic des débarquements, aux 3ᵉ et 4ᵉ trimestres en Manche, coïncide avec le recrutement, vers 23 cm (Dunn, Cefas) | VÉRIFIÉ, 1 (données 1994-1996) |
| État des connaissances | Stock très pauvre en données, sans évaluation formelle depuis plus de 10 ans (Marine Conservation Society) | VÉRIFIÉ, 2 |
| Régime | Dicté par la disponibilité des proies (contenus stomacaux de campagnes de chalutage) | VÉRIFIÉ, 1 |

### 4.6 Réglementation des espèces du BATEAU

| Espèce | Règle | Statut |
| --- | --- | --- |
| Lieu jaune, zones CIEM 7 et 8 | 2 par pêcheur et par jour au plus ; aucune capture ni détention du 1er janvier au 30 avril ; **pêcher-relâcher interdit** ; taille minimale 42 cm | VÉRIFIÉ, 2 : texte de l'arrêté de 2025 lu sur le site du ministère et présentation de juin 2026 ; **la limite pour 2026 reste à confirmer**. Les quotas européens de 2026 annonçaient 3 lieus au nord du 48ᵉ parallèle (presse spécialisée), et l'administration a rappelé que seuls s'appliquent les textes en vigueur |
| Bar, maquereau, lieu jaune, dorade rose | Enregistrement RecFishing la veille, puis déclaration sous 24 h (zones CIEM 4, 7 et 8 selon l'espèce) | VÉRIFIÉ, 1 (arrêté TECM2608396A) |

## 5. Sources de cette version

Espèces du BATEAU et réglementation :
- FishBase, *Pollachius pollachius* : https://www.fishbase.se/summary/34 ; *Zeus faber* : https://fishbase.se/summary/1370
- MarLIN, Pollack : https://marlin.ac.uk/species/detail/9
- Gonse M. et al. (2024). Combining acoustic telemetry with archival tagging… pollack. *Journal of Fish Biology* : https://pmc.ncbi.nlm.nih.gov/articles/PMC12120336
- Steven G. A. (1948). Mackerel migrations in the English Channel and Celtic Sea. *JMBA* : https://plymsea.ac.uk/1289/
- Jansen T. et al. (2012). Migration and fisheries of North East Atlantic mackerel in autumn and winter. *PLoS ONE* : https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3519697/
- Costas G. (2025). Spatio-temporal variability of spawning mackerel. *Frontiers in Marine Science* : https://doi.org/10.3389/fmars.2024.1461982
- CIEM (1996). The vertical distribution of eggs and larvae of mackerel, C.M. 1996/S:47 : https://www.vliz.be/imisdocs/publications/ocrd/275636.pdf
- Villegas-Ríos D. et al. Home range and diel behaviour of the ballan wrasse : https://core.ac.uk/download/36119228.pdf
- Mucientes G. et al. (2019). Interannual fine-scale site fidelity of male ballan wrasse : https://digital.csic.es/bitstream/10261/202897/3/Interannual_fine_scale_2019.pdf
- Brand L. (2025). Fine scale behaviour of *Labrus bergylta* (mémoire, université de l'Algarve) : https://sapientia.ualg.pt/bitstreams/d28cea69-71a9-49c9-b5d7-6bd159c93e6d/download
- Dunn M. R. The biology and exploitation of John dory in the waters of England and Wales (Cefas) : https://www.cefas.co.uk/data-and-publications/publications/list/publication-abstract/?id=13131
- Marine Conservation Society, Good Fish Guide, John Dory : https://www.mcsuk.org/goodfishguide/species/john-dory/wild/158/
- Arrêté réglementant la pêche de loisir du lieu jaune en zones CIEM 7 et 8 (texte soumis à consultation, ministère) : https://agriculture.gouv.fr/telecharger/145728 ; consultation du public : https://agriculture.gouv.fr/telecharger/146418
- Commune de Saint-Pabu, présentation de la pêche récréative, juin 2026 : https://www.saint-pabu.bzh/download/20/saint-pabu-le-mag-kannadig-special-semestriels/2922/presentation-peche-recreativej-juin-2026_final.pdf
- Arrêté du 1er avril 2026 sur la pêche de loisir du bar (TECM2608397A) : https://www.locquirec.bzh/wp-content/uploads/2026/04/Arrete-du-1er-avril-2026-Bar-loisir.pdf ; arrêté RecFishing (TECM2608396A) : https://www.dirm.memn.developpement-durable.gouv.fr/IMG/pdf/joe_20260411_0086_0009.pdf

Bar :

- Ifremer (2018). Résultats de l'action « Marquage » du projet Bargip (2014-2017) : https://bar.ifremer.fr/content/download/116111/file/4PagesMarquageAdultes_Final-3.pdf
- Ifremer, Sextant : *Spawning areas of seabass in the Bay of Biscay*, cartes mensuelles de janvier à mars : https://doi.org/10.12770/4ca9f42a-af88-4a00-a553-32130a1b23a2 ; *Spawning areas of Dicentrarchus labrax in the English Channel – Celtic Sea* (Dambrine, Woillez, Huret, de Pontual, 2020) : https://doi.org/10.12770/763b125d-afbe-4d32-bd0f-707c1f4474a8
- Laffaille P., Lefeuvre J.-C., Schricke M.-T., Feunteun E. (2001). Feeding ecology of 0-group sea bass in salt marshes of Mont Saint Michel Bay. *Estuaries* 24(1) : 116-125 : https://hal.archives-ouvertes.fr/hal-00736433
- Freeman H. A. et al. (2024). What makes a habitat a home? Habitat associations of juvenile European sea bass in estuarine nurseries. *Journal of Fish Biology* : https://ueaeprints.uea.ac.uk/97407/
- Spécialisation trophique individuelle des juvéniles (université de Southampton) : https://eprints.soton.ac.uk/437916
- Spitz J. et al. (2013). Prey preferences of adult sea bass in the northeastern Atlantic. *ICES Journal of Marine Science* 70(2) : 452-461 : https://doi.org/10.1093/icesjms/fss200
- Edwards J. E. et al. (2025). Multi-year tracking of European sea bass. *ICES Journal of Marine Science* : https://doi.org/10.1093/icesjms/fsaf190
- Bruit et comportement de jour et de nuit en enclos (Wageningen) : https://research.wur.nl/en/publications/european-seabass-respond-more-strongly-to-noise-exposure-at-night/
- Fritsch M. (2005). *Traits biologiques et exploitation du bar commun dans les pêcheries françaises de la Manche et du golfe de Gascogne*, thèse UBO et Ifremer : https://archimer.ifremer.fr/doc/2005/sup-1088.pdf (lu le 23 nov. : chapitre A et début du chapitre B ; la suite reste à lire)
- Sources des connaissances V2 citées par identifiant : `data/knowledge/bar-bord.json` (de Pontual 2023, Doyle 2017, Graham 2023, Millot et Bégout 2009, Chen 2023).
