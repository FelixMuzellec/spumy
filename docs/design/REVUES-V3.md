# Revues structurées de la phase 3 — SPUMY V3

20 novembre 2026 · sous-tâche 3.7 · prototype version 5.3 (branche `claude/v3-phase-3`, commits 318f28a à b92d494, après le jalon 2).

Ce document réunit :
- les revues demandées par le référentiel (phase 3) : UX, UI et direction artistique, plateformes, accessibilité, cartographie, contenu, terrain, QA ;
- le registre des défauts ;
- la matrice de conformité (§ 6.16) ;
- la matrice de traçabilité score → règle → composant → test ;
- les critères de recette des phases 10 à 12 ;
- le protocole de test d'utilisabilité.

La galerie AVANT/CIBLE est dans `docs/design/galerie-avant-cible.html`, publiée en page privée : https://claude.ai/artifact/97ghxwYeQHXVLG8bSQzbn9.

## 0. Méthode, preuves et limites

- **Qui a revu** : Claude, auteur du prototype. Ce n'est donc pas une revue indépendante. **VALIDATION HUMAINE INDÉPENDANTE NON OBTENUE.**
- **Validations humaines obtenues** : Félix, propriétaire et utilisateur principal :
  - jalon 1 validé avec remarques (20 nov., 13 h 46) ;
  - jalon 2 validé avec réserves (20 nov., 15 h 40, V3-027).
  Ce sont des validations sur revue, pas des tests de tâches.
- **Test utilisateur** : **TEST UTILISATEUR NON EFFECTUÉ.** Le protocole prêt à l'emploi est au § 9.
- **Mesures objectives** : `node scripts/mesures-revue-v3.mjs`. Il mesure huit écrans à 390 × 844 px et écrit `docs/design/revue-v3-mesures.json`. Il mesure sans juger :
  - cibles effectives, avec zone étendue et étiquette ;
  - ordre et visibilité du focus ;
  - focus masqué ;
  - espacement du texte ;
  - mouvement réduit ;
  - titres, repères, tailles de texte et poids chargé.
- **Tests automatisés** :
  - `npm run test:prototype-v3` : 194/194 avec axe-core ; 10 écrans × 4 largeurs × 2 thèmes ; règles métier ; cibles, titres, texte, héritage ;
  - `npm run test:design-v3` : 186/186 ;
  - `python3 tests/brand.py` : 29/29.
- **Gravités** : `CRITIQUE`, `MAJEURE`, `MINEURE`, `OBSERVATION`, comme dans `AUDIT-UX-AVANT.md`.
- **Statuts de conformité** : `Conforme`, `Partiellement conforme`, `Non conforme`, `Non vérifiable` (§ 6.16).
- **Limite de fond** : toutes les données sont de démonstration. Aucun score n'est un résultat du moteur (réserve 6 du jalon 2). La compréhension des scores par un vrai utilisateur reste à vérifier.

## 1. Mesures (390 × 844 px, thème nuit marine)

| Écran | Éléments interactifs | Cibles < 24 px | Cibles < 44 px | h1 | Tailles de texte (px) | Poids chargé |
| --- | --- | --- | --- | --- | --- | --- |
| Home | 22 | 0 | 0 | 1 | 12 à 30 | 466 Ko |
| Carte | 30 | 0 | 0 | 1 | 12 à 22 | 293 Ko |
| Météo | 17 | 0 | 0 | 1 | 12 à 22 | 265 Ko |
| Profil | 35 | 0 | 0 | 1 | 12 à 22 | 342 Ko |
| Journal | 15 | 0 | 0 | 1 | 12 à 22 | 304 Ko |
| Fiche (Pointe A, Pointe E) | 16 | 0 | 0 | 1 | 12 à 28 | 293 et 317 Ko |
| Comparaison | 10 | 0 | 0 | 1 | 12 à 22 | 293 Ko |

**Avant les corrections de cette revue** :
- 3 cibles étaient sous 24 px : la poignée du panneau (40 × 5 px) et les noms des cartes. Les noms sont un faux positif : le lien s'étend à toute la carte.
- 69 cibles étaient sous 44 px : bascule BORD / BATEAU, puces et petits boutons à 36 px, pastilles à 24 px.
- Le texte descendait à 9 px dans la Météo et à 10 px dans la courbe de marée.
- Carte et Météo n'avaient pas de h1, et le titre de page était le même partout.

**Clavier sur Home** :
- 38 arrêts de tabulation sur un tour ;
- un focus visible sur chacun ;
- aucun focus entièrement caché par l'en-tête ou la barre (WCAG 2.4.11).

**Espacement du texte** (WCAG 1.4.12 ; Home, Carte, Fiche, Profil) : aucune perte de texte et aucun défilement horizontal. Le texte qui dépasse du panneau réduit reste atteignable en faisant défiler.

