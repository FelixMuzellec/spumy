# Journal des décisions — SPUMY V3

Format ADR. Le registre des exigences (`docs/REQUIREMENTS.md`) et la vision (`docs/VISION-V3.md`) sont validés par le même jeton (20 nov. 2026, 4 h 25). Une décision « validée » vient de Félix (date et heure) ou du référentiel maître (`docs/SPUMY_MASTER_PROMPT.md`). Une décision « proposée » attend Félix et ne s'applique pas encore. Ce journal passe avant le référentiel en cas de contradiction, sauf en matière de sécurité, de protection et de préservation des données (référentiel, ordre de priorité).

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
| V3-008 | Une seule application à deux modes, catalogue de spots unique, hébergement statique, stack conservée | VALIDÉE (jeton de phase 3, 20 nov. 2026, 4 h 25) |
| V3-009 | Temps de route BORD par la Géoplateforme IGN (isochrone, puis itinéraire) | VALIDÉE (jeton de phase 3, 20 nov. 2026, 4 h 25) |
| V3-010 | Position : « Me géolocaliser » et « Saisir une position » ; pas de localisation par l'adresse IP | VALIDÉE (jeton de phase 3, 20 nov. 2026, 4 h 25) |
| V3-011 | Vigilance Météo-France lue par un petit relais gratuit qui garde la clé | VALIDÉE (Félix, 20 nov. 2026, 4 h 18) |
| V3-012 | Fond de carte : Plan IGN, OpenStreetMap en secours ; aucun préchargement hors ligne | VALIDÉE (jeton de phase 3, 20 nov. 2026, 4 h 25) |
| V3-013 | Données de l'utilisateur sur l'appareil, sans compte ; sauvegarde GitHub et export gardés | VALIDÉE (jeton de phase 3, 20 nov. 2026, 4 h 25) |
| V3-014 | Branche BATEAU de la phase 13 reprise en V3 (Pertinence retirée, seuils à valider) | VALIDÉE (Félix, 20 nov. 2026, 4 h 18) |
| V3-015 | Ancienne note sur 10 retirée ; modèle BATEAU présenté « d'après tes sorties » | VALIDÉE (Félix, 20 nov. 2026, 4 h 18) |
| V3-016 | Une place du Top 3 réservée à un spot admissible à 15 min ou moins de ta position | VALIDÉE (Félix, 20 nov. 2026, 4 h 18) |
| V3-017 | Navigation : Décision, Carte, Journal, Profil, Matériel ; bascule BORD / BATEAU | VALIDÉE (référentiel § 6.4) ; **remplacée en partie par V3-023** (jalon 1) |
| V3-018 | Identifiants de spot V2 gardés comme identifiants V3 | VALIDÉE (jeton de phase 3, 20 nov. 2026, 4 h 25) |
| V3-019 | Point de retour `v2-final` ; branches gardées | VALIDÉE (Félix, 23 nov. 2026, 19 h 07) ; **exécutée** : étiquette `v2-final` sur bb4f940, publiée par Félix le 23 nov. à 20 h 00 (Release « v2-final — V2 publiée (10.0) ») |
| V3-020 | Contrats typés par JSDoc et contrôle `tsc --checkJs`, sans migration TypeScript | VALIDÉE (jeton de phase 3, 20 nov. 2026, 4 h 25) ; appliquée en Phase 4 |
| V3-021 | Seuil du filtre « Favorables » : **75** (début de « Très bon ») | VALIDÉE (Félix, 20 nov. 2026, question 9) |
| V3-022 | Design System V3 : jetons dans `src/design/v3/tokens.js`, CSS généré, repère de valeur des jauges ; pastilles revues par V3-025 | VALIDÉE AVEC RÉSERVES (jalon 2, Félix, 20 nov. 2026, 15 h 40 ; voir V3-027) |
| V3-023 | Jalon 1 : Home (ex-Décision), onglet Météo, barre de 4 onglets modifiable, glissement entre onglets, position automatique ou manuelle, horaires mis en avant, courbe de marée dans la fiche, vent dans la comparaison, bateau enregistré ou saisi | VALIDÉE (Félix, 20 nov. 2026, 13 h 46) |
| V3-024 | Carte marine (épaves, hauts-fonds) en couche BATEAU | BONUS À ÉTUDIER (Félix : « pas obligatoire aujourd'hui ») |
| V3-025 | Refonte visuelle après le jalon 2 : photos en grand, cartes à photo, disque de score, pastilles-étiquettes avec score, nuit marine par défaut, barre déplaçable à la souris | VALIDÉE AVEC RÉSERVES (jalon 2, Félix, 20 nov. 2026, 15 h 40 ; voir V3-027) |
| V3-026 | Pas de vraies photos de spots : photos d'illustration seulement, marquées « Illustration » | VALIDÉE (Félix, 20 nov. 2026, 15 h 02 : « trop lourd pour l'application ») |
| V3-027 | Jalon 2 : direction visuelle, principes du Design System et prototype version 5.2 ; 6 réserves suivies | VALIDÉE AVEC RÉSERVES (Félix, 20 nov. 2026, 15 h 40) |
| V3-028 | Prototype version 6 d'après les maquettes de Félix : Home, Carte vue pêche, Météo vue conditions ; slogan autorisé ; Shore / Offshore ; finition et qualité d'information « top tier » ; pas de retour sur ce qui est validé | VALIDÉE (Félix, 23 nov. 2026, 5 h 58 à 6 h 22) ; réalisation au feu vert |
| V3-029 | Finalité des onglets : Carte = typologie du terrain et ses effets sur la pêche du bar ; Météo = chaque élément météo et son effet, expliqués scientifiquement ; toujours du général au spécifique | VALIDÉE (Félix, 23 nov. 2026, 6 h 59 et 7 h 03) |
| V3-030 | Juger les notes de SPUMY sur le journal de sorties et faire s'affiner le modèle, par la boucle contrôlée du référentiel | VALIDÉE (Félix, 23 nov. 2026, 8 h 11) |
| — | Jeton « APPROVED — PROCEED TO PHASE 4 » (23 nov. 2026, 13 h 50) : phase 3 VALIDATED, version 6.2 du prototype comprise (accord lu dans la demande du jeton, INFÉRÉ) ; critères de recette CR-01 à CR-16 du prototype pris comme critères de l'intégration (phases 10 à 12) | VALIDÉE |
| — | Réponses de Félix au rapport de phase 4 (23 nov. 2026, 14 h 54) : protection de `main` « oui » (pose toujours refusée par le relais de la session, HTTP 403, à faire par Félix) ; étalonnage IGN reporté « si c'est la meilleure option » (oui : il exige les points d'accès audités en phase 5 et l'adaptateur IGN ; le test CORS et joignabilité de l'IGN, promis en phase 4 par le rapport de phase 2, n'est pas reporté) ; ESLint et épinglage des actions maintenant « si c'est la meilleure solution technique » (oui : ESLint 10, la 9 étant en fin de vie depuis le 6 août 2026) ; fusions des phases 2 à 4 attendues jusqu'à l'intégration de la V3 « oui » | VALIDÉE |
| — | Réponses de Félix du 23 nov. 2026 (19 h 07, « Oui » aux recommandations) : V3-019 (étiquette `v2-final`, branches gardées) ; **D-11 : 48 px** au moins par zone invisible, appliqué à l'intégration (le prototype 6.2 reste à 44 px) ; **D-15 : export aux deux endroits**, même action (Journal ; Profil, Mes données), T6 pour confirmer ; **Dependabot** pour les actions GitHub seulement (mensuel, groupé, attente de 7 jours), actif à la fusion dans `main` ; **IGN** : politique de résilience chiffrée, validation des réponses, étalonnage mesuré avec marge autour de 60 min, contrat enrichi (V3-009 complétée, non modifiée) | VALIDÉE |
| — | Jeton « APPROVED — PROCEED TO PHASE 5 » (23 nov. 2026, 20 h 02) : phase 4 VALIDATED (protection de `main` corrigée par Félix à 19 h 47 ; étiquette `v2-final` publiée par Félix à 20 h 00) | VALIDÉE |
| — | Réponses de Félix au rapport de phase 5 (23 nov. 2026, 22 h 25) : (1) adresses des pages citées par la V2 « je ne les connais pas » ; (2) retrait du texte privé des fiches publiques « Très bien » ; (3) aucun spot public connu dans les quatre zones vides ; (4) postes de Pirou, Gouville, Surtainville « pas vraiment » | (2) EXÉCUTÉE : 40 fiches nettoyées (sessions, matériel personnel, tournures « ton journal », « ta boîte »), texte intégral gardé dans la sauvegarde V2, test ajouté ; (1), (3), (4) : rien à changer, anomalies maintenues |

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

