# Journal des décisions — SPUMY V3

Format ADR. Une décision « validée » vient de Félix (date et heure) ou du référentiel maître (`docs/SPUMY_MASTER_PROMPT.md`). Une décision « proposée » attend Félix et ne s'applique pas encore. Ce journal passe avant le référentiel en cas de contradiction, sauf en matière de sécurité, de protection et de préservation des données (référentiel, ordre de priorité).

## Index

| ADR | Décision | Statut |
| --- | --- | --- |
| V3-001 | La V3 suit le référentiel V4.1.13 ; le prompt V2 s'arrête | VALIDÉE (Félix, 20 nov. 2026, 0 h 58) |
| V3-002 | Logo BRAND repris, invariants ; Inshore et Offshore facultatifs ; photos transmises utilisables | VALIDÉE (Félix, 20 nov. 2026, 0 h 58) |
| V3-003 | Réserve P1-14 de la phase 1 acceptée | VALIDÉE PAR INFÉRENCE (jeton de phase 2, 20 nov., 1 h 24) |
| V3-004 | Lien Drive retiré de la copie publique du référentiel | APPLIQUÉE (mineure, réversible) |
| V3-005 | Usage : Félix et quelques proches, gratuit, non commercial | VALIDÉE (Félix, 20 nov. 2026, 1 h 30) |
| V3-006 | Deux scores : Favorabilité et Confiance ; Pertinence dépréciée | VALIDÉE (référentiel § 9.1) |
| V3-007 | Aucun secteur ; position de référence dynamique ; 60 min de route au plus en BORD | VALIDÉE (référentiel § 0.2, § 8.1) |
| V3-008 | Une seule application à deux modes, catalogue de spots unique, hébergement statique, stack conservée | PROPOSÉE |
| V3-009 | Temps de route BORD par la Géoplateforme IGN (isochrone, puis itinéraire) | PROPOSÉE |
| V3-010 | Position : « Me géolocaliser » et « Saisir une position » ; pas de localisation par l'adresse IP | PROPOSÉE |
| V3-011 | Vigilance Météo-France : comment la lire sans exposer de clé | À DÉCIDER (Félix) |
| V3-012 | Fond de carte : Plan IGN, OpenStreetMap en secours ; aucun préchargement hors ligne | PROPOSÉE |
| V3-013 | Données de l'utilisateur sur l'appareil, sans compte ; sauvegarde GitHub et export gardés | PROPOSÉE |
| V3-014 | Branche BATEAU de la phase 13 (proposition n° 15) | À DÉCIDER (Félix) |
| V3-015 | Ancienne note sur 10 | À DÉCIDER (Félix) |
| V3-016 | Place réservée dans le Top 3 | À DÉCIDER (Félix) |
| V3-017 | Navigation : Décision, Carte, Journal, Profil, Matériel ; bascule BORD / BATEAU | VALIDÉE (référentiel § 6.4) ; bascule à concevoir en Phase 3 |
| V3-018 | Identifiants de spot V2 gardés comme identifiants V3 | PROPOSÉE |
| V3-019 | Point de retour `v2-final` et nettoyage des branches fusionnées | À DÉCIDER (Félix) |
| V3-020 | Contrats typés par JSDoc et contrôle `tsc --checkJs`, sans migration TypeScript | PROPOSÉE (pour la Phase 4) |

## Décisions V2 encore en vigueur

Reprises telles quelles tant qu'aucune décision V3 ne les révise (source : `docs/historique/CONTINUITE-V2.md`, `docs/SPEC-MOTEUR-BORD-V2.md`, `docs/SPEC-MOTEUR-BATEAU.md`).

