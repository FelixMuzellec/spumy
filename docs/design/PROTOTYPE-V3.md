# Prototype interactif V3 (phase 3.6)

20 novembre 2026. Prototype haute fidélité **sur la base de UX-V3 version 2** (jalon 1 validé avec remarques, V3-023) et du Design System V3 (V3-022, proposé ; V3-021 : seuil « Favorables » à 75).

**Version 2** (20 nov., après le retour de Félix au jalon 2, V3-025) :
- photos en 1 600 px, une par carte, par espèce et par sortie du journal ;
- nuit marine par défaut ;
- cartes allégées avec disque de score ;
- pastilles-étiquettes avec le score ;
- compteurs égaux aux pastilles ;
- barre déplaçable au doigt, à la souris et à la molette, avec chevrons cliquables ;
- Météo redessinée, avec sa légende.

**Version 3** (20 nov., 14 h 46, demande de Félix) :
- carte déplaçable et zoomable (glisser, molette, pincement, double-clic, boutons + et − et « vue d'ensemble »), pastilles de taille constante ;
- feuille glissante à trois hauteurs, aimantée ;
- transitions entre écrans, désactivées si le mouvement est réduit ;
- rythme de 16 px dans les écrans et de 40 px entre les sections ;
- au plus trois tailles de texte par carte (30, 19 et 14 px), vérifié par test.

**Version 4** (20 nov., 15 h 02, demande de Félix) :
- **logo SPUMY** dans l'en-tête de tous les écrans (médaillon de 40 px, mot SPUMY à côté sur bureau) ;
- favicon, icône iOS et manifeste avec l'icône adaptative, tous tirés des exports V3 du logo ;
- cartes de spot compactes : score posé sur la photo, une ligne de faits (sécurité, route, Confiance) et la raison ; partie sous la photo de 110 px au plus ;
- 32 px entre deux spots.

**Version 5** (20 nov., 15 h 08, « pas top tier ce que tu as fait avec le logo ») :
- **écran de lancement** : le logo complet d'origine (symbole et mot SPUMY) sur son fond crème, en plein écran pendant 1,5 s (un appui le passe) ;
- **en-tête de marque** : médaillon de 44 px et mot SPUMY en Montserrat ; la bascule BORD / BATEAU passe sur une seconde ligne, pleine largeur ;
- **icônes** de l'application refaites sur le fond crème d'origine (symbole plein cadre), comme le logo ;
- Profil, à propos : le logo complet sur son fond ;
- carte : vue d'ensemble au départ (tous les spots visibles), regroupement des pastilles trop proches (nombre compté dans les filtres), recherche repliée derrière une loupe.

**Version 5.1** (15 h 20) : puce de position élargie ; le nom de la commune s'affiche en entier, sur deux lignes au besoin (« Saint-Pierre-Quiberon » vérifié à 320, 375 et 390 px). Le mode se lit au pictogramme (viseur : automatique ; épingle : manuel) et en entier dans le nom accessible.

**Version 5.2** (15 h 32, « les couleurs de la fenêtre de géolocalisation… ») : feuille de position refaite :
- fond de l'application et fermeture par un bouton rond ;
- sélecteur automatique / manuelle discret ;
- « Me géolocaliser » en rangée ;
- recherche avec loupe ;
- mini-carte centrée sur la position ;
- positions récentes en puces ;
- un seul bouton orange ;
- plus aucun texte orange sur l'ardoise ;
- axe contrôle la feuille ouverte.

**Version 5.3** (revues de la sous-tâche 3.7, après le jalon 2 ; `docs/design/REVUES-V3.md`) :
- cibles tactiles de 44 px au moins partout, par une zone invisible quand le dessin reste petit (puces, pastilles, petits boutons) ; bascule BORD / BATEAU à 44 px ; poignée du panneau de 56 × 44 px ;
- texte de 12 px au moins dans la courbe de marée et le graphique Météo, dont la légende passe en texte ;
- un h1 et un titre de page par écran ;
- règle d'inclusion de chaque filtre de la carte, affichée et lue avec le filtre ;
- Pointe E reprend la fixture du référentiel (§ 6.7.2) : 53 — À vérifier, Confiance 69 — Moyenne.

Vraies photos de spots : abandonnées (V3-026). Le fond IGN réel arrive aux phases 4 et 10 : la page de revue bloque les tuiles, et elles ne sont pas joignables d'ici.

**Statut** : jalon 2 VALIDÉ AVEC RÉSERVES (Félix, 20 nov., 15 h 40 ; V3-027) sur la version 5.2 ; la version 5.3 n'apporte que les corrections des revues. Toutes les données sont **de démonstration**, et l'écran le dit en permanence. Le prototype n'appelle aucun service : ni météo, ni route, ni géocodage, ni tuiles.

**Version 6** (23 nov. 2026, maquettes de Félix ; V3-028, V3-029, V3-030 ; cahier `docs/design/PROTOTYPE-V6.md`) :
- **Home**, d'après la maquette jugée « parfaite » : médaillon, mot SPUMY et le slogan « Read the sea. Fish the moment. » (seul slogan, en tête de Home) ; cartes Shore et Offshore avec les logos d'origine (redimensionnés seulement) ; champ de lieu ; Aujourd'hui, Demain, 7 jours ; photo et phrase de synthèse ; **bande de 24 h colorée heure par heure selon le score réel** ; la partie haute reste fixe en faisant défiler et se resserre.
- **Carte = vue pêche** : vrai trait de côte (IGN Admin Express, Licence ouverte) et les 8 vrais spots V2 à leur position ; pastilles à anneau de palier ; noms masqués en vue large ; boutons Me localiser, Couches, Vue d'ensemble, + et − discrets ; légende dépliable. Toucher un spot ouvre une bulle courte (km · min, sorties, poissons, « Meilleur moment ») ; le retoucher la ferme. Aucun vent sur cette vue.
- **Météo = vue conditions** : vent animé en couleurs (nappe de force et traînées, en nœuds ; flèches fixes si le mouvement est réduit, pause quand l'onglet est caché) ; Aujourd'hui, Demain, 7 jours ; panneau à droite au toucher d'un spot, refermé au second toucher, **Sécurité d'abord**, chaque valeur avec sa source et son heure.
- **Du général au spécifique** (V3-029) : la carte occupe le premier écran ; en faisant défiler, la Carte explique **pourquoi ce spot est bon aujourd'hui par son terrain** (marée, exposition, courant, houle croisés avec le jour, puis fond et structure), la Météo **comment chaque élément a pesé dans la note** (sens et poids, somme égale à la note) ; puis le détail sourcé, avec le niveau de preuve (1 à 5) de chaque connaissance.
- **Journal (JRN-06)** : chaque sortie garde la note affichée ce jour-là ; une vue met les notes de SPUMY face aux résultats (prises par heure), sans conclusion sous le seuil de 5 sorties dont 2 avec prise ; la boucle d'affinage reste contrôlée (§ 9.3.1 : calculée, approuvée par Félix, réversible).
- **Autres écrans** à la palette V6, vent en nœuds partout ; Pointe A à Pointe G remplacées par les vrais noms.

**Version 6.1** (23 nov., 12 h 07, « Tu ne respectes pas les modèles présentés. Tu dois être top tier. ») : les trois vues recalées sur les maquettes, au même cadrage, planches `docs/design/comparaison-v6/` :
- Carte et Météo en plein écran, en-tête, champ et puces posés sur la carte ; plus de bandeau en haut ; la carte occupe tout le premier écran, les détails viennent dessous ;
- pastilles de 46 px, noms à gauche, colonne le long de la côte ; spots trop proches écartés avec un trait vers leur vraie position (regroupement « +N » seulement sur écran trop court) ;
- boutons en colonne en bas à droite ; halo du spot choisi ; bulle sans croix ; la carte revient à sa place quand on referme ;
- Météo : panneau étroit sous le champ, lignes « Libellé : valeur », sécurité d'abord, rafales ; couleurs du vent relevées sur la vidéo, traînées courtes, apparition en fondu, côte tracée par-dessus ;
- Home : cartes de mode, champ à épingle, jours de même largeur, synthèse plus grande ; couleurs relevées sur les maquettes.

**Version 6.2** (23 nov., 12 h 45, remarques de Félix sur les quatre planches) :
- logo : le disque et le poisson sans l'anneau crème, comme sur les maquettes (symbole détouré, couleurs d'origine inchangées) ;
- Carte : champ de lieu et puces transparents ; cadrage sur l'emprise des spots, la côte remonte jusqu'en haut de l'écran sous l'en-tête ;
- Météo : la terre assombrie sous le vent, la mer en couleurs ; le panneau dit **pourquoi la note** (points de marée, coefficient, lumière, vent et mer, puis conditions × présence) ; sous la carte, chaque critère dit pourquoi il pèse autant, ses points du jour et pourquoi, son barème et sa règle sourcée ;
- les notes sont calculées par le modèle du moteur v2 (`src/prototype-v3/modele.js`, valeurs vérifiées contre le moteur) sur les conditions de démonstration ;
- Home : plus de finesse (graisses et tailles allégées), Offshore n'est plus en orange.

| Donnée | Réelle | De démonstration |
| --- | --- | --- |
| Spots, positions (à la minute près), temps de route, fenêtres de marée des fiches, terrain, sécurité, sources | oui (fiches V2, `data/sites/pirou.config.js`) | — |
| Connaissances et niveaux de preuve | oui (`data/knowledge`, générées par `scripts/connaissances-v6.mjs`) | — |
| Trait de côte | oui (IGN Admin Express 2018) | — |
| Calcul de la note (barèmes, présence) | oui : modèle du moteur v2, valeurs vérifiées par test | — |
| Conditions du jour (marée, vent, houle, ciel, eau), journal | — | oui, marquées « démo » à l'écran ; les notes en sont calculées |
| Courbes de profondeur | **absentes** : aucune donnée réelle joignable d'ici (EMODnet et Shom refusés par le proxy) ; rien n'est dessiné | — |

## Où le voir

- **Page de revue** : artefact « Prototype SPUMY V3 » (privé), construit avec `node scripts/build-prototype-v3.mjs --revue <dossier>`.
- **Dans le dépôt** : `prototype-v3/`, construit par `npm run build:prototype-v3`. Les photos et le logo sont lus dans `../assets`. Ce dossier sera publié avec le site seulement si Félix accepte la fusion.
- **Captures** à 390 × 844 : `docs/design/prototype-v3/*.webp`, 16 images (16 : pourquoi la note), nuit marine (et deux en plein jour), plus le bureau ; dont les premiers écrans avec la bulle de la Carte (12), le panneau de la Météo (13), le haut de Home resserré (14) et le vent animé (15).
- **Maquette contre prototype**, même largeur : `docs/design/comparaison-v6/{home,carte,meteo,meteo-vent}.webp`.

## Ce qu'on peut faire

| Écran | Interactions |
| --- | --- |
| En-tête | bascule BORD / BATEAU ; puce de position en haut à droite, qui ouvre la feuille de position (automatique ou manuel, me géolocaliser, lieu modifiable avec propositions pendant la frappe seulement, épingle) |
| Barre | 4 onglets visibles (Home, Carte, Météo, Profil) ; on la fait glisser pour voir Journal ; fondu et chevron du côté où elle peut défiler ; sur bureau, tous les onglets en haut |
| Home BORD | photo de fond (automatique selon la lumière, ou choisie dans Profil), phrase de synthèse, jours, frise du jour, 3 cartes avec les horaires en tête, place réservée « Le plus proche », zone « À vérifier », Comparer, Noter une sortie |
| Home BATEAU | choix du bateau (enregistré, ou saisi pour la sortie), verdict sur le pire moment, 3 marques avec leurs espèces, rappels, carte marine notée comme bonus à étudier |
| Carte | carte qui se déplace et zoome ; filtres avec compteurs exacts et règle affichée (Favorables = 75 ou plus, sécurité permise, pas à vérifier) ; pastilles-étiquettes avec score (⚠ et contour pour « à vérifier », score barré, vide, sélectionnée), groupes numérotés, légende, panneau à trois hauteurs avec aperçu ou liste ; sur bureau, liste à gauche |
| Météo | flèches de vent sur une grille de points, force et rafales écrites, avertissement à partir de force 6, curseur horaire sur 48 h, résumé, courbe vent et rafales ; en BATEAU, couche Mer |
| Fiche spot | photo marquée « Illustration », Favorabilité et Confiance, sécurité, courbe de marée avec heures favorables coloriées au palier (appui : heure et hauteur), indicateurs du jour, approche, stratégie, leurres conseillés, « Pourquoi ? » |
| Comparaison | sécurité, **vent** (force, rafales, exposition), Favorabilité, Confiance, horaires, route, règles, raison ; écart chiffré ou « avantage non établi » |
| Journal | sortie en cours, ajout rapide (enregistrement avec « Annuler »), états typés |
| Profil | Journal, bateaux, **ordre des onglets** (flèches ; poignées dessinées), photo de fond de Home, thème (système, clair, sombre), panneau « Démonstration : états » |

**Panneau « Démonstration : états »**, dans Profil :
- hors ligne ;
- chargement ;
- moins de 3 spots ;
- égalité au dernier rang ;
- aucun spot à 1 h ou moins ;
- premier lancement, avec la demande d'autorisation simulée ;
- position refusée.

Il n'existe pas dans l'application.

## Preuves

| Commande | Code de sortie | Résultat |
| --- | --- | --- |
| `npm run test:prototype-v3` (construction, puis `tests/prototype-v3.mjs --axe`), version 6.2 | 0 | 224/224 |
| `python3 tests/brand.py` (dont le symbole détouré) | 0 | 35/35 |
| `npm test` (lint, couches, données, connaissances, design, moteur v2, unitaires, e2e, contrat simulé) | 0 | tout vert ; 0 couleur en dur ajoutée |
| `npm run test:a11y` ; `npm run test:upgrade` ; `npm run test:prototype` | 0 ; 0 ; 0 | 0 violation ; 12/12 ; 244/244 |
| `node scripts/connaissances-v6.mjs --check` | 0 | `connaissances.js` à jour |
| `npm run test:design-v3` | 0 | 186/186 |
| `npm run -s lint` ; `node tests/layers.mjs` | 0 ; 0 | aucun écart ; 253 couleurs en dur hors de `src/design/`, inchangé |

`tests/prototype-v3.mjs` vérifie :
- 10 écrans à 320, 375 et 390 px et sur bureau, dans les deux thèmes, sans erreur ni défilement horizontal ;
- les règles de Home : phrase et horaires, 3 cartes, « Le plus proche », « À vérifier » hors des cartes ;
- la Carte : « Favorables » = 3, compteur égal aux pastilles, signes des pastilles ;
- la fiche : courbe, danger avant la marée, fixture « 53/100 — À vérifier » ;
- la comparaison : vent, écart chiffré, « avantage non établi » ;
- la barre : 4 onglets visibles, Journal hors champ, chevrons, ordre modifié ;
- la Météo (V6) : nappe et traînées du vent, panneau du spot avec Sécurité d'abord, vent en nœuds, source et heure, somme des poids égale à la note, ouverture et fermeture au toucher ;
- la Carte (V6) : bulle (distance, sorties, poissons, meilleur moment) qui ne cache pas le spot, détails sous la carte (effet par ligne, niveaux de preuve, sources), début des détails visible dans le premier écran ;
- Home (V6) : slogan, cartes Shore et Offshore avec logos chargés, bande de 24 h, haut fixe qui se resserre ;
- le Journal : note de SPUMY ce jour-là face au résultat, pas de conclusion sous le seuil ;
- BATEAU : choix du bateau avant le verdict ;
- les revues (3.7) : Confiance sans effet sur le rang ni sur les égalités (3 jeux), pénurie sans carte inventée, fixture § 6.7.2, règle des filtres, cibles de 44 px, un h1 et un titre par écran, 12 px au moins, ni Pertinence, ni note sur 10, ni « V2 » à l'écran ;
- axe-core (WCAG 2.2 A et AA) sur 6 écrans dans les deux thèmes : aucune violation grave ni critique.

## Limites connues

- Version 6 : trait de côte réel, mais notes, marée du jour, vent et journal **de démonstration** : aucune décision ne doit s'appuyer sur ces chiffres.
- Courbes de profondeur : absentes faute de données réelles joignables (Félix, 23 nov. : rien d'inventé).
- Offshore (Carte et Météo) : un avis remplace encore la vue ; pas au niveau V6.
- Les 8 vrais spots couvrent environ 70 km de côte : en vue d'ensemble, certains sont écartés de leur vraie position (trait pointillé) ; sur un écran de moins de ~780 px de haut, les deux plus proches peuvent encore se regrouper (« +1 »). Quand la bulle ou le panneau est ouvert, quelques noms se masquent faute de place.
- Glisser-déposer des onglets : seules les flèches fonctionnent ; les poignées sont dessinées.
- Demain et 7 jours : seule la journée d'aujourd'hui est remplie.
- Les composantes de « Pourquoi ? », la réglementation et les sources sont des textes d'exemple.
- Test utilisateur : **NON EFFECTUÉ** ; protocole prêt dans `docs/design/REVUES-V3.md` § 9.