- **Statut** : VALIDÉE par le jeton de la phase 3 (20 nov. 2026, 4 h 25), qui validait les propositions listées dans le rapport de phase 2 (§ 12).
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

- **Statut** : VALIDÉE par le jeton de la phase 3 (20 nov. 2026, 4 h 25), qui validait les propositions listées dans le rapport de phase 2 (§ 12).
- **Options** :

| Option | Pour | Contre |
| --- | --- | --- |
| **A. Géoplateforme IGN : un isochrone voiture de 60 min par position, puis l'itinéraire exact pour les spots montrés** | sans clé, gratuit, réseau BD TOPO, 5 requêtes par seconde (VÉRIFIÉ, fiches data.gouv.fr) | CORS non vérifié (INCONNU) ; France seulement |
| B. OpenRouteService | matrice de temps en un appel | clé obligatoire, impossible à cacher dans un site statique public (INFÉRÉ, non revérifié) |
| C. Serveur de démonstration OSRM | sans clé | usage intensif interdit, sans garantie (INFÉRÉ, non revérifié) |
| D. Estimation par la distance à vol d'oiseau | hors ligne | ce n'est pas un temps réel : interdit comme filtre vérifié (§ 8.1) |

- **Recommandation** : A, avec D comme estimation dégradée clairement marquée (hors ligne ou service en échec). Si CORS bloque en Phase 4, un relais gratuit (Cloudflare Worker) sans clé ni donnée stockée.
- **Vérification du 23 nov. 2026 (phase 4, 4.14)** : CORS ouvert (`Access-Control-Allow-Origin: *`) sur le géocodage, l'itinéraire et l'isochrone ; appels réussis dans Chromium depuis l'origine `https://felixmuzellec.github.io` (contrat IGN, passage 45210735483 du contrat IGN, 23 nov. 2026). **Le relais n'est pas nécessaire** ; l'option A tient telle quelle. Le contrat IGN le revérifie chaque jour.
- **Étalonnage** : reporté après la phase 5, avec l'adaptateur IGN (décision de Félix, 23 nov. 2026, 14 h 54).
- **Données gardées** : fournisseur, origine (arrondie à 100 m dans le cache), spot, durée, heure, validité (24 h).
- **Critères de vérification** :
    - un spot à 59 min est gardé et un spot à 61 min est écarté ;
    - le libellé « estimation » s'affiche hors ligne ;
    - aucune position précise n'est conservée au-delà du cache.

