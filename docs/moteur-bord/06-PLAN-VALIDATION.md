# Hypothèses, inconnues, plan de validation et registre des décisions du moteur BORD

Phase 6 V3, 24 nov. 2026. Statut : **PROVISOIRE**. Ce document clôt le dossier de conception provisoire (00 à 05).

Les questions D6-01 à D6-21 sont inscrites au registre (`docs/DECISIONS_LOG.md`, V3-031). Le référentiel les fait arbitrer **après** la revue contradictoire de la phase 8 et la consolidation de la phase 9 : aucune n'est posée à Félix maintenant, aucune ne bloque la phase 7.

## 1. Hypothèses (à éprouver)

| N° | Hypothèse | Niveau | Où elle pèse | Comment l'éprouver | Phase |
| --- | --- | --- | --- | --- | --- |
| H6-01 | Coefficients mensuels de présence (0,5 en février à 1 de juin à octobre) | N4 | présence, première source de variance | sources de télémétrie et de marquage Manche et Bretagne ; journal | 7, 8 |
| H6-02 | Paliers thermiques (7,5 / 9,5 / 11,5 / 13,5 / 19 / 21,5 °C) | N4, en partie contredite (6,5 °C, 6,9 °C) | présence | idem ; sensibilité D6-06 | 7, 8 |
| H6-03 | L'abri (rade, ria, havre) garde des bars l'hiver : facteur de saison de 0,025 à 0,075 au-dessus de la côte ouverte hors de juin à octobre (0,575 contre 0,5 en février), plancher thermique 0,5 à 0,6 | N4 | présence d'hiver | observations locales identifiables ; journal d'hiver | 7, 8 |
| H6-04 | Points de la fenêtre (25 ou 15), du coefficient (trapèze), de la lumière (25, 15, 5 à 11) et du vent (table) | N4 (règles N2) | conditions | sensibilité (fait : E5) ; journal ; revue indépendante | 8 |
| H6-05 | Plage utile du coefficient par poste ; [30, 45, 75, 105] par défaut | N4 | C2 | sources par poste (phase 7) ; défaut remplacé par INCONNU (01 § 8) | 7 |
| H6-06 | Le bar mord davantage en lumière basse, en milieu naturel | N2 (bassin et cage) | C3 | recherche d'études en milieu naturel | 7 |
| H6-07 | Un vent de mer modéré est favorable, un vent de terre défavorable de jour | N2 (pêcheurs) | C4 | recherche ; journal | 7, 8 |
| H6-08 | ψ : a priori Beta déclaré, de moyenne inférieure à 1, jamais tiré de la présence P ; k fixé ; poids ω_i de forme candidate | hypothèse de modèle | moteur 2 | identifiabilité (fait : E3) ; sensibilité à k et à l'a priori | 8, 13 |
| H6-09 | Agrégation de la Confiance par le maillon le plus faible | choix de conception | Confiance | revue indépendante ; lisibilité (test utilisateur) | 8, 9 |
| H6-10 | Publication : nombre seulement si tout est connu ; fourchette jusqu'à 20 points | choix de conception | publication | journées archivées : part des cartes en nombre, en fourchette, en qualitatif | 8 |
| H6-11 | Les facteurs de sécurité non évalués (période de houle, ressac, repli, visibilité) restent des limites déclarées, pas des inconnues | choix de conception | sécurité | revue indépendante ; sources compétentes | 7, 8 |

## 2. Inconnues

| N° | Inconnue | Pourquoi elle compte | Ce qui la lèverait |
| --- | --- | --- | --- |
| I6-01 | Courant au poste (vitesse, renverse) | le coefficient n'en est qu'un substitut (A16) | atlas du SHOM ou modèle public, licence et résolution vérifiées |
| I6-02 | Turbidité réelle | seuls des proxys N4 existent (pluie, houle, coefficient) | aucune source locale connue |
| I6-03 | Fenêtres de marée des 32 fiches V3 candidates | sans fenêtre, pas de note (A3) | recherche par poste (phase 7) |
| I6-04 | Accès selon la marée (75 fiches), fenêtre de sécurité des 23 fiches dont la contrainte de marée est connue, réglementation locale (35, dont la Manche), engagement (32), maximum de houle (32), mouvements de terrain (54) | avec elles inconnues, aucune fiche sur 98 ne peut être SAFE (`e9`, D6-15, D6-21) | recherche (phase 7, priorité) ; photos et précisions de Félix |
| I6-05 | Vérité terrain | 3 sessions au journal | journal confirmé (phase 13), au moins 5 sessions par poste pour l'affichage descriptif |
| I6-06 | Lecture de la vigilance Météo-France | rappel seulement (V3-011) | relais avec clé hors du dépôt |
| I6-07 | Temps de route réel depuis la position | filtre des 60 min et place réservée | service de routage (V3-009), phase 10 |

