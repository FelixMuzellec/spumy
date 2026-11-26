# Revue indépendante des phases 5 et 7 (phase 8)

Phase 8 V3, 27 nov. 2026. Référentiel, phase 8 : « revue critique séparée du travail de recherche des Phases 5 et 7 ».

## 1. Méthode

- **Relecteur séparé.** Un agent en lecture seule, qui n'a rien produit de ces phases, a reçu le diff des deux phases et une grille de 9 points, sans les conclusions de l'auteur :
    - G1 faits et inférences ;
    - G2 sources ;
    - G3 TOP_TIER ;
    - G4 marée ;
    - G5 sécurité ;
    - G6 biologie régionale ;
    - G7 proposition de saison ;
    - G8 BATEAU ;
    - G9 cohérence entre rapports et données.
- **Contre-vérification.** Chaque constat a ensuite été vérifié par l'auteur de la phase 8 dans les fichiers, avant toute suite. Il est soit confirmé, soit réduit, soit écarté.
- **Contrôle sur le web.** Un second agent a contrôlé 10 fiches à haut risque sur des pages publiques (`AUDIT-FICHES-PHASE-8.md`, § 3).
- **Ce que la relecture n'a pas fait.** Elle n'a pas lu les articles scientifiques. Les chiffres de de Pontual, Goossens et Fritsch sont contrôlés pour leur cohérence interne, pas contre la source.

## 2. Constats et contre-vérification

Bilan du relecteur : 2 MAJEUR, 11 MINEUR, 6 OBSERVATION. Après contre-vérification : **aucun MAJEUR ne tient tel quel**. Il reste 0 MAJEUR, 12 MINEUR et 7 OBSERVATION.

