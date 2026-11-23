# Sources de données et services externes — SPUMY V3

Phase 2 V3, 20 novembre 2026. Usage décidé par Félix : **lui et quelques proches, gratuit, non commercial** (Q2, ADR-V3-005). Ce cadre rend gratuits les services ci-dessous ; un passage au public ou au commercial rouvrirait ce document.

Marqueurs : `VÉRIFIÉ` (page officielle lue le 20 nov. 2026, ou code et tests du dépôt), `INFÉRÉ`, `INCONNU`, `À DÉCIDER`.

## 1. Sources en service dans la V2 (à garder)

| Donnée | Fournisseur | Accès | Licence et conditions | Limites | Statut V3 |
| --- | --- | --- | --- | --- | --- |
| Prévision météo (vent, rafales, direction, nébulosité, pluie, pression), modèles AROME et ECMWF | Open-Meteo, `api.open-meteo.com` | sans clé, CORS ouvert (VÉRIFIÉ : en service dans la V2) | CC BY 4.0 ; gratuit seulement en usage non commercial (app privée sans abonnement ni publicité : admis) — VÉRIFIÉ, [conditions](https://open-meteo.com/en/terms) | < 10 000 appels par jour, 5 000 par heure, 600 par minute, par IP et par application — VÉRIFIÉ | Garder. Attribution à afficher (déjà présente en V2) |
| Houle, vagues, température de l'eau | Open-Meteo Marine, `marine-api.open-meteo.com` | idem | idem | idem | Garder |
| Archives de prévisions (épreuve du moteur) | Open-Meteo, `historical-forecast-api.open-meteo.com` | idem | idem | idem | Garder (outil, pas l'application) |
| Fond de carte | OpenStreetMap, `tile.openstreetmap.org` | sans clé | ODbL ; attribution visible ; Referer valide ; **aucun usage hors ligne ni préchargement** — VÉRIFIÉ, [politique](https://operations.osmfoundation.org/policies/tiles/) | pas de seuil chiffré : blocage possible sans préavis en cas d'abus | Garder en secours ; candidat principal : IGN (section 2) |
| Marée | Calcul harmonique sur l'appareil (`src/core/tide.js`), constantes TICON-4 et ports secondaires ajustés | aucun réseau | TICON-4 : licence ouverte (INFÉRÉ, à confirmer) ; contrôle contre les tables SHOM publiées, jamais utilisées pour l'ajustement — VÉRIFIÉ (code) | précision par port écrite dans les fiches (± 4 à ± 40 min selon le port) | Garder ; catalogue des ports à rendre indépendant des guides |
| Sauvegarde du journal | API GitHub, dépôt de l'utilisateur | jeton saisi par l'utilisateur, gardé sur l'appareil | conditions GitHub | quotas GitHub | Garder, facultative |
| Analyse de photos | API Anthropic | clé saisie par l'utilisateur, appel direct | conditions Anthropic | facturation sur la clé de l'utilisateur | Garder, facultative |

## 2. Services candidats pour les besoins nouveaux de la V3

Les services de la Géoplateforme de l'IGN couvrent les trois besoins nouveaux (position saisie, temps de route, fond de carte), sans clé ni coût. Ils sont le premier choix pour un usage privé en France.

| Besoin V3 | Service | Accès | Limites | Licence | Points ouverts |
| --- | --- | --- | --- | --- | --- |
| Saisir une position (adresse, ville, lieu, code postal) | Géocodage Géoplateforme, `https://data.geopf.fr/geocodage/search` (a remplacé l'API Adresse ; l'ancien domaine `api-adresse.data.gouv.fr` n'était maintenu que jusqu'en janvier 2026) | ouvert | 50 requêtes par seconde par IP | Licence Ouverte 2.0 (défaut du site, à confirmer) | CORS : **VÉRIFIÉ** ouvert (`Access-Control-Allow-Origin: *` ; appel réussi dans Chromium depuis l'origine du site publié ; passage 45210735483 du contrat IGN, 23 nov. 2026) |
| Suggestions pendant la saisie | Autocomplétion Géoplateforme | ouvert | 10 requêtes par seconde par IP | idem | idem |
| Spots à 60 min de route ou moins (BORD) | Isochrone Géoplateforme, `https://data.geopf.fr/navigation/isochrone`, voiture, en temps | ouvert, disponibilité annoncée 99,5 % | 5 requêtes par seconde par IP | idem ; réseau routier BD TOPO | CORS : **VÉRIFIÉ** ouvert (même passage) ; un seul appel par position donne le polygone des 60 min (ressource `bdtopo-valhalla`, `costType=time`, `costValue=3600`) |
| Temps de route exact vers un spot | Itinéraire Géoplateforme, `https://data.geopf.fr/navigation` (le plus rapide, voiture) | ouvert, 99,5 % | 5 requêtes par seconde par IP | idem | CORS : **VÉRIFIÉ** ouvert (même passage ; ressource `bdtopo-osrm`, durée en secondes, distance en mètres) ; à limiter aux spots retenus (Top 3 et fiche) |
| Fond de carte (plan, photos aériennes) | WMTS Géoplateforme, `https://data.geopf.fr/wmts` | ouvert, 99,5 % | non documentée | idem | Couches et usage hors ligne : à vérifier dans la documentation métier |
| Vigilance météorologique (vent violent, vagues-submersion) | API Bulletin Vigilance de Météo-France, `portail-api.meteofrance.fr` | **compte obligatoire** (clé d'accès) | 60 requêtes par minute ; 99,9 % | non précisée sur la fiche | Lue par un petit relais gratuit qui garde la clé hors du dépôt (ADR-V3-011, validée le 20 nov.) |

Sources de la section 2 : fiches data.gouv.fr de l'IGN ([isochrone](https://www.data.gouv.fr/dataservices/api-geoplateforme-calcul-disochrone-isodistance), [itinéraire](https://www.data.gouv.fr/dataservices/api-geoplateforme-calcul-ditineraire), [WMTS](https://www.data.gouv.fr/dataservices/api-geoplateforme-diffusion-dimages-tuilees-wmts), [liste des services](https://www.data.gouv.fr/organizations/institut-national-de-linformation-geographique-et-forestiere/dataservices)), [transfert de l'API Adresse à l'IGN](https://www.data.gouv.fr/posts/lapi-adresse-de-la-base-adresse-nationale-est-transferee-a-lign-10), [API Bulletin Vigilance](https://www.data.gouv.fr/dataservices/api-bulletin-vigilance). Lues le 20 nov. 2026.

**Localisation approximative par le réseau (adresse IP).** Aucun service retenu. Les services gratuits envoient l'adresse IP de l'utilisateur à un tiers pour une position à la ville près. Pour un petit groupe d'utilisateurs, « Me géolocaliser » et « Saisir une position » suffisent (ADR-V3-010, à valider).

## 3. Règles communes (référentiel, § 8.2 et § 10.4)

- Chaque valeur porte sa source, son heure, son âge, sa résolution et son type (`mesurée`, `prévision`, `calculée`, `fournie_utilisateur`, `estimation`, `inconnue`). Heures stockées en UTC.
- Un service injoignable ne donne jamais une valeur par défaut : la donnée est `inconnue`, et la sécurité passe « à vérifier ».
- Un temps de route d'un service est marqué « vérifié » avec sa source et son heure. Une estimation hors ligne (vol d'oiseau × facteur) est marquée « estimation » et ne sert jamais seule au filtre des 60 min.
- Attributions affichées : Open-Meteo, OpenStreetMap ou IGN selon le fond de carte.
- Les fournisseurs passent par un adaptateur par service, afin qu'un changement de fournisseur ne touche ni les moteurs ni l'écran (ADR-V3-008).

## 4. Données internes

| Donnée | Emplacement | Provenance |
| --- | --- | --- |
| 66 spots BORD | `data/sites/*.config.js` (7 fiches V2) | sources par spot, rubriques de preuve `data/knowledge/preuves-spots.json` |
| Connaissances bar (bord) | `data/knowledge/bar-bord.json` | niveaux de preuve 1 à 5 |
| Connaissances BATEAU | `data/knowledge/bateau.json` | phase 9 V2 |
| Photos d'ambiance | `assets/photos/`, `data/photos/catalogue.json` | générées par Gemini, fournies par Félix ; toujours « Illustration » |
| Logos | `assets/brand/sources/` | fichiers de Félix (19 nov. 2026), identiques aux originaux |