| Décision V2 | Source | Statut en V3 |
| --- | --- | --- |
| La sécurité passe en premier et ne se compense jamais ; une donnée de sécurité inconnue est « à vérifier », jamais au vert | cahier des charges V2, phase 2 | Conforme au référentiel ; gardée |
| Vent BORD : « à vérifier » dès la force 6 ou 60 km/h de rafales ; « non recommandé » dès la force 8 ou 90 km/h | Félix, 13 nov. 2026 | Gardée ; à revoir en Phase 6 (validation du moteur) |
| Espèce BORD : le bar seul | Félix, 13 nov. 2026 | Conforme au référentiel (§ 4.1) |
| Paliers de Favorabilité 75, 65, 55, 45 | phase 8 V2, 19 nov. 2026 | Gardés jusqu'à la Phase 8 V3 (calibration) |
| La Confiance ne change jamais le rang | Félix, phase 2 V2 | Conforme (§ 9.1) |
| Pertinence (trois scores) | Félix, phase 2 V2 | **Remplacée par V3-006** |
| Temps de trajet maximal 45 min, dans la Pertinence | question 3 de la phase 6 V2, sans réponse | **Remplacée par V3-007** (60 min, filtre et non score) |
| Seuils BATEAU (vent, mer, marges) : valeurs proposées « à valider » | questions 16 à 25 V2, ouvertes | Toujours à valider ; liées à V3-014 |

---

## V3-001 — La V3 suit le référentiel V4.1.13

- **Date** : 20 nov. 2026, 0 h 58. **Statut** : VALIDÉE par Félix (« On arrête la master prompt de la V2 ici. À partir de maintenant on commence la V3 avec le prompt ci-joint. »).
- **Effet** : phases numérotées 1 à 15 du référentiel ; suivi V2 archivé (`docs/historique/CONTINUITE-V2.md`) ; la proposition n° 15 (phase 13 V2) reste un brouillon jusqu'à V3-014.

## V3-002 — Logos et photos

- **Date** : 20 nov. 2026, 0 h 58. **Statut** : VALIDÉE par Félix.
- **Décision** : le logo de marque BRAND est repris. Ses invariants ne changent jamais :
    - le dessin du poisson ;
    - l'orange de l'aplat du disque, mesuré à **#C76A31** sur `assets/brand/sources/spumy.jpg`. L'aplat est uniforme (écart type d'environ 2) ; la mesure est faite sur un JPEG, et un original sans perte, s'il existe, fera foi.

  Les logos Inshore et Offshore ne sont pas obligatoires : ils peuvent servir, être adaptés ou ne pas être utilisés. Cette décision passe avant le § 19 du référentiel, qui en fait des logos obligatoires. Les photos transmises (`assets/photos/`) sont utilisables, toujours comme « Illustration ».
- **Conséquences** :
    - la variante sombre actuelle (queue du poisson recolorée, défaut D1 de la phase 1) doit être remplacée en Phase 3 ;
    - le jeton `brand` #d9772f doit être séparé en `brand-logo-orange` (#C76A31, protégé) et `accent-orange` (#F07824, palette du référentiel).

## V3-003 — Réserve de la phase 1

- **Date** : 20 nov. 2026, 1 h 24. **Statut** : VALIDÉE PAR INFÉRENCE.
- **Contexte** : le rapport de phase 1 proposait deux voies, relier un navigateur ou accepter la réserve P1-14 (site en ligne non ouvert dans un vrai navigateur). Félix a donné le jeton de la phase 2 sans relier de navigateur.
- **Effet** : P1-14 reste ouvert ; le contrôle sera fait dès qu'un navigateur sera relié, au plus tard en Phase 3 (captures AVANT).

## V3-004 — Lien Drive retiré de la copie publique

- **Statut** : APPLIQUÉE par Claude (mineure, réversible).
- **Raison** : le dépôt est public, et le lien du dossier Drive d'archivage (§ 0.2.1) n'a pas à y figurer. La copie `docs/SPUMY_MASTER_PROMPT.md` le remplace par une mention ; l'original de Félix le garde.

## V3-005 — Usage privé, gratuit, non commercial

- **Date** : 20 nov. 2026, 1 h 30. **Statut** : VALIDÉE par Félix (« Moi et quelques proches »).
- **Effets** :
    - les services gratuits sont admis : Open-Meteo, Géoplateforme IGN, tuiles OpenStreetMap ;
    - hébergement statique (GitHub Pages), sans compte ni serveur à soi ;
    - obligations RGPD réduites, mais protection des données gardée (référentiel § 11).
