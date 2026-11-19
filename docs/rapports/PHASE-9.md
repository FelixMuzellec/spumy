# SPUMY — Phase 9 : BATEAU, conception

19 novembre 2026 · Félix · version de référence : document Claude « SPUMY — Phase 9 : BATEAU, conception » (https://claude.ai/artifact/UziTDraLFrMrgTDQYtmgjz) · branche `claude/phase-9-bateau`, proposition de fusion n° 10 en brouillon (pas fusionnée sans ton accord)

Le mode BATEAU d'aujourd'hui est un carnet : tes spots, tes sorties, et une note apprise de tes prises après 8 sorties. Il n'a aucune sécurité en mer, aucune logique par espèce et aucune réglementation des espèces du bateau. La spécification écrite dans cette phase corrige les trois, sans une ligne de code :
- douze règles de sécurité en mer, séparées de celles du bord, qui jugent toute la sortie, du départ au retour, selon ton bateau autant que selon la météo ;
- les critères des six espèces que tu as choisies ;
- leur réglementation 2026.

Chaque règle et chaque critère s'appuie sur l'une des 35 connaissances de `data/knowledge/bateau.json`, avec son niveau de preuve : 21 de niveau 1, et tout ce qui n'a pas de source est dit hypothèse ou à décider. Les questions sont gardées pour la fin, comme tu l'as demandé : je ne t'en pose aucune ici.

## 1. Objectif

Le périmètre est celui proposé à la fin de la phase 8 et approuvé le 19 novembre :
- auditer le mode BATEAU tel qu'il est (spots, conditions, sorties, modèle empirique) ;
- concevoir la sécurité en mer, séparée de celle du bord ;
- spécifier le moteur par espèce, sans code, à valider comme celui du BORD.

Espèces, dans ton ordre : lieu jaune, lieu noir là où il est pertinent, maquereau, bar, vieille, saint-pierre.

## 2. Travail réalisé

| Lot | Ce qui a été fait | Statut |
| --- | --- | --- |
| 9.0 | Branche `claude/phase-9-bateau` partie de `main` (40ba84f) ; suivi ; reprise automatique programmée | IMPLEMENTED |
| 9.1 | Audit de l'onglet Offshore : `offshore.js` (288 lignes), `wx.js` (75), `Offshore.jsx` (496), leurs tests | IMPLEMENTED |
| 9.2 | Connaissances par espèce et réglementation 2026, sourcées : 21 connaissances | TESTED |
| 9.3 | Sécurité en mer : 12 règles, 14 connaissances (sécurité et données) | TESTED |
| 9.4 | Spécification du moteur BATEAU : circuit, profil du bateau, sécurité, trois scores par espèce, apprentissage personnel gardé, 16 scénarios, plan d'épreuve | IMPLEMENTED |
| 9.5 | Ce rapport, tests, suivi, arrêt | IMPLEMENTED |

Les lots 9.2 et 9.3 sont TESTED : `tests/knowledge.mjs` vérifie leur fichier.

## 3. Livrables

| Livrable | Où |
| --- | --- |
| Spécification du moteur BATEAU (à valider) | `docs/SPEC-MOTEUR-BATEAU.md` |
| Connaissances du mode BATEAU (35) | `data/knowledge/bateau.json` |
| Schéma de ce fichier | `data/schema/knowledge-bateau.schema.json` |
| Contrôle du fichier et de son lien avec la spécification | `tests/knowledge.mjs` (section 4) |
| Rapport | `docs/rapports/PHASE-9.md` et document Claude |
| Suivi | `SPUMY_AUDIT_CONTINUITY.md`, `CHANGELOG.md` |

Aucun fichier de `src/` ni de `scripts/` n'est modifié : l'application est la même qu'après la revue de qualité.

## 4. Preuves

| Preuve | Commande | Résultat |
| --- | --- | --- |
| Connaissances BORD et BATEAU, rubriques de spot | `npm run test:knowledge` | 27/27. La partie BATEAU contrôle : le schéma ; les niveaux (jamais plus sûr que la meilleure source, pas de niveau 1 à 3 sans source) ; les six espèces dans ton ordre, chacune avec au moins une connaissance et sa réglementation, même inconnue ; une réglementation de niveau 1 ou dite inconnue ; une connaissance « VÉRIFIÉ » qui cite une source ; une règle de sécurité sans source qui reste « HYPOTHÈSE » ou « À DÉCIDER » ; chaque règle `SEC_*` et `ESP_*` de la spécification portée par au moins une connaissance |
| Le contrôle refuse les erreurs | même commande | six fichiers faux, tous refusés : espèce inconnue, règle `SEC_RAZ` sans connaissance, espèce sans réglementation, « VÉRIFIÉ » sans source, niveau 2 sans source, règle absente de la spécification |
| Moteur v2 du BORD | `npm run test:v2` | 56/56 (inchangé) |
| Unitaires, 7 guides et fuseau d'Auckland | `npm run test:unit` | 2 953 contrôles pour les 7 guides, plus 437 à Auckland : tous verts |
| Données, couches, lint | `test:data`, `test:layers`, `npm run lint` | 69/69 ; 0 écart aux couches ; 0 problème |
| Code de l'application inchangé | `git diff --name-only origin/main...HEAD -- src scripts` | aucun fichier |
| Chiffres de l'audit | lecture de `src/bateau/` et de ses tests | voir 5.1 ; tests du bateau : 20 contrôles unitaires (section « 16 terdecies ») et 26 de parcours (section « 0 ter ») |

Les sources ont été lues en ligne pendant la phase. Les 22 adresses sont dans `data/knowledge/bateau.json`, avec la date de lecture quand la page en donne une.

## 5. Résultats

### 5.1 Le mode BATEAU tel qu'il est

| Partie | Ce qu'il fait | Ce qui manque |
| --- | --- | --- |
| Spots | Ajoutés par toi : nom, position, type (épave, roche, banc, tombant, chenal, autre), profondeur ; synchronisés avec ton dépôt GitHub (`offshore.json`) | Port d'attache, distance d'un abri |
| Sorties | Date, heures, prises par espèce (31 espèces), taille, gardée ou relâchée, techniques (8), notes | — |
| Conditions | Retrouvées seules pour chaque sortie : vent d'AROME puis d'ECMWF ; vagues et eau jusqu'à J+7, et pour les sorties de moins de 80 jours. Marée du port de guide le plus proche, s'il est à moins de 40 km. Le modèle lit 13 variables, dont le moment de la marée, l'heure et le jour de l'année | Visibilité, orage, courant ; marée plus loin que 40 km d'un guide |
| Prévision | Créneaux de 3 h de 5 h à 20 h sur 7 jours, météo gardée 90 min | — |
| Note | Régression de Poisson des prises sur les conditions, la durée de la sortie comptant comme exposition, pénalisée. Il faut 8 sorties avec conditions et au moins une prise. 5 sur 10 = ta moyenne, ±2,5 par doublement. Fiabilité dite en clair (seuils 15 et 40 sorties) | **Aucune logique par espèce** : rien n'est conseillé avant 8 sorties |
| Sécurité | **Aucune** | Une mer forte peut recevoir une bonne note si tes prises passées l'ont « appris ». C'est contraire à la règle n° 1 : la sécurité ne se compense pas |
| Réglementation | Aucune pour les espèces du bateau | Fermeture du lieu jaune, tailles, quotas, marquage, déclaration |

Ce qui reste bon et sera gardé : les fiches et leur nettoyage, la fusion avec GitHub, la recherche des conditions, et le modèle de tes sorties. Ce dernier devient l'apprentissage personnel, un ajustement de ±10 au plus, à part de la sécurité.

### 5.2 La sécurité en mer

La sortie est jugée sur tout le créneau, au pire moment. La règle retenue est toujours la plus stricte des trois : la loi, la catégorie du bateau, tes limites.

| Règle | Ce qu'elle dit | Fondement | Preuve |
| --- | --- | --- | --- |
| SEC_ARMEMENT | Zone plus loin d'un abri que ton armement ne le permet (basique 2 milles, côtier 6, semi-hauturier 60) → non recommandé ; distance inconnue → à vérifier | Division 240, ministère de la Mer (19/06/2026) | 1 |
| SEC_CATEGORIE | Pire moment au-delà de la catégorie de conception (C : force 6 et 2 m ; D : force 4 et 0,3 m) → non recommandé ; près de la limite → à vérifier | Directive 2013/53/UE ; marge : hypothèse | 1 et 4 |
| SEC_VENT | À vérifier dès la force 5 ou 50 km/h de rafales ; non recommandé dès la force 6 ou 60 km/h | Proposition de départ | à décider |
| SEC_MER | À vérifier dès « agitée » (1,25 m) ou une mer courte | Échelle de Météo-France ; seuils : hypothèse | 1 et 4 |
| SEC_BMS | Force 7 prévue, ou BMS côte en cours → non recommandé ; BMS non lu → dit à l'écran | Météo-France, Guide marine | 1 |
| SEC_VISIBILITE | Mauvaise (0,5 à 2 milles) → à vérifier ; brume (sous 0,5) → non recommandé ; inconnue → à vérifier | Termes de Météo-France ; classement : hypothèse | 1 et 4 |
| SEC_ORAGE | Orage sur le créneau → à vérifier ; avec rafales au-delà des limites → non recommandé | Prudence | 5 |
| SEC_NUIT | Retour après le coucher du soleil → à vérifier | Prudence | à décider |
| SEC_RAZ | Raz avec vent ou houle contre le courant → non recommandé ; plein courant → à vérifier ; courant inconnu → à vérifier, passer à l'étale | bateaux.com (2025) ; courants d'Open-Meteo « pas adaptés à la navigation côtière » | 2 |
| SEC_DONNEES | Prévision de plus de 12 h, ou qui ne couvre pas tout le créneau → à vérifier | Prudence | 5 |
| SEC_SEUL | Seul à bord : seuils serrés d'un cran | Prudence | à décider |
| SEC_RAPPELS | Toujours affichés : aide à la flottabilité par personne, canal 16, 196, itinéraire donné à un proche | Ministère de la Transition écologique (mai 2026), ministère de la Mer | 1 |

Une règle sans source ne peut que rendre la sortie plus prudente, jamais plus permissive. Le fichier de connaissances l'écrit, et le test vérifie qu'aucune n'est marquée « VÉRIFIÉ ».

### 5.3 Les six espèces

| Espèce | Ce qui est sourcé (niveau 1 ou 2) | Ce qui ne l'est pas | Confiance de départ |
| --- | --- | --- | --- |
| Lieu jaune | Fonds durs et épaves, 40 à 100 m (jusqu'à 200) ; épaves par plus de 25 m, têtes de roche par plus de 15 m ; frai de février à mai ; toucher le fond et remonter à mi-hauteur | Effet de la marée et de la lumière | bonne |
| Lieu noir | 37 à 364 m ; en côte au printemps, au large en hiver ; rare à la limite sud de son aire (golfe de Gascogne) | Sa présence en Finistère (déduite faible) ; structure, marée, lumière | faible |
| Maquereau | En côte quand l'eau atteint 11 à 14 °C, du printemps à octobre ; se nourrit de jour, en bancs ; pêché souvent de 15 à 30 m, au train de plumes ; chasses repérées aux oiseaux | Effet de la marée ; seuil de mer | bonne |
| Bar | Biologie et réglementation du BORD (`bar-bord.json`, `rules.js`) | Tous les critères propres au bateau (plateaux, raz, courant) | moyenne |
| Vieille | Roche et laminaires, 2 à 30 m ; résidente, fidèle à un petit territoire ; active de jour, au printemps et en été, plus détectée en vives-eaux ; mâle qui garde le nid ; frai d'avril à août | Taille minimale | bonne pour le milieu, une seule étude pour la marée |
| Saint-pierre | Près du fond, 50 à 150 m (5 à 400) ; seul ; mange des poissons en bancs ; frai en fin d'hiver | Sa saison en côte en Bretagne ; marée, lumière ; taille | faible |

Tous les poids (combien de points pour chaque critère) sont des hypothèses de départ, à éprouver comme ceux du BORD.

### 5.4 La réglementation des espèces du bateau (2026)

| Espèce | Taille | Quota par pêcheur et par jour | Autres | Source |
| --- | --- | --- | --- | --- |
| Lieu jaune | 42 cm | 2, du 1er mai au 31 décembre | **Fermé du 1er janvier au 30 avril, relâcher compris** ; marquage ; RecFishing | DDTM du Finistère (avril 2026), service-public |
| Lieu noir | 35 cm | — | Marquage ; pas de RecFishing | DDTM |
| Maquereau | 20 cm | 10 | Marquage (en bateau, possible au débarquement) ; RecFishing | DDTM, service-public |
| Bar | 42 cm | Nord du 48e parallèle : 3, et relâcher seul du 1er février au 31 mars ; sud : 2 | Marquage ; RecFishing | arrêté du 1er avril 2026 (déjà dans l'application) |
| Vieille | INCONNU | INCONNU | Absente des textes lus | — |
| Saint-pierre | INCONNU | INCONNU | Absent des textes lus | — |

Pour toutes les espèces : 12 hameçons au plus en tout sur les lignes à main et de traîne, un train de plumes compris. Je n'ai pas encore vérifié si ce nombre s'entend par pêcheur ou par bateau : je le relirai dans l'arrêté du 26/10/2012.

La taille légale du maquereau (20 cm) est sous sa taille de première maturité (28,7 cm, FishBase). C'est une information, pas une règle.

### 5.5 Les connaissances

| | Nombre |
| --- | --- |
| Niveau 1 (scientifique, institutionnel, texte officiel) | 21 |
| Niveau 2 (article ou guide attribuable) | 4 |
| Niveau 4 (déduction) | 3 |
| Niveau 5 (pratique sans source) | 7 |
| Statut VÉRIFIÉ / HYPOTHÈSE / À DÉCIDER / INCONNU | 25 / 4 / 3 / 3 |
| Par espèce : lieu jaune, lieu noir, maquereau, bar, vieille, saint-pierre, toutes | 5, 3, 3, 2, 4, 3, 15 |
| Sources distinctes | 22 |

## 6. Problèmes et risques

1. **L'onglet Offshore actuel reste sans sécurité** jusqu'à la phase 10. Il est sur les téléphones qui ont la v8.15 (ancienne adresse), et dans `main`. Une note y peut être bonne par mer forte.
2. **La visibilité manque sans doute.** Elle n'est pas dans les modèles Météo-France servis par Open-Meteo. Si aucun modèle ne la donne sur tes zones, presque toutes les sorties seront « à vérifier » : il faudra mesurer ce coût en phase 10, comme celui des seuils de vent au BORD.
3. **Courant et raz.** Le courant prévu n'est pas fiable près des côtes, et les heures de renverse de chaque raz ne sont pas dans l'application. La règle SEC_RAZ restera souvent « à vérifier » sans une source (atlas de courants du SHOM, ou tes marques).
4. **BMS non lu.** Comme la vigilance au BORD, il est dit à l'écran ; une prévision de force 7 vaut BMS.
5. **Marée au large.** Elle ne vient que d'un port de guide à moins de 40 km. Il faut ajouter des ports de marée pour les zones plus loin.
6. **Critères sans source.** L'effet de la marée n'est sourcé que pour la vieille, celui de la lumière pour la vieille et le maquereau. Tous les poids sont des hypothèses, et le lieu noir et le saint-pierre partent avec une confiance faible.
7. **Sources générales.** FishBase et MarLIN décrivent toute l'aire d'une espèce, pas le Finistère. L'étude de la vieille vient de Jersey.
8. **La réglementation change chaque année** (règlement de l'Union en janvier) : à revérifier en janvier 2027. Pour la vieille et le saint-pierre, l'absence de règle dans la synthèse ne prouve pas qu'il n'y en a pas.
9. **Sans profil du bateau, le moteur ne note pas.** C'est voulu : il ne suppose ni catégorie ni armement. Il faut ta saisie.

## 7. Critères d'acceptation

| Critère | Résultat | Statut |
| --- | --- | --- |
| Audit du mode BATEAU tel qu'il est | 5.1 et spécification §0, appuyés sur le code et ses tests | IMPLEMENTED |
| Sécurité en mer séparée de celle du bord | Règles `SEC_*` propres au bateau ; rien du BORD modifié ; couches : `bateau` n'importe jamais `bord` | TESTED |
| Sécurité non compensable ; donnée inconnue jamais au vert | Écrit pour chaque règle ; scénarios B4, B5, B11 | IMPLEMENTED (codé et testé en phase 10) |
| Chaque règle sourcée, ou dite hypothèse ou à décider | contrôle de `tests/knowledge.mjs` | TESTED |
| Six espèces prioritaires : critères, présence, réglementation | spécification §4 et §5 ; fichier contrôlé | TESTED |
| Trois scores sur 100, jamais fusionnés | spécification §4 à §6 | IMPLEMENTED |
| Spécification sans code | aucun fichier de `src/` ni de `scripts/` modifié | TESTED |
| Scénarios de référence et plan d'épreuve | 16 scénarios (§10), plan (§11) | IMPLEMENTED |
| Validation par Félix | en attente | NOT STARTED |

## 8. Décisions attendues

Tu as demandé de garder toutes les questions pour les traiter ensemble quand toutes les étapes seront faites. Elles sont tenues dans `SPUMY_AUDIT_CONTINUITY.md` ; je ne t'en pose aucune maintenant.

Questions gardées des phases 3 à 8 :
1. Activation de GitHub Pages : *Settings → Pages → Deploy from a branch → `main` / (root)*.
2. Branches de travail déjà dans `main` : à supprimer par toi si tu le souhaites (*Code → Branches*).
3. Inventaire de ta boîte (la boîte actuelle reste provisoire).
4. Trajet maximal (45 min par défaut).
5. Vigilance Météo-France : source à brancher ou non.
6. Isolement de Mousterlin, Agon et Sciotot.
7. Écart S12 (abri à 0,6 entre 7,5 et 9,5 °C).
8. Filtre de sécurité commun aux deux moteurs du BORD (v1 et v2).
9. Historique de sorties réelles pour la référence.
10. Restes de la phase 5.
11. Houle maximale de chaque spot : la revoir spot par spot.
12. Paliers 75/65/55/45 : les garder.
13. Égalité à 3 points : la garder, ou annoncer l'égalité jusqu'à 10 points.
14. Rampe de lumière : retirée selon la règle ; la reprendre si tu préfères le gain « à égalité près ».
15. Dépôt de sauvegarde par défaut du journal : `FelixMuzellec/spumy-journal`.

Nouvelles questions de la phase 9 :

16. Tes seuils en bateau (SEC_VENT, SEC_MER) : à vérifier dès la force 5 ou 50 km/h de rafales, non recommandé dès la force 6 ou 60 km/h ; mer « agitée » à vérifier.
17. Ton bateau (le tien, celui d'un ami, une location ?) : catégorie de conception, armement, port d'attache et abris, vitesse de route. Pour le matériel, je pars de ta canne de jigging Daiwa Megaforce 170 (90 à 210 g) et de ton Stradic 4000 tressé en 16/100 : à confirmer.
18. Seul à bord : serrer les seuils d'un cran ?
19. Retour après le coucher du soleil : « à vérifier » ?
20. Lieu noir : le proposer seulement si tu en as déjà pris, ou toujours, avec une confiance faible ?
21. Vieille : conseiller de relâcher les gros sujets ?
22. Saint-pierre : sa saison en côte, d'après une source ou ton expérience.
23. Raz : liste de tes zones « raz », et source des heures de renverse (atlas de courants du SHOM, ou tes marques).
24. BMS : chercher une source lisible par l'application, ou rester à l'écran.
25. Fusion de la phase 9 dans `main` : proposition n° 10 en brouillon, pas fusionnée sans ton accord.

## 9. Prochaine phase proposée, et arrêt

**Phase 10 : moteur BATEAU par espèce** (feuille de route : phases 9, 10 et 13 pour le BATEAU). Elle se code une fois cette spécification validée :
- `src/bateau/engine/` : sécurité de la sortie, favorabilité par espèce, pertinence, confiance, réglementation des espèces, données dans `data/` ;
- `wx.js` : visibilité, orage et courant ;
- profil du bateau ;
- les 16 scénarios en tests ;
- mesure du coût de la prudence sur des journées archivées de tes zones ;
- l'interface viendra en phase 13.

**STOP.** J'attends ta réponse « `APPROVED — PROCEED TO PHASE 10` ». Rien de la phase 9 n'est fusionné dans `main` sans ton accord.
