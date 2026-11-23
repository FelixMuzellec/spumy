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

## 2. Résultat (VÉRIFIÉ, recalculé par le test ; passe forums et listes complètes, 5.13, 23-24 nov. 2026)

- **100 fiches** : les 66 de la V2 et 34 candidates nouvelles (§ 5 et § 6).
- **TOP_TIER : 6** — Dunes de Sainte-Marguerite, Pointe de Brézellec, Pointe de Corsen, Pointe de Dinan, Pointe de Mousterlin, Pointe de Penmarc'h. Deux éditeurs indépendants lus page par page, dont au moins un attache le bar au poste. Pour Brézellec, Corsen, Dinan et Sainte-Marguerite, c'est une zone de chasse sous-marine (lechasseursousmarin.com) qui l'attache : voir la limite du § 3.
- **Corroborées : 4** — Plage des Blancs-Sablons, Pointe de Beg Meil, Pointe de Kerjean, Rochers de Saint-Guénolé.
- **À vérifier : 56.** **Candidates : 34** (fiches nouvelles : sécurité, engagement ou position encore à documenter).
- Réglementées, inaccessibles : 0, 0.
- Historique : 2 TOP_TIER et 7 corroborées à la fin de la passe exhaustive (5.12) ; la passe 5.13 a ajouté une troisième famille d'éditeurs indépendants (zones de chasse sous-marine), un blog de première main (oupecher.fr) et un office de tourisme.

Critères non remplis (nombre de fiches) : QUAL-1 51, QUAL-2 64, QUAL-3 19, QUAL-4 7, QUAL-5 43, QUAL-6 36, QUAL-7 0.

## 3. Limites

