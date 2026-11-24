# Qualification des fiches de spots

Phase 5 V3, sous-tâches 5.9, 5.12 et 5.13, revue contradictoire du 24 nov. 2026 (référentiel § 7.2 : « qualifier chaque fiche (candidate, à vérifier, corroborée, `TOP_TIER`, inaccessible, réglementée/interdite) selon des critères explicites »). 23 novembre 2026. Le script `scripts/qualifier-fiches.mjs` applique les critères ; `tests/spots-v3.mjs` recalcule chaque statut et vérifie que les critères bloquent ce qu'ils doivent bloquer.

## 1. Critères

| Critère | Exigence | Pourquoi |
| --- | --- | --- |
| QUAL-1 Intérêt halieutique corroboré | au moins **deux groupes d'indépendance** parmi les sources de la fiche : famille 1 à 4, éditeur dont le domaine couvre la pêche ou la présence d'espèces, source non privée et non « hors pêche » (patrimoine, tourisme), **citation qui nomme le poste**. Le nom de la commune seul ne nomme pas le poste (« Saint-Vaast-la-Hougue » ne nomme pas « la Hougue »). Un article général ne prouve rien d'un lieu ; une citation qui parle de pêche en bateau ou de navigation ne compte pas pour un poste du bord. | § 7.1 : deux pages qui recopient la même source ne comptent pas double ; § 7.2 : l'intérêt pour l'espèce doit être documenté pour le mode |
| QUAL-2 Qualité des sources examinée | au moins **deux groupes d'indépendance parmi les sources évaluées** (§ 7.1 : page entière ou extrait du moteur de recherche, mode consigné dans `lecture`), dont **au moins une source de pêche (domaine « halieutique ») attache le bar au poste**. Une zone de chasse sous-marine compte comme groupe lu, mais n'attache pas le bar pour la pêche du bord. | § 7.2 : « deux sources réellement indépendantes […] dont la qualité est examinée » et « l'intérêt halieutique spécifique pour l'espèce ciblée », documenté pour le mode |
| QUAL-3 Position contrôlée | position corrigée sur un toponyme officiel naturel, ou toponyme officiel naturel de même nom (cap, pointe, plage, île, rocher, détail orographique ou hydrographique…) à 1,5 km au plus, sans anomalie de position ; un village, un quartier, un camping, un port, un bâtiment ou un équipement ne situe pas le poste | un poste mal placé fausse l'accès, la marée et la sécurité |
| QUAL-4 Accès documenté | stationnement et temps de marche connus (IGN) | § 7.2, étape 9 |
| QUAL-5 Sécurité documentée | engagement connu (échelle SPUMY 1 à 3 : un jugement), **au moins une consigne de source externe** (pas la seule « fiche du spot » ni la « prudence du guide »), **contrainte de marée documentée** (jamais INCONNU), mouvements de terrain consultés | § 0.2 : la sécurité ne se compense jamais ; une donnée inconnue n'est jamais « au vert » |
| QUAL-6 Réglementation claire | règles locales du département recherchées dans un texte officiel lu ; aucune règle locale dont l'application au poste reste « à vérifier » ; zone CIEM certaine | une interdiction possible n'est jamais « au vert » ; sans recherche, l'absence de règle ne prouve rien |
| QUAL-7 Pas de source privée | la fiche ne cite pas le journal personnel de Félix | données privées hors des fiches publiques |

| Statut | Règle |
| --- | --- |
| `reglementee` | une règle confirmée interdit la pêche au poste |
| `inaccessible` | accès fermé, vérifié |
| `TOP_TIER` | QUAL-1 à QUAL-7 |
| `corroboree` | QUAL-1, QUAL-3 à QUAL-7 (corroborée par éditeurs indépendants, sans deux sources évaluées dont une source de pêche attache le bar au poste) |
| `a_verifier` (spot V2) ou `candidate` (spot V3) | sinon ; les raisons sont dans `quality.raisons` |

La qualification ne change ni la Favorabilité ni le rang : c'est un statut de vérification, que l'écran montre à part (§ 6.7). Un spot `a_verifier` n'entre jamais dans les trois cartes principales (§ 6.7.4).

## 2. Résultat (VÉRIFIÉ, recalculé par le test ; après la revue contradictoire du 24 nov. 2026)