**Mouvement** : les transitions durent 200 ms, et 0 ms avec « réduire les animations ».

## 2. Revue UX : les 10 heuristiques de Nielsen

| Heuristique | Constat | Gravité | Statut |
| --- | --- | --- | --- |
| 1. Visibilité de l'état | La puce de position dit le lieu et le mode (pictogramme automatique ou manuel ; précision dans le nom accessible). La fiche marque « maintenant » sur la courbe de marée. Le bandeau hors ligne donne l'heure des données. La Météo dit sa source et son heure. Il y a des états de chargement, de position refusée et d'absence de spot. | — | Conforme |
| 2. Correspondance avec le monde réel | Mots de pêcheur : marée, coefficient, BM / PM, Beaufort, flot, jusant. Heures `HH:MM–HH:MM`, vent en km/h et Beaufort. « Favorabilité » et « Confiance » sont des mots du produit. Ils sont adoucis par le mot du palier (« Très bon ») et par « ne change pas le rang ». Leur compréhension n'est pas testée. | MINEURE | Partiellement conforme (test, § 9) |
| 3. Contrôle et liberté | Bouton Retour. Retour du navigateur grâce aux adresses par écran. « Annuler » après une sortie notée. Échap ferme les feuilles. Le passage automatique / manuel est réversible. | — | Conforme |
| 4. Cohérence et standards | Une règle d'espacement et trois tailles de texte au plus par carte (testé). Même grammaire du score partout : disque, jauge, pastille. Deux écarts voulus par Félix, voir § 3 et § 6 : la barre qui défile (V3-023) et le marqueur « à vérifier » (V3-025). | OBSERVATION | Conforme, écarts arbitrés |
| 5. Prévention des erreurs | « Favorables » exige la sécurité. Les spots à vérifier sont séparés des recommandations. Le danger est dit avant la marée. L'effacement des données se confirme dans la page. Le bateau est enregistré ou saisi. | — | Conforme |
| 6. Reconnaître plutôt que se souvenir | Légende sous la carte. Compteur et règle sur chaque filtre (corrigé ici). Positions récentes. Onglets avec pictogramme et nom. | — | Conforme |
| 7. Souplesse et efficacité | Ordre des onglets et photo de Home réglables. Jours en un toucher. Comparaison de deux spots. « Noter une sortie » depuis Home. Deux panneaux sur bureau. | — | Conforme |
| 8. Esthétique et sobriété | Home en 3 sections ; partie sous la photo de 110 px au plus ; direction validée au jalon 2. La fiche est longue (2 271 px à 390 px), mais elle est rangée en Vue rapide, Détails et Expert. | OBSERVATION | Conforme |
| 9. Reconnaître et corriger les erreurs | Position refusée, avec la cause et la saisie manuelle. « Fenêtre non déterminable : raison ». « Non recommandé : raison ». Les états réels (tuiles indisponibles, erreur réseau) ne sont pas encore prototypés. | MINEURE | Partiellement conforme (recette CR-04) |
| 10. Aide et documentation | Explications sur place (« Pourquoi ? », légende, règles des filtres). « Aide et règles » existe dans Profil sans être détaillé. | MINEURE | Partiellement conforme (recette CR-09) |

## 3. Plateformes : Apple (Human Interface Guidelines) et Android (Material 3)

| Point | Attendu | Prototype | Statut |
| --- | --- | --- | --- |
| Cibles tactiles | Apple : 44 × 44 pt ; Material : 48 × 48 dp | 44 px au moins partout, mesuré et testé. Une zone invisible étend les petits dessins (puces, pastilles). | Conforme Apple ; 4 px sous Material (OBSERVATION, D-11) |
| Barre de navigation | 3 à 5 destinations, toujours visibles, sans défilement | 4 onglets visibles et un 5ᵉ en faisant défiler, avec des chevrons. Demande explicite de Félix (V3-023). Journal reste accessible depuis Home et Profil. | Écart arbitré (D-12) |
| Feuilles modales | Poignée, hauteurs d'arrêt, fermeture visible | Poignée, 3 hauteurs (réduite, moitié, ouverte), bouton de fermeture rond, Échap, focus sur le titre | Conforme |
| Commande segmentée | BORD / BATEAU, couches Vent / Mer | Commandes segmentées, rôles radio et onglets | Conforme |
| Mode sombre | Deux apparences soignées | « Nuit marine » par défaut et thème clair ; contrastes mesurés dans les deux | Conforme |
| Taille du texte du système | Dynamic Type (iOS), taille de police (Android) | Une application web suit le zoom du navigateur (reflow testé à 320 px) ; la taille du texte du système n'est pas testée | Non vérifiable (CR-06) |
| Zones sûres (encoche, barre du geste) | Rien sous l'encoche ni sous la barre du geste | Non testé sur un appareil | Non vérifiable (CR-06) |
| Retour système Android | Le geste de retour revient à l'écran précédent | Adresses par écran : le retour du navigateur fonctionne | Conforme |
| Installation | Icônes, nom, couleur de thème | Manifeste SPUMY, icône adaptative, icône iOS (testés) | Conforme |

