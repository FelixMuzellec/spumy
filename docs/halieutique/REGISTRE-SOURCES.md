# Registre des sources

Phase 5 V3, livrable 4, sous-tâche 5.4. Les données sont dans `data/sources/registre.json`, généré par `scripts/sources-registre.mjs` et contrôlé par `tests/spots-v3.mjs`. 23 novembre 2026.

## 1. Ce que contient le registre

Le registre rassemble deux origines :
- les sources V2 citées par les 66 fiches de spots (`provenance.sources_v2`, texte exact) ;
- les sources des connaissances BORD et BATEAU (`data/knowledge/`, avec référence, adresse et niveau).

| Mesure | Valeur (VÉRIFIÉ, registre du 23 nov.) |
| --- | --- |
| Sources distinctes | **284** |
| Éditeurs | 95, dont 46 cités une seule fois |
| Avec une adresse | 40, presque toutes issues des connaissances : les sources des fiches V2 sont des textes sans lien |
| Évaluées selon le § 7.1 | **0** : toutes « à évaluer » |
| Répartition | sites, guides et presse spécialisée 221 ; institutionnel ou scientifique 23 ; collectivités et tourisme 19 ; encyclopédies collaboratives 12 ; forums 4 ; cartographie 4 ; journal personnel 1 |

Chaque fiche relie ses sources par identifiant (`src-<éditeur>-<empreinte>`). Le test vérifie deux choses : aucune fiche ne cite une source absente du registre, et le registre est à jour.

## 2. Les plus citées

| Éditeur | Type | Sources | Citations |
| --- | --- | --- | --- |
| peche.com | site spécialisé | 28 | 37 |
| mieuxpecher.com | site spécialisé | 35 | 36 |
| visorando.com | randonnée | 13 | 16 |
| cannes-peche.blog4ever.com | blog | 14 | 15 |
| doi.org (articles scientifiques) | scientifique | 6 | 13 |
| peche-poissons.com | site spécialisé | 8 | 12 |
| DDTM du Finistère | institutionnel | 2 | 9 |
| FishBase | base scientifique | 5 | 9 |
| voileaviron.org | association | 4 | 9 |
| cpiecotentin.com | association | 8 | 8 |

## 3. Indépendance (§ 7.1 : « deux pages qui recopient la même source ne comptent pas double »)

- **Règle appliquée d'office** : deux sources du même éditeur forment un seul groupe d'indépendance. Exemple : 35 pages de mieuxpecher.com comptent pour une seule voix.
- **À vérifier source par source** : la reprise d'un même contenu par des éditeurs différents, par exemple un article de forum recopié sur un blog. On ne peut la voir qu'en lisant les pages : c'est l'évaluation de chaque source.
- Conséquence pour la qualification (5.9) : un spot `TOP_TIER` exige au moins deux **groupes** indépendants, pas deux lignes du registre.

## 4. Droits, conditions d'utilisation et collecte

| Point | Constat | Traitement |
| --- | --- | --- |
| Usage fait des sources | le dépôt garde la référence, de courtes citations et les faits qui en sont tirés ; jamais la copie d'une page | conforme au droit de citation (INFÉRÉ) ; à confirmer éditeur par éditeur lors de l'évaluation |
| Google Maps (4 sources, 7 citations) | ses conditions d'utilisation limitent l'extraction de contenu, par exemple de coordonnées, pour un autre usage (HYPOTHÈSE, à vérifier dans les conditions en vigueur) | **coordonnées à re-sourcer sur des données ouvertes** : IGN (Licence Ouverte) ou OpenStreetMap (ODbL, attribution) lors de 5.7 |
| Forums et groupes | souvent réservés aux membres | aucune connexion ni contournement : ce qui n'est pas lisible publiquement n'est pas utilisé (§ 15) |
| Articles scientifiques | parfois payants | résumé public ou version ouverte seulement ; jamais de contournement d'un accès payant |
| Journal personnel (1 source : « Ton journal… ») | une observation de Félix, dans une fiche publique V2 | marqué `prive` dans le registre ; à garder hors des fiches publiques V3 (anomalie relevée en 5.3) |

## 5. Évaluation restante (§ 7.1)

Chaque source doit recevoir :
- l'auteur ou l'organisme et sa compétence ;
- la date et l'actualité ;
- la méthode et le contexte ;
- la précision géographique et temporelle ;
- son groupe d'indépendance ;
- ses limites et biais ;
- ses droits ;
- l'affirmation exacte qu'elle soutient.

Ordre de travail : d'abord les sources qui portent la sécurité et l'accès d'un spot, puis celles des spots sans autre source, puis les plus citées. Les champs `evaluation` se remplissent à la main et ne sont jamais écrasés par le script. Une source lue reçoit sa date de consultation ; une source inaccessible le dit (`statut : inaccessible`).
