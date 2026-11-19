# Spécifications fonctionnelles et techniques de SPUMY

Phase 12 du prompt maître · novembre 2026 · s'appuie sur le prototype de la phase 11 (`prototype/`), sur l'application v10 et sur les spécifications des moteurs (`SPEC-MOTEUR-BORD-V2.md`, `SPEC-MOTEUR-BATEAU.md`).

Ce document dit, écran par écran, ce que fait SPUMY :
- ses composants et ses états ;
- les actions possibles ;
- les données lues et leurs règles ;
- les services appelés ;
- les critères d'acceptation, qui sont vérifiables.

Chaque écran porte un **statut** :
- **EN SERVICE** : l'application le fait aujourd'hui, et les tests le vérifient ;
- **v10** : livré à cette phase ;
- **À FAIRE** : décrit par le prototype, pas encore dans l'application (lot BORD restant, phase 13 pour BATEAU).

## 1. Cadre

| Sujet | Règle |
|---|---|
| Adresse | https://felixmuzellec.github.io/spumy/ seule. GitHub Pages publie la branche `main` |
| Pages publiées | `index.html` (accueil : Inshore et Offshore), un fichier `<guide>.html` par guide (7), `prototype/` (maquette, pas l'application) |
| Modes | **Inshore** = BORD (pêcheur sur le rivage, bar aux leurres) ; **Offshore** = BATEAU (sortie en mer, toutes espèces). Deux logos distincts, ceux de Félix |
| Code | React 18, esbuild ; couches `core`, `bord`, `bateau`, `design`, `app` (`tests/layers.mjs`) ; une couleur en dur hors de `src/design/` est comptée, et ce compte ne peut que baisser |
| Hors connexion | Service worker : les fichiers du site sont en cache ; la météo est gardée en cache avec son âge ; les photos d'ambiance ne sont pas en cache (miniature floue à la place) |
| Sécurité | CSP stricte générée par `scripts/build.mjs` ; aucun secret dans le code ; le jeton de sauvegarde du journal reste sur l'appareil |
| Honnêteté | Trois scores jamais fusionnés ; l'inconnu n'est jamais vert ; la sécurité ne se compense pas ; une photo d'ambiance n'est jamais présentée comme un spot ou une prise |

## 2. Services et données

| Source | Usage | Règle si absente |
|---|---|---|
| Open-Meteo (AROME, ECMWF ; Marine) | Vent, rafales, nébulosité, pression, pluie ; vagues, houle, température de l'eau | Critère « inconnu » : jamais vert ; spot « à vérifier » ; bandeau « données anciennes » au-delà de leur âge utile |
| Marée calculée sur l'appareil (TICON-4, ports secondaires) | Heures et hauteurs, coefficient, courbe | Toujours disponible (pas de réseau) |
| Fiches des sites (`data/sites/*.config.js`) | Spots, types, accès, sécurité, niveaux de preuve | Champ absent : rubrique « non renseigné » |
| Connaissances (`data/knowledge/`) | Règles du moteur, réglementation, sources | Statut affiché (VÉRIFIÉ, HYPOTHÈSE, INCONNU) |
| Ta boîte, ta canne, ton journal (appareil ; copie GitHub facultative) | Pertinence, conseils de leurre, confiance | Pertinence « provisoire » ; part « ton journal » à 0 |
| OpenStreetMap | Fond des cartes | Carte sans fond, pastilles toujours lisibles |
| Photos d'ambiance (`assets/photos/`, `data/photos/catalogue.json`) | Fond de l'écran Décision, bandeau de la fiche | Miniature floue du catalogue |

## 3. Système de design (v10)

- Jetons : `src/design/tokens.js` pour l'application, `src/design/ds/tokens.css` pour le prototype.
- Thèmes :
    - **Nuit marine**, par défaut : fond #071427, cartes #0e2139, texte #e3ecf5, cyan #1fd2f5 pour l'action ;
    - **Plein soleil** : réglage de l'appareil.
- Marque : l'orange #d9772f et la crème #efe7d8 des logos de Félix. Jamais pour un statut ni une alerte.
- Typographie : Roboto Condensed auto-hébergée pour les titres et les chiffres ; police du système pour les textes.
- Favorabilité : cinq bleus (bornes 75, 65, 55, 45). « À vérifier » en ambre pointillé avec « ? » ; « non recommandé » en gris barré ; pas de note : pastille vide.
- Cibles tactiles de 44 px, et 48 à 52 px pour l'action principale ; contrastes AA (`test:a11y`, `test:design`).
- Détail : `docs/DIRECTION-ARTISTIQUE.md`.

## 4. États communs

Tout écran qui lit des données sait afficher ces états.

| État | Affichage | Critère |
|---|---|---|
| Chargement | Squelettes à la place des blocs | Aucun chiffre inventé pendant le chargement |
| Données disponibles | Écran normal | — |
| Données absentes | Le critère dit « inconnu » et le spot passe « à vérifier » | Jamais de vert sur un inconnu |
| Erreur de service | Bandeau d'erreur, et bouton « Réessayer » ou « Actualiser » | Le reste de l'écran fonctionne |
| Données anciennes | Bandeau avec l'âge de la météo | Âge affiché en heures |
| Hors ligne | Bandeau « hors ligne » ; marée et fiches restent disponibles | L'application s'ouvre sans réseau (test de mise à jour) |
| Permission refusée (position) | Message, et choix manuel du lieu | Pas de blocage |
| Résultat vide | Phrase qui dit pourquoi, et l'action suivante | Pas d'écran blanc |
| Action réussie | Message bref | — |
| Action impossible | Message avec la raison | — |

## 5. Écrans

### 5.1 Accueil — v10 (EN SERVICE depuis v8.15, charte en v10)

- **Composants** :
    - grand logo SPUMY et accroche ;
    - deux onglets **Inshore** et **Offshore** avec leurs logos ;
    - recherche d'un spot, « les spots les plus proches de moi », carte de tous les spots, ajout d'un spot ;
    - guides par département ;
    - réglages (Plein soleil, transfert des données) ;
    - version au bas de l'écran.
- **Données** : la liste des guides et de leurs spots (index construit), la position du téléphone (sur demande), la météo en cache de chaque guide.
- **Règles** :
    - le dernier onglet choisi revient à l'ouverture suivante ;
    - le lien `#offshore` ouvre Offshore ;
    - un spot ajouté va dans le guide de la fiche la plus proche.
- **Acceptation** :
    - titre et logo présents ;
    - les deux onglets s'ouvrent au clavier ;
    - la recherche trouve un spot par son nom ou sa commune ;
    - aucune violation de CSP (`test:e2e`).

### 5.2 Décision (BORD) — EN SERVICE, photo d'ambiance en v10

- **Composants** :
    - en-tête : verdict en une phrase (« Très favorable ce matin »), meilleure fenêtre, spot, bouton « Voir le spot », temps avant le créneau ;
    - fond : photo d'ambiance marquée « Illustration » ;
    - tendance de la semaine ;
    - meilleur choix avec ses trois scores, « Pourquoi ce spot ? » et « À surveiller » ;
    - comparaison des spots suivants ;
    - mode terrain.
- **Données** : classement du moteur v2 (`rankDay`), météo du créneau, lumière, marée.
- **Règles** :
    - spots sans doute avant spots à vérifier, puis favorabilité, puis distance à égalité ;
    - un créneau déjà fini n'est plus proposé ;
    - la photo suit la lumière, le ciel, la mer et le type de lieu du créneau retenu, et n'est jamais reconnaissable sur un spot nommé.
- **Acceptation** :
    - le verdict cite le spot et la fenêtre que le classement met en tête ;
    - « Voir le spot » ouvre sa fiche ;
    - la photo porte « Illustration » ;
    - sans réseau, la miniature floue reste visible et le texte lisible (contraste AA).

### 5.3 Carte et fiche du spot (BORD) — EN SERVICE, bandeau photo en v10

- **Carte** : pastilles du moteur (cinq bleus, à vérifier, non recommandé), filtres « Tous » et « Favorables », appui sur une pastille, tes spots.
- **Fiche** :
    - bandeau photo d'ambiance ;
    - anneau de favorabilité, type, engagement, réglementation de la zone ;
    - meilleure fenêtre ;
    - « Pourquoi ce spot ? » ;
    - trois scores qui s'ouvrent sur leur décomposition ;
    - sous-onglets Créneaux, Terrain, Leurres, Accès ;
    - sécurité du spot, chaque consigne avec sa source.
- **Règles** : non recommandé (coup de vent, rafales, coefficient au-delà du seuil de la fiche) avant toute note ; niveaux de preuve affichés.
- **À FAIRE** (prototype) :
    - classement sous la carte ;
    - pastilles voisines écartées avec un trait vers leur position ;
    - trois niveaux de lecture (Vue rapide, Détails, Expert) au lieu des sous-onglets.
- **Acceptation** :
    - un appui sur une pastille sélectionne le spot ;
    - un spot non recommandé affiche sa raison ;
    - la décomposition de chaque score s'ouvre et se referme au clavier.

### 5.4 Comparaison (BORD) — EN SERVICE (dans Décision) ; écran dédié À FAIRE

- **Règle** : comparer deux à trois spots par famille de critères (marée, lumière, vent et mer, présence) avec le conseil du moteur.
- **Acceptation** : les mêmes scores que la fiche, jamais recalculés à part.

### 5.5 Matériel et stratégie (BORD) — EN SERVICE

- **Composants** :
    - « Pour quel spot, quel créneau ? » ;
    - leurre précis de ta boîte : modèle, poids, nage, couleur, animation ;
    - plan B ;
    - ta boîte et ta canne.
- **Règles** :
    - poids dans la plage de la canne ;
    - pas de surface si la fiche l'exclut ;
    - courant, vent par rapport au pêcheur, profondeur estimée, eau du jour ;
    - journal : ce qui a pris monte, ce qui est resté bredouille descend.
- **À FAIRE** (prototype) : vue « Stratégie » avec le dessin du leurre.
- **Acceptation** : le leurre conseillé est dans ta boîte, avec un poids dans la plage de ta canne (`test:unit`).

### 5.6 Journal (BORD) — EN SERVICE

- **Composants** : session en cours (chrono, « +1 bar », « Terminer »), saisie, historique, statistiques.
- **Règles** :
    - conditions enregistrées avec la session ;
    - recalibrage des spots à partir de 3 sessions ;
    - part « ton journal » de la confiance : 1,5 point par session, jusqu'à 10 sessions ;
    - copie GitHub facultative (jeton sur l'appareil).
- **Acceptation** : une session saisie apparaît dans l'historique et survit à un rechargement ; l'export et l'import rendent les mêmes données.

### 5.7 Plus (BORD) — EN SERVICE

- **Écrans** :
    - Marée ;
    - Météo, avec la fiabilité du conseil ;
    - Saison ;
    - Règles : réglementation 2026 selon le 48e parallèle, sécurité, sources ;
    - Photos : analyse d'un spot ;
    - réglages : Plein soleil, moteur v1 ou v2, sauvegarde.
- **Acceptation** : chaque écran s'ouvre depuis « Plus » et se ferme par le retour du téléphone, qui revient à l'écran précédent.

### 5.8 Mode terrain (BORD) — EN SERVICE

Gros caractères, le meilleur choix seul, utilisable d'une main.

**Acceptation** : le réglage est gardé sur l'appareil ; contraste AA.

### 5.9 Offshore (BATEAU) — EN SERVICE (v8.15) ; moteur de la phase 10 À FAIRE

- **Aujourd'hui** :
    - tes spots en mer (GPS, carte ou coordonnées ; type ; profondeur) ;
    - conditions des 7 prochains jours : vent, vagues, houle, eau, pression, marée du port le plus proche ;
    - tes sorties et leurs prises ;
    - un modèle empirique qui n'affiche pas de note avant 8 sorties.
- **À FAIRE** (phase 10, écrans du prototype) :
    - « Sortir aujourd'hui ? » ;
    - sécurité de la sortie heure par heure (règles `SEC_*`, seuils à valider) ;
    - zones et cercles de distance des abris ;
    - espèces et réglementation, techniques sourcées.
- **Règle** : aucun verdict de sécurité tant que les seuils ne sont pas validés par Félix (questions 16 à 25).
- **Acceptation** :
    - pas de note avant 8 sorties ;
    - un spot sans coordonnées valides est refusé ;
    - l'export et l'import rendent les mêmes données.

## 6. Exigences non fonctionnelles

| Exigence | Critère | Contrôle |
|---|---|---|
| Accessibilité | Aucune violation axe-core, dans les deux thèmes, à 390 et 320 px | `test:a11y`, `test:prototype` |
| Contrastes | AA pour tout texte | `test:design`, `test:a11y` |
| Pas de défilement horizontal | À 320 px | `test:e2e`, `test:prototype` |
| Mise à jour | Un téléphone passe de la version publiée à la nouvelle sans perte | `test:upgrade` |
| Sécurité | Aucune violation CSP sur les parcours | `test:e2e` |
| Couches | 0 écart ; couleurs en dur en baisse seulement | `test:layers` |
| Moteur | Scénarios de la spécification v2 | `test:v2`, `test:unit` |

## 7. Ce qui reste du prototype

1. Fiche à trois niveaux (Vue rapide, Détails, Expert) et anneaux de score en dégradé.
2. Classement sous la carte ; pastilles écartées.
3. Écrans dédiés Comparaison et Stratégie, avec les leurres dessinés.
4. Moteur et écrans BATEAU : phase 13 (Développement BATEAU), avec le moteur de la phase 10 ; seuils de sécurité à valider par Félix.

Les points 1, 2, 3 et 5 forment le lot BORD restant, à placer avant la QA globale (phase 16).
5. Planche des états, appliquée à chaque écran.