## 4. Accessibilité : WCAG 2.2, niveau AA

| Critère | Preuve | Statut |
| --- | --- | --- |
| 1.1.1 Contenu non textuel | Photos décoratives (`alt=""`) marquées « Illustration ». Graphiques avec `role="img"` et une description complète (courbe de marée : BM, PM, coefficient, heures favorables). | Conforme |
| 1.3.1 Information et relations | Repères `header`, `nav` et `main` ; un h1 par écran (corrigé, testé) ; sections en h2 ; listes. | Conforme |
| 1.3.2 Ordre séquentiel logique | La barre du bas vient avant l'en-tête dans l'ordre du code : le lecteur d'écran et la tabulation la rencontrent d'abord. | Partiellement conforme (D-08) |
| 1.3.4 Orientation | Aucun verrouillage dans le code ni dans le manifeste ; mise en page bureau testée à 1 280 × 800. | Conforme |
| 1.4.1 Couleur | Chaque palier porte un chiffre ou un mot. « À vérifier » : signe ⚠ et contour. « Non recommandé » : score barré. Palette validée pour les daltonismes (ΔE ≥ 8,9). | Conforme |
| 1.4.3 Contraste | axe-core sur 6 écrans × 2 thèmes : 0 violation grave. 186 contrôles de jetons. | Conforme |
| 1.4.4 Redimensionnement du texte | Zoom du navigateur, reflow testé. La taille du texte seule n'est pas testée. | Partiellement conforme (CR-06) |
| 1.4.10 Reflow | 10 écrans à 320 px, deux thèmes : aucun défilement horizontal. | Conforme |
| 1.4.11 Contraste des éléments non textuels | Contours forts de 3:1 au moins, testés ; anneau marine des pastilles. Paliers sur fond : contraste informatif, le chiffre porte l'information (DESIGN-SYSTEM-V3). | Conforme |
| 1.4.12 Espacement du texte | Mesuré sur 4 écrans : aucune perte. | Conforme |
| 2.1.1 Clavier | Toutes les commandes sont des boutons ou des liens. Barre : chevrons. Ordre des onglets : boutons monter / descendre. Carte : zoom, vue d'ensemble et pastilles au clavier, mais pas de déplacement au clavier. | Partiellement conforme (D-09) |
| 2.1.2 Pas de piège au clavier | Le tour de Home revient au début ; Échap ferme les feuilles. | Conforme |
| 2.2.2 Mettre en pause, arrêter, masquer | Écran de lancement de 1,5 s, rien qui bouge plus de 5 s. | Conforme |
| 2.4.1 Contourner des blocs | Repères ARIA. | Conforme |
| 2.4.2 Titre de page | Un titre par écran (« Carte · SPUMY »…), testé ; corrigé ici. | Conforme |
| 2.4.3 Parcours du focus | Logique dans chaque écran ; barre en premier (voir 1.3.2). | Partiellement conforme (D-08) |
| 2.4.7 Focus visible | 38 arrêts sur 38. | Conforme |
| 2.4.11 Focus non masqué | 0 sur Home ; les autres écrans ne sont pas mesurés. | Partiellement vérifié (CR-07) |
| 2.5.1 Gestes multipoints | Pincer pour zoomer a l'équivalent + / −. Le glissement entre onglets a l'équivalent du toucher sur l'onglet. | Conforme |
| 2.5.2 Annulation du pointeur | Actions au relâchement (clic). | Conforme |
| 2.5.3 Étiquette dans le nom | Les noms accessibles contiennent le texte visible : pastille « 92 » → « Pointe I, 92/100… » ; puce « Pirou ». | Conforme |
| 2.5.7 Mouvements de glissement | Panneau : poignée au toucher. Barre : chevrons. Courbe de marée : heures écrites. Curseur d'heure : clic et clavier. Déplacer la carte demande un glissement ; seuls le zoom, la vue d'ensemble et la liste en dispensent. | Partiellement conforme (D-09) |
| 2.5.8 Taille de la cible (minimum) | 24 px au moins partout, et même 44 px (mesuré et testé). | Conforme |
| 3.1.1 Langue de la page | `lang="fr"`. | Conforme |
| 3.2.3 Navigation cohérente, 3.2.6 Aide cohérente | Même barre et même en-tête partout ; l'aide est toujours dans Profil. | Conforme |
| 3.3.2 Étiquettes ou instructions | Recherche de position, sortie rapide, profil du bateau. | Conforme |
| 3.3.7 Saisie redondante | Bateau enregistré et réutilisé ; positions récentes. | Conforme |
| 3.3.8 Authentification accessible | Pas de connexion. Le jeton de sauvegarde GitHub (fonction V2) n'est pas prototypé : collage et gestionnaire de mots de passe à vérifier. | Non vérifiable (CR-08) |
| 4.1.2 Nom, rôle et valeur | axe-core : 0 violation grave. `aria-pressed`, radios, onglets. | Conforme |
| 4.1.3 Messages d'état | Message temporaire et bandeau hors ligne en `role="status"`. | Conforme |

