# Qualification des fiches de spots

Phase 5 V3, sous-tâche 5.9 (référentiel § 7.2 : « qualifier chaque fiche (candidate, à vérifier, corroborée, `TOP_TIER`, inaccessible, réglementée/interdite) selon des critères explicites »). 23 novembre 2026. Le script `scripts/qualifier-fiches.mjs` applique les critères ; `tests/spots-v3.mjs` recalcule chaque statut et vérifie que les critères bloquent ce qu'ils doivent bloquer.

## 1. Critères

| Critère | Exigence | Pourquoi |
| --- | --- | --- |
| QUAL-1 Intérêt halieutique corroboré | au moins **deux groupes d'indépendance** parmi les sources de la fiche : famille 1 à 4, éditeur dont le domaine couvre la pêche, source non privée, **citation qui nomme le spot**. Un article général (« les plateaux rocheux ») ne prouve rien d'un lieu ; une citation qui parle de pêche en bateau, de navigation, ou dit ne pas parler du bar ne compte pas pour un poste du bord. | § 7.1 : deux pages qui recopient la même source ne comptent pas double ; § 7.2 : l'intérêt pour l'espèce doit être documenté pour le mode |
| QUAL-2 Qualité des sources examinée | chaque source retenue en QUAL-1 a été **lue et évaluée page par page** (§ 7.1) | § 7.2 : « dont la qualité est examinée » ; le seul nombre de sources ne suffit pas |
| QUAL-3 Position contrôlée | position corrigée sur un toponyme officiel, ou toponyme officiel de même nom à 1,5 km au plus, sans anomalie de position | un poste mal placé fausse l'accès, la marée et la sécurité |
| QUAL-4 Accès documenté | stationnement et temps de marche connus (IGN) | § 7.2, étape 9 |
| QUAL-5 Sécurité documentée | engagement connu, au moins une consigne, contrainte de marée classée, mouvements de terrain consultés | § 0.2 : la sécurité ne se compense jamais |
| QUAL-6 Réglementation claire | aucune règle locale dont l'application au poste reste « à vérifier », zone CIEM certaine | une interdiction possible n'est jamais « au vert » |
| QUAL-7 Pas de source privée | la fiche ne cite pas le journal personnel de Félix | données privées hors des fiches publiques |

| Statut | Règle |
| --- | --- |
| `reglementee` | une règle confirmée interdit la pêche au poste |
| `inaccessible` | accès fermé, vérifié |
| `TOP_TIER` | QUAL-1 à QUAL-7 |
| `corroboree` | QUAL-1, QUAL-3 à QUAL-7 (sources corroborées par éditeurs indépendants, pages pas encore toutes relues) |
| `a_verifier` (spot V2) ou `candidate` (spot V3) | sinon ; les raisons sont dans `quality.raisons` |

La qualification ne change ni la Favorabilité ni le rang : c'est un statut de vérification, que l'écran montre à part (§ 6.7). Un spot `a_verifier` n'entre jamais dans les trois cartes principales (§ 6.7.4).

## 2. Résultat (VÉRIFIÉ, recalculé par le test)

- **Corroborées : 5** (Pointe d'Agon, Pointe de Brézellec, Pointe de Dinan, Pointe de Mousterlin, Pointe de Penmarc'h).
- **À vérifier : 61.**
- **TOP_TIER : 0.** QUAL-2 manque partout. Des 10 sources qui corroborent ces cinq fiches, une seule a pu être lue (Le Figaro Nautisme, pour Penmarc'h) ; trois ont été cherchées sans succès (la V2 les cite sans adresse) et sont marquées `inaccessible`. On ne force pas la qualification : le niveau inférieur est retenu, avec sa raison.
- Réglementées, inaccessibles : 0. Aucune interdiction n'est confirmée au poste ; 18 fiches ont une règle locale ou une zone CIEM à vérifier.
- Correction en cours de route : une première version comptait les articles généraux et les guides de pêche en bateau (14, puis 9 fiches corroborées). La règle « la citation nomme le spot » ramène le total à 5 : par exemple, Granville reposait sur deux articles sur le courant et les plateaux rocheux en général.

Critères non remplis (nombre de fiches) : QUAL-1 59, QUAL-2 66, QUAL-3 15, QUAL-4 6, QUAL-5 9, QUAL-6 18, QUAL-7 1.

## 3. Limites

- La famille d'un éditeur est INFÉRÉE de sa nature (`data/sources/editeurs.json`) : une page faible d'un éditeur sérieux compte comme l'éditeur, tant qu'elle n'est pas lue. C'est la raison de QUAL-2.
- L'exclusion des citations « bateau » repose sur le texte de la citation V2, pas sur la page.
- 43 sources de mieuxpecher.com et de peche-poissons.com ne comptent pas : éditeurs non classés, aucune page retrouvée.

## 4. Détail par fiche

| Spot | Statut | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Embouchure de l'Aber Benoît | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Embouchure de l'Aber Ildut | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Pointe d'Agon | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de l'Armorique | à vérifier | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Barnénez – Dourduff | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Beg Meil | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe du Bendy | à vérifier | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Plage des Blancs-Sablons | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Brézellec | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| L'Hôpital-Camfrout | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Pointe du Cap Coz | à vérifier | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Carantec : Penn al Lann – Cosmeur | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cap de Carteret | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Corsen | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Dinan | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe des Espagnols | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Feunteun Aod | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Goury | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gouville-sur-Mer | à vérifier | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Embouchure du Goyen | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Granville | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Kerjean | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Kerlouan : Enez Amann ar Rouz | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Kermorvan | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Baie du Kernic | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Estuaire de la Laïta | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Landévennec | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Sillon de Lauberlac'h | à vérifier | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Leydé | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Locquirec : pointe et digue | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Pointe de Lostmarc'h | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe du Petit Minou | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Morgat | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Moulin Mer | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Pointe de Mousterlin | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Embouchure de l'Odet | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Aber Wrac'h : Paluden – pont du Diable | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Pointe de Roc'h Pelguent | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Pen-Hir | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Penhors | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Penmarc'h | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Penn Enez – Grève Blanche | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Plage de Pentrez | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Embouchure de la Penzé | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Pirou Plage | à vérifier | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Portbail | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Embouchures de l'Aven et du Bélon | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Pointe de Primel | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe du Raz | à vérifier | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Régnéville | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Rospico | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Rostiviec | à vérifier | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Concarneau : sud des Sables Blancs | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Dunes de Sainte-Marguerite | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Rochers de Saint-Guénolé | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Saint-Jean-du-Doigt | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Plage de Saint-Tugen | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Anse de Sciotot | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Surtainville | à vérifier | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Île de Térénez | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de la Torche | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Trénaouret | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Baie des Trépassés | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Trévignon | à vérifier | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Plage de Trez Bellec | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Van | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |

✓ critère rempli, ✗ non rempli ; le détail de chaque critère est dans `quality.criteres` de la fiche.
