# Registre des sources

Phase 5 V3, livrable 4, sous-tâche 5.4. Les données sont dans `data/sources/registre.json`, généré par `scripts/sources-registre.mjs` et contrôlé par `tests/spots-v3.mjs`. 23 novembre 2026.

## 1. Ce que contient le registre

Le registre rassemble deux origines :
- les sources V2 citées par les 66 fiches de spots (`provenance.sources_v2`, texte exact) ;
- les sources des connaissances BORD et BATEAU (`data/knowledge/`, avec référence, adresse et niveau).

| Mesure | Valeur (VÉRIFIÉ, registre du 23 nov., soir) |
| --- | --- |
| Sources distinctes | **297** (284 au premier passage, plus les sources officielles ajoutées en 5.7) |
| Éditeurs | 102, regroupés en **87 groupes d'indépendance** |
| Avec une adresse | 53 ; les 244 autres sont des citations V2 sans lien |
| Évaluées page par page (§ 7.1) | **60** après la passe exhaustive (textes officiels, IGN, Géorisques, Commons, DDTM 29, Attitude Manche, Le Figaro Nautisme ; 35 citations mieuxpecher.com vérifiées mot pour mot ; fiches carnet-de-peche.com ; sources des six candidates) ; **2 introuvables** ; chaque évaluation porte l'affirmation exacte et `bar_au_poste` (`scripts/evaluer-pages.mjs`) |
| Classées par éditeur | 297 sur 297 reçoivent la nature, les domaines, le groupe, les limites et les droits de leur éditeur |
| Famille (§ 7.1, INFÉRÉE de l'éditeur) | 1 : 21 ; 2 : 40 ; 3 : 8 ; 4 : 166 ; 6 : 19 ; non fixée : 43 (mieuxpecher.com et peche-poissons.com) |

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

### Classement par éditeur (`data/sources/editeurs.json`)

Chaque éditeur reçoit, à la main :
- sa **nature** (administration, institut de recherche, presse spécialisée, guide professionnel, blog, forum, plateforme de randonnée, office de tourisme, encyclopédie, agrégateur) ;
- les **domaines** auxquels il peut répondre (halieutique, accès, réglementation, biologie, courants…) : un site de randonnée prouve un sentier, pas un poste à bar ;
- son **groupe d'indépendance** : peche.com et bateaux.com forment un seul groupe (bateaux.com renvoie vers peche.com) ; Le Figaro Nautisme et Météo Consult aussi ; les administrations de l'État forment un groupe pour la réglementation ;
- ses **limites** et ses **droits**.

La famille qui en découle est INFÉRÉE : elle ne vaut pas évaluation de la page. C'est pourquoi la qualification distingue la corroboration par éditeurs indépendants (QUAL-1) de la qualité examinée page par page (QUAL-2).

## 4. Droits, conditions d'utilisation et collecte

| Point | Constat | Traitement |
| --- | --- | --- |
| Usage fait des sources | le dépôt garde la référence, de courtes citations et les faits qui en sont tirés ; jamais la copie d'une page | conforme au droit de citation (INFÉRÉ) ; à confirmer éditeur par éditeur lors de l'évaluation |
| Google Maps (4 sources, 7 citations) | ses conditions d'utilisation limitent l'extraction de contenu, par exemple de coordonnées, pour un autre usage (HYPOTHÈSE, à vérifier dans les conditions en vigueur) | **coordonnées à re-sourcer sur des données ouvertes** : IGN (Licence Ouverte) ou OpenStreetMap (ODbL, attribution) lors de 5.7 |
| Forums et groupes | souvent réservés aux membres | aucune connexion ni contournement : ce qui n'est pas lisible publiquement n'est pas utilisé (§ 15) |
| Articles scientifiques | parfois payants | résumé public ou version ouverte seulement ; jamais de contournement d'un accès payant |
| Données officielles collectées (IGN, BRGM, Géorisques) | Licence Ouverte ; gardées dans `data/spots/collecte/` avec le numéro du passage CI | conforme |
| Wikimedia Commons | licence propre à chaque fichier ; seules les métadonnées (titre, page, licence, auteur, distance) sont gardées, aucune image copiée | attribution et licence à afficher avec chaque photo |
| OpenStreetMap | ODbL ; résultats non gardés dans le dépôt | conforme (choix de la phase 5) |
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