## 5. Revue UI et direction artistique

- **Planche UI de référence** (`docs/design/REFERENCES.md`) suivie :
  - fond nuit marine ;
  - orange en accent et en remplissage, jamais en petit texte sur fond clair ;
  - grandes photos ;
  - cartes à photo ;
  - chiffres en Roboto Condensed.
  Ce n'est ni un rendu générique, ni une simple recoloration de la V2.
- **Marque** : logo BRAND d'origine, sans retouche du poisson ni de l'orange #C76A31 (`tests/brand.py` 29/29). Écran de lancement sur le fond crème ; médaillon et mot SPUMY dans l'en-tête ; icônes d'application.
- **Système** :
  - rythme de 16 px et 32 px entre deux spots (testé) ;
  - trois tailles de texte au plus par carte (testé) ;
  - 12 px au moins partout (testé) ;
  - mêmes composants d'un écran à l'autre (jauge, disque, pastille, feuille, puces).
- **Retours de Félix intégrés** de la version 2 à la version 5.2 (14 h 26 à 15 h 32) : graphisme « top tier », Home aérée, vraie carte et panneau du bas, logo, puce de position élargie, couleurs de la feuille de position.
- **Restent en réserve** :
  - photos générées (R3) ;
  - dessin Météo (R5) ;
  - taille de la mini-carte (R4).
- **Statut** : Conforme, provisoire pour la densité et les visualisations métier (V3-027).

## 6. Revue cartographique : recette du prototype (§ 6.9)

| Point | Prototype | Statut |
| --- | --- | --- |
| Carte réellement visible (Carte, Météo, mini-carte de position) | Oui, sans être masquée ni écrasée ; aucune pastille sous le panneau (testé). | Conforme |
| Centre initial sur la position et cadrage des spots | Vue d'ensemble du fond dessiné ; la position est visible (anneau), mais pas au centre. | Partiellement conforme (D-10, CR-02) |
| Pas de secteur, de région ni de département | Aucun. Météo : grille de points sans zone nommée. | Conforme |
| Position visible et modifiable, précision affichée | Puce permanente (auto / manuelle), feuille de position, « Me géolocaliser » sur la carte ; précision dans le nom accessible de la puce. | Conforme |
| Recentrage | « Vue d'ensemble » et « Me géolocaliser ». Pas encore de bouton distinct « revenir à ma position de référence ». | Partiellement conforme (CR-02) |
| Zoom et déplacement libres | Pincer, molette, double-clic, + / −, glisser ; bornes. | Conforme ; clavier : D-09 |
| Marqueurs : grammaire, jamais la couleur seule | Pastille : couleur du palier et score écrit. « À vérifier » : contour et ⚠. « Non recommandé » : score barré. Sans note : pastille vide « – ». Choisi : mis en avant. | Conforme ; écart au § 6.9 arbitré (D-13) |
| Regroupement | Sous 48 px, avec le nombre exact ; un groupe compte ses spots (testé) ; on zoome pour les séparer. | Conforme |
| Sélection | Le toucher ou le clavier ouvre l'aperçu : nom, score sur 100, mot, état, sécurité, temps de route, « Ouvrir la fiche ». | Conforme |
| Filtres | Tous, Favorables, À vérifier, Mes spots ; compteur exact égal aux pastilles (testé) ; règle d'inclusion affichée (corrigée ici, testée). | Conforme |
| Panneau du bas | 3 hauteurs, poignée de 44 px, ne masque ni les commandes ni les pastilles. | Conforme |
| États (chargement, hors ligne, aucun spot à 1 h, position refusée) | Prototypés dans Profil, États de démonstration. Tuiles indisponibles : pas de tuiles. | Partiellement conforme (CR-04) |
| Fond de carte réel, vue large de la France | Fond dessiné (démonstration). Plan IGN à l'intégration (V3-012). | Non vérifiable (R2, CR-01) |
| Bureau | Deux panneaux, liste et carte (capture 11). | Conforme |