- **Réversibilité** : un passage au public ou au commercial rouvrira V3-008, V3-009, V3-012 et `docs/DATA_SOURCES.md` (licences commerciales). Les adaptateurs de V3-008 limitent le travail.

## V3-006 — Deux scores ; Pertinence dépréciée

- **Statut** : VALIDÉE (référentiel § 9.1, § 6.7).
- **Décision** :
    - Favorabilité et Confiance seulement. La Pertinence n'est plus calculée, affichée, stockée comme score, ni utilisée pour filtrer ou classer, en BORD comme en BATEAU (branche de la phase 13 comprise).
    - Le réglage « boîte complète » disparaît. La boîte de l'utilisateur ne sert qu'à la sélection personnelle de leurres, dans la fiche spot.
    - Les champs V2 (`v2.pert`, `V2.pert`, `bar:boite-complete`, `bar:trajet-max`) sont gardés pour la migration seulement, et marqués dépréciés.
- **Vérification** : tests d'invariance du rang (§ 13.2). Remplir la boîte ne change ni la Favorabilité, ni la Confiance, ni la sécurité, ni le rang.

## V3-007 — Aucun secteur ; position dynamique ; 60 min en BORD

- **Statut** : VALIDÉE (référentiel § 0.2, règle 13, et § 8.1).
- **Décision** :
    - plus de départements, de guides ni de zones comme entrée, filtre ou classement ;
    - une position de référence (appareil ou saisie) ;
    - en BORD, seuls les spots à 60 min de route réelle ou moins, depuis cette position, jusqu'à l'accès du spot.

  Les données des guides (zones, ports, `distMin`, `isLocal`, `region`, `dept`) restent des données de contexte ou de provenance.
- **Conséquences** : V3-008, V3-009, V3-010 ; migration des liens `<guide>.html#…` (`docs/MIGRATION-V3.md`).

## V3-008 — Une application, deux modes, un catalogue

- **Statut** : PROPOSÉE.
- **Problème** : la V2 publie sept pages (une par guide), chacune avec ses spots, sa météo et son classement. La V3 exige un classement depuis n'importe quelle position, sur tous les spots.
- **Options** :

| Option | Pour | Contre |
| --- | --- | --- |
| A. Garder les 7 pages et ajouter une couche de position | peu de changements | les secteurs restent ; un classement multi-guides impose de charger 7 pages de données |
| **B. Une seule page, deux modes, catalogue unique de spots ; mêmes outils (React 18, esbuild, Leaflet), hébergement statique** | supprime les secteurs à la racine ; réutilise les moteurs testés ; aucun coût | refonte du point d'entrée et de la navigation ; migration des liens |
| C. Changer de cadre (Next.js, Vite, TypeScript complet) | outils récents | coût élevé sans bénéfice démontré ; risque de régression sur 849 parcours testés |

- **Recommandation** : B. Le catalogue peut être découpé en interne (fichiers par tuile géographique, par exemple), pour ne charger que les spots proches. Ce découpage reste technique et invisible pour l'utilisateur, ce que le § 8.1 autorise.
- **Impacts** :
    - les moteurs `src/bord/engine` (v2) et `src/bateau` restent ;
    - `SITE_CONFIG` (une fiche par guide) devient un catalogue ;
    - la marée passe d'un port par guide à un catalogue de ports ;
    - les fournisseurs passent par des adaptateurs (`docs/ARCHITECTURE-V3.md`).
- **Sécurité** : surface inchangée (site statique, CSP stricte), plus les hôtes de la Géoplateforme.
- **Coûts** : 0 €. **Réversibilité** : moyenne ; anciennes pages redirigées pendant la migration.
- **Critères de vérification** :
    - classement identique à la V2 pour une position au pôle d'un guide (hors filtre des 60 min et hors Pertinence) ;
    - temps de chargement mesuré, sans régression (Phase 4).

## V3-009 — Temps de route BORD

- **Statut** : PROPOSÉE.
- **Options** :

