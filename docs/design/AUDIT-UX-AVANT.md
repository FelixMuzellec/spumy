# Audit UX/UI AVANT — SPUMY en ligne (V2)

Phase 3 V3, 20 novembre 2026. C'est l'état de départ de la refonte. Il reprend l'audit de la phase 1 (`docs/rapports/v3/PHASE-1.md`, défauts D1 à D14) et le complète écran par écran.

## 1. Conditions des captures

- **Code** : `main` à bb4f940 (v10.0.0), construit localement ; c'est le code publié (déploiement GitHub Pages vérifié par l'API).
- **Exécution** : Chromium (Playwright), servi au chemin `/spumy/` comme GitHub Pages. Heure figée au 20 nov. 2026, 9 h 30 (heure de Paris).
- **Données de test** :
    - météo simulée des tests (`tests/om_mock.mjs`, scénario « nominal ») ;
    - fond de carte remplacé par un aplat, car les tuiles sont injoignables d'ici ;
    - mode BATEAU avec un spot de démonstration (« Basse de démonstration », 48,2 N, 4,8 O, épave, 35 m) ;
    - aucun journal.
- **Viewports** : 390 × 844 (iPhone 13), 375 × 812 (iPhone 11 Pro), 320 × 640, 1 280 × 800 ; thèmes Nuit marine et Plein soleil.
- **Site en ligne dans un vrai navigateur** : `Non vérifiable` (aucun navigateur relié ; réserve P1-14, ADR-V3-003).
- **Erreurs** : aucune erreur JavaScript et aucun fichier manquant sur les 30 captures, hormis l'avertissement du service worker bloqué par le banc d'essai. Hors ligne, les échecs réseau sont attendus.

## 2. Galerie AVANT (`docs/design/avant/`)

| Fichier | Route | Mode | Viewport | État |
| --- | --- | --- | --- | --- |
| 01-pirou-spots-mobile(-chargement) | `pirou.html#spots` | BORD | 390 | chargé ; et à 250 ms |
| 02-pirou-spots-mobile-page | `pirou.html#spots` | BORD | 390 | page entière |
| 03-pirou-spots-desktop | `pirou.html#spots` | BORD | 1 280 | chargé |
| 04-pirou-spots-320 | `pirou.html#spots` | BORD | 320 | chargé |
| 05-pirou-spots-hors-ligne | `pirou.html#spots` | BORD | 390 | hors ligne |
| 06-pirou-spots-meteo-en-erreur | `pirou.html#spots` | BORD | 390 | météo en erreur |
| 07-pirou-spots-soleil | `pirou.html#spots` | BORD | 390 | Plein soleil |
| 08-pirou-decision, 27 (375), 29 (bureau) | `pirou.html#synthese` | BORD | 390, 375, 1 280 | chargé |
| 09-pirou-journal, 30 (soleil) | `#journal` | BORD | 390 | vide |
| 10-pirou-materiel | `#leurres` | BORD | 390 | boîte de départ |
| 11-pirou-plus à 16-pirou-photos | `#plus`, `#maree`, `#meteo`, `#saison`, `#regles`, `#photos` | BORD | 390 | chargé |
| 17-pirou-fiche-spot | `#spot=goury` | BORD | 390 | fiche ouverte |
| 18-accueil-inshore, 20 (bureau) | `index.html` | accueil | 390, 1 280 | chargé |
| 19-accueil-offshore | `index.html#offshore` | BATEAU | 390 | vide |
| 24-offshore-avec-spot, 28 (375) | `index.html#offshore` | BATEAU | 390, 375 | un spot |
| 21-logonna-spots | `logonna.html#spots` | BORD | 390 | chargé |
| 22-ancre-inconnue | `pirou.html#nimportequoi` | BORD | 390 | ancre inconnue |
| 23-accueil-ajout-spot | `index.html` | accueil | 390 | après « Ajouter un spot » |
| 25-pirou-reglages | `#plus` → Réglages | BORD | 390 | réglages |
| 26-pirou-spots-375 | `pirou.html#spots` | BORD | 375 | chargé |

## 3. Inventaire des écrans, des parcours et des composants