## 7. Revue des contenus et revue terrain

**Contenus**
- Un seul slogan, en tête de Home (V3-028) ; pas de « V2 » ni de « phase », pas de note sur 10, pas de « Pertinence » à l'écran (testé sur 8 écrans ; « Phase 9 » retiré du choix du bateau, D-16).
- Heures au format `HH:MM–HH:MM`.
- Espace insécable avant « : ».
- Chaque photo est marquée « Illustration » (V3-026).
- Les règles de pêche du prototype sont marquées « (démo) ».
- Aucun texte ne promet une prise : la phrase de Home dit une qualité probable.

**Terrain**, d'après une revue d'expert (INFÉRÉ, pas d'essai au bord de l'eau) :
- **Pour une main mouillée ou gantée** : cibles de 44 px au moins.
- **Pour le plein soleil** : thème clair. Il reste à essayer dehors (CR-05).
- **Pour décider d'un coup d'œil** : les horaires sont en tête de carte, la courbe de marée est coloriée, et la sécurité est dite avant le reste.
- **Sans réseau** : bandeau hors ligne avec l'heure des données.
- **Ce qui manque** : un essai réel (R1). Le « mode terrain » de Profil n'est pas prototypé.

## 8. Registre des défauts de la revue

| Id | Défaut | Gravité | Traitement | Statut |
| --- | --- | --- | --- | --- |
| D-01 | Bascule BORD / BATEAU, puces et petits boutons à 36 px ; pastilles à 24 px | MAJEURE (terrain) | 44 px ; zone invisible pour les petits dessins | Corrigé (318f28a), testé |
| D-02 | Poignée du panneau de 40 × 5 px (WCAG 2.5.8) | MAJEURE | 56 × 44 px, même dessin | Corrigé (318f28a), testé |
| D-03 | Texte de 9 et 10 px dans les graphiques | MAJEURE (lisibilité dehors) | 12 px ; légende du graphique Météo en texte | Corrigé (318f28a), testé |
| D-04 | Pas de h1 sur Carte et Météo | MINEURE | h1 lu par les lecteurs d'écran | Corrigé, testé |
| D-05 | Même titre de page partout (WCAG 2.4.2) | MINEURE | « Écran · SPUMY » | Corrigé, testé |
| D-06 | Règle d'inclusion des filtres non affichée (§ 6.9) | MINEURE | Règle sous la carte et dans le nom du filtre | Corrigé, testé |
| D-07 | Fixture § 6.7.2 incomplète (Pointe E à Confiance 40) | MINEURE | Pointe E : 53 — À vérifier, Confiance 69 — Moyenne | Corrigé, testé |
| D-08 | La barre du bas précède l'en-tête dans l'ordre du code | MINEURE | Mettre la barre après le contenu, ou un lien d'évitement | Ouvert : CR-07 |
| D-09 | La carte ne se déplace pas au clavier ni sans glisser (2.1.1, 2.5.7) | MINEURE | Flèches du clavier, boutons de déplacement ou recherche qui centre | Ouvert : CR-03 |
| D-10 | Carte non centrée sur la position de référence | MINEURE | Centre et cadrage dynamiques sur le vrai fond | Ouvert : CR-02 |
| D-11 | 44 px au lieu des 48 dp de Material | OBSERVATION | Proposition : garder 44 (Apple, WCAG 2.5.5 AAA) ; à confirmer | À DÉCIDER (§ 12 du rapport) |
| D-12 | Barre qui défile, hors standard Apple et Material | OBSERVATION | Voulue par Félix (V3-023) ; chevrons ; Journal accessible ailleurs | Arbitré |
| D-13 | Marqueur « à vérifier » : ⚠ et contour plein au lieu du pointillé et du « ? » du § 6.9 | OBSERVATION | Retour de Félix (14 h 26 : pointillés et « ? » incompris), V3-025 validée au jalon 2 | Arbitré ; écart au référentiel consigné |
| D-14 | Aide et « mode terrain » non détaillés | MINEURE | Prototyper avant l'intégration | Ouvert : CR-09 |
| D-15 | Emplacement de l'export du journal non décidé (A22) | MINEURE | Options A, B, C (UX-V3 § 11) | À DÉCIDER après test |
| D-16 | « Phase 9 » écrit à l'écran dans le choix du bateau (UX-03), trouvé au contrôle des exigences de la sous-tâche 3.8 | MINEURE | Mention retirée ; le test d'héritage cherche aussi « phase » | Corrigé, testé |

Aucun défaut critique ou majeur ne reste ouvert. Les défauts de l'audit AVANT (A01 à A22) sont suivis au § 10.

## 9. Test d'utilisabilité : protocole (TEST UTILISATEUR NON EFFECTUÉ)

