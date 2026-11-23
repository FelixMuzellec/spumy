# Qualification des fiches de spots

Phase 5 V3, sous-tâche 5.9 (référentiel § 7.2 : « qualifier chaque fiche (candidate, à vérifier, corroborée, `TOP_TIER`, inaccessible, réglementée/interdite) selon des critères explicites »). 23 novembre 2026. Le script `scripts/qualifier-fiches.mjs` applique les critères ; `tests/spots-v3.mjs` recalcule chaque statut et vérifie que les critères bloquent ce qu'ils doivent bloquer.

## 1. Critères

| Critère | Exigence | Pourquoi |
| --- | --- | --- |
| QUAL-1 Intérêt halieutique corroboré | au moins **deux groupes d'indépendance** parmi les sources de la fiche : famille 1 à 4, éditeur dont le domaine couvre la pêche, source non privée, **citation qui nomme le spot**. Un article général (« les plateaux rocheux ») ne prouve rien d'un lieu ; une citation qui parle de pêche en bateau, de navigation, ou dit ne pas parler du bar ne compte pas pour un poste du bord. | § 7.1 : deux pages qui recopient la même source ne comptent pas double ; § 7.2 : l'intérêt pour l'espèce doit être documenté pour le mode |
| QUAL-2 Qualité des sources examinée | au moins **deux groupes d'indépendance parmi les sources lues et évaluées page par page** (§ 7.1), dont **au moins une attache le bar au poste** (affirmation exacte consignée) | § 7.2 : « deux sources réellement indépendantes […] dont la qualité est examinée » et « l'intérêt halieutique spécifique pour l'espèce ciblée » |
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
| `corroboree` | QUAL-1, QUAL-3 à QUAL-7 (corroborée par éditeurs indépendants, sans deux pages lues dont une sur le bar au poste) |
| `a_verifier` (spot V2) ou `candidate` (spot V3) | sinon ; les raisons sont dans `quality.raisons` |

La qualification ne change ni la Favorabilité ni le rang : c'est un statut de vérification, que l'écran montre à part (§ 6.7). Un spot `a_verifier` n'entre jamais dans les trois cartes principales (§ 6.7.4).

## 2. Résultat (VÉRIFIÉ, recalculé par le test ; mise à jour de la passe exhaustive, 23 nov. 2026, soir)

- **72 fiches** : les 66 de la V2 et 6 candidates nouvelles (§ 5).
- **TOP_TIER : 2** — Pointe de Mousterlin et Pointe de Penmarc'h. Deux éditeurs indépendants lus page par page ; carnet-de-peche.com attache le bar au poste (« réputé pour le bar et le congre » ; « le bar chasse dans le ressac »).
- **Corroborées : 7** — Pointe d'Agon, Pointe de Beg Meil, Plage des Blancs-Sablons, Pointe de Brézellec, Pointe de Dinan, Pointe de Kerjean, Rochers de Saint-Guénolé.
- **À vérifier : 57.** **Candidates : 6** (fiches nouvelles, sécurité à documenter).
- Réglementées, inaccessibles : 0.
- Historique : 14, puis 9, puis 5 corroborées avant la passe exhaustive (règles « la citation nomme le spot » et « pas de guide de pêche en bateau ») ; la lecture des listes de mieuxpecher.com (35 citations V2 vérifiées mot pour mot) et des fiches de carnet-de-peche.com a ajouté une voix indépendante à de nombreuses fiches.

Critères non remplis (nombre de fiches) : QUAL-1 52, QUAL-2 64, QUAL-3 15, QUAL-4 6, QUAL-5 15, QUAL-6 18, QUAL-7 0.

## 3. Limites

- La famille d'un éditeur est INFÉRÉE de sa nature (`data/sources/editeurs.json`) : une page faible d'un éditeur sérieux compte comme l'éditeur, tant qu'elle n'est pas lue. C'est la raison de QUAL-2.
- L'exclusion des citations « bateau » repose sur le texte de la citation V2, pas sur la page.
- peche-poissons.com (8 sources) reste non classé : aucune page relue. mieuxpecher.com est classé depuis la lecture de ses listes (famille 4 : listes sans méthode).

## 4. Détail par fiche

| Spot | Statut | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Embouchure de l'Aber Benoît | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Embouchure de l'Aber Ildut | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Pointe d'Agon | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de l'Armorique | à vérifier | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Barnénez – Dourduff | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Beg Meil | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe du Bendy | à vérifier | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Plage des Blancs-Sablons | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Brézellec | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| L'Hôpital-Camfrout | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Pointe du Cap Coz | à vérifier | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Cap Lévi | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Carantec : Penn al Lann – Cosmeur | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cap de Carteret | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe du Conguel | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Corsen | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Dinan | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe des Espagnols | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Feunteun Aod | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Goury | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gouville-sur-Mer | à vérifier | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Embouchure du Goyen | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Granville | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Kerjean | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Kerlouan : Enez Amann ar Rouz | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Kermorvan | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Baie du Kernic | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Estuaire de la Laïta | à vérifier | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Landévennec | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Sillon de Lauberlac'h | à vérifier | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Leydé | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Locquirec : pointe et digue | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Pointe de Lostmarc'h | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe du Petit Minou | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Morgat | à vérifier | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Moulin Mer | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Mousterlin | **TOP_TIER** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Embouchure de l'Odet | à vérifier | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Aber Wrac'h : Paluden – pont du Diable | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Pointe de Roc'h Pelguent | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Pen-Hir | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Penhors | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Penmarc'h | **TOP_TIER** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Penn Enez – Grève Blanche | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Plage de Pentrez | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Embouchure de la Penzé | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Pointe du Percho | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pirou Plage | à vérifier | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Pointe du Château (Plougrescant) | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Portbail | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Embouchures de l'Aven et du Bélon | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Pointe de Primel | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe et digue de Querqueville | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Raz | à vérifier | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Régnéville | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Rospico | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Rostiviec | à vérifier | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Concarneau : sud des Sables Blancs | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Saint-Colomban | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Dunes de Sainte-Marguerite | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Rochers de Saint-Guénolé | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
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

## 5. Fiches nouvelles (5.12)

Postes des zones sans fiche nommés par deux éditeurs indépendants dans des pages lues ; position du toponyme officiel de l'IGN, choisi à la main (`data/spots/candidats-v3.json`) ; stationnement, marche, risques et photos collectés comme pour les autres. Statut `candidate` : aucune consigne de sécurité ni engagement documentés (QUAL-5).

| Fiche | Zone (repère d'audit) | Éditeurs | Bar au poste |
| --- | --- | --- | --- |
| Pointe du Percho | Morbihan | mieuxpecher.com, carnet-de-peche.com | oui (« lieu jaune et gros bars ») |
| Pointe du Conguel | Morbihan | mieuxpecher.com, carnet-de-peche.com | oui (liste des spots à bar) |
| Pointe de Saint-Colomban | Morbihan | mieuxpecher.com, carnet-de-peche.com | oui (liste des spots à bar) |
| Pointe du Château (Plougrescant) | Côtes-d'Armor | mieuxpecher.com, carnet-de-peche.com | oui (liste, espèce bar) |
| Pointe et digue de Querqueville | Manche nord | mieuxpecher.com, carnet-de-peche.com | non (cité pour le lieu noir) |
| Cap Lévi | Manche nord-est | mieuxpecher.com, lechasseursousmarin.com (Decathlon) | oui (« Pour les bars, on attend plutôt que la marée remonte ») |

Ille-et-Vilaine : un seul éditeur (liste mieuxpecher.com) nomme des postes ; aucun second éditeur retrouvé : aucune fiche.
