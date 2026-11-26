# Audit du mode BATEAU (phase 7)

Phase 7 V3, périmètre du référentiel : vérifier que le mode BATEAU n'a pas été négligé (régressions, cohérence de l'interface, données, espèces, sécurité). Toute extension nouvelle est proposée à Félix, jamais développée. Version 1 du 26 novembre 2026.

Méthode :
- un relecteur en lecture seule a parcouru le code V2 (`src/bateau/`), le prototype V3, `data/knowledge/bateau.json`, la spécification et les tests ;
- chaque constat retenu ci-dessous a été revérifié dans le fichier cité.

Le code V2 du BATEAU est gelé (PF-26 : « sans objet » en V2). Ses restes sont notés, pas corrigés.

## 1. Corrections faites (26 nov. 2026)

| Constat | Preuve | Correction | Contrôle |
| --- | --- | --- | --- |
| Le prototype V3 affichait des règles fausses sur ses marques de démonstration. Lieu jaune « taille minimale 30 cm » au lieu de 42 cm, 2 par jour et fermeture du 1er janvier au 30 avril. Bar « 2 par jour » au nord du 48ᵉ parallèle au lieu de 3. Lieu noir « aucune taille fixée » au lieu de 35 cm. Maquereau « — » au lieu de 20 cm et 10 par jour. C'est une régression par rapport au prototype V2 | `src/prototype-v3/data.js`, marques m1 à m4 ; `data/knowledge/bateau.json` (règles de 2026) | règles de 2026 recopiées, sans la mention « (démo) » sur la règle (les marques restent inventées et marquées « démo ») | `tests/prototype-v3.mjs` : « BATEAU : règle de chaque espèce des marques conforme à 2026 » |
| Home BATEAU disait « Sortie possible » sans dire que les seuils de sécurité ne sont pas validés | `src/prototype-v3/home.jsx`, verdict de Home BATEAU ; PF-37 ; `docs/SPEC-MOTEUR-BATEAU.md` (« À DÉCIDER par Félix ») | « seuils de sécurité à valider » ajouté sous le verdict | `tests/prototype-v3.mjs` : « Home BATEAU : les seuils de sécurité sont dits « à valider » » |
| Le contrôle PF-26 (ni Pertinence, ni note sur 10, ni « V2 ») ne passait que par les écrans BORD | `tests/prototype-v3.mjs`, boucle des routes | contrôle ajouté sur Home BATEAU, hors captures | `tests/prototype-v3.mjs` : « héritage Home BATEAU » |

## 2. Vérifié sans défaut

- **Six espèces**, dans l'ordre de Félix (`bateau.json`).
- **Fermeture du lieu jaune** : cohérente entre la connaissance, la spécification et le prototype V2.
- **Aucune valeur de 2025 reprise pour 2026** : sources datées de 2026 ; l'arrêté du 24/12/2024 est marqué « à revérifier ».
- **Sécurité inconnue jamais au vert** dans le prototype V3 : elle bascule en « Sécurité à vérifier ».
- **Aucun import croisé** entre le BORD et le BATEAU (`tests/layers.mjs`).
- **Aucune coordonnée de spot personnel** dans le dépôt : les marques personnelles vivent sur l'appareil ou dans la sauvegarde GitHub.
- **Fonctions BAT-01 de la V2** présentes et couvertes par `tests/e2e.mjs` : spot par GPS, conditions sur 7 jours, sorties et prises (y compris sans prise), modèle appris.

## 3. Écarts gardés ouverts (corrections à faire à l'intégration, phases 10 à 12)

| Écart | Gravité | Pourquoi pas maintenant |
| --- | --- | --- |
| Le prototype V3 n'a pas encore les écrans d'une fonction BATEAU existante : ajout d'une marque (GPS ou carte), journal des sorties, modèle « d'après tes sorties » (V3-015). La carte BATEAU est un emplacement réservé | à corriger | ce sont des écrans d'intégration (BAT-01 garde la V2 en ligne en attendant) ; à prévoir au plan des phases 10 à 12 |
| La V2 gelée affiche encore une « Note sur 10 » (`src/bateau/offshore.js`, `Offshore.jsx`) | mineur | code gelé, remplacé par la V3 (V3-015) |
| Le BMS est listé sans état « non lu » | mineur | la spécification le demande à l'écran ; intégration |
| Placement d'un spot par la carte non couvert par l'e2e V2 | mineur | code gelé ; à couvrir dans l'e2e V3 |
| Réglementation de la vieille et du saint-pierre : INCONNUE | mineur | échéance écrite avant la phase 10 (`bateau.json`) |

## 4. Extensions possibles : propositions seulement, rien n'est développé

- Couche de carte marine (épaves, hauts-fonds) : V3-024, « bonus à étudier ».
- Visibilité, orages et courant dans les conditions BATEAU : `docs/SPEC-MOTEUR-BATEAU.md`, pistes.