## 3. Plan de validation

Les critères de réussite sont fixés **avant** l'épreuve (§ 14.2), et chaque épreuve compare A1 à B-V2 et à B-simple.

| Épreuve | Données | Critère de réussite fixé d'avance | Phase |
| --- | --- | --- | --- |
| V-01 Rejouer les 24 scénarios sur les journées archivées (252) | archives de la phase 8 V2 | les 24 propriétés tiennent ; aucune carte publiée en nombre avec un critère manquant | 8 |
| V-02 Distribution des niveaux publiés | idem | part des cartes en nombre, fourchette, qualitatif, « — » par saison ; aucun « — » sans raison écrite | 8 |
| V-03 Stabilité du classement, météo et paramètres perturbés | idem, ensemble météo de la phase 8 V2 | Top 3 à 10 points près dans 80 % des tirages au moins ; sinon, la publication doit le dire (D6-02) | 8 |
| V-04 Sécurité : aucun créneau DANGER ou BLOCKED dans un Top ; aucun INSUFFICIENT_DATA dans le groupe documenté | toutes les journées × tous les spots | zéro exception | 8 |
| V-09 Données de sécurité des fiches | 98 fiches | part des fiches qui peuvent être SAFE, avant et après la phase 7 ; chaque INCONNU levé avec sa source | 7, 8 |
| V-05 Invariance : Confiance, boîte, champs V2 de Pertinence | tests unitaires | ordre identique | 8, 10 |
| V-06 Revue contradictoire indépendante du dossier 00 à 06 | dossier, code, résultats | aucun constat MAJEUR ouvert | 8 |
| V-07 Journal : statistiques descriptives et posterior de θ_x | sessions confirmées | aucune conclusion sous 5 sessions dont 2 avec prise ; intervalle de θ_x affiché seulement s'il est informatif | 13 |
| V-08 Calibration (si le volume le permet un jour) | sessions confirmées, hors échantillon par le temps et par poste | calibration et validation hors échantillon avant tout affichage de probabilité (§ 9.1.8) | après 13 |

## 4. Registre des décisions (À DÉCIDER)

