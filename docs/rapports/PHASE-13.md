# SPUMY — Phase 13 : développement BATEAU

20 novembre 2026 · Félix · version de référence : document Claude « SPUMY — Phase 13 : développement BATEAU » (https://claude.ai/artifact/Cp32mm98mZHanVKXyEXP7r) · branche `claude/phase-13-bateau` · proposition de fusion en brouillon (pas fusionnée sans ton accord)

L'onglet Offshore sait maintenant répondre à « Sortir aujourd'hui ? ». Une fois ton bateau décrit, il juge la sécurité de la sortie zone par zone, sur le pire moment du créneau. Elle ne se compense jamais. Il propose ensuite les espèces ouvertes avec leurs trois scores, la technique, le poids et la réglementation.

Les seuils de vent et de mer sont ceux de la spécification, affichés comme « à valider ». Ce sont tes questions 16 à 25, toujours ouvertes.

## 1. Objectif

Phase 13 du prompt maître : architecture, interfaces, moteur, données, fonctionnalités et intégration du mode BATEAU, d'après `docs/SPEC-MOTEUR-BATEAU.md` (phase 9). La phase 10 (moteur par espèce), mise de côté, est faite ici.

## 2. Travail réalisé

| Lot | Statut | Contenu |
|---|---|---|
| 13.0 Départ | IMPLEMENTED | Phase 12 fusionnée dans `main` (bb4f940) ; branche `claude/phase-13-bateau` |
| 13.A Moteur | TESTED | `src/bateau/engine/` : sécurité, espèces, pertinence, confiance ; `data/bateau/moteur.json` |
| 13.B Météo du large | TESTED | Visibilité, code temps (orage) et CAPE demandés à Open-Meteo |
| 13.C Interface | TESTED | Profil du bateau ; « Sortir aujourd'hui ? » dans l'onglet Offshore |
| 13.D Tests | TESTED | `test:bateau` (16 scénarios de la spécification) ; parcours e2e de la sortie |
| 13.E Documents | IMPLEMENTED | Spécifications, fonctionnalités, architecture, journal des versions, suivi, ce rapport |

## 3. Livrables

- `src/bateau/engine/` :
    - `safety.js` : règles SEC_* ;
    - `species.js` : favorabilité, présence, pertinence, confiance, fermetures ;
    - `sun.js` : soleil en mer, phase de la marée ;
    - `index.js` : une zone, toutes les zones, temps de route.
- `data/bateau/moteur.json` : seuils, réglementation vérifiée des espèces, rappels.
- `src/bateau/Sortie.jsx`, branché dans `Offshore.jsx` ; `src/bateau/wx.js` : trois variables de plus.
- `tests/bateau.mjs` (dans `npm test` et l'intégration continue) ; contrôles e2e de la sortie.
- Version 10.1.0.

## 4. Preuves

| Contrôle | Résultat |
|---|---|
| `test:bateau` : les 16 scénarios B1 à B16, plus les règles (trois scores, classement, rappels, route) | 29/29 |
| `test:e2e`, avec la sortie bateau | 856/856, puis 855/855 dans la suite complète |
| Suite complète : lint 0 ; couches 0 écart (253) ; données 69/69 ; connaissances 27/27 ; design 41/41 ; v2 56/56 ; bateau 29/29 ; unitaires tous verts ; accessibilité 0 violation ; mise à jour 12/12 ; studio 34/34 ; prototype 244/244 | tout vert |

Ce que vérifient les contrôles e2e de la sortie :
- sans profil, aucun verdict ;
- zone à 7,8 milles d'un abri avec un armement côtier : non recommandée (Division 240) ;
- la même zone à 1 mille de l'abri : plus de refus ;
- la fiche de la zone affiche les règles, les espèces et leurs trois scores, et la réglementation ;
- les rappels sont affichés ;
- le profil est gardé sur l'appareil.

## 5. Résultats

- **Sécurité** : un seul « non recommandé » empêche la zone ; un seul « à vérifier » interdit le vert. Les règles :
    - distance de l'abri selon l'armement ;
    - catégorie de conception (directive 2013/53/UE) ;
    - force 7, qui vaut un BMS ;
    - vent et mer (seuils proposés, tes limites, un cran plus bas seul à bord) ;
    - visibilité, orage, retour de nuit, raz ;
    - âge de la prévision.
- **Espèces** :
    - lieu jaune, maquereau, bar, vieille et saint-pierre ; lieu noir seulement si tes sorties en ont pris ;
    - le lieu jaune n'est pas proposé du 1er janvier au 30 avril, relâcher compris ;
    - un critère manquant sort du calcul, et sous la moitié de critères calculés, pas de note (cas du saint-pierre).
- **Trois scores** : favorabilité, pertinence (canne, route, réglementation), confiance (données, modèles, preuves, tes sorties). Jamais fusionnés ; la confiance ne change jamais le rang.
- **Écran** :
    - le verdict en une phrase (« Oui, de 7 h à 12 h », « À vérifier avant de partir » ou « Non : sortie non recommandée ») ;
    - les raisons avec l'heure du pire moment ;
    - les zones, chacune avec ses règles et ses espèces ;
    - les rappels : aide à la flottabilité, canal 16 et 196, BMS non lu, itinéraire donné à un proche.

## 6. Problèmes et risques

- **Seuils non validés** : vent (à vérifier dès la force 5, non recommandé dès la force 6) et mer (agitée dès 1,25 m). Ce sont les valeurs proposées ; l'écran le dit.
- **BMS non lus** : une prévision de force 7 vaut BMS, mais l'application ne lit pas les bulletins. L'écran invite à les consulter.
- **Raz** : sans courant fiable, une zone de raz reste « à vérifier ». Une zone est marquée raz quand son nom ou ses notes contiennent « raz ».
- **Visibilité** : quand le modèle ne la donne pas, la sortie est « à vérifier ». C'est voulu (spécification), mais cela peut être fréquent.
- **Test de parcours instable** (connu depuis la phase 11, hors BATEAU) : sur cette machine, rouvrir une analyse photo enregistrée dépasse parfois 12 s, et le parcours s'arrête là (2 passages sur 4 ici). Il passe sur GitHub (proposition n° 15 verte). À traiter en phase 16 (QA).
- **Pas encore fait** :
    - ajustement personnel par tes sorties (prévu, ±10 au plus, à partir de 8 sorties) ;
    - profil du bateau dans la sauvegarde GitHub ;
    - marée au-delà de 40 km d'un guide ;
    - carte des zones avec les cercles des abris ;
    - épreuve sur journées archivées.

## 7. Critères d'acceptation

| Critère | Statut |
|---|---|
| La sécurité passe en premier et ne se compense jamais (B11) | TESTED |
| Une donnée de sécurité inconnue n'est jamais au vert (B4, B5) | TESTED |
| Trois scores sur 100, jamais fusionnés ; la confiance ne classe pas (B12) | TESTED |
| Fermetures réglementaires respectées (B8) | TESTED |
| Sans profil, aucun verdict ; rien supposé à la place de l'utilisateur | TESTED |
| Les 16 scénarios de référence de la spécification | TESTED (29/29) |
| Données des espèces et réglementation hors du code (`data/`) | IMPLEMENTED |
| Épreuve sur journées archivées (§ 11 de la spécification) | NOT STARTED |

## 8. Décisions attendues

Je ne te les pose pas maintenant ; elles sont dans le suivi :
- **Questions 16 à 25** : seuils de vent et de mer, marges, retour de nuit, seul à bord, lieu noir. Elles sont appliquées avec les valeurs proposées en attendant ta décision.
- **Fusion de la phase 13 dans `main`** : proposition en brouillon. Elle mettrait en ligne des verdicts de sécurité dont les seuils sont encore « à valider ». C'est affiché, mais c'est à toi de choisir.

## 9. Prochaine phase proposée, et arrêt

**Phase 14 — Journal, personnalisation et offline** (prompt maître) :
- historique ;
- apprentissage, dont l'ajustement personnel BATEAU ;
- stockage, avec le profil du bateau dans la sauvegarde GitHub ;
- cache, synchronisation et conflits ;
- protection des données.

**STOP.** J'attends « APPROVED — PROCEED TO PHASE 14 ».