| N° | Grille | Constat du relecteur | Contre-vérification (phase 8) | Verdict | Suite |
| --- | --- | --- | --- | --- | --- |
| 1 | G3, G5 | QUAL-5 accepte `!!mouvements_terrain`, vrai même quand le statut est INCONNU (Penmarc'h, TOP_TIER) | La définition de QUAL-5 (`QUALIFICATION.md`, l. 13) demande « mouvements de terrain **consultés** », pas « absents ». Les 98 fiches portent la consultation de Géorisques, avec sa source et sa date. Le code ne vérifie pourtant pas cette consultation, et le libellé « mouvements de terrain 0 » peut se lire comme « aucun risque » | MAJEUR réduit à MINEUR | Proposé (phase 9) : exiger la source et la date dans le code ; libellé « 0 recensé (recensement non exhaustif) » |
| 2 | G5, G9 | K-08 passe de 18 à 22 grâce à un dépliant de pêche à pied départemental, générique (Granville, Pirou, Portbail, Surtainville) | Granville, Pirou et Portbail ont **aussi** une consigne propre au poste, sourcée : presse locale de 2019 et de 2012, et Attitude Manche. **Seule Surtainville** tient QUAL-5 par la seule règle générale. Aucun effet sur la sécurité : ces fiches restent « à vérifier » (D6-15) | MAJEUR réduit à MINEUR | Proposé (phase 9) : une consigne générale ne suffit pas seule à QUAL-5 (K-08 : −1 fiche) |
| 3 | G5, G2 | Fenêtre du Grand Bé (basse mer ± 1 h 30) : un seul éditeur, règle de visite | Confirmé, et déjà dit dans la fiche : INFÉRÉ, niveau 4, « règle de visite, pas de pêche » | MINEUR, déjà déclaré | Gardé ; retour terrain de Félix |
| 4 | G2 | L'office de tourisme de Saint-Malo est compté comme deux groupes d'indépendance | Confirmé (`editeurs.json`). Aucun statut n'en dépend aujourd'hui | MINEUR | **Corrigé** (commit bfa60f9) |
| 5 | G1, G9 | Mousterlin, « coefficient 75 » : le registre dit « sans source », la fiche cite carnet-de-peche.com | Confirmé : une seule source (carnet-de-peche.com, lue sur extrait), et aucune source indépendante. Le contrôle web le confirme | MINEUR (libellé) | Libellé à préciser : « une seule source, non corroborée » |
| 6 | G3 | QUAL-2 de Mousterlin et Penmarc'h : « lues page par page », alors que carnet-de-peche.com n'est lu que sur extrait | Confirmé par `CHALLENGE-TOP-TIER-PHASE-7.md` § 2. Les deux TOP_TIER sont déjà dits fragiles, et Q7-04 propose une règle plus stricte | MINEUR | Rejoint Q7-04 (règle TOP_TIER plus stricte) |
| 7 | G6 | Goossens 2023 : 6,9 °C (phase 5, cité par Edwards) contre 2,8 °C (phase 7) | Confirmé : l'écart n'est pas concilié. Les deux chiffres n'ont pas la même origine (citation secondaire contre lecture directe) | MINEUR | À concilier ; la phase 7, lecture directe, prime |
| 8 | G6, G1 | `frai-temperature` (février à juin) contre `frai-manche-ouest` (janvier à avril-mai), tous deux VÉRIFIÉ | Confirmé : la première est générale au stock nord, la seconde régionale. La revue ne signale pas l'écart | MINEUR | La connaissance régionale prime en Manche ouest ; écart à écrire |
| 9 | G9 | « 34 connaissances, chacune avec sa zone de validité » : 8 sont exemptées par domaine | Confirmé (sécurité, réglementation, leurres) | MINEUR (libellé) | Libellé : « 26 avec zone, 8 exemptées par domaine » |
| 10 | G4 | 133 phases de marée V2 INFÉRÉ sans source, dont 25 sont une règle générale (Vidal) appliquée au poste | Confirmé. Ce sont des données V2 gardées (PF-04, PF-05) | MINEUR | Aucune fenêtre générique n'est présentée comme observée ; journal |
| 11 | G1 | Kernic : contrainte de marée déduite ; la consigne sourcée parle de baignade | Confirmé | MINEUR | Retour terrain |
| 12 | G1 | Beg-en-Aud : position « VÉRIFIÉ » d'un tumulus, à 1 km de précision | La position du **toponyme** est bien vérifiée, avec 1000 m de précision déclarés et « poste à confirmer ». Le doublon à 0,51 km avec le Percho reste incertain | OBSERVATION | Gardé, doublon non fusionné |
| 13 | G6 | « Marquages de Saint-Malo » invoqués sans connaissance qui les cite | Confirmé | MINEUR | Citer la source ou retirer la mention |
| 14 | G9 | Chiffres périmés dans le corps de `PHASE-7.md` (365 sources, K-08 à 18) | Confirmé : ils sont corrigés dans le complément final du rapport | OBSERVATION | — |
| 15 | G6 | Abri : « seul indice, cinq poissons à Audierne » ; la revue cite aussi deux résidents d'Iroise | Confirmé | OBSERVATION | — |
| 16 | G7 | Arithmétique de la saison cohérente ; « (66 spots) » écrit en dur | Confirmé | OBSERVATION | — |
| 17 | G8, G5 | Marques de démonstration BATEAU avec `safety: "ok"`, alors que les seuils ne sont pas validés | Confirmé (prototype, données de démonstration) | MINEUR | Intégration (phases 10 à 12) : jamais « ok » tant que PF-37 n'est pas tranché |
| 18 | G1 | `filtre-prudence-felix` et `filtre-inconnu` : VÉRIFIÉ niveau 5 sans source | Ce sont des décisions de Félix (13 nov. 2026), pas des faits | OBSERVATION | Statut « décision », pas « fait », à la phase 9 |
| 19 | G9 | Synthèse de `PHASE-5.md` (0 TOP_TIER) contredite par sa suite (2 TOP_TIER) | Confirmé : la synthèse date d'avant la revue contradictoire de la phase 5 | OBSERVATION | — |

## 3. Ce que la revue confirme sans défaut

- 98 fiches : 66 V2 et 32 V3. Statuts : 63 « à vérifier », 32 candidates, 2 TOP_TIER, 1 corroborée.
- 23 contraintes de marée connues et 75 inconnues ; une seule fenêtre de sécurité.
- 13 règles sans source régionale (AUCUNE). 17 fiches de la Manche en INFÉRÉ, « à vérifier ».
- Chiffres d'Iroise cohérents : 17, 6 et 2 sur 25 ; 41 jours sur 12 409.
- Aucune donnée OpenStreetMap stockée.
- Proposition de saison cohérente et jamais appliquée dans `src/`.

## 4. Lecture

Le travail de recherche des phases 5 et 7 tient sur l'essentiel :
- aucune donnée de sécurité inconnue n'est présentée comme connue au point de rendre un spot praticable ;
- aucun spot n'est perdu ;
- les comptes sont exacts.

Ses faiblesses sont surtout de **libellé** et de **force des critères** :
- QUAL-5 accepte une consultation sans la vérifier dans le code, et une règle générale suffit à le remplir ;
- QUAL-2 compte comme « lue » une page vue en extrait ;
- deux chiffres biologiques ne sont pas conciliés.

Aucune de ces faiblesses ne fait passer un spot au vert. Les corrections qui changent un critère validé sont proposées pour la phase 9, jamais appliquées d'office (PF-04).