- **Accueil** :
    - logo, slogan, onglets Inshore et Offshore ;
    - recherche ; « Les spots les plus proches de moi » ;
    - carte de tous les spots (Aujourd'hui, Demain), avec une légende longue en paragraphe ;
    - tes spots ; ajout d'un spot ;
    - guides par département.
- **Guide BORD (7 pages)**, barre du bas : Décision, Carte, Journal, Matériel, Plus.
    - **Décision** : photo d'illustration, verdict, meilleure fenêtre, meilleur choix et égalité, sécurité, comparaison, 7 jours.
    - **Carte** : carte Leaflet de 340 px, filtres Tous, Favorables et Les miens avec compteurs, Top 3 ou les 10, fiche du spot, tes spots, heures de pêche.
    - **Journal** : sessions, prises, apprentissage.
    - **Matériel** : créneau, boîte, conseil de leurres sourcé.
    - **Plus** : Marée, Météo, Saison, Règles, Photos, Réglages (thème, moteur v1 ou v2, « boîte complète », trajet maximal, sauvegarde GitHub, transfert), Changer de guide.
- **BATEAU (onglet Offshore de l'accueil)** : texte d'explication, tes spots bateau (carte, ajout), conditions sur 7 jours par spot, sorties et prises, modèle appris (note sur 10 dès 8 sorties). Pas de barre de navigation propre.
- **Composants clés** :
    - anneau de score (`ScoreRing`) ;
    - grille des trois scores (`Scores.jsx`) ;
    - pastilles de carte, en 5 bleus ; pointillé et « ? » pour « à vérifier » ; barré pour « non recommandé » ;
    - badges de sécurité ; puces de créneau ; photo d'ambiance marquée « Illustration » ;
    - barre du bas ; en-tête de guide ; sélecteur de jour.

## 4. Registre priorisé des écarts

Gravité selon le § 6.15. Effort : S (heures), M (jours), L (une phase). Les corrections sont conçues dans cette phase et réalisées aux Phases 10 à 12, sauf mention contraire.

| Id | Écran ou parcours | Preuve | Gravité | Impact utilisateur | Exigence enfreinte | Cause probable | Correction proposée | Effort, risque | Critère d'acceptation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A01 | Accueil, en-têtes (logo sombre) | 18, 20 ; comparaison des pixels (phase 1) | CRITIQUE | Marque altérée : pointe de la queue du poisson recolorée | UX-01, § 6.1.1 | `scripts/logos.py` passe le marine en crème hors du disque | **Fait dans cette phase** : exports V3 sans recoloration, sur fond extérieur adapté ; test de la zone protégée (`tests/brand.mjs`) | S, faible | zone protégée identique à la source dans chaque export |
| A02 | Fiche spot, Réglages | 17, 25 | CRITIQUE | Un score supprimé reste affiché et peut déclasser | REC-02, § 6.7 | moteur v2 à trois scores | Retirer la Pertinence de l'écran, du réglage et du classement | M, moyen (tests à revoir) | aucune Pertinence dans le build ; invariance du rang |
| A03 | Accueil, guides, Réglages (« Changer de guide ») | 18, 25 | MAJEURE | Il faut choisir un guide ou un département ; le classement part du pôle du guide | V3-007, POS, RTE | architecture par guide | Position de référence et catalogue unique | L | aucune entrée par secteur ; recette carto 2 |
| A04 | Décision, Top 3 | code `selectTop3` | MAJEURE | Un spot non proposé peut combler le Top 3 ; « Local garanti » | REC-05, REC-06 | règle V2 | Cartes de recommandation V3 (`docs/design/UX-V3.md`) | M | cas de pénurie et d'égalité testés |
| A05 | Accueil, description, manifeste | 18 | MAJEURE | Slogan interdit | UX-03, § 6.2.2 | — | Retirer | S | recherche de texte dans le build |
| A06 | Toutes | toutes | MAJEURE | Cyan structurant, hors de l'identité SPUMY | UX-02, § 6.2 | jetons v10 | Design System V3 (`docs/design/DESIGN-SYSTEM-V3.md`) | L | jetons V3 seuls ; contrastes mesurés |
| A07 | Jetons | `src/design/tokens.js` | MAJEURE | Orange « de marque » faux (#d9772f au lieu de #C76A31) | UX-02, § 6.2.1 | valeur non mesurée en phase 12 | Jetons `brand-logo-orange` et `accent-orange` | S | test des jetons |
| A08 | Carte (Pirou) | données | MAJEURE | 7 pastilles placées à environ 1 à 2 km près | MAP-06 | coordonnées à la minute d'arc | Coordonnées sourcées (Phases 5 et 7) ; signalement en attendant | M | 66 spots en décimales ou signalés |
| A09 | Réglages, Offshore | 19, 25 | MAJEURE | Ancienne note sur 10 encore choisissable ; note sur 10 en BATEAU | REC-12, V3-015 | — | Retirer ; modèle BATEAU « d'après tes sorties » | S | aucun « sur 10 » dans le build |
| A10 | Décision, sécurité | 08 | MAJEURE | Vigilance non lue | SEC-03, V3-011 | pas de source | Relais (Phase 9 ou 10) ; en attendant, rappel | M | état « vigilance inconnue » distinct |
| A11 | Carte | 01, 03, 04, 26 | MAJEURE | Carte petite (340 px), pas centrée sur toi ; pastilles et étiquettes qui se chevauchent ; pas de regroupement ; sur bureau, une colonne de 640 px | MAP-01, MAP-03, MAP-07 | carte en carte de contenu, dans une page à défilement | Carte plein écran avec feuille glissante (UX-V3) | L | recette carto 1 à 10 |
| A12 | Carte, chargement | 01 (250 ms) | MINEURE | Pastilles « à vérifier » provisoires avant la météo | UX-07 | calcul sans météo affiché | État « calcul en cours » | S | capture au chargement |
| A13 | Décision, Réglages, ancres | 08, 22, 25 | MINEURE | « sans doute », « v2 », « phase 8 » visibles ; format « 08h30 → 12h30 » ; ancre inconnue gardée | UX-03, REC-09 | — | Textes et format `HH:MM–HH:MM` ; ancre normalisée | S | recherche de texte ; test du format |
| A14 | Accueil, Offshore, Réglages, légendes | 18, 19, 25 | MAJEURE | Paragraphes à lire avant de voir (légende de la carte, explication du mode BATEAU, réglages) | § 6.5.1 | — | Légende visuelle, textes courts, détails en second niveau | M | test « 5 secondes » sur captures |
| A15 | Fiche spot | 17 | MAJEURE | Grille de trois scores en colonnes | § 6.7.1, UX-04 | trois scores | Deux scores empilés et lisibles | S | captures 320 à 1 280 px |
| A16 | Carte, listes, fiches | 01, 17 | MAJEURE | Favorabilité en 5 nuances de bleu (paliers 75, 65, 55, 45) au lieu des 6 paliers communs (§ 6.7.5.1) ; Confiance sans code commun | § 6.7.5.1, § 6.7.5.2 | charte v10 | Jauges et pastilles à 6 paliers (DS V3) | M | recette des bornes 0 à 100 |
| A17 | Navigation | toutes | MAJEURE | Pas de Profil ; « Plus » mélange référence, réglages et changement de guide ; Matériel porte le conseil de leurres | UX-05, V3-017 | navigation V2 | Navigation V3 en 5 entrées ; « Leurres conseillés » dans la fiche | M | arbre de navigation testé |
| A18 | BATEAU | 19, 24, 28 | MAJEURE | Le mode BATEAU n'est qu'un onglet de l'accueil, sans Décision, Carte ni Journal propres ; on n'y accède pas depuis un guide | BAT-08, § 6.6 | BATEAU ajouté à l'accueil en V2 | Bascule de mode commune ; tâches BATEAU dans la même navigation | L | test de tâche 6 |
| A19 | Bureau | 03, 20, 29 | MINEURE | Une colonne de 640 px ; le reste de l'écran est vide | MAP-07, § 6.11 | mise en page mobile seule | Disposition bureau à deux panneaux (liste et carte) | M | captures 1 280 px |
| A20 | Position | 01, 08 | MAJEURE | Position de référence ni visible ni modifiable dans les guides | POS-01, POS-05 | — | Puce de position permanente | M | recette carto 6 et 7 |
| A21 | Filtres de carte | 01 | MINEURE | Pas de filtre « À vérifier » ; règle de « Favorables » non affichée | MAP-04, § 6.9 | — | Filtres V3 avec compteur et règle | S | compteurs exacts |
| A22 | Export du journal | 25 | MINEURE | Export rangé dans les réglages (« Toutes mes données ») par convention | JRN-04, § 6.4 | — | Emplacement à étudier et à faire valider (UX-V3) | S | décision consignée |

**Bilan** : 22 écarts, dont 2 CRITIQUE, 15 MAJEURE et 5 MINEURE. A01 est corrigé dans cette phase, au niveau des fichiers de marque (section 3.2 du rapport). Les autres sont conçus dans cette phase et réalisés plus tard.
