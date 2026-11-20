# Références visuelles et photographies — revue de la Phase 3

20 novembre 2026. Référentiel § 6.1.4, § 6.2, § 6.12.

## 1. Planche « SPUMY Fishing App UI Showcase »

- **Fichier** : envoyé par Félix (1 536 × 1 024, PNG) ; copie dans le dépôt : `docs/reference/maquette-reference.webp`.
- **Statut** : référence d'intention et de niveau de finition, pas une maquette à reproduire (§ 6.1.4). La hiérarchie du référentiel s'applique : invariants du logo, puis palette approuvée (§ 6.2), puis planche.

| Écran de la planche | À garder | À adapter | À rejeter, et pourquoi |
| --- | --- | --- | --- |
| Accueil (« Excellentes conditions aujourd'hui ! ») | photo en tête qui porte l'ambiance ; verdict en une phrase ; fenêtre horaire ; une recommandation mise en avant avec ses raisons ; accès rapides | verdict et fenêtre au format `HH:MM–HH:MM` ; trois cartes de recommandation (§ 6.7.4.1) au lieu d'une ; logo BRAND en médaillon | logo à vague cyan (ce n'est pas le logo BRAND) ; bouton cyan (§ 6.2) ; jauge en dégradé (§ 6.7.5.1) |
| Carte interactive | carte plein écran ; aperçu en bas (photo, nom, Favorabilité, habitat, profondeur) ; boutons de zoom et de localisation ; filtres en puces | filtres V3 avec compteurs (Tous, Favorables, À vérifier, Mes spots) ; pastilles à 6 paliers ; puce de position | fond de carte en carte de chaleur colorée (aucune donnée ne la fonde ; elle se confondrait avec les paliers de Favorabilité) ; filtre « À explorer » (sans règle) |
| Ma stratégie | progression `Vue rapide`, `Détails`, `Expert` (gardée par § 6.5) ; technique ; paramètres clés en liste ; astuce | astuce rattachée à une source ou à une règle | illustration de leurre décorative, si elle n'apporte rien |
| Matériel et leurres | inventaire en cartes avec visuel du leurre ; « Mon matériel » | Matériel en dernier, et seulement quand l'inventaire existe (V3-017) | notes en étoiles (4,8) : aucune donnée ne les fonde (§ 6.5, gamification) ; onglet « Recommandés » dans Matériel (le conseil est dans la fiche spot, § 6.7.4) |
| Fiche spot (« Le Minou ») | photo d'en-tête ; « Pourquoi ce spot ? » en liste de raisons ; carte « À surveiller » ; meilleure fenêtre ; action principale | deux scores (Favorabilité, Confiance) empilés ; photo marquée « Illustration » si ce n'est pas le lieu réel | anneau « Pertinence » (supprimée, V3-006) ; trois anneaux en colonnes (§ 6.7.1) ; cœur de favori sans besoin observé (§ 6.7.4.1) |
| Comparaison de spots | colonnes côte à côte ; facteurs alignés | sécurité et vérification d'abord ; Favorabilité, Confiance, fenêtre, route ; écart chiffré seulement s'il est comparable (§ 6.7.5.3) | trophée « Notre conseil » : un palmarès trompeur (§ 6.6) ; barres sans unité ni explication (§ 6.7.3) |
| Journal de pêche | liste des sorties avec date, lieu, prises, photo ; `+` d'ajout toujours visible | états typés (prise, sans prise, inconnu…) ; ajout rapide | onglet « Statistiques » (il va dans Profil, § 6.4) ; smileys comme seul codage du résultat (couleur et visage seuls) |
| Mode terrain | essentiel en grand : score, statut, vent, marée, eau ; spot le plus proche ; « Voir sur la carte » | Favorabilité avec son palier et sa sécurité ; donnée « à vérifier » visible | anneau en dégradé ; « Bonnes conditions » en vert si la sécurité n'est pas vérifiée |