**Participants** : Félix et 2 à 4 proches pêcheurs, chacun sur son téléphone, dehors si possible. **Matériel** : l'artefact « Prototype SPUMY V3 ». **Mesures** : réussite, temps, erreurs, réponses de compréhension. **Durée** : 15 min.

| Tâche | Consigne | Réussite attendue |
| --- | --- | --- |
| T1 | « Où irais-tu pêcher ce matin, et à quelle heure ? » | Nomme un spot et sa fenêtre en 30 s au plus |
| T2 | « Ce spot est-il sûr pour y aller ? » | Trouve la sécurité et le danger de marée |
| T3 | « Montre seulement les spots favorables sur la carte. » | Filtre « Favorables », dit pourquoi 3 |
| T4 | « Tu pêches près de Saint-Pierre-Quiberon : change ta position. » | Saisie manuelle réussie |
| T5 | « Note ta sortie d'hier. » | Sortie enregistrée |
| T6 | « Où exporterais-tu ton journal ? » | Trouvé sans aide en 20 s, par 4 personnes sur 5 (décide D-15) |
| T7 | Fiche Pointe E : « Que veulent dire “53 — À vérifier” et “Confiance 69 — Moyenne” ? » | Pas une probabilité de prise ; la Confiance ne change pas le rang ; quelque chose est à vérifier avant d'y aller |
| T8 | « Passe en BATEAU et dis si tu peux sortir. » | Choisit son bateau, lit le verdict |

**Résultats** : aucun, le test n'a pas été fait. Il est prévu avant la revalidation du jalon 3, après les phases 5, 8 et 9.

## 10. Écarts de l'audit AVANT : état dans le prototype

| Écarts | État |
| --- | --- |
| A01 (logo altéré), A06 (cyan), A07 (orange faux) | Corrigés en V3 (brand 29/29, design-v3). Le site en ligne reste inchangé jusqu'à l'intégration. |
| A02 (Pertinence), A09 (note sur 10), A15 (trois colonnes), A16 (5 bleus) | Absents du prototype (testé). Moteur et site : intégration. |
| A03 (guide ou département), A20 (position) | Puce de position, aucun guide. |
| A04 (Top 3), A21 (filtres), A14 (paragraphes avant de voir), A13 (textes, horaires) | Corrigés dans le prototype (A04 et A21 testés). |
| A11 (carte), A19 (bureau), A17 (navigation), A18 (BATEAU) | Corrigés dans le prototype ; vrai fond de carte à l'intégration. |
| A12 (pastilles provisoires au chargement) | État « Chargement » prototypé. |
| A05 (slogan) | Le slogan du site est retiré ; seul « Read the sea. Fish the moment. » reste, en tête de Home (V3-028). |
| A08 (coordonnées), A10 (vigilance) | Hors du périmètre de la phase 3 : phases 5, 7 et 9. |
| A22 (export) | À décider après le test T6. |

## 11. Matrice de conformité (§ 6.16)

| Domaine | Statut | Preuve | Écart, risque, traitement |
| --- | --- | --- | --- |
| Utilité et parcours | Partiellement conforme | 8 tâches prioritaires couvertes (UX-V3 § 1), parcours BORD et BATEAU de bout en bout dans le prototype | Réussite réelle non mesurée (R1) ; test § 9 |
| Architecture de l'information | Conforme | Jalon 1 validé ; barre de 4 onglets, retour, contexte gardé (adresses par écran) | — |
| Hiérarchie et compréhension | Partiellement conforme | Fixture 53 / 69 présente et testée ; mot du palier ; « ne change pas le rang » | Compréhension non vérifiée (T7). « 100 provisoire » : la forme d'affichage (valeur, fourchette, qualitatif) se décide en phase 6 (§ 9.1) : Non vérifiable |
| Modèle de choix | Conforme | Confiance sans effet sur le rang ni sur les égalités (testé, 3 jeux) ; aucune Pertinence (testé) ; « à vérifier » hors des cartes, quel que soit le score | — |
| Direction artistique | Conforme (provisoire) | Jalon 2 validé avec réserves ; planche suivie ; logo intact | Réserves R3, R4, R5 |
| Design System | Conforme | Jetons uniques, 186 contrôles, composants partagés, états | Valeurs finales au jalon 4 |
| Cartographie | Partiellement conforme | § 6 : 10 points conformes sur 14 | Fond dessiné (R2) ; centrage, recentrage, clavier : CR-01 à CR-03 |
| Données et confiance | Partiellement conforme | Source et heure (Météo, fiche), hors ligne, sécurité avant tout, règles de pêche marquées | Données de démonstration (R6) ; vigilance réelle : relais (V3-011) |
| Terrain et accessibilité | Partiellement conforme | WCAG 2.2 AA : 24 critères conformes, 7 partiels ou non vérifiables (§ 4) ; cibles de 44 px ; deux thèmes | Essai dehors (CR-05) ; D-08, D-09 |
| Responsive et performance | Partiellement conforme | 320, 375, 390, 1 280 px × 2 thèmes ; 265 à 466 Ko par écran | Appareils réels, réseau dégradé, zones sûres : CR-06 |
| Contenus et assets | Conforme | Photos marquées « Illustration », provenance dans `data/photos/catalogue.json`, un seul slogan, en tête de Home (V3-028), aucun « V2 » | — |
| Périmètre V3 et héritage V2 | Partiellement conforme | BATEAU présent : Home, marques, bateau, sorties, carte, météo Mer | Fonctions BATEAU V2 non toutes prototypées (journal BATEAU détaillé, modèle appris) ; vérifiées à l'intégration (BAT-01 à BAT-10) |
| Validation | Partiellement conforme | Captures réelles, 194 + 186 + 29 tests, jalons 1 et 2 de Félix | TEST UTILISATEUR NON EFFECTUÉ ; VALIDATION HUMAINE INDÉPENDANTE NON OBTENUE |
| Trois cartes de recommandation | Conforme | 3 cartes BORD et 3 BATEAU ; place réservée, égalités, pénurie testées ; responsive | Données réelles : intégration |
| Profil et export | Partiellement conforme | Pas d'onglet Statistiques ; statistiques non figées (PRO-02) | Emplacement de l'export non décidé (D-15) |