## V3-010 — Méthodes de position

- **Statut** : VALIDÉE par le jeton de la phase 3 (20 nov. 2026, 4 h 25), qui validait les propositions listées dans le rapport de phase 2 (§ 12).
- **Décision** : deux actions, « Me géolocaliser » (sur demande, avec la permission du système) et « Saisir une position » (recherche avec suggestions, puis épingle déplaçable). Pas de localisation par l'adresse IP : elle enverrait l'adresse IP à un tiers pour une précision à la ville, ce qui est inutile pour un petit groupe. Le § 8.1 la rend facultative (« uniquement si … réellement disponibles »).
- **Contrat de position** : `{lat, lon, precisionM, source: DEVICE|MANUAL, at, validUntil, permission, explicit}`. Aucun historique des positions.

## V3-011 — Vigilance Météo-France

- **Statut** : VALIDÉE par Félix le 20 nov. 2026 à 4 h 18 : option B, un petit relais gratuit.
- **Contexte** : la V2 ne lit pas la vigilance (défaut D10). L'API officielle exige un compte et une clé (VÉRIFIÉ). Or une clé ne peut pas être publiée dans un dépôt public.

| Option | Pour | Contre |
| --- | --- | --- |
| A. Chaque utilisateur saisit sa propre clé, gardée sur l'appareil (comme la clé Anthropic) | aucun serveur | chaque proche doit créer un compte Météo-France |
| B. Un petit relais gratuit (Cloudflare Worker) qui garde la clé de Félix et ne renvoie que la vigilance | transparent pour tous | un service à maintenir ; compte Cloudflare |
| C. Ne pas la lire : rappel et lien vers vigilance.meteofrance.fr (comportement V2) | rien à faire | la sécurité dépend du réflexe de l'utilisateur |

- **Décision** : B.
- **Ce que fait le relais** :
    - il garde la clé de Félix hors du dépôt, comme secret du service ;
    - il ne renvoie que la vigilance du département demandé ;
    - il ne stocke rien et ne journalise aucune position ;
    - il n'accepte que l'origine du site.
- **À fournir par Félix, au moment de la phase qui l'implante (Phase 9 ou 10)** : un compte Météo-France (portail API) et un compte Cloudflare. Claude préparera le code et la marche à suivre ; Félix saisira lui-même la clé.
- **En attendant**, et en cas de panne, comportement C (rappel et lien). Une vigilance inconnue ne vaut jamais « pas de vigilance ».

## V3-012 — Fond de carte

- **Statut** : VALIDÉE par le jeton de la phase 3 (20 nov. 2026, 4 h 25), qui validait les propositions listées dans le rapport de phase 2 (§ 12).
- **Décision** :
    - Plan IGN (WMTS de la Géoplateforme) en fond principal : sans clé, détaillé sur le littoral français ;
    - photos aériennes IGN en option, utiles pour lire l'estran ;
    - OpenStreetMap en secours ;
    - aucun préchargement de tuiles pour le hors ligne : OpenStreetMap l'interdit (VÉRIFIÉ), et c'est à vérifier pour l'IGN. Hors ligne, la carte dit qu'elle a besoin du réseau.

## V3-013 — Données de l'utilisateur sur l'appareil

- **Statut** : VALIDÉE par le jeton de la phase 3 (20 nov. 2026, 4 h 25), qui validait les propositions listées dans le rapport de phase 2 (§ 12).
- **Décision** :
    - le journal, les spots personnels, le profil et les préférences restent sur l'appareil (`localStorage`, IndexedDB), avec un schéma versionné et des migrations testées ;
    - pas de compte ;
    - la sauvegarde GitHub (facultative, jeton de l'utilisateur) et le transfert par fichier sont gardés.

  Les états hors ligne et de synchronisation sont ceux du § 8.5.
- **Raison** : V3-005. Un compte serait un serveur et des données personnelles à protéger, sans besoin pour un petit groupe.

## V3-014 — Branche BATEAU de la phase 13

- **Statut** : VALIDÉE par Félix le 20 nov. 2026 à 4 h 18 : option (a).
- **Contenu de la branche** : profil du bateau, « Sortir aujourd'hui ? », règles de sécurité SEC_* sur le pire moment du créneau, espèces avec réglementation, trois scores (dont une Pertinence), seuils de vent et de mer « à valider ». Tests verts ; rien n'est en ligne.
- **Options** :
    - (a) la garder en brouillon et la reprendre en V3 : retirer la Pertinence, faire valider les seuils, l'intégrer au mode BATEAU de la nouvelle navigation ;
    - (b) la fermer et repartir de la spécification BATEAU ;
    - (c) la fusionner telle quelle.
- **Décision** : (a). La proposition n° 15 reste en brouillon, sans fusion. Son contenu est repris dans le mode BATEAU de la V3 (Phases 9 et 10) :
    - Pertinence retirée ;
    - seuils de vent et de mer (questions 16 à 25) validés par Félix avant toute mise en ligne ;
    - intégration dans la nouvelle navigation.

## V3-015 — Ancienne note sur 10

- **Statut** : VALIDÉE par Félix le 20 nov. 2026 à 4 h 18.
- **Constat** : en BORD, la note v1 sur 10 est encore un réglage. En BATEAU, la seule note en ligne est sur 10 (modèle appris sur les sorties).
- **Décision** : l'option v1 disparaît en BORD ; la clé `bar:moteur` est ignorée après migration. En BATEAU, le modèle appris devient une information personnelle (« d'après tes sorties »), jamais une note concurrente de la Favorabilité. Le code v1 qui sert encore aux fenêtres et aux créneaux (`model.js`) reste, sans note affichée.