| N° | Question | Options | Choix provisoire et raison | Preuve | Impact |
| --- | --- | --- | --- | --- | --- |
| D6-01 | Rang d'un spot dont un critère ou l'eau manquent | (a) borne basse, soit une imputation à 0 ; (b) valeur centrale, soit une imputation à la moitié du maximum ; (c) renormalisation V2, soit une imputation au taux des autres critères ; (d) pas de note : intervalle publié, spot dans « à vérifier » | (d) : seule option conforme à la lettre du § 9.1.5 (« jamais remplacée par zéro ou une valeur neutre ») ; le § 13.2 permet de « retirer/qualifier le score ». Les options (a) à (c) imputent toutes une valeur. Dans le groupe « à vérifier », l'ordre d'affichage suit la borne basse | E4 : renormalisation fausse de plus de 10 points sur 21 % des créneaux sans vent | Un vent inconnu met déjà le spot en INSUFFICIENT_DATA ; (d) ajoute le coefficient, la lumière et l'eau inconnus |
| D6-02 | Publication de l'incertitude de modèle | (a) intervalle des seules données manquantes ; (b) ajouter l'incertitude des paramètres | (a), parce que (b) ferait publier une fourchette presque partout : c'est un changement de l'écran, présenté ici avec son impact | E6 : intervalle à 90 % de 12 points en médiane ; chiffre optimiste (phase 8 V2, hypothèses seules : Top 3 tenu sur 63 journées sur 241) | (b) : fourchettes sur la plupart des cartes ; filtre « Favorables » (V3-021) à redéfinir |
| D6-03 | Eau inconnue | (a) P entre le plancher 0,3 et la saison, resserré par une climatologie sourcée quand elle existera ; (b) saison seule (V2) | (a) | S11 : 95 au lieu de 75 au retour de mai ; avec (a), intervalle de 30 à 95 | Pas de note en transition quand l'eau manque |
| D6-04 | Condition qui rend le poste non pêchable | (a) plafond de la note ; (b) veto (pas de note) ; (c) somme (V2) | (a) ou (b), à arbitrer avec la phase 8 | 609 créneaux à 65 ou plus avec un coefficient hors plage ; S08 : 80 | Moins de « favorables » hors plage utile |
| D6-05 | Lumière | (a) fonction continue de la hauteur du soleil ; (b) classes (V2) | (a) si une source en milieu naturel en donne la forme ; sinon (b), déclarée N4 | A4 : 15 points de saut en moyenne (9 à 18) | Plus de saut à l'aube |
| D6-06 | Valeurs de présence et tables de points | (a) garder et challenger ; (b) remplacer par des valeurs sourcées | (a) jusqu'aux phases 7 et 8 | E5 : la présence est l'hypothèse la plus sensible | Selon la recherche |
| D6-07 | Agrégation de la Confiance | (a) maillon le plus faible ; (b) moyenne pondérée (V2) | (a) : pas de compensation entre dimensions | A7 ; `confiance.mjs` | Confiance BORD « moyenne au mieux » tant que la présence est N4 |
| D6-08 | Place réservée quand le Top est étendu par une égalité | (a) le spot proche prend la 3ᵉ place, les spots déplacés restent nommés ; (b) il s'ajoute en 4ᵉ ou 6ᵉ | (a), lecture littérale de V3-016 | `classement.mjs`, tests | Affichage des spots déplacés |
| D6-09 | Ordre de sévérité entre INSUFFICIENT_DATA et CAUTION | (a) INSUFFICIENT_DATA au-dessus (un danger caché n'est pas exclu) ; (b) l'inverse | (a) | 01 § 6 | Libellé seulement : les deux vont dans « à vérifier » |
| D6-10 | Seuils de vent BORD (Félix, 13 nov. 2026, « à revoir en phase 6 ») | (a) les garder ; (b) les changer | (a) : aucune preuve trouvée pour un changement ; non-recommandation alignée sur Météo-France | Phase 8 V2 : la prudence fait passer 1 % des spots praticables en « à vérifier » sur l'année, 13 % en février | Aucun |
| D6-11 | Bonus du journal (±10) | (a) le retirer ; (b) le garder affiché | (a), imposé par le § 9.1.9 | A8 | L'écran ne montre plus de bonus ; statistiques descriptives à la place |
| D6-12 | Probabilité interne de capture | (a) ni calculée en production ni affichée ; (b) affichage distinct | (a) : conditions du § 9.1.8 non réunies (3 sessions) | E3 | Aucun |
| D6-13 | Saison comptée deux fois dans le moteur 2 | (a) ω_saison mesure la transférabilité seulement, si λ_env porte la saison ; (b) ω_saison seul | (a) | 04 § 6.2 | Aucun avant la phase 13 |
| D6-14 | Désaccord des modèles et météo changeante dans la sécurité | (a) le plus fort des deux modèles, à la pire heure du créneau ; (b) le modèle principal (V2) | (a) | Tests ; S12, S13 | Plus de « à vérifier » quand AROME et ECMWF divergent |
| D6-15 | Données de sécurité INCONNUES dans la fiche : engagement, accès selon la marée, houle maximale, réglementation locale (QUAL-6) ; les autres champs de sécurité sont des limites déclarées (limite de courant, mouvements de terrain : D6-16), des prudences (consignes : D6-19) ou une information affichée sans règle d'état (risques communaux Géorisques) | (a) INSUFFICIENT_DATA, application littérale de « une donnée de sécurité inconnue n'est jamais au vert » ; (b) comportement V2 : l'absence de règle vaut « pas d'alerte », avec la lacune écrite et la Confiance baissée | (a) ; la phase 7 comble les données | `e9` : aucune fiche sur 98 ne peut être SAFE avec les données actuelles (avec D6-21) ; S19, S23 | Tant que la phase 7 n'a pas levé ces INCONNUS, tous les spots BORD sont « à vérifier » : c'est un changement du comportement V2 |
| D6-16 | Facteurs du § 9.5 que le contrat n'évalue pas (période et direction de houle, exposition et orientation, ressac, rochers glissants, mouvements de terrain, repli, visibilité, limite de courant non documentée) | (a) limites déclarées à côté de l'état ; (b) inconnus, donc INSUFFICIENT_DATA | (a) : avec (b), aucun poste ne serait jamais SAFE ; ces facteurs sont à documenter par des sources compétentes, jamais à inventer. Écart déclaré à la lettre de SEC-02 pour la visibilité : elle est listée, et aucun état n'est jamais affiché en vert | `securite.mjs` (`nonEvalues`, 7 facteurs) | SAFE veut dire « aucune alerte connue sur les facteurs évalués » |
| D6-17 | Valeurs d'une dimension de Confiance inconnue | (a) âge inconnu : 0 ; un seul modèle : 40 ; (b) valeurs V2 (âge inconnu 50 ; un seul modèle 0) | (a) : une prévision d'âge inconnu peut être périmée ; un modèle seul n'est pas une donnée absente, mais une corroboration absente | `confiance.mjs` | Un seul modèle laisse la Confiance au plus « moyenne » |
| D6-18 | Règles de classement nouvelles, non encore validées | Liste des lacunes qui mettent « à vérifier » ; temps de route inconnu → exclu ; ordre d'affichage du groupe « à vérifier » ; départage au-delà de 5 ex æquo (temps de route, puis identifiant) ; fenêtre servant au rang (meilleure fenêtre SAFE) | Celles de 01 § 7 | `classement.mjs` | Ordre d'affichage seulement ; aucune ne crée de bonus |
| D6-19 | Prudences V2 (consignes actives, poste engagé, nuit sur un poste de niveau 2) | (a) libellé « Prudence » au premier niveau, chaque prudence écrite, sans changer l'état ni le rang : c'est exactement la V2 ; (b) CAUTION, donc « à vérifier » | (a) | `securite.mjs` (`niveauAffiche`) ; `safetyOf` V2 ; S22 | (b) retirerait du Top documenté les 16 spots engagés |
| D6-20 | Vigilance Météo-France, une fois lue (V3-011) | (a) orange ou rouge (vent, vagues-submersion) → DANGER, jaune → CAUTION ; (b) rappel seulement | (a), à valider avec le relais V3-011 | Vigilance officielle ; aucune valeur inventée | Plus de « non recommandé » les jours de vigilance |
| D6-21 | Contrainte de marée connue (isolement au flot, poste submersible à pleine mer, praticable à basse mer seulement, accès selon la marée) que rien ne situe par rapport au créneau | (a) INSUFFICIENT_DATA tant qu'une fenêtre de sécurité documentée ne situe pas le créneau hors de la contrainte ; (b) comportement V2 : une consigne de prudence quand elle est active, sinon aucune alerte | (a) : la contrainte est connue, mais pas son heure par rapport au créneau ; c'est une donnée de sécurité inconnue | `e9` : 23 fiches concernées ; S23 ; la seule règle V2 d'isolement (Térénez) ne dépend que du coefficient | Avec D6-15, aucune fiche ne peut être SAFE aujourd'hui ; la phase 7 doit documenter la fenêtre de sécurité de ces 23 fiches |

## 5. Ce qui sera challengé ensuite

- **Phase 7** : les recherches demandées aux documents 02 (§ 5) et 06 (I6-01 à I6-04) ; les fenêtres et la sécurité des fiches V3.
- **Phase 8** : la revue contradictoire indépendante du dossier, les épreuves V-01 à V-06 et la calibration de ce qui peut l'être.
- **Phase 9** : la consolidation des spécifications, puis l'approbation explicite de Félix. Aucun changement de moteur avant elle.