| Option | Pour | Contre |
| --- | --- | --- |
| **A. Géoplateforme IGN : un isochrone voiture de 60 min par position, puis l'itinéraire exact pour les spots montrés** | sans clé, gratuit, réseau BD TOPO, 5 requêtes par seconde (VÉRIFIÉ, fiches data.gouv.fr) | CORS non vérifié (INCONNU) ; France seulement |
| B. OpenRouteService | matrice de temps en un appel | clé obligatoire, impossible à cacher dans un site statique public (INFÉRÉ, non revérifié) |
| C. Serveur de démonstration OSRM | sans clé | usage intensif interdit, sans garantie (INFÉRÉ, non revérifié) |
| D. Estimation par la distance à vol d'oiseau | hors ligne | ce n'est pas un temps réel : interdit comme filtre vérifié (§ 8.1) |

- **Recommandation** : A, avec D comme estimation dégradée clairement marquée (hors ligne ou service en échec). Si CORS bloque en Phase 4, un relais gratuit (Cloudflare Worker) sans clé ni donnée stockée.
- **Données gardées** : fournisseur, origine (arrondie à 100 m dans le cache), spot, durée, heure, validité (24 h).
- **Critères de vérification** :
    - un spot à 59 min est gardé et un spot à 61 min est écarté ;
    - le libellé « estimation » s'affiche hors ligne ;
    - aucune position précise n'est conservée au-delà du cache.

## V3-010 — Méthodes de position

- **Statut** : PROPOSÉE.
- **Décision** : deux actions, « Me géolocaliser » (sur demande, avec la permission du système) et « Saisir une position » (recherche avec suggestions, puis épingle déplaçable). Pas de localisation par l'adresse IP : elle enverrait l'adresse IP à un tiers pour une précision à la ville, ce qui est inutile pour un petit groupe. Le § 8.1 la rend facultative (« uniquement si … réellement disponibles »).
- **Contrat de position** : `{lat, lon, precisionM, source: DEVICE|MANUAL, at, validUntil, permission, explicit}`. Aucun historique des positions.

## V3-011 — Vigilance Météo-France

- **Statut** : À DÉCIDER par Félix.
- **Contexte** : la V2 ne lit pas la vigilance (défaut D10). L'API officielle exige un compte et une clé (VÉRIFIÉ). Or une clé ne peut pas être publiée dans un dépôt public.

| Option | Pour | Contre |
| --- | --- | --- |
| A. Chaque utilisateur saisit sa propre clé, gardée sur l'appareil (comme la clé Anthropic) | aucun serveur | chaque proche doit créer un compte Météo-France |
| B. Un petit relais gratuit (Cloudflare Worker) qui garde la clé de Félix et ne renvoie que la vigilance | transparent pour tous | un service à maintenir ; compte Cloudflare |
| C. Ne pas la lire : rappel et lien vers vigilance.meteofrance.fr (comportement V2) | rien à faire | la sécurité dépend du réflexe de l'utilisateur |

- **Recommandation** : B si Félix accepte un relais, sinon C en attendant. Dans tous les cas, une vigilance inconnue ne vaut jamais « pas de vigilance ».

## V3-012 — Fond de carte

- **Statut** : PROPOSÉE (aspect visuel validé en Phase 3).
- **Décision** :
    - Plan IGN (WMTS de la Géoplateforme) en fond principal : sans clé, détaillé sur le littoral français ;
    - photos aériennes IGN en option, utiles pour lire l'estran ;
    - OpenStreetMap en secours ;
    - aucun préchargement de tuiles pour le hors ligne : OpenStreetMap l'interdit (VÉRIFIÉ), et c'est à vérifier pour l'IGN. Hors ligne, la carte dit qu'elle a besoin du réseau.

## V3-013 — Données de l'utilisateur sur l'appareil