- **98 fiches** : les 66 de la V2 et 32 candidates nouvelles (§ 5 et § 6).
- **TOP_TIER : 2** — Pointe de Mousterlin, Pointe de Penmarc'h.
- **Corroborée : 1** — Dunes de Sainte-Marguerite (bar attesté par la seule chasse sous-marine : QUAL-2 non rempli).
- **À vérifier : 63.** **Candidates : 32.** Réglementées : 0 ; inaccessibles : 0.
- Critères non remplis (nombre de fiches) : QUAL-1 50, QUAL-2 80, QUAL-3 22, QUAL-4 7, QUAL-5 80, QUAL-6 35, QUAL-7 0.

**Ce que la revue contradictoire a changé.** Avant elle, 6 TOP_TIER et 4 corroborées. Un relecteur séparé, qui n'avait pas produit le travail, a montré que QUAL-5 acceptait une contrainte de marée INCONNU, que quatre TOP_TIER tenaient le bar d'une seule zone de chasse sous-marine, qu'un contrôle de position par un village passait QUAL-3 (Saint-Guénolé) et que le nom d'une commune pouvait nommer un poste (Saint-Vaast-la-Hougue). Les règles sont corrigées et testées ; Brézellec, Corsen et Dinan redeviennent « à vérifier » (marée non documentée), Sainte-Marguerite reste corroborée. La présence du bar marquée « VÉRIFIÉ » par la V2, sans date ni page, a été confrontée aux pages lues : 3 fiches confirmées et sourcées (Cap Coz, Mousterlin, Penmarc'h), 46 ramenées à INFÉRÉ.

## 3. Limites

- La famille d'un éditeur est INFÉRÉE de sa nature (`data/sources/editeurs.json`) : une page faible d'un éditeur sérieux compte comme l'éditeur, tant qu'elle n'est pas lue. C'est la raison de QUAL-2.
- L'exclusion des citations « bateau » repose sur le texte de la citation V2, pas sur la page.
- peche-poissons.com (8 sources) reste non classé : aucune page relue. mieuxpecher.com est classé depuis la lecture de ses listes (famille 4 : listes sans méthode).
- **Chasse sous-marine** : lechasseursousmarin.com (famille 4, domaines « présence d'espèces » et « fonds ») décrit des zones parcourues à la palme depuis le bord. Il atteste la présence du bar sous l'eau, pas la pêche au leurre depuis la côte. Depuis la revue contradictoire, une zone de chasse sous-marine compte comme groupe lu mais n'attache plus le bar au poste (QUAL-2). Seule l'introduction publique des zones est lue ; le détail réservé aux abonnés ne l'est pas.
- Les éditeurs famille 6 (agrégateurs, sites généralistes ou anonymes : bretagne-peche-et-nature.fr, a-babord.com, fluxdeconnaissances.com, generationvoyage.fr) ne comptent jamais comme une voix indépendante.
- Les zones de lechasseursousmarin.com et les fiches de carnet-de-peche.com sont souvent évaluées sur l'extrait renvoyé par le moteur de recherche (carnet-de-peche.com refuse la lecture directe) : le mode de lecture est consigné source par source.
- L'engagement (1 facile, 2 modéré, 3 engagé) reste le jugement de la V2 : QUAL-5 l'exige connu et appuyé par une consigne de source externe, sans le tenir pour une donnée sourcée. À revoir en phase 8 (validation par Félix des jugements de sécurité).
- `bar_au_poste` est porté par la source, pas par chaque couple source-poste : une page qui cite plusieurs postes l'attache à tous. Sans effet sur les statuts actuels, la règle de QUAL-2 n'acceptant que des sources de pêche.
- Une consigne V2 dont le texte de source nomme un éditeur famille 6 (fishipedia.fr, Wikipédia) compte encore comme consigne externe : le texte libre de la V2 n'est pas relié au registre. Les trois fiches de tête ont au moins une consigne d'un éditeur famille 2 à 4.
- Mousterlin tient son TOP_TIER d'un extrait de carnet-de-peche.com (bar et platier qui découvre), que le site ne laisse pas relire directement ; Penmarc'h a été revérifié en ligne par le relecteur.

## 4. Détail par fiche

| Spot | Statut | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Aber Wrac'h : Paluden – pont du Diable | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Anse de Gattemare | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Anse de Sciotot | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Baie des Trépassés | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Baie du Kernic | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| Barnénez – Dourduff | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Belle-Île : pointe des Poulains | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Bréhec | candidate | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Cap de Carteret | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Cap Fréhel | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Cap Lévi | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Carantec : Penn al Lann – Cosmeur | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Concarneau : sud des Sables Blancs | à vérifier | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Cosqueville : pointe de la Loge | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Dunes de Sainte-Marguerite | **corroborée** | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Embouchure de l'Aber Benoît | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Embouchure de l'Aber Ildut | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Embouchure de l'Odet | à vérifier | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Embouchure de la Penzé | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Embouchure du Goyen | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Embouchures de l'Aven et du Bélon | à vérifier | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Estuaire de la Laïta | à vérifier | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Feunteun Aod | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Goury | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Gouville-sur-Mer | à vérifier | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| Granville | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Groix : pointe des Chats | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Kerlouan : Enez Amann ar Rouz | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| L'Hôpital-Camfrout | à vérifier | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Landévennec | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Larmor-Plage : Toulhars | candidate | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Locquirec : pointe et digue | à vérifier | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Moulin Mer | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Moëlan-sur-Mer : embouchure du Merrien | candidate | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Penhors | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Penn Enez – Grève Blanche | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Phare de Gatteville | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Pirou Plage | à vérifier | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Plage de Pentrez | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Plage de Saint-Tugen | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Plage de Trez Bellec | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Plage des Blancs-Sablons | à vérifier | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Plage des Rosaires et pointe de Pordic | candidate | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Plouha : Gwin Zégal | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Plévenon : pointe de la Latte | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe d'Agon | à vérifier | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Pointe de Beg an Fry | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Beg en Aud | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Beg Meil | à vérifier | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Bihit | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Brézellec | à vérifier | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Corsen | à vérifier | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Dinan | à vérifier | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Kerjean | à vérifier | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Kermorvan | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de l'Armorique | à vérifier | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Pointe de la Moulière | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de la Torche | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de la Varde | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Leydé | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Lostmarc'h | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Morgat | à vérifier | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Pointe de Mousterlin | **TOP_TIER** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Pen-Hir | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Penmarc'h | **TOP_TIER** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pointe de Perhérel | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Primel | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Roc'h Pelguent | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Rospico | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Saint-Colomban | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Saire | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Pointe de Séhar | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Trénaouret | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe de Trévignon | à vérifier | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Pointe des Espagnols | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Bec de Vir | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Bendy | à vérifier | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Pointe du Cap Coz | à vérifier | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ |
| Pointe du Château (Plougrescant) | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Conguel | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Décollé | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Meinga | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Percho | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Petit Minou | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe du Raz | à vérifier | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Pointe du Van | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Pointe et digue de Querqueville | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Portbail | à vérifier | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Rochers de Saint-Guénolé | à vérifier | ✓ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Rostiviec | à vérifier | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| Régnéville | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Saint-Jean-du-Doigt | à vérifier | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Saint-Malo : Grand Bé et Petit Bé | candidate | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Saint-Vaast-la-Hougue : île Tatihou | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Sillon de Lauberlac'h | à vérifier | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Surtainville | à vérifier | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Île de Térénez | à vérifier | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Île Percée (Moëlan-sur-Mer) | candidate | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |

✓ critère rempli, ✗ non rempli ; le détail de chaque critère est dans `quality.criteres` de la fiche.

## 5. Fiches nouvelles (5.12)

Postes des zones sans fiche nommés par deux éditeurs indépendants dans des pages lues ; position du toponyme officiel de l'IGN, choisi à la main (`data/spots/candidats-v3.json`) ; stationnement, marche, risques et photos collectés comme pour les autres. Statut `candidate` : aucune consigne de sécurité ni engagement documentés (QUAL-5).

| Fiche | Zone (repère d'audit) | Éditeurs | Bar au poste |
| --- | --- | --- | --- |
| Pointe du Percho | Morbihan | mieuxpecher.com, carnet-de-peche.com | oui (« lieu jaune et gros bars ») |
| Pointe du Conguel | Morbihan | mieuxpecher.com, carnet-de-peche.com | oui (liste des spots à bar) |
| Pointe de Saint-Colomban | Morbihan | mieuxpecher.com, carnet-de-peche.com | oui (liste des spots à bar) |
| Pointe du Château (Plougrescant) | Côtes-d'Armor | mieuxpecher.com, carnet-de-peche.com | oui (liste, espèce bar) |
| Pointe et digue de Querqueville | Manche nord | mieuxpecher.com, carnet-de-peche.com (puis lechasseursousmarin.com, 5.13) | non par une source de pêche (carnet : lieu noir) ; la zone de chasse sous-marine cite le bar |
| Cap Lévi | Manche nord-est | mieuxpecher.com, lechasseursousmarin.com (Decathlon) | non par une source de pêche ; la sélection de chasse sous-marine cite le bar (« Pour les bars, on attend plutôt que la marée remonte ») |

Ille-et-Vilaine : en 5.12, un seul éditeur (liste mieuxpecher.com) ; en 5.13, cinq postes ont trouvé leur second éditeur (§ 6).

## 6. Fiches nouvelles (5.13, passe forums et listes complètes)

Même règle d'entrée qu'en 5.12 : deux éditeurs indépendants nomment le poste dans des pages évaluées, selon la règle de nommage stricte ; position du toponyme officiel de l'IGN choisi à la main (`data/spots/candidats-v3.json`) ; accès IGN, risques Géorisques et photos libres collectés par la CI (passage 45281418941). Une position sur un lieu habité ou un équipement de loisirs est une anomalie (QUAL-3 non rempli).

| Fiche | Statut | Éditeurs indépendants | Bar au poste par une source de pêche lue |
| --- | --- | --- | --- |
| Pointe de Beg en Aud | candidate | carnet-de-peche.com, lechasseursousmarin.com | oui : « Pointe de Beg en Aud POINTE ROCHEUSE · BAR » |
| Larmor-Plage : Toulhars | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « Plage de Toulhars · Bar » (liste des spots du Morbihan) |
| Pointe de Bihit | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « Pointe de Bihit · Bar » |
| Bréhec | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « Plage de Bréhec · Bar » |
| Cap Fréhel | candidate | mieuxpecher.com, carnet-de-peche.com | non |
| Anse de Gattemare | candidate | mieuxpecher.com, pechemercotentin.forumactif.org | non |
| Saint-Malo : Grand Bé et Petit Bé | candidate | mieuxpecher.com, oupecher.fr | oui : « La pêche du bar est assez prolifique depuis Grand Bé et Petit Bé » |
| Plage des Rosaires et pointe de Pordic | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « Plage des Rosaires · Bar » |
| Pointe de Perhérel | candidate | mieuxpecher.com, carnet-de-peche.com | oui : « le bar longe les bordures à la montante » |
| Île Percée (Moëlan-sur-Mer) | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Pointe du Meinga | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Pointe de la Moulière | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Pointe du Décollé | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Pointe de la Varde | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Pointe du Bec de Vir | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Plévenon : pointe de la Latte | candidate | carnet-de-peche.com, lechasseursousmarin.com | oui : « Pointe de la Latte 6.1 km · Bar » |
| Plouha : Gwin Zégal | candidate | carnet-de-peche.com, lechasseursousmarin.com | oui : « Port de Gwin Zégal 2.5 km · Bar » |
| Pointe de Séhar | candidate | carnet-de-peche.com, lechasseursousmarin.com | oui : « Pointe de Séhar Bar » |
| Groix : pointe des Chats | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Belle-Île : pointe des Poulains | candidate | carnet-de-peche.com, lechasseursousmarin.com | oui : « Belle-Île, Pointe des Poulains » : « Spot mythique pour le bar au leurre de surface en été » |
| Moëlan-sur-Mer : embouchure du Merrien | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Pointe de Beg an Fry | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Pointe de Saire | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Cosqueville : pointe de la Loge | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Phare de Gatteville | candidate | mieuxpecher.com, lechasseursousmarin.com | non |
| Saint-Vaast-la-Hougue : île Tatihou | candidate | mieuxpecher.com, lechasseursousmarin.com | non |

**Non retenus** (règle d'entrée non démontrée, aucune fiche) : Pointe du Dourven — mieuxpecher.com écrit « Pointe du Dourvin » ; selon la règle de nommage stricte, un seul éditeur de pêche (carnet-de-peche.com) nomme le poste. Fiche retirée ; même règle que la pointe de la Garde Guérin (« Guarde »). ; Saint-Vaast-la-Hougue : la Hougue — mieuxpecher.com dit « Tour Vauban près des parcs » sans nommer la Hougue (deux tours Vauban : la Hougue et Tatihou) et le forum dit « St Vaast » ; seul carnet-de-peche.com nomme la digue de la Hougue. Fiche retirée.

**Sans position IGN, donc sans fiche** : Pointe du Berchis, Étel : embouchure et estuaire, Anse des Sévignés, Pointe de Penvins, Pointe de Néville. Le Grand Bé et le Petit Bé ont une contrainte de marée sourcée (office de tourisme de Saint-Malo, blog du pêcheur, presse) ; leur fenêtre reste INCONNU, la durée lue sur la page de l'office étant mal affichée.
