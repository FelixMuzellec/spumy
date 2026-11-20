# SPUMY V3 — Phase 1 : audit initial V2

Copie du rapport de phase 1 (document Claude https://claude.ai/artifact/62UYfGbGKJtRvo6rAF9QrK, version du 20 nov. 2026). Les captures sont dans le document Claude.

Nov 20, 2026 · @Félix

## 1. Objectif et périmètre

Auditer la V2 telle qu'elle est en ligne, sans rien modifier, pour préparer la V3 (prompt maître V4.1.13, Phase 1). Aucun fichier, aucune branche, aucune donnée et aucune configuration du dépôt n'ont été modifiés ; aucun commit, aucun push.

- **Cible** : `main` à bb4f940 (v10.0.0), la version publiée par GitHub Pages. La branche `claude/phase-13-bateau` (v10.1, proposition n° 15 en brouillon) est auditée à part : elle n'est pas en ligne.
- **Point d'entrée UX** : `pirou.html#spots`, puis l'accueil, les autres onglets des guides et le mode BATEAU.
- **Méthode** : un clone de `main` dans un dossier de travail hors dépôt. Sur ce clone : installation, construction, suite de tests complète, captures dans Chromium (mobile 390 et 320 px, bureau 1 280 px), puis lecture du code, des données et des documents.
- **Décisions de Félix (20 nov., 00 h 58)** :
  - fin du prompt maître V2 ;
  - le logo SPUMY principal est repris ;
  - les logos Inshore et Offshore sont facultatifs ;
  - les photos déjà transmises sont utilisables.

  Elles seront écrites dans `docs/DECISIONS_LOG.md` dès qu'une phase autorise l'écriture.
- **Limites** :
  - le site en ligne n'a pas pu être ouvert dans un vrai navigateur, car aucun navigateur n'est relié à cette session ;
  - le réseau du conteneur n'atteint ni Open-Meteo, ni les tuiles OpenStreetMap, ni github.io : en local, la météo est simulée et la carte n'a pas de fond réel.

## 2. Synthèse exécutive

**Statut de la phase : IN PROGRESS, car un contrôle reste BLOCKED.** Le site en ligne n'a pas pu être ouvert dans un vrai navigateur. Le reste de l'audit est fait. La V2 en ligne est stable et bien testée : 849 parcours de bout en bout verts, 0 violation d'accessibilité, construction reproductible. Mais elle est **structurellement non conforme à la V3** sur quatre points, qui décident de l'ampleur de la refonte.

1. **Trois scores au lieu de deux.** La Pertinence (sur 100) est calculée, affichée et, quand la boîte est déclarée complète, elle déclasse les spots sous 50. La V3 la supprime (§ 9.1). La branche BATEAU de la phase 13 en calcule une aussi.
2. **Des secteurs géographiques partout.**
   - Sept guides, un par pôle, regroupés par département sur l'accueil.
   - Des zones « local / inter / far » dans chaque guide, et une place « Local garanti » dans le Top 3.
   - Des temps de route fixes comptés depuis le pôle du guide.
   - L'ajout d'un spot le rattache au guide le plus proche.

   La V3 interdit cette sectorisation et veut une position de référence dynamique, avec 60 min de route au plus en BORD.
3. **Le logo BRAND est altéré dans sa variante sombre**, celle de l'accueil en ligne. La pointe de la queue du poisson, hors du disque, passe du bleu marine au crème. C'est un défaut bloquant selon § 6.1.1. L'orange du disque, lui, est intact : **#C76A31**, mesuré sur le fichier source. Le jeton `brand` de l'application (#d9772f) et la documentation donnent une autre valeur.
4. **Un slogan visible sur l'accueil**, « Où et quand pêcher le bar aux leurres », interdit par § 6.2.2. Et une palette cyan, que la V3 exclut comme couleur structurante (§ 6.2).

Autres constats importants :

- 7 des 10 spots de Pirou n'ont que des coordonnées à la minute d'arc (environ 1,2 à 1,8 km de précision).
- 3 spots sont au-delà de 60 min de route : Goury 100 min, Sciotot 68, Pen-Hir 75.
- Le Top 3 se complète avec des spots non proposés quand il en manque.
- L'ancienne note sur 10 reste un réglage possible en BORD, et c'est la seule note du mode BATEAU en ligne.
- La vigilance Météo-France n'est pas lue.

Aucun spot, aucune donnée et aucune fonction BATEAU n'est à perdre : les 66 spots sont présents et sourcés, et toutes les branches sont inventoriées.

## 3. Travail réalisé

Six sous-tâches sur sept sont terminées. L'exécution est faite en local ; sur le site en ligne, elle reste bloquée.

| Sous-tâche | Statut | Contenu |
| --- | --- | --- |
| Contrôle de l'environnement (§ 2) | TESTED | Tableau ci-dessous |
| État Git et branches | TESTED | 16 branches distantes, 15 propositions, déploiement (section 6) |
| Stack, dépendances, secrets, services | TESTED | Section 5 |
| Inventaire des 66 spots et des secteurs | TESTED | Section 5 |
| Moteurs, scores, états, tris, sécurité ; matrice AVANT | TESTED | Section 5 |
| Écrans, parcours, photos et trois logos | TESTED | Sections 5 et 8 |
| Exécution réelle : en local | TESTED | 22 captures, 6 états, 3 largeurs |
| Exécution réelle : site en ligne dans un vrai navigateur | BLOCKED | Aucun navigateur relié à la session |

**Contrôle de l'environnement**

| Capacité | État | Ce qui a été testé, et la conséquence |
| --- | --- | --- |
| Dépôt GitHub | DISPONIBLE | `git fetch`, `ls-remote` ; l'API REST lit les propositions, les exécutions et les déploiements |
| Shell, git | DISPONIBLE | — |
| npm, installation | DISPONIBLE | `npm ci` : 235 paquets, 0 vulnérabilité (`npm audit --omit=dev`) |
| Construction, lint, tests | DISPONIBLE | Suite complète, section 7 |
| Serveur local | DISPONIBLE | Serveur Node au chemin `/spumy/` comme GitHub Pages |
| Navigateur sans tête | DISPONIBLE | Chromium et Playwright 1.56 |
| Captures mobile et bureau | DISPONIBLE | iPhone 13 (390 px), 320 px, 1 280 × 800 |
| Lecture des images | DISPONIBLE | Trois logos, planche UI, captures |
| Réseau depuis le shell | INDISPONIBLE | github.io, Open-Meteo, tuiles OSM : aucune réponse. La météo est simulée et les tuiles remplacées ; le rendu réel des tuiles n'est pas vérifiable en local |
| Recherche web | PARTIEL | Recherche disponible ; la lecture du site en ligne est refusée (adresse hors de la liste autorisée) |
| API externes | PARTIEL | Pas d'appel direct. Le contrat Open-Meteo réel passe sur GitHub (dernière exécution le 19 nov. à 23 h 33 UTC) |
| Vrai navigateur (Claude in Chrome ou navigateur de l'application) | INDISPONIBLE | Aucun relié. **Pour lever ce blocage** : relier Claude in Chrome ou l'application Claude de l'ordinateur |
| Branches, commits, propositions | DISPONIBLE | Non utilisé en Phase 1 |

## 4. Justification des changements

Aucun changement : la Phase 1 est en lecture seule. Le clone de travail et les captures sont hors du dépôt. La seule action hors audit est la mise à jour de la tâche de reprise automatique : elle visait la phase 13 V2 et reprend maintenant la Phase 1 V3.

## 5. Livrables

Tout est hors du dépôt : ce document, et le dossier de travail de la session (`p1/` : captures, matrice, inventaires en JSON).

### 5.1 Inventaire des spots V2

La V2 compte **66 spots BORD** dans 7 fiches (`data/sites/*.config.js`). Il n'y a aucun doublon de nom ni de coordonnées, et chaque spot a au moins une source. Le mode BATEAU n'a **aucun spot fourni** : ce sont les spots de l'utilisateur, sur son appareil.

| Guide | Spots | Zones (secteurs) | « Local » | Niveau de danger 3 | Au-delà de 60 min | Coordonnées à la minute | Spots |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Logonna-Daoulas (rade de Brest) | 11 | local, inter, far | 5 | 2 | Pen-Hir (75 min) | 0 | Moulin Mer, Pointe du Bendy, Rostiviec, L'Hôpital-Camfrout, Sillon de Lauberlac'h, Pointe de l'Armorique, Landévennec, Île de Térénez, Pointe des Espagnols, Pointe du Petit Minou, Pointe de Pen-Hir |
| Audierne (Cap Sizun) | 11 | local, inter, far | 2 | 5 | — | 0 | Embouchure du Goyen, Saint-Tugen, Feunteun Aod, Pointe du Raz, Baie des Trépassés, Pointe du Van, Brézellec, Penhors, La Torche, Rochers de Saint-Guénolé, Penmarc'h |
| Pirou Plage (Cotentin ouest) | 10 | local, inter, sud, far | 4 | 5 | Sciotot (68 min), Goury (100 min) | **7** | Pirou Plage, Régnéville, Gouville-sur-Mer, Pointe d'Agon, Portbail, Cap de Carteret, Granville, Anse de Sciotot, Surtainville, Goury |
| Plouguerneau (Abers) | 10 | local, aber, inter, far | 3 | 2 | — | 0 | Penn Enez, Roc'h Pelguent, Aber Wrac'h (Paluden), Sainte-Marguerite, Aber Benoît, Kerlouan, Aber Ildut, Corsen, Blancs-Sablons, Kermorvan |
| Concarneau (Cornouaille) | 10 | local, inter, far | 2 | 0 | — | 0 | Sables Blancs, Cap Coz, Beg Meil, Mousterlin, Odet, Trévignon, Kerjean, Rospico, Aven et Bélon, Laïta |
| Carantec (baie de Morlaix) | 7 | local, riviere, inter, far, ouest | 2 | 0 | — | 0 | Penn al Lann, Penzé, Barnénez, Primel, Saint-Jean-du-Doigt, Locquirec, Kernic |
| Crozon (presqu'île) | 7 | local, inter, far | 3 | 2 | — | 0 | Dinan, Lostmarc'h, Morgat, Trez Bellec, Pentrez, Leydé, Trénaouret |
| **Total** | **66** |  | **21** | **16** | **3** | **7** |  |

Les 7 spots de Pirou sans décimales (Pirou, Régnéville, Gouville, Agon, Portbail, Carteret, Surtainville) ne sont placés qu'à la minute d'arc près, par exemple `49°10'N 1°35'W`. Une minute vaut environ 1,8 km en latitude et 1,2 km en longitude : la pastille peut tomber à terre ou en mer. Chaque fiche porte aussi le port de marée, la bande de coefficient, la houle maximale, les expositions, les fenêtres de marée, les leurres, l'accès et la sécurité. Six spots ont une limite de coefficient (`coefHardMax`).

### 5.2 Anciens secteurs V2 à retirer des parcours (§ 0.2, règle 13)

Les données sont à garder : seul leur rôle de découpage disparaît des parcours.

| Secteur | Où | Effet aujourd'hui |
| --- | --- | --- |
| Départements (Finistère 29, Manche 50) | Accueil : sections repliables | L'entrée se fait par département |
| Sept guides (une page HTML par pôle) | `*.html`, `scripts/sites.mjs` | Les spots, la météo et le classement sont cloisonnés par guide |
| Zones `local`, `inter`, `far`, `sud`, `riviere`, `aber`, `ouest` | Fiches, `SITE.zones` | Point d'ancrage météo, libellés, « Local » |
| Drapeau `isLocal` et place « Local garanti » | `selectTop3` (`model.js`), liste du Top 3 | Une place sur trois est réservée à un spot de la zone « local » |
| Temps de route fixes (`distMin`, « 40 min ») | Fiches | Comptés depuis le pôle du guide, pas depuis toi ; ils départagent les égalités |
| `region`, `headerLabel`, `dept` | Fiches, en-têtes | « COTENTIN OUEST », « CAP SIZUN »… |
| Ajout d'un spot « dans le guide le plus proche » | Accueil, `MySpotForm` | Ton spot est rattaché à un secteur |

Ce qui existe déjà dans le bon sens :

- sur l'accueil, la carte de tous les spots, la recherche par nom et « Les spots les plus proches de moi » (géolocalisation) ;
- l'ajout d'un spot par ta position, la carte ou des coordonnées.

Ce qui manque : une saisie manuelle de ta position ou une épingle de référence pour tout le classement, et un temps de route réel.

### 5.3 Cartographie fonctionnelle (écrans et routes)

| Écran | Route | Mode | Ce qu'il fait | À préserver |
| --- | --- | --- | --- | --- |
| Accueil | `index.html` | les deux | Logo, slogan, onglets Inshore et Offshore, recherche, « les plus proches de moi », carte de tous les spots (aujourd'hui, demain), tes spots, guides par département, ajout d'un spot | Carte globale, proximité, ajout |
| Décision | `<guide>.html#synthese` (défaut) | BORD | Photo d'illustration, verdict, meilleure fenêtre, meilleur choix et égalité, sécurité, comparaison, 7 jours | Oui |
| Carte | `#spots` | BORD | Carte Leaflet (filtres Tous, Favorables, Les miens), Top 3 ou les 10 classés, fiche du spot, tes spots, heures de pêche | Oui |
| Fiche d'un spot | `#spot=<id>` puis `#spots` | BORD | Trois scores, créneaux, marée, vent, sécurité, accès, leurres | Oui |
| Journal | `#journal` | BORD | Sessions, prises, apprentissage personnel | Oui |
| Matériel | `#leurres` | BORD | Boîte, conseil de leurres | Oui |
| Plus | `#plus`, `#maree`, `#meteo`, `#saison`, `#regles`, `#photos` | BORD | Marée, météo par spot, saison, réglementation, analyse de photos (clé Anthropic de l'utilisateur) | Oui |
| Réglages | dans les guides | les deux | Thème Plein soleil, moteur v1 ou v2, « boîte complète », trajet maximal, sauvegarde GitHub du journal, transfert | Sauvegarde et transfert |
| Offshore | `index.html#offshore` | BATEAU | Tes spots bateau (carte, GPS), conditions sur 7 jours, sorties et prises, modèle empirique (note sur 10 à partir de 8 sorties) | **Tout** : mode de premier rang |
| Sortir aujourd'hui ? | branche phase 13, pas en ligne | BATEAU | Profil du bateau, sécurité par zone, espèces avec trois scores | À décider (section 12) |

Une ancre inconnue (`#nimportequoi`) ouvre Décision mais garde l'ancre dans l'adresse. Le lien `#spot=goury` ouvre la Carte et sa fiche, puis l'adresse redevient `#spots`.

## 6. Git et état du dépôt

**Aucune opération Git d'écriture pendant la Phase 1** : ni commit, ni push, ni branche, ni étiquette. Le dépôt de travail est resté sur `claude/phase-13-bateau` (9991f35), propre.

- **`main`** : bb4f940, « Phase 12 : spécifications et charte SPUMY dans l'application, v10 (#14) », du 19 nov. à 23 h 50. GitHub Pages l'a publié avec succès (déploiement 7927998348, 19 nov. à 22 h 50 UTC). **Le site en ligne est donc exactement le code audité en local** (VÉRIFIÉ par l'API GitHub).
- **Étiquettes** : aucune. Il n'existe pas d'étiquette `v2` ni `v10.0.0`.
- **Propositions** : 15 au total ; la n° 15 (phase 13, BATEAU) est ouverte en brouillon, ses tests GitHub sont verts.
- **Fichiers de pilotage** :
  - `SPUMY_AUDIT_CONTINUITY.md` existe sur `main` : c'est le suivi du prompt V2 ;
  - `CLAUDE.md`, `docs/DECISIONS_LOG.md`, `docs/REQUIREMENTS.md`, `docs/DATA_SOURCES.md`, `docs/TEST_STRATEGY.md`, `docs/design/` et `docs/security/` n'existent pas.

| Branche distante | État | Proposition |
| --- | --- | --- |
| `main` | publiée (v10.0.0) | — |
| `claude/phase-13-bateau` | **non fusionnée**, 6 commits d'avance (v10.1.0) | n° 15, brouillon |
| `claude/transfert-spumy` | fusionnée par écrasement (son commit n'est pas un ancêtre de `main`) | n° 5 |
| `claude/phase-3-socle` à `claude/phase-12`, `qualite-avant-phase-9`, `suivi-fusion-phase-8`, `suivi-fusion-phase-11`, `suivi-pages` (13 branches) | entièrement fusionnées dans `main` | n° 1 à 14 |

La n° 4 (phase 6) a été fermée sans fusion, mais son contenu est arrivé par la n° 6. Localement, il reste des références `gpb/main` et `gpb/v8.15` d'un ancien dépôt qui n'est plus configuré : sans effet sur GitHub.

**Plan de nettoyage proposé, non exécuté, à valider en Phase 2 :**

1. Étiqueter `main` à bb4f940 en `v2-final` (ou `v10.0.0`) : c'est le point de retour de la V3.
2. Supprimer les 14 branches distantes déjà fusionnées, après cette étiquette. Leurs commits restent dans l'historique de `main`, et la suppression se défait en recréant la branche depuis son SHA, listé ici.
3. Décider du sort de `claude/phase-13-bateau` (section 12).
4. Ajouter les fichiers de pilotage V3 (`CLAUDE.md`, `DECISIONS_LOG`, exigences…) sans dupliquer les documents existants.
5. Pour l'archive Drive, le dossier de destination contient déjà `V0`, `V1` et `V2` (début novembre, pas au format du § 0.2.1). Rien n'y sera touché ; l'archive V3 se fera à la clôture de la V3 (Gate I).

## 7. Preuves

Toutes les commandes ont été exécutées le 20 nov. 2026, entre 1 h et 2 h, sur un clone propre de `main` (bb4f940) avec Node 22.23.4 et npm 10.9.9.

| Commande | Code de sortie | Résultat |
| --- | --- | --- |
| `npm ci` | 0 | 235 paquets |
| `npm run build` | 0 | empreinte e6d65f7622cb ; **`git status` vide après la construction : les fichiers publiés sont reproductibles** |
| `npm test` | 0 | lint 0 erreur ; couches 0 écart ; données 69/69 ; connaissances 27/27 ; design 41/41 ; moteur v2 56/56 ; unitaires des 7 guides (407 à 437 chacun, plus Logonna en fuseau Auckland) ; **e2e 849/849** ; contrat Open-Meteo simulé 28/28 |
| `npm run test:a11y` | 0 | 0 violation (axe, tous les onglets des 7 guides) |
| `npm run test:upgrade` | 0 | mise à jour 12/12 |
| `npm run test:prototype` | 0 | 23 écrans × 2 largeurs × 2 thèmes : 244/244 |
| `npm audit --omit=dev` | 0 | 0 vulnérabilité |
| API GitHub : exécutions sur `main` | — | « Tests » et « pages build and deployment » en succès sur bb4f940 ; contrat Open-Meteo **réel** en succès (19 nov., 23 h 33 UTC) |
| Captures (script hors dépôt, Chromium) | 0 | 22 captures, aucune erreur JavaScript, aucun fichier manquant (404), aucun débordement horizontal à 320, 390 et 1 280 px |
| Matrice AVANT (script hors dépôt) | 0 | 3 réglages × 10 spots, section 5.4 |
| Mesures des logos (Python, Pillow) | 0 | Empreintes, couleurs, comparaison des exports |

**Captures réalisées** (dossier de travail `p1/shots/`) :

- `pirou.html#spots` :
  - au chargement (250 ms), en mobile 390 px, en page entière, en bureau 1 280 px et en 320 px ;
  - hors ligne, avec la météo en erreur, en thème Plein soleil ;
- Décision, Journal, Matériel, Plus, Marée, Météo, Saison, Règles, Photos ;
- la fiche par lien `#spot=goury` ;
- l'accueil Inshore (mobile et bureau) et Offshore ;
- le guide de Logonna ;
- une ancre inconnue.

**Limites des preuves** :

- le fond de carte est un aplat (tuiles non joignables) : l'emplacement des pastilles par rapport à la côte n'est **pas vérifiable** ;
- la météo est celle du simulateur des tests, pas celle du jour ;
- le service worker est bloqué pendant les captures ;
- le site en ligne n'a pas été ouvert dans un vrai navigateur (BLOCKED).

&#91;image: pirou.html#spots : chargement, mobile, 320 px, hors ligne, météo en erreur, Plein soleil\]

`pirou.html#spots` en local, de gauche à droite : au chargement, en mobile, en 320 px, hors ligne, avec la météo en erreur, en Plein soleil. Le fond vert uni remplace les tuiles, injoignables d'ici.

&#91;image: Accueil Inshore, Offshore, Décision et fiche de Goury\]

L'accueil Inshore (slogan, logo, carte de tous les spots), l'accueil Offshore vide, l'écran Décision de Pirou, puis la Carte ouverte par le lien `#spot=goury`.

## 8. Résultats fonctionnels et qualité

La V2 fonctionne de bout en bout en local, dans tous les états testés ; ses défauts sont de conception V3, pas des pannes.

**Ce qui fonctionne (VÉRIFIÉ en local)**

- `pirou.html#spots` en accès direct :
  - la carte Leaflet s'initialise (330 × 340 px en mobile, 700 × 340 px en bureau) ;
  - les 10 pastilles, le Top 3 et la fiche s'affichent en environ 4 s, sans erreur JavaScript.
- **Hors ligne ou météo en erreur** : pas d'écran cassé. Les spots passent « à vérifier » (vent inconnu), et la liste dit « Sans météo : classement sur la marée et la lumière seules ».
- **Thème Plein soleil, 320 px** : lisible, sans débordement horizontal.
- **Accessibilité** : 0 violation axe ; navigation au clavier dans la barre du bas.
- **Mode BATEAU** en ligne :
  - l'état vide est clair (« Ajoute ta première marque ») ;
  - le modèle n'affiche pas de note avant 8 sorties.

**Ce qui ne fonctionne pas, ou pas comme la V3 l'exige**

- **Pertinence** affichée comme un score, et capable de déclasser (section 5.5).
- **Classement par guide** : le Top 3 de Pirou peut proposer Sciotot (1 h 10) et Goury (1 h 40), à cause du temps de route fixe depuis le pôle.
- **Première image fausse** : au chargement, avant la météo, toutes les pastilles sont « à vérifier », puis changent environ une seconde plus tard.
- **Carte peu lisible** :
  - pastilles et étiquettes se chevauchent autour de Carteret, Sciotot et Surtainville ;
  - carte de 340 px de haut seulement, colonne de 640 px sur bureau (le reste de l'écran est vide) ;
  - la carte n'est pas centrée sur ta position.
- **Logo, slogan et palette** : voir la section 2.
- **Ancre inconnue** : gardée dans l'adresse.
- **Taille du paquet** : un seul `app.js` de 346 Ko compressé pour chaque page. C'est lourd sur un réseau faible au bord de l'eau ; à mesurer en Phase 4.

**Incertain (non vérifiable ici)**

- Le rendu réel du site en ligne, de ses tuiles et de son service worker sur un vrai téléphone.
- La position réelle des 7 pastilles de Pirou placées à la minute d'arc.
- Le comportement avec la vraie météo du jour.
- La compréhension des scores par de vrais pêcheurs : aucun test d'utilisabilité n'a été mené.

## 9. Matrice des exigences

Le registre des exigences V3 n'existe pas encore : il sera créé en Phase 2. Cette matrice suit donc les exigences de la Phase 1 elle-même (§ 15). Aucune n'est VALIDATED avant ta revue.

| Id | Exigence de la Phase 1 | Statut | Preuve |
| --- | --- | --- | --- |
| P1-01 | Contrôle de l'environnement | TESTED | Section 3 |
| P1-02 | Inventaire de toutes les branches, état Git, étiquettes, commits | TESTED | Section 6 |
| P1-03 | Stack, versions, dépendances, scripts | TESTED | Section 5.7 ; `npm ci`, `npm audit` |
| P1-04 | Inventaire des `.env`, services, API et secrets, sans valeurs | TESTED | Section 5.7 |
| P1-05 | Inventaire exhaustif des spots V2 | TESTED | Section 5.1 (66 spots) |
| P1-06 | Cartographie des écrans et parcours BORD et BATEAU | TESTED | Section 5.3, 22 captures |
| P1-07 | Anciens secteurs à retirer des parcours | TESTED | Section 5.2 |
| P1-08 | Ajout manuel de spots | IMPLEMENTED | Lu dans le code et vu sur l'accueil ; formulaire non ouvert en capture |
| P1-09 | Moteurs, Favorabilité, Confiance, « à vérifier », « non recommandé », filtres, tris, sécurité | TESTED | Sections 5.4 et 5.5 |
| P1-10 | Rapprochement spécification, code, paramètres, écran, tests, documents | TESTED | Section 5.5 |
| P1-11 | Ancienne note /10 non mélangée aux scores /100 | TESTED | Pas sur un même écran BORD ; coexistence BORD /100 et BATEAU /10 signalée |
| P1-12 | Assets, trois logos, photos | TESTED | Section 5.6 |
| P1-13 | Exécution réelle locale (états, mobile, réseau dégradé) | TESTED | Section 7 |
| P1-14 | Site en ligne dans un vrai navigateur, `#spots` en accès direct, console, réseau, tuiles | **BLOCKED** | Aucun navigateur relié |
| P1-15 | Matrice AVANT des scores et de la règle de classement | TESTED | Section 5.4 |
| P1-16 | Risques, dette, plan de nettoyage | IMPLEMENTED | Sections 6 et 10 |

## 10. Red-Team et risques

La relecture critique n'a fait tomber aucun constat ; elle en a précisé trois. Aucun défaut n'est corrigé ici, car la phase est en lecture seule. Chaque correction est rattachée à sa phase.

| Id | Défaut | Gravité | Preuve | Correction proposée |
| --- | --- | --- | --- | --- |
| D1 | Pointe de la queue du poisson recolorée dans la variante sombre du logo BRAND, en ligne sur l'accueil | CRITIQUE | Section 5.6, comparaison avec la source | Phase 3 : variante sombre sans recoloration (logo sur pastille crème, ou détourage seul), contrôle automatique de la zone protégée |
| D2 | Pertinence calculée, affichée, capable de déclasser (BORD en ligne, BATEAU phase 13) | CRITIQUE | Sections 5.4 et 5.5 | Phases 2, 6 et 10 : déprécier, garder les champs pour la migration seulement |
| D3 | Sectorisation : départements, guides, zones, « Local garanti », temps de route fixes | MAJEURE | Section 5.2 | Phase 2 : service de position dynamique et routage BORD ≤ 60 min |
| D4 | Top 3 complété par des spots non proposés ; pas d'extension à 4 ou 5 en cas d'égalité | MAJEURE | `selectTop3` (lu dans le code ; pas observé à l'écran ce jour-là) | Phases 6 et 10 |
| D5 | Slogan sur l'accueil, la description et le manifeste | MAJEURE | Captures 18 et 20 ; `index.html`, `manifest.json` | Phase 3 |
| D6 | Palette cyan structurante, au lieu de l'orange, du marine et de l'ardoise | MAJEURE | Captures | Phase 3 |
| D7 | Jeton `brand` #d9772f présenté comme l'orange du logo (mesuré : #C76A31) | MAJEURE | Section 5.6 | Phase 3 : jetons `brand-logo-orange` et `accent-orange` |
| D8 | 7 spots de Pirou placés à la minute d'arc | MAJEURE | Section 5.1 | Phases 5 et 7 : coordonnées sourcées, sans rien supprimer |
| D9 | Ancienne note /10 encore choisissable en BORD ; BATEAU en ligne seulement en /10 | MAJEURE | Section 5.5 | Phase 2 : décision ; Phase 6 |
| D10 | Vigilance Météo-France non lue | MAJEURE | `safety.js` | Phase 2 : source et contrat |
| D11 | Carte petite, sans centrage sur toi, pastilles qui se chevauchent | MAJEURE | Captures 01, 03, 17 | Phase 3 |
| D12 | État de chargement qui montre des « à vérifier » provisoires | MINEURE | Capture 01, au chargement | Phase 3 |
| D13 | « sans doute » visible ; format de fenêtre « 08h30 → 12h30 » ; ancre inconnue gardée ; mentions « v2 » et « phase 8 » visibles | MINEURE | Section 5.5 ; `Scores.jsx` | Phase 3 |
| D14 | Spécification BORD marquée « à valider » alors que le code la dit validée | MINEURE | Section 5.5 | Phase 2 : `DECISIONS_LOG` |

**Risques ouverts**

- **Données et licences (INFÉRÉ, à vérifier en Phase 2)** :
  - l'usage gratuit d'Open-Meteo est réservé à un usage non commercial ;
  - les tuiles OpenStreetMap ont une politique d'usage qui limite les gros volumes.

  Un usage public plus large demandera un abonnement ou un autre fournisseur.
- **Perte de données personnelles** : le journal vit dans le navigateur. La sauvegarde GitHub est facultative ; si le stockage est effacé, le journal est perdu.
- **Jetons de l'utilisateur** dans le `localStorage` (GitHub, Anthropic). La CSP stricte limite le risque d'injection de script ; modèle de menace à faire en Phase 2.
- **Branche phase 13** : la fusionner publierait des verdicts de sécurité dont les seuils ne sont pas validés, plus une Pertinence que la V3 supprime.
- **Test de parcours instable** (rouvrir une analyse photo enregistrée) : vert cette fois. Le nombre de parcours varie entre 849 et 856 d'une exécution à l'autre ; à traiter en Phase 14.
- **Pas d'étiquette de version** : le seul point de retour est le SHA bb4f940.

**Contrôle de la lecture seule** : seul `git fetch` a été lancé dans le dépôt de travail. Il a mis à jour la référence locale `origin/main` (de a88874b à bb4f940), sans toucher aux fichiers ni à GitHub. Tout le reste s'est fait dans un clone à part.

**Limite de la mesure de l'orange** : #C76A31 est mesuré sur un JPEG, donc avec perte, mais l'aplat est uniforme (écart type d'environ 2 sur 138 000 pixels). Si tu as un fichier d'origine sans perte (PNG ou vectoriel), c'est lui qui fera foi.

## 11. Qualité et conformité

La V2 est non conforme à la V3 dans 7 domaines UX/UI sur 15, partiellement conforme dans 6, et 2 restent non vérifiables. Les gates de la Phase 1 passent, sauf D, bloqué par le rendu en ligne.

**Matrice de conformité UX/UI de la V2 (§ 6.16)** — viewports inspectés : 320, 390 et 1 280 px ; thèmes Nuit marine et Plein soleil ; validation humaine : aucune.

| Domaine | Statut | Écart principal |
| --- | --- | --- |
| Utilité et parcours | Partiellement conforme | Parcours BORD complets mais cloisonnés par guide ; BATEAU sans « Sortir aujourd'hui ? » en ligne |
| Architecture de l'information | Non conforme | Entrée par département puis par guide ; secteurs |
| Hiérarchie et compréhension | Partiellement conforme | Grille à trois scores ; fixture 53 « à vérifier », 69 « moyenne » non testée |
| Modèle de choix | Non conforme | Pertinence active ; Confiance sans effet sur le rang (conforme) ; « à vérifier » indépendant du nombre (conforme) |
| Direction artistique | Non conforme | Cyan dominant, slogan, poisson altéré en variante sombre |
| Design System | Partiellement conforme | Jetons et composants existants, mais palette et jeton de marque à refaire |
| Cartographie | Non conforme | Pas de centrage sur ta position, carte petite, chevauchements, 7 positions imprécises |
| Données et confiance | Partiellement conforme | Sources et fraîcheur montrées ; vigilance non lue |
| Terrain et accessibilité | Partiellement conforme | 0 violation axe et thème Plein soleil ; aucun test en plein soleil réel |
| Responsive et performance | Non conforme | Colonne de 640 px sur bureau ; paquet de 346 Ko compressé non mesuré sur réseau faible |
| Contenus et assets | Partiellement conforme | Photos étiquetées « Illustration », provenance écrite ; mentions internes visibles |
| Périmètre V3 et héritage V2 | Non vérifiable | Dépend de la décision sur la branche phase 13 |
| Validation | Non vérifiable | Rendu en ligne BLOCKED ; aucun test d'utilisabilité |
| Trois cartes de recommandation | Non conforme | Top 3 complété par des spots non proposés ; pas de 4ᵉ ou 5ᵉ en cas d'égalité |
| Profil et export | Non conforme | Pas d'écran Profil ; export caché dans les réglages (Transfert) |

**Gates de la Phase 1 (§ 0.4)**

| Gate | Statut | Pourquoi |
| --- | --- | --- |
| A Produit et périmètre | PASS | Les deux modes sont audités ; le BATEAU est inventorié comme mode de premier rang |
| B Recherche et faits | N/A JUSTIFIÉ | Aucune affirmation halieutique nouvelle : inventaire seulement |
| C Données et continuité | PASS | 66 spots inventoriés, rien modifié |
| D UX et identité | BLOCKED | Rendu local fait ; rendu en ligne dans un vrai navigateur impossible |
| E Ingénierie | PASS | Aucun code touché ; construction et suite complète exécutées |
| F Sécurité et confidentialité | PASS | Inventaire sans aucune valeur secrète ; risques listés |
| G GitHub | PASS | 16 branches qualifiées ; plan de nettoyage proposé, non exécuté |
| H Traçabilité | PASS | Chaque constat a sa preuve ; le blocage reste visible |
| I Archive Drive | N/A JUSTIFIÉ | Phase intermédiaire ; l'archive se fait à la clôture de la V3 |

## 12. Questions et décisions attendues

Une seule question a bloqué la phase, posée dès qu'elle est apparue (§ 0.6) : relier un navigateur pour ouvrir le site en ligne. Aucune réponse pour l'instant. Les décisions ci-dessous ne bloquent pas la Phase 1 ; elles se prendront en Phase 2.

**Question posée pendant la phase**

- 20 nov., 1 h 05 : relier l'application Claude de ton ordinateur ou Claude in Chrome, pour auditer `pirou.html#spots` en ligne. **En attente.** Sans réponse, P1-14 reste BLOCKED, et la phase peut être close avec cette réserve si tu l'acceptes.

**Décisions reçues (20 nov., 00 h 58), à inscrire au journal des décisions en Phase 2**

- Le prompt maître V2 s'arrête ; la V3 suit le V4.1.13.
- Le logo SPUMY principal (BRAND) est repris, avec ses invariants : dessin du poisson et orange #C76A31.
- Les logos Inshore et Offshore sont facultatifs. Cette décision passe avant le § 19 du prompt, qui en fait des logos obligatoires.
- Les photos déjà transmises sont utilisables.

**Décisions attendues**

| Décision | Options | Recommandation |
| --- | --- | --- |
| Branche phase 13 (« Sortir aujourd'hui ? », proposition n° 15) | (a) la garder en brouillon et la reprendre en V3 ; (b) la fermer ; (c) la fusionner | **(a)** : son moteur de sécurité et la réglementation des espèces ont de la valeur, mais il faut retirer la Pertinence et valider les seuils avant toute mise en ligne |
| Ancienne note /10 | (a) supprimer l'option v1 en BORD ; (b) la garder | **(a)**, et en BATEAU, garder le modèle appris sur tes sorties comme une information, pas comme une note concurrente |
| Place réservée dans le Top 3 | (a) un spot à 15 min ou moins de ta position (§ 9.1.7) ; (b) aucune | À trancher par toi ; la V2 réserve aujourd'hui une place à la zone « local » |
| Point de retour et branches | Étiquette `v2-final` sur bb4f940, puis suppression des 14 branches fusionnées | Oui, en Phase 2 |
| Usage public ou commercial de SPUMY | Il conditionne les licences Open-Meteo et OpenStreetMap | À préciser en Phase 2 |
| Fichier d'origine sans perte du logo BRAND | S'il existe, il fait foi pour l'orange | Facultatif : envoie-le si tu l'as |

## 13. Prochaine phase proposée

**Phase 2 — Vision produit, exigences et architecture cible.** Elle part de cet audit pour fixer ce que la V3 garde, change et retire, avant toute ligne de code.

- **Objectif** : registre des exigences, décisions (ADR), architecture cible et plan de migration.
- **Contenu prioritaire, tiré de l'audit** :
  - service de position dynamique (géolocalisation, saisie, épingle) et routage BORD ≤ 60 min, en remplacement des guides et des zones ;
  - contrat à deux scores et dépréciation de la Pertinence ;
  - matrice BATEAU « déjà en ligne / prévu / à décider », avec le sort de la branche phase 13 ;
  - sources de données et licences ;
  - modèle de menace ;
  - fichiers de pilotage V3 (`CLAUDE.md`, `docs/SPUMY_MASTER_PROMPT.md`, `docs/DECISIONS_LOG.md`, `docs/REQUIREMENTS.md`) ;
  - plan de nettoyage GitHub.
- **Prérequis** : ta validation de ce rapport, avec ou sans la réserve P1-14 (site en ligne).
- **Dépendances** : tes décisions de la section 12, et l'accès à des pêcheurs pour une première boucle de recherche utilisateur, si tu en as.
- **Bénéfice** : la refonte UX de la Phase 3 et le moteur des Phases 5 à 8 partiront d'exigences validées, pas de l'héritage des guides.

## 14. Arrêt

**STOP.** La Phase 1 reste IN PROGRESS tant que le rendu en ligne (P1-14) est bloqué. Deux façons de la clore :

- relier un navigateur, et je termine ce contrôle ;
- accepter la réserve et passer à la suite.

J'attends le jeton exact : **`APPROVED — PROCEED TO PHASE 2`**.

### 5.4 Matrice AVANT : les scores et la règle de classement

Ce tableau est lu à l'écran sur `pirou.html#spots`, le 20 nov. 2026 à 8 h 30 (heure de Paris), avec la météo simulée « nominale » des tests et les réglages par défaut. Les temps de route sont ceux de la fiche, comptés depuis Pirou.

| Rang | Spot | Route | Favorabilité | Pertinence | Confiance | Sécurité | Ancienne note /10 (rang) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Cap de Carteret | 40 min | 59 | 100, provisoire | 74, haute | sans alerte | 3,8 (1) |
| 2 | Gouville-sur-Mer | 20 min | 56 | 100 | 74, haute | sans alerte | 3,1 (5) |
| 3 | Granville | 50 min | 56 | 97 | 69, moyenne | sans alerte | 3,0 (6) |
| 4 | Anse de Sciotot | 1 h 10 | 56 | 87 | 69, moyenne | sans alerte | 2,5 (8) |
| 5 | Pirou Plage | sur place | 52 | 100 | 75, haute | sans alerte | 3,1 (4) |
| 6 | Pointe d'Agon | 25 min | 52 | 100 | 71, haute | sans alerte | 3,1 (3) |
| 7 | Régnéville | 35 min | 51 | 100 | 69, moyenne | sans alerte | 3,4 (2) |
| 8 | Goury | 1 h 40 | 51 | 75 | 77, haute | sans alerte | 2,4 (9) |
| 9 | Portbail | 35 min | 48 | 100 | 74, haute | sans alerte | 2,9 (7) |
| 10 | Surtainville | ≈ 1 h | 45 | 93 | 74, haute | sans alerte | 1,8 (10) |

**Règle de classement V2** (`rankCompareV2`, vérifiée dans le code) :

1. spots praticables avant les spots non recommandés ;
2. sans doute de sécurité avant « à vérifier » ;
3. si « boîte complète » est coché, Pertinence sous 50 après les autres ;
4. Favorabilité décroissante ;
5. temps de route depuis le pôle du guide ;
6. identifiant.

La Confiance n'intervient pas (VÉRIFIÉ : 74 et 69 ne changent rien aux égalités à 56).

Ce que montre la matrice :

- **Égalités** : trois spots à 56 et deux à 52 sont départagés par la route depuis Pirou, pas depuis toi.
- **Pertinence** : avec « boîte complète », l'ordre est identique ici, car aucun spot n'est sous 50. Le déclassement est vérifié par les tests S13 et « boîte complète » (`tests/v2.mjs`).
- **Ancienne note /10** : son ordre est très différent (Régnéville 2ᵉ au lieu de 7ᵉ). Elle reste choisissable dans les réglages ; les deux échelles ne sont jamais mélangées sur un même écran BORD.
- **Règles V3 appliquées à ce jour (INFÉRÉ, non implémenté)** :
  - Sciotot et Goury sortiraient du périmètre BORD de 60 min, si tu étais à Pirou ;
  - la colonne Pertinence disparaîtrait ;
  - l'égalité stricte à 56 au 3ᵉ rang afficherait 4 cartes au lieu de 3 (§ 9.1.7), mais Sciotot sort du périmètre, et il en reste 3.

### 5.5 Écarts entre la V3, la spécification, le code, l'écran, les tests et les documents

| Règle | Attendu V3 | Spécification V2 | Code | Écran | Tests | Documents | Gravité |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Nombre de scores | 2 (Favorabilité, Confiance) | 3 | 3 (`v2.js`, `v2-params.js`) | 3 colonnes (`Scores.jsx`), réglage « boîte complète » | S13, S14, « boîte complète » | 3 dans SPEC, SPECIFICATIONS, FONCTIONNALITES, ARCHITECTURE, DIRECTION-ARTISTIQUE | CRITIQUE |
| Confiance sans effet sur le rang | oui | oui | oui | « ne change pas le rang » | S15 | oui | conforme |
| « À vérifier » indépendant du nombre | oui | oui | oui (sécurité et données) | pointillé et « ? » | oui | oui | conforme |
| Seuils de vent | à valider en Phase 6 | force 6 ou 60 km/h : à vérifier ; force 8 ou 90 km/h : non recommandé | identiques (`WIND_LIMITS`) | oui | oui | oui | conforme à la V2 |
| Top 3 | 3 admissibles, 4 ou 5 si égalité stricte, jamais complété par un spot bloqué ou à vérifier | non traité | `selectTop3` : place « Local garanti » ; complète avec des spots non proposés | « Local garanti » | non | non | MAJEURE |
| Périmètre BORD | 60 min de route depuis ta position | trajet maximal (45 min), dans la Pertinence | `trajetMax` 45, réglable | réglage | S14 | question 3 de la phase 6 sans réponse | MAJEURE |
| Note /10 | pas de mélange avec /100 | passage v1 → v2 (§ 11) | moteur v1 en option ; note BATEAU /10 | réglages ; onglet Offshore | unitaires v9.2 | `audit/UX-SPUMY-v9.2.md` décrit la note /10 | MAJEURE |
| Libellé « sans doute » | jamais exposé | « spots sans doute » | commentaires | légende de Décision : « sans doute de sécurité » | — | SPEC | MINEURE |
| Vigilance Météo-France | contrat de sécurité | INCONNU, source à trouver | non lue | « non lue, consulte-la » | — | oui | MAJEURE |
| Fenêtre horaire | `HH:MM–HH:MM` ou « non déterminable » | — | — | « 08h30 → 12h30 » | — | — | MINEURE |
| Statut de la spécification | — | « À VALIDER par Félix » | « validée le 18 nov. » (`v2.js`) | — | — | contradiction | MINEURE |

Les douze chemins d'audit du § 3.3 du prompt existent tous (VÉRIFIÉ). La Pertinence est présente dans 18 fichiers du code, des tests et des documents (hors fichiers construits).

### 5.6 Les trois logos et les photos

| Rôle | Fichier maître | SHA-256 (début) | Format | Fond | Orange mesuré | Bleu marine mesuré |
| --- | --- | --- | --- | --- | --- | --- |
| BRAND | `assets/brand/sources/spumy.jpg` | d4357a758ad601fe | JPEG 2048 × 2048, RVB, sans profil ICC, sans transparence | crème #E9E2D2 | **#C76A31** (aplat uniforme, écart type d'environ 2) | #152636 |
| INSHORE | `assets/brand/sources/inshore.jpg` | 8d6facc8937ecde3 | idem | #E9DCC9 | #CF7730 | #162A38 |
| OFFSHORE | `assets/brand/sources/offshore.jpg` | 2d929f408c687728 | idem | #E7DCC6 | #D3782F | #142B38 |

- **Provenance VÉRIFIÉE** : les trois fichiers maîtres sont identiques, octet pour octet, aux images que tu as envoyées le 19 nov. à 23 h 11. Leurs rôles sont sans ambiguïté : le poisson et « SPUMY », le pêcheur sur la roche, le bateau.
- **Variante sombre du logo BRAND, CRITIQUE.** Elle est utilisée sur l'accueil en ligne : `logo-spumy.webp` est identique à `spumy-logo-sombre.webp`. `scripts/logos.py` passe le bleu marine en crème hors du disque, ce qui recolore la pointe de la queue du poisson (comparaison visuelle sur le fichier source et les exports). Le disque lui-même est gardé tel quel.
- **Orange du disque** :
  - Les exports le conservent : #C76A31, et #C76B31 après compression WebP.
  - Le jeton `brand` (#d9772f) et la documentation (« orange du disque SPUMY ») se trompent de valeur. MAJEURE : c'est une erreur de documentation et de jeton, pas une recoloration du logo.
  - La couleur d'accent V3, #F07824, est différente : il faut deux jetons distincts, `brand-logo-orange` et `accent-orange` (§ 6.2).
- **Bord du disque** : un mince liseré clair ou foncé apparaît au détourage. MINEURE.
- **Emplacement** : les fichiers sont dans `assets/brand/sources/`, pas dans `docs/design-reference/brand/logos/` (emplacement cible du prompt). Il n'existe pas encore de manifeste au sens du § 6.2.1.
- **Planche UI Showcase** (1 536 × 1 024, copie dans `docs/reference/maquette-reference.webp`). Elle montre un autre logo (une vague cyan), un anneau « Pertinence » et une palette cyan dominante. Elle est donc en contradiction avec § 6.2 et § 9.1 : à traiter comme référence d'expérience seulement.
- **Photos** :
  - 32 photos d'ambiance (64 fichiers en 720 et 1 600 px, 5,0 Mo), générées par Gemini ; cette origine est écrite dans `data/photos/catalogue.json`.
  - Elles sont marquées « Illustration » à l'écran et ne sont jamais montrées comme le vrai spot.
  - Répartition : 16 pêcheurs du bord, 5 bateaux, 7 poissons, 2 paysages, 1 matériel, 1 journal ; 6 images écartées avec leur raison.
  - Le contrôle de qualité image par image (§ 6.12.1), avec les demandes de remplacement, relève de la Phase 3.

&#91;image: Queue du poisson : fichier source, variante sombre (pointe passée en crème), variante claire\]

De gauche à droite : le fichier source, la variante sombre en ligne (pointe de la queue recolorée en crème) et la variante claire (couleurs d'origine).

### 5.7 Services, stockage et secrets

| Service | Usage | Accès |
| --- | --- | --- |
| Open-Meteo (prévision AROME et ECMWF, marine, archives) | Météo, houle, eau | sans clé ; contrat réel testé chaque jour sur GitHub |
| Tuiles OpenStreetMap | Fond de carte | sans clé ; politique d'usage à vérifier en Phase 2 |
| API GitHub | Sauvegarde du journal (dépôt `spumy-journal`) | jeton saisi par l'utilisateur, gardé sur l'appareil |
| API Anthropic | Analyse de photos | clé saisie par l'utilisateur, appel direct depuis le navigateur |
| Marée | Calcul harmonique sur l'appareil (`src/core/tide.js`) | aucun réseau ; contrôlée par 19 relevés de référence (`tests/ref/`) |

- **Secrets** : aucun dans le dépôt (aucun `.env`, aucune clé ni jeton dans le code). Les deux jetons de l'utilisateur sont dans le `localStorage` de son appareil.
- **Politique de sécurité du contenu (CSP)** : stricte. Scripts du site seulement, et des hôtes de connexion listés.
- **Stockage** : `localStorage` (clés `bar:*`), IndexedDB pour les photos, cache du service worker.
- **Stack VÉRIFIÉE** :
  - React 18.3.1, Leaflet 1.9.4, esbuild 0.28.2, Playwright 1.56 ;
  - ESLint 8.57.1, en fin de support ;
  - 3 dépendances d'exécution, 0 vulnérabilité connue.
- **Paquet `app.js`** : 1,04 Mo, 346 Ko compressé ; un seul paquet pour toutes les pages.