## V3-016 — Place réservée dans le Top 3

- **Statut** : VALIDÉE par Félix le 20 nov. 2026 à 4 h 18 : option (a), 15 min ou moins.
- **Constat** : la V2 réserve une place à un spot de la zone « local » du guide (un secteur). Le référentiel (§ 9.1.7) garde une place pour un spot à 15 min ou moins de la position, « si elle est toujours validée ». Cette place ne donne aucun bonus de Favorabilité.
- **Options** : (a) place réservée à un spot admissible à 15 min ou moins de ta position ; (b) aucune place réservée.
- **Élément connu** : pour le guide du Cotentin, Félix voulait toujours au moins un spot proche (25 min ou moins) dans le Top 3. Félix a choisi 15 min (et non 25) sous la forme V3 : depuis ta position, et non plus depuis la zone d'un guide.
- **Règle** :
    - si aucun spot à 15 min ou moins de route vérifiée n'est dans les trois premiers, le meilleur spot admissible à 15 min ou moins prend la 3ᵉ place, sans bonus de Favorabilité, avec la mention « le plus proche » ;
    - s'il n'y en a aucun d'admissible, rien n'est réservé ;
    - la place ne va jamais à un spot « à vérifier » ou bloqué.

## V3-017 — Navigation

- **Statut** : VALIDÉE (référentiel § 6.4).
- **Décision** :
    - cinq entrées : Décision, Carte, Journal, Profil, Matériel ;
    - Matériel n'est affiché que lorsque son contenu existe ;
    - le Profil remplace toute page de statistiques ;
    - la bascule BORD / BATEAU est commune, et ses règles restent séparées.

  La V2 a déjà Décision, Carte, Journal et Matériel. « Plus » (marée, météo, saison, règles, photos) sera redistribué en Phase 3.
- **Remplacée en partie** par V3-023 (jalon 1, 20 nov. 2026) : Home au lieu de Décision, onglet Météo, barre de 4 onglets modifiable. Restent en vigueur : Matériel affiché seulement quand son contenu existe ; le Profil remplace toute page de statistiques ; bascule commune, règles séparées.

## V3-018 — Identifiants de spot

- **Statut** : VALIDÉE par le jeton de la phase 3 (20 nov. 2026, 4 h 25), qui validait les propositions listées dans le rapport de phase 2 (§ 12).
- **Constat** : les 66 identifiants V2 sont uniques dans tout le catalogue (VÉRIFIÉ, par exemple `goury`, `moulinmer`). Le journal, les favoris et les spots personnels s'y réfèrent.
- **Décision** : les garder tels quels comme identifiants V3, et ajouter un champ de provenance `legacy: {guide}`. Un nouveau spot reçoit un identifiant qui n'entre jamais en collision.

## V3-019 — Point de retour et nettoyage des branches