**Traits stylistiques retenus** :
- interface sombre de nuit marine, avec un thème clair de plein soleil ;
- photos marines en tête d'écran, avec un voile pour la lisibilité ;
- cartes aux angles arrondis (16 à 20 px), surfaces sobres ;
- titres gras et compacts ; chiffres grands et tabulaires ;
- barre de navigation à 5 entrées, icônes au trait.

**Traits rejetés** : cyan et turquoise, dégradés de jauges, effets de verre décoratifs, notes en étoiles, palmarès.

## 2. Photographies

**Inventaire** : 32 photos d'ambiance, 64 fichiers (720 et 1 600 px), 5,0 Mo, dans `assets/photos/`.
- Origine : images générées par Gemini, fournies par Félix. C'est écrit dans `data/photos/catalogue.json`.
- Elles sont toujours marquées « Illustration » à l'écran.
- 6 autres ont été écartées en V2, avec leur raison.

**Demandes de remplacement**, faites à Félix le 20 nov. 2026 (photo, diagnostic, brief, usage) :

| Photo | Diagnostic | Remplacement demandé | Statut |
| --- | --- | --- | --- |
| `lieu-noir-boudin` | même cadrage que `lieu-jaune-boudin` et `bar-boudin` : cartes d'espèces indistinctes | lieu noir de jigging sur le pont, de côté, jig accroché, 3:4 | `BLOCKED — PHOTO UTILISATEUR ATTENDUE` |
| `bar-boudin` | idem | bar tenu au-dessus de l'eau claire, leurre souple, lumière rasante, 3:4 | `BLOCKED — PHOTO UTILISATEUR ATTENDUE` |
| `silhouette-aube-rose` | presque identique à `silhouette-couchant` | platier découvert à marée basse avant l'aube, frontale rouge, 3:4 | `BLOCKED — PHOTO UTILISATEUR ATTENDUE` |
| `semi-rigide-gilets` | 4 vues en surplomb du semi-rigide, quasi identiques | jigging vertical vu de la console, sondeur à 60–80 m, 16:9 | `BLOCKED — PHOTO UTILISATEUR ATTENDUE` |

Prompts de génération détaillés, demandés par Félix le 20 nov. : `docs/design/PROMPTS-PHOTOS.md`.

**Restriction d'usage, sans remplacement** : `phare-pointe-aube`, `abbaye-crepuscule`, `phare-tempete`, `granit-crique` et `port-crepuscule` ressemblent à des lieux réels reconnaissables. Ce sont des images générées : elles ne sont jamais montrées sur la fiche d'un spot, même avec la mention « Illustration », et servent seulement aux écrans généraux (lancement, états vides, BATEAU). En V2, la règle « jamais une image reconnaissable sur un spot nommé » les écartait déjà de la plupart des fiches.

**Manques de couverture** (à demander le moment venu, dans la phase qui en aura besoin) :
- vieille et saint-pierre (cartes d'espèces BATEAU, Phase 9) ;
- approche d'un poste : sentier, descente vers l'estran, repères (fiche spot, Phase 7) ;
- jigging profond (demandé ci-dessus) ;
- photos réelles de spots, avec lieu et provenance vérifiés : aucune à ce jour.

**Matrice de couverture**

| Contexte (catalogue) | Nombre | Lumière et ciel | Point faible |
| --- | --- | --- | --- |
| BORD, pêcheur | 16 : roche, falaise, crique, plage, estuaire, port, nuit | aube, jour, couchant, nuit, pluie, tempête | deux silhouettes trop proches (demande 2) |
| Espèces (poissons) | 7 : bar, lieu jaune, lieu noir, maquereau (deux fois), dont 3 « boudin » | jour | trois cadrages identiques (demande 1) ; « poisson sur goémon » répété |
| BATEAU | 5 semi-rigides | aube, jour, brume, couvert | vues en surplomb identiques (demande 3) |
| Journal, matériel | 1 mesure du bar, 1 boîte de leurres | jour | une seule photo de matériel |
| Paysages sans pêcheur | 2 : phare dans la tempête, falaise | tempête, couvert | lieux reconnaissables : usage restreint |