## 12. Matrice de traçabilité : score → règle → composant → test

| Valeur visible | Règle | Code | Composants | Tests |
| --- | --- | --- | --- | --- |
| Palier de Favorabilité (6 couleurs, mot) | § 6.7.5.1 | `TIERS`, `tierOf`, `favorabilityLabel` (tokens.js) | Jauge, disque, pastille, bandes de la courbe de marée | design-v3 : bornes, arrondi, mots ; prototype : « chaque pastille porte son score » |
| Valeur affichée (arrondi) | § 6.7.5.1 | `displayValue` | Tous | design-v3 : « 19,5 s'affiche 20 » |
| « Favorables » | V3-021 (75), § 6.7.4 | `FAVORABLE_MIN`, `isFavorable`, `favorable` | Filtre et compteur de la Carte, règle affichée | design-v3 : Favorables ; prototype : « Favorables = 3 », compteur égal aux pastilles, règle affichée |
| Confiance (valeur, mot) | § 6.7.1, V3-006 | `ranking` ne la lit pas ; `confidenceLabel` | Jauge fine, ligne des cartes, comparaison | prototype : rang et égalités inchangés (3 jeux), « ne change pas le rang » |
| « À vérifier » | § 6.7.2, § 6.9, V3-025 | `status: "verify"`, `verifyList`, exclusion par `admissible` | Section « À vérifier » de Home, pastille ⚠, filtre | prototype : « hors des cartes », pastilles ⚠, fixture 53 |
| « Non recommandé » (sécurité) | § 9.5 | `safety`, `admissible` | Pastille barrée, message de la fiche | prototype : pastille barrée ; route #spot-g sans erreur |
| Sans note | § 9.1 | `fav: null`, `tierOf(null)` | Pastille vide « – », « Sans note » | design-v3 : sans note ; prototype : pastille vide |
| Place « Le plus proche » | V3-016 | `ranking` (`nearest`) | Carte de recommandation | prototype : place réservée |
| Égalité au dernier rang | § 6.7.4 | `ranking` (`tie`, `extra`) | 4 ou 5 cartes, accès aux autres | prototype : 4 ou 5 cartes marquées |
| Moins de 3 spots | § 6.7.4 | `ranking` (`scarce`) | Phrase de Home, aucune carte inventée | prototype : pénurie |
| Phrase de Home | V3-023 | `homePhrase` | En-tête de Home | prototype : phrase avec horaires |
| Encre sur palier | contraste 3:1 | `TIER_INK` | Disque, pastille | design-v3 : encre des paliers |
| Pas de couleur seule | § 6.7.5, WCAG 1.4.1 | palette validée (validate_palette) | Tous | design-v3 : contrastes ; ΔE consignés (DESIGN-SYSTEM-V3) |
| Pas d'ancien score | V3-006, V3-015 | — | Tous les écrans | prototype : « ni Pertinence, ni note sur 10, ni “V2” » (8 écrans) |

## 13. Critères de recette pour l'intégration (phases 10 à 12)

Chaque critère reprend une réserve du jalon 2 (R1 à R6) ou un défaut ouvert. Il sera prouvé par une capture ou un test au moment de la recette (jalon 4).