- **Statut** : VALIDÉE par Félix le 23 nov. 2026 (19 h 07), sur la recommandation : **étiquette `v2-final` sur bb4f940** (la version publiée, OPS-02) ; **les branches sont gardées**. Les supprimer n'apporte rien dans un dépôt à une personne, et `CLAUDE.md` exclut tout nettoyage destructif.
- **Exécution** : **faite le 23 nov. 2026 à 20 h 00 par Félix**, depuis GitHub (Release « v2-final — V2 publiée (10.0) », cible `main`). Vérifiée par la session : `refs/tags/v2-final` → bb4f940. La session avait préparé l'étiquette, mais son envoi était refusé par le relais (HTTP 403, non contourné). Félix l'envoie (`git push origin v2-final` depuis une copie qui l'a, ou `git tag -a v2-final bb4f940 -m "v2-final" && git push origin v2-final`) ou la crée depuis GitHub (Releases → Draft a new release → tag `v2-final`, cible `main`).
- **Proposition d'origine** (pour mémoire) :
- **Proposition** :
    - étiquette `v2-final` sur `main` à bb4f940, la version publiée ;
    - puis suppression des 14 branches distantes déjà fusionnées.

  Leurs commits restent dans `main`, et chaque branche peut être recréée depuis son SHA (liste dans le rapport de phase 1, section 6). `claude/phase-13-bateau` est gardée (V3-014).

## V3-020 — Contrats typés

- **Statut** : VALIDÉE par le jeton de la phase 3 (20 nov. 2026, 4 h 25), qui validait les propositions listées dans le rapport de phase 2 (§ 12).
- **Décision** : contrats typés (position, spot, scores, sécurité, journal) en JSDoc, vérifiés par `tsc --checkJs` dans l'intégration continue, sans réécrire le code en TypeScript. Le § 10.2 demande des « types stricts selon la stack » ; c'est le moyen le moins coûteux pour une base JavaScript testée.

## V3-021 — Seuil du filtre « Favorables »

- **Statut** : VALIDÉE par Félix le 20 nov. 2026 (question 9) : **75**, option (C), contre la recommandation (A).
- **Contexte** : en V2, « favorable » commence à 65 (`src/core/scale.js`). Les six paliers du référentiel (§ 6.7.5.1) placent 65 au milieu du jaune (60–74) : deux pastilles de même couleur pourraient être l'une favorable, l'autre non.
- **Options** : (A) 60, début de « Bon », cohérent avec la couleur ; (B) 65, continuité avec la V2 ; (C) 75, début de « Très bon », plus strict. Dans tous les cas, le filtre exige aussi la sécurité et l'absence de statut « À vérifier » (§ 6.7.4).
- **Recommandation** : (A), révisable à la recalibration du moteur (Phase 8).
- **Décision** : un spot est « favorable » si sa Favorabilité affichée est de 75 ou plus (vert et bleu), si sa sécurité le permet et s'il n'est pas « à vérifier ». Le seuil V2 de 65 (`src/core/scale.js`) reste en vigueur dans l'application en ligne jusqu'à l'intégration ; la recalibration (Phase 8) pourra le revoir avec Félix.

## V3-022 — Design System V3

- **Statut** : VALIDÉE AVEC RÉSERVES au jalon 2 (Félix, 20 nov. 2026, 15 h 40 ; V3-027). Les pastilles à anneau double et à « ? » ont été remplacées par les pastilles-étiquettes de V3-025.
- **Décision** :
    - jetons dans une source unique typée (`src/design/v3/tokens.js`), CSS généré (`scripts/tokens-v3.mjs`), contrôle `tests/design-v3.mjs` ;
    - thèmes clair et sombre ;
    - orange d'accent en remplissage avec texte marine, jamais en texte sur fond clair ;
    - repère de valeur sur les jauges, anneau double sur les pastilles, « ? » des pastilles à vérifier dans une pastille marine.
- **Raisons** : les six teintes imposées ne peuvent pas toutes contraster avec une même piste ou un même fond (jaune sur piste claire 1,0:1). Le repère, l'anneau et le texte rendent la lecture indépendante de ce contraste, sans découper le remplissage.
- **Détails** : `docs/design/DESIGN-SYSTEM-V3.md`.

## V3-023 — Jalon 1 de la phase 3 : architecture et parcours

- **Statut** : VALIDÉE par Félix (20 nov. 2026, 13 h 46), en réponse aux wireframes du jalon 1. Elle remplace en partie V3-017.
- **Décisions** :
    - « Décision » s'appelle **Home** ;
    - un **onglet Météo** : carte de la force et de la direction du vent, heure par heure ; « par zone » est rendu par une grille de points de prévision, sans découpage géographique ;
    - **4 onglets visibles** dans la barre, ordre par défaut **Home, Carte, Météo, Profil**, puis Journal ; Météo plutôt que Journal ;
    - **l'ordre des onglets** se change dans Profil, comme la photo de fond de Home (précision du 20 nov., 14 h 02) ;
    - on change d'onglet en le **touchant** ; on **fait glisser la barre** pour faire apparaître d'autres onglets (précision du 20 nov., 14 h 02) ;
    - **position** par la puce en haut à droite, automatique (demande du téléphone) ou manuelle ; aucune grande action au centre de Home ;
    - au centre de Home, une **phrase** qui résume la pêche probable ;
    - dans la feuille de position, le champ montre le lieu actuel ; les propositions n'apparaissent que pendant la frappe ;
    - **horaires** des sessions bien visibles ;
    - fiche spot : **courbe de marée** avec les heures favorables coloriées, au lieu du bloc « fenêtre du jour » ; indicateurs du jour ;
    - comparaison : **force du vent** ;
    - BATEAU : **bateau enregistré** dans Profil, ou champs remplis pour la sortie.
- **Conséquences** : `docs/design/UX-V3.md` (version 2), wireframes (version 2), exigences MET-01 à MET-04, UX-05, UX-08, UX-09, PRO-03, SPOT-09, BAT-09.

## V3-024 — Carte marine en BATEAU

- **Statut** : BONUS À ÉTUDIER. Félix : « Ça ne serait qu'un bonus. Pas obligatoire aujourd'hui. »
- **Idée** : une couche montrant épaves, hauts-fonds et balisage sur la Carte BATEAU.
- **Avant toute promesse** :
    - vérifier les sources possibles (cartes du SHOM, OpenSeaMap, bathymétrie EMODnet), leurs licences et leurs conditions d'usage : rien n'est VÉRIFIÉ à ce jour ;
    - la couche ne remplace jamais une carte marine officielle à jour, et l'application doit le dire.
- **Exigence** : BAT-10 (expérimentale).

## V3-025 — Refonte visuelle après le jalon 2

- **Statut** : VALIDÉE AVEC RÉSERVES au jalon 2 (Félix, 20 nov. 2026, 15 h 40 ; V3-027), après les versions 3 à 5.2 du prototype. Origine : retour de Félix du 20 nov. 2026, 14 h 26 (jalon 2 non validé). Retour : « loin d'un graphisme top tier », pas assez de photos, photos de mauvaise qualité, interface lourde ; barre d'onglets impossible à faire défiler ; pastilles laides et incompréhensibles, sans score ; compteurs à faire correspondre ; Météo à mieux dessiner, différence BORD / Mer incomprise.
- **Décisions** :
    - **photos** en 1 600 px dans les grandes surfaces (héros, cartes, fiches, journal), une photo par carte de recommandation, une photo par espèce en BATEAU ;
    - **thème « nuit marine » par défaut** dans le prototype, comme la planche de référence ; « plein soleil » au choix dans Profil ;
    - **cartes allégées** : photo, horaires et nom sur la photo, un disque de score (chiffre de 20 px gras, encre marine ou blanc cassé selon le palier, 3:1 au moins, testé), la Confiance en une ligne ;
    - **pastilles-étiquettes** : couleur du palier et score écrit ; triangle pour « à vérifier », score barré pour « non recommandé » ; plus de carrés ni de pointillés ; aucun groupe fictif ; compteur égal aux pastilles ;
    - **barre** : glisser au doigt, à la souris et à la molette ; chevrons cliquables ;
    - **Météo** : flèches effilées d'une seule teinte, plus marquées quand le vent forcit, force Beaufort dans une pastille, ambre à partir de force 6 ; légende explicite ; spots et marques en points de même forme ; explication des couches Vent et Mer.
- **Inchangé** : seuils et teintes des paliers (le vert ne peut pas être assombri sans se confondre avec le rouge en deutéranopie : ΔE 4,7) ; aucun petit texte posé sur un palier.

## V3-026 — Pas de vraies photos de spots

- **Statut** : VALIDÉE par Félix (20 nov. 2026, 15 h 02) : « Oublie les vraies photos, ça serait trop lourd pour l'application. »
- **Décision** : l'application n'embarque que les photos d'ambiance du catalogue (`data/photos/catalogue.json`), toujours marquées « Illustration ». Aucune photo n'est présentée comme celle d'un spot réel. La règle V2 reste : jamais une image reconnaissable sur un spot nommé.
- **Conséquences** : le manque « photos réelles de spots » de `docs/design/REFERENCES.md` est clos ; la fiche spot garde une photo d'illustration choisie selon le type de lieu.

## V3-027 — Jalon 2 de la phase 3 : direction visuelle, Design System, prototypes

- **Statut** : VALIDÉE AVEC RÉSERVES par Félix (20 nov. 2026, 15 h 40 : « jalon 2 validé avec réserves »), sur le prototype version 5.2 (commit 28b3b85, artefact « Prototype SPUMY V3 », version 8).
- **Ce qui est validé, statut final** (ne change plus sans gestion des changements, référentiel § 5.3) :
    - identité : logo BRAND d'origine (écran de lancement, médaillon et mot SPUMY dans l'en-tête, icônes sur le fond crème) ;
    - palette, six paliers et leurs teintes, thème « nuit marine » par défaut et thème clair ;
    - typographie (Roboto, Roboto Condensed pour les chiffres, Montserrat pour la marque) ;
    - navigation : barre de 4 onglets déplaçable, puce de position, bascule BORD / BATEAU ;
    - grammaire des scores : disque, mot du palier, Confiance à part, pastilles-étiquettes avec score.