- La famille d'un éditeur est INFÉRÉE de sa nature (`data/sources/editeurs.json`) : une page faible d'un éditeur sérieux compte comme l'éditeur, tant qu'elle n'est pas lue. C'est la raison de QUAL-2.
- L'exclusion des citations « bateau » repose sur le texte de la citation V2, pas sur la page.
- peche-poissons.com (8 sources) reste non classé : aucune page relue. mieuxpecher.com est classé depuis la lecture de ses listes (famille 4 : listes sans méthode).
- **Chasse sous-marine** : lechasseursousmarin.com (famille 4, domaines « présence d'espèces » et « fonds ») décrit des zones parcourues à la palme depuis le bord. Il atteste la présence du bar sous l'eau, pas la pêche au leurre depuis la côte. Quatre TOP_TIER en dépendent pour le bar au poste : c'est un point à challenger en phase 7 (revue contradictoire des TOP_TIER) et en phase 8. Seule l'introduction publique des zones est lue ; le détail réservé aux abonnés ne l'est pas.
- Les éditeurs famille 6 (agrégateurs, sites généralistes ou anonymes : bretagne-peche-et-nature.fr, a-babord.com, fluxdeconnaissances.com, generationvoyage.fr) ne comptent jamais comme une voix indépendante.
- **Chasse sous-marine** : lechasseursousmarin.com (famille 4, domaines « présence d'espèces » et « fonds ») décrit des zones parcourues à la palme depuis le bord. Il atteste la présence du bar sous l'eau, pas la pêche au leurre depuis la côte. Quatre TOP_TIER en dépendent pour le bar au poste : c'est un point à challenger en phase 7 (revue contradictoire des TOP_TIER) et en phase 8. Seule l'introduction publique des zones est lue ; le détail réservé aux abonnés ne l'est pas.
- Les éditeurs famille 6 (agrégateurs, sites généralistes ou anonymes : bretagne-peche-et-nature.fr, a-babord.com, fluxdeconnaissances.com, generationvoyage.fr) ne comptent jamais comme une voix indépendante.

## 4. Détail par fiche

| Spot | Statut | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Aber Wrac'h : Paluden – pont du Diable | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Anse de Gattemare | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Anse de Sciotot | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Baie des Trépassés | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Baie du Kernic | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Barnénez – Dourduff | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Belle-Île : pointe des Poulains | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Bréhec | candidate | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Cap de Carteret | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Cap Fréhel | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Cap Lévi | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Carantec : Penn al Lann – Cosmeur | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Concarneau : sud des Sables Blancs | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Cosqueville : pointe de la Loge | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Dunes de Sainte-Marguerite | **TOP_TIER** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Embouchure de l'Aber Benoît | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Embouchure de l'Aber Ildut | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Embouchure de l'Odet | à vérifier | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Embouchure de la Penzé | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Embouchure du Goyen | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Embouchures de l'Aven et du Bélon | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Estuaire de la Laïta | à vérifier | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Feunteun Aod | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Goury | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Gouville-sur-Mer | à vérifier | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| Granville | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Groix : pointe des Chats | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Kerlouan : Enez Amann ar Rouz | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| L'Hôpital-Camfrout | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Landévennec | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Larmor-Plage : Toulhars | candidate | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Locquirec : pointe et digue | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Moulin Mer | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Moëlan-sur-Mer : embouchure du Merrien | candidate | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Penhors | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Penn Enez – Grève Blanche | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Phare de Gatteville | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Pirou Plage | à vérifier | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| Plage de Pentrez | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Plage de Saint-Tugen | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Plage de Trez Bellec | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Plage des Blancs-Sablons | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Plage des Rosaires et pointe de Pordic | candidate | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Plouha : Gwin Zégal | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Plévenon : pointe de la Latte | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe d'Agon | à vérifier | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Pointe de Beg an Fry | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Beg en Aud | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Beg Meil | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Bihit | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Brézellec | **TOP_TIER** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Corsen | **TOP_TIER** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Dinan | **TOP_TIER** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Kerjean | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Kermorvan | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de l'Armorique | à vérifier | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Pointe de la Moulière | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de la Torche | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de la Varde | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Leydé | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Lostmarc'h | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Morgat | à vérifier | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Pointe de Mousterlin | **TOP_TIER** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Pen-Hir | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Penmarc'h | **TOP_TIER** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Perhérel | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Primel | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Roc'h Pelguent | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Rospico | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Saint-Colomban | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Saire | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Pointe de Séhar | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Trénaouret | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Trévignon | à vérifier | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Pointe des Espagnols | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe du Bec de Vir | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Bendy | à vérifier | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Pointe du Cap Coz | à vérifier | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Pointe du Château (Plougrescant) | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Conguel | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Dourven | candidate | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Décollé | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Meinga | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Percho | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Petit Minou | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe du Raz | à vérifier | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Pointe du Van | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe et digue de Querqueville | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Portbail | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Rochers de Saint-Guénolé | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Rostiviec | à vérifier | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Régnéville | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Saint-Jean-du-Doigt | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Saint-Malo : Grand Bé et Petit Bé | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Saint-Vaast-la-Hougue : la Hougue | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Saint-Vaast-la-Hougue : île Tatihou | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Sillon de Lauberlac'h | à vérifier | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Surtainville | à vérifier | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| Île de Térénez | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Île Percée (Moëlan-sur-Mer) | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |

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

## 6. Fiches nouvelles (5.13, passe forums et listes complètes)

Même règle d'entrée qu'en 5.12 : deux éditeurs indépendants nomment le poste dans des pages lues ; position du toponyme officiel de l'IGN choisi à la main (`data/spots/candidats-v3.json`) ; accès IGN, risques Géorisques et photos libres collectés par la CI (passage 45281418941). Une position sur un lieu habité ou un équipement de loisirs est une anomalie (QUAL-3 non rempli).

| Fiche | Statut | Éditeurs indépendants | Bar au poste (source lue) |
| --- | --- | --- | --- |
| Pointe de Beg en Aud | candidate | carnet-de-peche.com, lechasseursousmarin.com | oui : « Pointe de Beg en Aud POINTE ROCHEUSE · BAR » |
| Larmor-Plage : Toulhars | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « Plage de Toulhars · Bar » (liste des spots du Morbihan) |
| Pointe de Bihit | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « Pointe de Bihit · Bar » |
| Bréhec | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « Plage de Bréhec · Bar » |
| Cap Fréhel | candidate | mieuxpecher.com, carnet-de-peche.com | non |
| Saint-Vaast-la-Hougue : la Hougue | candidate | mieuxpecher.com, carnet-de-peche.com, pechemercotentin.forumactif.org | oui : « Saint-Vaast-la-Hougue — digue de la Hougue DIGUE · BAR » |
| Anse de Gattemare | candidate | mieuxpecher.com, pechemercotentin.forumactif.org | non |
| Saint-Malo : Grand Bé et Petit Bé | candidate | mieuxpecher.com, oupecher.fr | oui : « La pêche du bar est assez prolifique depuis Grand Bé et Petit Bé » |
| Plage des Rosaires et pointe de Pordic | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « Plage des Rosaires · Bar » |
| Pointe du Dourven | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « Pointe du Dourven · Bar » |
| Pointe de Perhérel | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « le bar longe les bordures à la montante » |
| Île Percée (Moëlan-sur-Mer) | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « On y croise de très gros bars à basse mer » (île Percée, chasse sous-marine) |
| Pointe du Meinga | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « Cette avancée rocheuse s'élance sur 900 m » ; la zone « permet une pêche sportive de bars, mulets, lieus jaunes et vieilles dans le courant » |
| Pointe de la Moulière | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « Tentez aussi des agachons pour attirer des bars, mulets ou lieus jaunes en maraude » |
| Pointe du Décollé | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Pointe de la Varde | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Pointe du Bec de Vir | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « Côté chasse, les bars et les mulets sont les plus présents » |
| Plévenon : pointe de la Latte | candidate | carnet-de-peche.com, lechasseursousmarin.com | oui : « Pointe de la Latte 6.1 km · Bar » |
| Plouha : Gwin Zégal | candidate | carnet-de-peche.com, lechasseursousmarin.com | oui : « Port de Gwin Zégal 2.5 km · Bar » |
| Pointe de Séhar | candidate | carnet-de-peche.com, lechasseursousmarin.com | oui : « Pointe de Séhar Bar » |
| Groix : pointe des Chats | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « Des agachons, permettront, autour de la cardinale de la pointe ainsi qu'au retour, une pêche de poissons (bars, mulets, vieilles…) » |
| Belle-Île : pointe des Poulains | candidate | carnet-de-peche.com, lechasseursousmarin.com | oui : « Belle-Île, Pointe des Poulains » : « Spot mythique pour le bar au leurre de surface en été » |
| Moëlan-sur-Mer : embouchure du Merrien | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « à l'embouchure de la rivière de Merrien » ; « Commencez à pêcher dès la pointe en 1 : bars, vieilles, plies peuvent être rencontrés » |
| Pointe de Beg an Fry | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Pointe de Saire | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « Baigné par un courant de marée, c'est une zone de chasse pour les bars et mulets » |
| Cosqueville : pointe de la Loge | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « un éperon rocheux (la pointe de la Loge) » ; « propice à la rencontre d'espèces diverses : bars, mulets, vieilles » |
| Phare de Gatteville | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « du poisson blanc qui circule beaucoup : bar, mulet, lieu jaune et même maquereau ! » |
| Saint-Vaast-la-Hougue : île Tatihou | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « Cette zone alternant roches, moulières et sable est propice à la rencontre de bars » ; le parcours part de la cale de la pointe de Jonville |

Sans position IGN, donc sans fiche (`sans_position`) : anse des Sévignés, pointe de Penvins, pointe de Néville, pointe du Berchis, embouchure d'Étel. Le Grand Bé et le Petit Bé ont une contrainte de marée sourcée (office de tourisme de Saint-Malo, blog du pêcheur, presse) ; leur fenêtre reste INCONNU : la durée lue sur la page de l'office est mal affichée.

## 6. Fiches nouvelles (5.13, passe forums et listes complètes)

Même règle d'entrée qu'en 5.12 : deux éditeurs indépendants nomment le poste dans des pages lues ; position du toponyme officiel de l'IGN choisi à la main (`data/spots/candidats-v3.json`) ; accès IGN, risques Géorisques et photos libres collectés par la CI (passage 45281418941). Une position sur un lieu habité ou un équipement de loisirs est une anomalie (QUAL-3 non rempli).

| Fiche | Statut | Éditeurs indépendants | Bar au poste (source lue) |
| --- | --- | --- | --- |
| Pointe de Beg en Aud | candidate | carnet-de-peche.com, lechasseursousmarin.com | oui : « Pointe de Beg en Aud POINTE ROCHEUSE · BAR » |
| Larmor-Plage : Toulhars | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « Plage de Toulhars · Bar » (liste des spots du Morbihan) |
| Pointe de Bihit | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « Pointe de Bihit · Bar » |
| Bréhec | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « Plage de Bréhec · Bar » |
| Cap Fréhel | candidate | mieuxpecher.com, carnet-de-peche.com | non |
| Saint-Vaast-la-Hougue : la Hougue | candidate | mieuxpecher.com, carnet-de-peche.com, pechemercotentin.forumactif.org | oui : « Saint-Vaast-la-Hougue — digue de la Hougue DIGUE · BAR » |
| Anse de Gattemare | candidate | mieuxpecher.com, pechemercotentin.forumactif.org | non |
| Saint-Malo : Grand Bé et Petit Bé | candidate | mieuxpecher.com, oupecher.fr | oui : « La pêche du bar est assez prolifique depuis Grand Bé et Petit Bé » |
| Plage des Rosaires et pointe de Pordic | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « Plage des Rosaires · Bar » |
| Pointe du Dourven | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « Pointe du Dourven · Bar » |
| Pointe de Perhérel | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « le bar longe les bordures à la montante » |
| Île Percée (Moëlan-sur-Mer) | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « On y croise de très gros bars à basse mer » (île Percée, chasse sous-marine) |
| Pointe du Meinga | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « Cette avancée rocheuse s'élance sur 900 m » ; la zone « permet une pêche sportive de bars, mulets, lieus jaunes et vieilles dans le courant » |
| Pointe de la Moulière | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « Tentez aussi des agachons pour attirer des bars, mulets ou lieus jaunes en maraude » |
| Pointe du Décollé | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Pointe de la Varde | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Pointe du Bec de Vir | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « Côté chasse, les bars et les mulets sont les plus présents » |
| Plévenon : pointe de la Latte | candidate | carnet-de-peche.com, lechasseursousmarin.com | oui : « Pointe de la Latte 6.1 km · Bar » |
| Plouha : Gwin Zégal | candidate | carnet-de-peche.com, lechasseursousmarin.com | oui : « Port de Gwin Zégal 2.5 km · Bar » |
| Pointe de Séhar | candidate | carnet-de-peche.com, lechasseursousmarin.com | oui : « Pointe de Séhar Bar » |
| Groix : pointe des Chats | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « Des agachons, permettront, autour de la cardinale de la pointe ainsi qu'au retour, une pêche de poissons (bars, mulets, vieilles…) » |
| Belle-Île : pointe des Poulains | candidate | carnet-de-peche.com, lechasseursousmarin.com | oui : « Belle-Île, Pointe des Poulains » : « Spot mythique pour le bar au leurre de surface en été » |
| Moëlan-sur-Mer : embouchure du Merrien | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « à l'embouchure de la rivière de Merrien » ; « Commencez à pêcher dès la pointe en 1 : bars, vieilles, plies peuvent être rencontrés » |
| Pointe de Beg an Fry | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Pointe de Saire | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « Baigné par un courant de marée, c'est une zone de chasse pour les bars et mulets » |
| Cosqueville : pointe de la Loge | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « un éperon rocheux (la pointe de la Loge) » ; « propice à la rencontre d'espèces diverses : bars, mulets, vieilles » |
| Phare de Gatteville | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « du poisson blanc qui circule beaucoup : bar, mulet, lieu jaune et même maquereau ! » |
| Saint-Vaast-la-Hougue : île Tatihou | candidate | mieuxpecher.com, lechasseursousmarin.com | oui : « Cette zone alternant roches, moulières et sable est propice à la rencontre de bars » ; le parcours part de la cale de la pointe de Jonville |

Sans position IGN, donc sans fiche (`sans_position`) : anse des Sévignés, pointe de Penvins, pointe de Néville, pointe du Berchis, embouchure d'Étel. Le Grand Bé et le Petit Bé ont une contrainte de marée sourcée (office de tourisme de Saint-Malo, blog du pêcheur, presse) ; leur fenêtre reste INCONNU : la durée lue sur la page de l'office est mal affichée.
