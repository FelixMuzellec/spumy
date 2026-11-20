# Modèle de menace initial — SPUMY V3

Phase 2 V3, 20 novembre 2026. Référentiel § 11. Contexte : site statique public (GitHub Pages), sans serveur ni compte, utilisé par Félix et quelques proches (ADR-V3-005). À revoir en Phase 14 (QA et sécurité), et à chaque nouveau service.

## 1. Ce qu'il faut protéger

| Bien | Où | Sensibilité |
| --- | --- | --- |
| Position de l'utilisateur | mémoire ; cache arrondi à 100 m (routage) | forte : dit où il est, souvent près de chez lui |
| Spots personnels (postes secrets) | appareil ; sauvegarde GitHub facultative | forte pour un pêcheur |
| Journal (sorties, prises, photos et leurs métadonnées GPS) | appareil (`localStorage`, IndexedDB) ; GitHub | moyenne à forte |
| Jeton GitHub, clé Anthropic | `localStorage` de l'appareil | forte : accès au dépôt du journal, facturation |
| Justesse des avis de sécurité | moteurs, données | **critique** : un « vert » à tort peut mettre en danger |
| Intégrité de l'application publiée | dépôt public, GitHub Pages, dépendances npm | forte |

## 2. Menaces et contrôles

| Menace | Effet | Contrôle en place (V2) | Contrôle V3 |
| --- | --- | --- | --- |
| Script injecté (XSS) par une donnée externe (nom de lieu du géocodage, réponse d'API) | vol des jetons, de la position, du journal | CSP stricte (`script-src 'self'`), React échappe le texte | même CSP, élargie aux seuls hôtes nécessaires ; les réponses des services ne sont jamais insérées comme HTML |
| Réponse de service fausse ou corrompue (météo, temps de route) | mauvais avis, faux « vert » | données inconnues → « à vérifier » | validation de forme de chaque réponse par l'adaptateur ; valeur hors bornes = inconnue ; un temps de route manquant n'est jamais « vérifié » |
| Fuite de la position à des tiers | suivi de l'utilisateur | aucune position stockée | coordonnées envoyées seulement à Open-Meteo et à l'IGN, pour leur service ; aucune localisation par adresse IP (V3-010) ; pas de télémétrie |
| Journaux des services (Open-Meteo garde les journaux du serveur, coordonnées comprises, 90 jours ; VÉRIFIÉ) | coordonnées des spots consultés chez le fournisseur | — | accepté (usage privé) ; noté dans l'information aux utilisateurs |
| Jeton GitHub trop large | accès à d'autres dépôts | conseil : jeton à grain fin sur un seul dépôt ; écriture refusée si le dépôt n'est pas privé (V2) | gardé |
| Téléphone perdu | lecture du journal et des spots | aucun | export et effacement (PRV-04) ; pas de chiffrement local (hors périmètre, à revoir si demandé) |
| Dépendance npm malveillante | code injecté dans `app.js` | `package-lock.json`, 3 dépendances d'exécution, `npm audit` à 0 | audit dans la CI ; aucune nouvelle dépendance pour la position ni le routage |
| Compte GitHub de Félix compromis | publication d'une application piégée | protection de `main` par la règle « pas de push direct » (convention) | proposer une protection de branche et une double authentification (à faire par Félix) |
| Clé Météo-France publiée par erreur | abus du compte | — | jamais dans le dépôt : secret du relais (V3-011), saisi par Félix |
| Relais de vigilance détourné (appelé par d'autres sites, surchargé) | quota Météo-France épuisé, vigilance indisponible | — | origine du site seule acceptée ; une seule route (vigilance d'un département) ; aucun stockage ni journal de position ; en panne, « vigilance inconnue » |
| Données de spot erronées (danger absent, coordonnées fausses) | mise en danger | sources et niveaux de preuve | revue indépendante (Phase 8) ; positions imprécises signalées (MAP-06) |

## 3. Données personnelles (RGPD)

L'usage est privé, entre proches. Le RGPD exclut l'activité « strictement personnelle ou domestique » ; partager l'application avec quelques proches reste proche de ce cadre (INFÉRÉ, avis juridique non sollicité). Les principes sont appliqués quand même :

| Finalité | Données | Où | Durée | Base |
| --- | --- | --- | --- | --- |
| Classer les spots depuis ta position | position (précision, source) | mémoire ; cache arrondi à 100 m | 24 h | action de l'utilisateur |
| Tenir ton journal | sorties, prises, photos | appareil ; GitHub si tu l'actives | jusqu'à effacement | action de l'utilisateur |
| Tes spots | positions, notes | appareil ; GitHub si tu l'actives | jusqu'à effacement | action de l'utilisateur |

Destinataires : Open-Meteo (coordonnées des spots), IGN (position arrondie et coordonnées des spots), GitHub (si sauvegarde), Anthropic (photos, si analyse). Aucun transfert à d'autres fins. Une page « Tes données » dira tout cela dans l'application (Phase 13).

## 4. Risques résiduels

- **Pas de chiffrement des données sur l'appareil** : accepté, proposé à Félix.
- **Disponibilité des services gratuits** : sans garantie contractuelle. Repli prévu (`docs/ARCHITECTURE-V3.md`, § 5).
- **CORS des services IGN** : non vérifié. S'il bloque, le relais de vigilance pourrait aussi servir l'IGN, mais il faudrait alors le protéger contre les abus.
- **Relais de vigilance** : nouveau composant hors de GitHub, dépendant d'un compte Cloudflare de Félix.