- **Statut** : PROPOSÉE.
- **Décision** :
    - le journal, les spots personnels, le profil et les préférences restent sur l'appareil (`localStorage`, IndexedDB), avec un schéma versionné et des migrations testées ;
    - pas de compte ;
    - la sauvegarde GitHub (facultative, jeton de l'utilisateur) et le transfert par fichier sont gardés.

  Les états hors ligne et de synchronisation sont ceux du § 8.5.
- **Raison** : V3-005. Un compte serait un serveur et des données personnelles à protéger, sans besoin pour un petit groupe.

## V3-014 — Branche BATEAU de la phase 13

- **Statut** : À DÉCIDER par Félix.
- **Contenu de la branche** : profil du bateau, « Sortir aujourd'hui ? », règles de sécurité SEC_* sur le pire moment du créneau, espèces avec réglementation, trois scores (dont une Pertinence), seuils de vent et de mer « à valider ». Tests verts ; rien n'est en ligne.
- **Options** :
    - (a) la garder en brouillon et la reprendre en V3 : retirer la Pertinence, faire valider les seuils, l'intégrer au mode BATEAU de la nouvelle navigation ;
    - (b) la fermer et repartir de la spécification BATEAU ;
    - (c) la fusionner telle quelle.
- **Recommandation** : (a). (c) est exclue : elle publierait une Pertinence supprimée par V3-006 et des seuils de sécurité non validés.

## V3-015 — Ancienne note sur 10

- **Statut** : À DÉCIDER par Félix.
- **Constat** : en BORD, la note v1 sur 10 est encore un réglage. En BATEAU, la seule note en ligne est sur 10 (modèle appris sur les sorties).
- **Recommandation** : supprimer l'option v1 en BORD. En BATEAU, présenter le modèle appris comme une information personnelle (« d'après tes sorties »), pas comme une note concurrente de la Favorabilité.

## V3-016 — Place réservée dans le Top 3

- **Statut** : À DÉCIDER par Félix.
- **Constat** : la V2 réserve une place à un spot de la zone « local » du guide (un secteur). Le référentiel (§ 9.1.7) garde une place pour un spot à 15 min ou moins de la position, « si elle est toujours validée ». Cette place ne donne aucun bonus de Favorabilité.
- **Options** : (a) place réservée à un spot admissible à 15 min ou moins de ta position ; (b) aucune place réservée.
- **Élément connu** : pour le guide du Cotentin, Félix voulait toujours au moins un spot proche (25 min ou moins) dans le Top 3. La V3 demande de confirmer cette règle sous sa forme nouvelle : depuis ta position, et non plus depuis la zone d'un guide.

## V3-017 — Navigation

- **Statut** : VALIDÉE (référentiel § 6.4).
- **Décision** :
    - cinq entrées : Décision, Carte, Journal, Profil, Matériel ;
    - Matériel n'est affiché que lorsque son contenu existe ;
    - le Profil remplace toute page de statistiques ;
    - la bascule BORD / BATEAU est commune, et ses règles restent séparées.

  La V2 a déjà Décision, Carte, Journal et Matériel. « Plus » (marée, météo, saison, règles, photos) sera redistribué en Phase 3.

## V3-018 — Identifiants de spot

- **Statut** : PROPOSÉE.
- **Constat** : les 66 identifiants V2 sont uniques dans tout le catalogue (VÉRIFIÉ, par exemple `goury`, `moulinmer`). Le journal, les favoris et les spots personnels s'y réfèrent.
- **Décision** : les garder tels quels comme identifiants V3, et ajouter un champ de provenance `legacy: {guide}`. Un nouveau spot reçoit un identifiant qui n'entre jamais en collision.

## V3-019 — Point de retour et nettoyage des branches

- **Statut** : À DÉCIDER par Félix.
- **Proposition** :
    - étiquette `v2-final` sur `main` à bb4f940, la version publiée ;
    - puis suppression des 14 branches distantes déjà fusionnées.

  Leurs commits restent dans `main`, et chaque branche peut être recréée depuis son SHA (liste dans le rapport de phase 1, section 6). `claude/phase-13-bateau` est gardée (V3-014).

## V3-020 — Contrats typés

- **Statut** : PROPOSÉE, pour la Phase 4.
- **Décision** : contrats typés (position, spot, scores, sécurité, journal) en JSDoc, vérifiés par `tsc --checkJs` dans l'intégration continue, sans réécrire le code en TypeScript. Le § 10.2 demande des « types stricts selon la stack » ; c'est le moyen le moins coûteux pour une base JavaScript testée.