- **Ce qui est validé, statut provisoire** (révisable au jalon 3, après les phases 5, 8 et 9) : densité des écrans, contenus et textes, visualisations métier (courbe de marée, Météo), états détaillés, composition secondaire des cartes de recommandation.
- **Réserves** (suivies dans `docs/design/REVUES-V3.md`, transformées en critères de recette) :
    1. aucun essai par un vrai utilisateur (Félix ou un proche, sur téléphone, au bord de l'eau) ;
    2. fond de carte dessiné : la vraie carte (Plan IGN, V3-012) arrive à l'intégration ; recette cartographique à refaire sur les vraies tuiles ;
    3. photos générées, marquées « Illustration » (V3-026) ;
    4. taille de la mini-carte de la fenêtre position (180 px) à revoir à l'usage (question de Félix, 15 h 36) ;
    5. Météo : dessin des flèches et densité de la grille à affiner avec les vraies prévisions ;
    6. données de démonstration seulement (scores, fenêtres, marées) : rien n'est un résultat du moteur.
- **Félix (15 h 36)** : les retouches visuelles restent possibles après le jalon ; elles suivent la règle ci-dessus.

## V3-028 — Prototype version 6 d'après les maquettes de Félix

- **Statut** : VALIDÉE par Félix, 23 nov. 2026, de 5 h 58 à 6 h 22. Réalisation au feu vert de Félix, dans la phase 3, sans rien publier. Cahier des charges complet : `docs/design/PROTOTYPE-V6.md`. Maquettes : `docs/design/maquettes-v6/`.
- **Origine** : deux captures (Home, Carte) et une vidéo de 10 s (Météo), faites par Félix pour améliorer l'ergonomie, le design et les fonctions de chaque partie.
- **Ce qui modifie le référentiel ou une décision antérieure** :
    1. **Slogan** : « Read the sea. Fish the moment. » est autorisé en tête de Home, et c'est le seul. Il modifie le référentiel § 6.2.2 (« Aucun slogan ») et l'exigence UX-03 ; l'écart A05 de l'audit AVANT visait le slogan de la V2. Félix l'a inventé et le garde.
    2. **Noms des modes à l'écran** : Shore / Offshore au lieu de BORD / BATEAU, que les documents et le code gardent. Les logos Inshore et Offshore d'origine (jusqu'ici facultatifs) portent les deux cartes de mode de Home.
    3. **Home** : grandes cartes de mode, champ de lieu, jours, carte principale avec la bande de 24 h. Le champ de lieu remplace la puce de position en haut à droite (remarque du jalon 1, V3-023). La partie haute reste fixe et se resserre quand on fait défiler.
    4. **Carte, vue pêche** : pastilles à anneau avec le nom du spot ; bulle au toucher (distance, sorties, poissons, meilleur moment) ; pas de vent ; boutons réduits, légende dépliable. Elle remplace les pastilles-étiquettes et le panneau du bas de V3-025.
    5. **Météo, vue conditions** : vent animé en couleurs, que Félix garde malgré ma proposition contraire ; jours ; panneau à droite au toucher, avec la sécurité en tête. Elle remplace la grille de flèches à force Beaufort de MET-01.
    6. **Unités** : le vent en nœuds, au lieu de km/h et Beaufort ; la distance en « km · min » (la limite de 60 min de route ne change pas).
    7. **Profondeurs** : aucune courbe sans données réelles (EMODnet ou Shom, avec source, précision et « ne pas utiliser pour la navigation »).
    8. **Exigence de qualité** : finition exceptionnelle des cartes ; chaque chiffre affiché a sa source et son heure ; le même niveau partout dans l'application.
- **Corrections des maquettes acceptées par Félix** : 11 points, listés au § 6 du cahier des charges (spot touché, lignes en double, panneau qui masque, jaune pour 62, sécurité, vraies positions, onglet de la vidéo, « Meilleur moment », couleurs de la bande de 24 h, noms cachés au dézoom, « km · min »).
- **Ce qui ne change pas** : tout ce qui a été validé, listé au § 7 du cahier des charges. Félix ne veut pas y revenir.
- **Documents à mettre à jour à la réalisation** : Design System, UX-V3, PROTOTYPE-V3, revues, galerie AVANT/CIBLE, exigences MAP-02, MET-01, UX-05, UX-09.
- **Précision du 23 nov. 2026, 12 h 07** (Félix : « Tu ne respectes pas les modèles présentés. Tu dois être top tier. ») : les trois maquettes font foi pour la composition, les proportions et les couleurs, écran par écran. Conséquences appliquées dans la version 6 :
    1. Carte et Météo occupent tout l'écran ; l'en-tête, le champ et les puces sont posés sur la carte ; le bandeau « Prototype · données de démonstration » quitte le haut d'écran : la mention « démo » reste sur la photo de Home, en pied de carte, dans la bulle et dans le panneau.
    2. **Changement d'un point validé au jalon 2 (version 5 : regroupement des pastilles trop proches)** : en vue d'ensemble, les pastilles forment une colonne le long de la côte, noms à gauche, comme sur la maquette ; deux spots trop proches sont écartés verticalement, un trait pointillé les relie à leur vraie position. Le regroupement « +N » ne reste qu'en dernier recours, sur les écrans trop courts. Impact : tous les spots restent visibles et comptés ; aucune position n'est faussée (le vrai point reste marqué).
    3. Bulle sans croix (second toucher, Échap ou toucher du fond de carte) ; boutons en colonne en bas à droite ; panneau Météo en lignes « Libellé : valeur », les effets de chaque élément passant sous la carte (V3-029).
- **Précision du 23 nov. 2026, 12 h 45** (Félix, sur les quatre planches) : champ de lieu transparent et carte jusqu'en haut ; terre et mer distinctes sous le vent ; « il faut expliquer les raisons du score : pourquoi la marée impacte le score de tant, et cela pour les autres facteurs » ; plus de finesse sur Home ; Offshore n'est pas orange ; « le logo n'est pas bon ». Conséquences :
    1. **Logo** : sur les en-têtes sombres, le symbole est le disque et le poisson sans l'anneau crème du médaillon, comme sur les maquettes (`assets/brand/v3/spumy-symbole-*.png`, `scripts/logos-symbole-v6.py`). Seule l'opacité du fond crème d'origine change ; aucune valeur de couleur n'est modifiée (`tests/brand.py`, 35/35). Le médaillon reste l'export de référence sur fond clair.
    2. **La note est expliquée par le calcul réel du moteur v2** (spécification § 4, validée le 18 nov.) : Favorabilité = conditions × présence ; conditions = marée (fenêtre 25, coefficient 20), lumière 25, vent et mer 30 ; présence = la plus restrictive de la saison et de l'eau ; pression, rafales et clarté : 0 point. Le panneau dit les points de chaque critère et la formule ; sous la carte, chaque critère dit pourquoi il pèse autant, ses points du jour et pourquoi, son barème et sa règle sourcée. Cela **remplace la décomposition de démonstration** (base et points ajoutés), qui ne suivait pas le moteur (MET-05 : aucune décomposition inventée).
    3. **Conséquence sur les notes de démonstration** : elles sont désormais calculées par ce modèle sur les conditions de démonstration du jour ; elles changent (Granville 92, Carteret 79, Agon 75…). La fixture « 53 — À vérifier » de Portbail (référentiel § 6.7.2) laisse place à sa note calculée (79, sur 70 % des critères : houle non documentée) ; la Confiance 69 — Moyenne et le statut « à vérifier » sont gardés.

## V3-029 — Finalité scientifique des onglets Carte et Météo

- **Statut** : VALIDÉE par Félix, 23 nov. 2026, 6 h 59. Complète V3-028 et le cahier des charges `docs/design/PROTOTYPE-V6.md` (§ 0, 3 et 4), sans rien retirer de ce qui est validé.
- **Directive de Félix** :
    - « Le but de la section carte c'est d'avoir tous les renseignements concernant la typologie du terrain qui peuvent impacter scientifiquement en positif ou en négatif la pêche du bar. »
    - « Le but de la section météo est d'avoir et d'expliquer de façon scientifique pourquoi tel élément météo va impacter positivement ou négativement notre pêche. »
- **Ce que cela impose** :
    1. **Carte** : pour chaque spot, les rubriques de terrain déjà présentes dans les données (fond, terrain, structure, exposition, courant), chacune avec son effet favorable ou défavorable, l'explication, la source et le niveau de preuve (échelle 1 à 5 de `data/knowledge/bar-bord.json`). Une rubrique déduite (niveau 4) ou une règle générale (niveau 5) est marquée comme hypothèse. Les couches de terrain (natures de fonds, profondeurs, estran, courants) ne viennent que de données réelles, avec leur source.
    2. **Météo** : pour chaque élément, l'effet favorable ou défavorable, pourquoi en mots simples, la source et le niveau de preuve, tirés des connaissances sourcées : vent-exposition, rafales-penalite, houle-turbidite, pression, eau-chaude, seuils-thermiques, ciel-couvert, lumiere-basse, pluie-turbidite, maree-flot, coefficient-plage-utile, courant-coefficient, gros-coefficient-turbidite. Sans connaissance sourcée, la valeur s'affiche sans effet annoncé.
    3. Rien n'est inventé. Les effets et les explications viennent des données et des connaissances sourcées du dépôt. L'audit biologique et halieutique de la phase 5 les revalidera.
    4. **Toujours du général au spécifique** (Félix, 7 h 03 : « Mais toujours de façon générale pour aller vers le spécifique ») :
        - précision de Félix (7 h 47) : « Pour les 2 tu commences de la carte qui ont été définies ensemble, c'est le point de vue global et après on étudie tous les points spécifiques pour arriver à justifier ton approche terrain, pourquoi ce spot est bon aujourd'hui, et ton approche météo, comment tu as pris ces indications dans ta note » ;
        - le point de vue global, c'est la carte de chaque onglet telle que définie (Carte : les spots sur le terrain ; Météo : le vent sur la zone) ;
        - puis le spot touché, avec sa note ;
        - puis la justification : sur la Carte, pourquoi ce spot est bon aujourd'hui par son terrain (fond, structure, exposition, courant, croisés avec la marée et les conditions du jour) ; sur la Météo, comment chaque élément météo a pesé dans la note (dans quel sens et avec quel poids) ;
        - enfin, à déplier, la règle générale, la source et le niveau de preuve ;
        - précision de Félix (7 h 52) : « je ne veux pas toutes les informations au même niveau. La carte est le point de départ et ensuite on scrolle pour avoir plus de détails top tier et un design qui a au moins la même rigueur que ce que j'ai pu designer pour les 3 vues » : la carte occupe le premier écran ; la bulle et le panneau restent courts ; la justification et le détail sont dans des sections sous la carte, atteintes en faisant défiler, dessinées avec au moins la rigueur des trois vues ;
        - la justification doit rendre compte de la note affichée : jamais une décomposition inventée. Le poids exact vient du moteur ; dans le prototype, des valeurs de démonstration cohérentes avec la note, marquées comme telles.
- **Ce que cela modifie dans le référentiel** : il ne fixait pas cette finalité aux onglets ; elle devient la règle de conception de la Carte et de la Météo. Exigences ajoutées : MAP-09, MET-05.

## V3-030 — Les notes de SPUMY jugées sur le journal, et un modèle qui s'affine

- **Statut** : VALIDÉE par Félix, 23 nov. 2026, 8 h 11 : « Le mieux enfin serait de comparer les notes de Spumy aux résultats notés dans votre journal de sessions : les journées bien notées sont-elles vraiment les bonnes ? Et de pouvoir construire un modèle qui s'affine de lui-même. »
- **Ce que le référentiel prévoit déjà** (rien à modifier) :
    - architecture à deux moteurs : un moteur environnemental de comptage (ZINB/GAMM) et une adaptation par le journal de pêche ;
    - règle anti-biais des bredouilles : un zéro n'est compté que s'il est déclaré ;
    - boucle d'apprentissage contrôlée (§ 9.3.1) : collecte, qualification, validation hors échantillon, comparaison à la version de référence, approbation, version, retour arrière ;
    - calibration en phase 8.
- **Ce que la directive ajoute** : exigence JRN-06.
    - Chaque sortie garde la note affichée au moment de la sortie : Favorabilité, Confiance, version du modèle. La comparaison porte sur la note d'alors, jamais sur une note recalculée après coup.
    - Une vue compare les notes aux résultats.
- **Lecture de « s'affine de lui-même »**, d'après le référentiel validé :
    - le modèle calcule seul ses mises à jour ;
    - aucune n'est activée automatiquement après une prise ;
    - chacune est évaluée sur des sorties qu'elle n'a pas vues, puis proposée à Félix, qui l'approuve ; elle reste réversible.
    - Une activation sans approbation serait un changement du référentiel, à présenter avec son impact.
- **Prototype version 6** : le Journal montre, pour chaque sortie, la note d'alors face au résultat, et une synthèse « Les notes de SPUMY face à tes sorties », avec des données de démonstration marquées comme telles ; aucune conclusion sous le seuil de sorties.