| Id | Origine | Critère | Preuve attendue |
| --- | --- | --- | --- |
| CR-01 | R2 | La carte réelle (Plan IGN, OpenStreetMap en secours) passe les 14 points du § 6 ; la vue large montre la France sans découpage | Captures 320 à 1 280 px, recette carto |
| CR-02 | D-10 | Au premier affichage, la carte est centrée sur la position de référence et cadre les spots à 60 min ou moins. Un bouton distinct y ramène. La carte ne se recentre jamais seule contre une position manuelle. | Test e2e (position auto, position manuelle) |
| CR-03 | D-09 | La carte se déplace au clavier (flèches) et sans glisser (boutons ou recherche qui centre) | Test e2e clavier |
| CR-04 | Nielsen 9 | États réels : tuiles indisponibles, erreur réseau, position imprécise ou ancienne, permission absente | Captures de chaque état |
| CR-05 | R1, terrain | Essai au bord de l'eau, en plein soleil, thème clair : tout se lit sans plisser les yeux ; une main mouillée touche les cibles | Compte rendu d'essai de Félix |
| CR-06 | Plateformes | iPhone et Android réels : zones sûres, taille du texte du système, installation, hors ligne | Captures sur appareils |
| CR-07 | D-08, 2.4.11 | Ordre de lecture : contenu avant la barre, ou lien d'évitement ; aucun focus caché sur aucun écran | Mesure étendue à tous les écrans |
| CR-08 | 3.3.8 | Le champ du jeton de sauvegarde accepte le collage et le gestionnaire de mots de passe ; le jeton reste sur l'appareil | Test e2e |
| CR-09 | D-14 | Aide et « mode terrain » prototypés, puis validés par Félix | Capture, décision |
| CR-10 | R3 | Toute photo est marquée « Illustration » et aucune n'est présentée comme un lieu réel | Test de contenu |
| CR-11 | R4 | Taille de la mini-carte de position revue à l'usage (180 px aujourd'hui) | Retour de Félix |
| CR-12 | R5 | Météo sur vraies prévisions : flèches lisibles à 320 px, densité de grille réglée, rafales visibles | Captures, retour de Félix |
| CR-13 | R6, jalon 3 | Prototypes métier revalidés avec les scores du moteur, après les phases 5, 8 et 9 ; fixture 53 / 100 provisoire / 69 rejouée sur mobile et bureau (§ 10) | Tests de compréhension T7 |
| CR-14 | Performance | Home sous 500 Ko au premier chargement, polices comprises (466 Ko mesurés dans le prototype) ; images en 720 px sur mobile | Mesure du poids |
| CR-15 | V3-028 | Courbes de profondeur seulement depuis une donnée réelle (EMODnet Bathymetry ou Shom), avec source et date ; aucune courbe sinon | Recette carto, source citée |
| CR-16 | V3-028 | Vent animé sur vraies prévisions : couleurs en nœuds justes contre les données, animation en pause onglet caché, flèches fixes si le mouvement est réduit, 60 i/s sur un téléphone moyen | Mesure, captures |

## 14. Revue de la version 6 (23 nov. 2026)

Même méthode que les revues 3.7 (heuristiques, accessibilité, contenu), appliquée aux maquettes de Félix reproduites (V3-028 à V3-030).

| Point | Constat | Suite |
| --- | --- | --- |
| Fidélité aux 3 vues | Home, Carte et Météo reprennent la composition, la palette et la hiérarchie des maquettes (`docs/design/comparaison-v6/`) | Revalidation par Félix |
| Données | Trait de côte IGN réel, 8 vrais spots à leur position ; notes, marée du jour, vent et journal de démonstration, marqués | Moteur : phases 5, 8, 9 |
| Courbes de profondeur | Absentes : EMODnet et Shom refusés par le proxy ; rien de dessiné | Fichier à fournir par Félix (CR-15) |
| Général → spécifique | Premier écran = carte ; bulle ou panneau au toucher ; sections « pourquoi » sous la carte ; détail sourcé avec niveau de preuve | Testé |
| Accessibilité | axe : aucune violation grave dans les deux thèmes après correction de l'orange (3,9 → 5,1:1) et du vert (4,3 → 5,9:1) en plein jour, des libellés d'effet et des pastilles décoratives | Testé |
| Cibles | Liens de sources portés à 44 px ; boutons de carte 44 px ; pastilles 52 px | Testé |
| Vue large | Spots proches regroupés (« +N ») : les vrais spots couvrent ~70 km, la maquette 4 spots rapprochés | Écart assumé, à confirmer par Félix |
| Offshore | Carte et Météo Offshore : un avis, pas encore la vue V6 | À faire |
| Mouvement | Vent animé en pause onglet caché ; flèches fixes si le mouvement est réduit | Testé (mouvement réduit) |
