# SPUMY — Phase 6 : conception du moteur BORD

13 novembre 2026 · Félix

La spécification du moteur BORD v2 est écrite, sans code : [`docs/SPEC-MOTEUR-BORD-V2.md`](../SPEC-MOTEUR-BORD-V2.md).

Elle remplace la note sur 10 par trois scores sur 100 : favorabilité, pertinence et confiance. La note sur 10 est aujourd'hui tassée : 9 et 10 ne sont jamais atteints. La sécurité sort de la couleur de la note. Elle intègre tes réponses du 13 novembre : seuils de vent plus prudents, bar seul, profil tiré de ta boîte, pastilles en phase 7. Rien ne change dans l'application avant la phase 7.

## 1. Objectif

Concevoir le moteur BORD v2, comme prévu en phase 2 : une fiche par critère, les trois scores, le filtre de sécurité, le traitement des données manquantes, des scénarios de référence et le plan Monte Carlo. Ce document est une spécification à valider par toi, sans code.

## 2. Travail réalisé

| Lot | Ce qui a été fait | Statut |
| --- | --- | --- |
| 6.0 | Mesures de départ. Étendue réelle de la note sur 10 : 12 150 créneaux, 1 746 meilleurs créneaux du jour. Effet des seuils de vent plus prudents sur la grille de 73 986 cas | TESTED |
| 6.1 | Spécification : circuit, données qualifiées, filtre de sécurité, trois scores, données manquantes, pastilles, 16 scénarios, plan Monte Carlo, passage de la v1 à la v2 | IMPLEMENTED (à valider) |
| 6.2 | Ce rapport, document de suivi, proposition de fusion n° 4 | IMPLEMENTED |

## 3. Livrables

| Livrable | Où |
| --- | --- |
| Spécification du moteur BORD v2 | `docs/SPEC-MOTEUR-BORD-V2.md` |
| Ce rapport | `docs/rapports/PHASE-6.md` |
| Suivi | `SPUMY_AUDIT_CONTINUITY.md`, `CHANGELOG.md` |
| Branche et proposition | `claude/phase-6-conception` ; [proposition n° 4](https://github.com/FelixMuzellec/spumy/pull/4), en brouillon, posée sur la phase 5 (n° 3) |

## 4. Preuves

| Mesure | Résultat | Comment |
| --- | --- | --- |
| Étendue de la note sur 10, tous créneaux (66 spots, toutes leurs fenêtres, 3 coefficients, 3 lumières, 3 vents, février, mai, septembre) | médiane 4,5 · 90e centile 7,6 · maximum 8,8 | script de mesure à partir du moteur actuel |
| Meilleur créneau du jour par spot, celui que la carte colore (1 746) | vert 443, orange 659, gris 644 ; médiane 5,6 ; en mai 12 % de gris, en septembre 5 %, en février 94 % | même script |
| Seuils plus prudents (force 6 et rafales de 60 km/h « à vérifier ») sur la grille de 73 986 cas | 11 712 cas passent « à vérifier », dont 5 760 des 13 376 cas sans doute ; rien d'autre ne change | `tests/scenarios.mjs --compare`, moteur modifié dans une copie de travail, jamais publié |
| Tests | Aucun code de l'application modifié : la construction reste celle de `main` | — |

## 5. Résultats

L'essentiel de la spécification :

- **Sécurité, avant tout.** Trois nouveautés par rapport à la v1 :
    - « à vérifier » dès la force 6 ou des rafales de 60 km/h (ton choix) ;
    - nuit sur spot engagé, isolement par la marée et houle au-delà du maximum plus 0,5 m : non recommandés ;
    - une houle légèrement au-dessus du maximum devient « à vérifier » au lieu d'une pénalité cachée.

  La vigilance Météo-France n'est pas lue par l'application : la source reste à trouver.
- **Favorabilité sur 100 = conditions × présence.**
    - Conditions : marée 45 points (fenêtre 25, coefficient 20), lumière 25, vent et mer 30.
    - Présence : la plus restrictive de la saison et de la température de l'eau. En abri l'hiver, plancher à 0,5, car des bars restent sous 7 °C.
    - La pression et les rafales faibles sortent de la note : elles reposent sur des blogs, ou la sécurité les couvre déjà.
- **Pertinence sur 100, tirée de ta boîte.**
    - Couverture technique, 50 points : le bon leurre ou montage est-il dans ta boîte, pour ce fond ?
    - Poids et lancer, 25 points : dans ta boîte et dans la plage de ta canne, 14 à 42 g.
    - Distance, 25 points.

  SPUMY te conseille les trois meilleurs leurres de ta boîte pour le créneau, et ce qui y manque.
- **Confiance sur 100.** Elle se compose de l'âge et de l'échéance des données (40), de l'accord entre modèles (20), du niveau de preuve (25) et de ton journal (15). Elle s'affiche à côté et ne change jamais le rang.
- **Pastilles.** La couleur dit la favorabilité, en cinq paliers d'une même famille, sans orange ni rouge. Les autres états ont leur propre forme :
    - « à vérifier » : contour pointillé et « ? » ;
    - non recommandé : pastille grise barrée ;
    - pas de note : pastille vide.
- **16 scénarios de référence**, qui deviennent des tests en phase 7, dont tes trois sessions de Moulin Mer comme contrôle de vraisemblance.
- **Plan Monte Carlo** pour la phase 8 : 30 journées réelles par guide et 1 000 tirages. Les entrées varient selon leur incertitude, les paramètres selon leur niveau de preuve.
    - Critère : les trois premiers spots restent les mêmes dans au moins 80 % des tirages.
    - Un paramètre de niveau 4 ou 5 qui décide trop est signalé.

## 6. Problèmes et risques

1. **Tous les points, paliers et seuils sont des hypothèses de départ.** Ils sont marqués comme tels. La phase 8 dira lesquels tiennent.
2. **La prudence a un coût.** Avec les nouveaux seuils, beaucoup de journées d'automne et d'hiver seront « à vérifier » : force 6 ou rafales de 60 km/h sont courantes en Bretagne et dans le Cotentin. La fréquence réelle sera mesurée en phase 8, sur des prévisions archivées.
3. **La vigilance Météo-France n'a pas de source dans l'application.** Une alerte orange ou rouge ne retire donc pas encore un spot.
4. **Le conseil de leurres n'est encore fait que sur la boîte connue.** La pertinence et ce conseil dépendent de ton inventaire complet, que tu m'enverras.
5. **Le journal ne peut rien conclure aujourd'hui** : 3 sessions, toutes à Moulin Mer. L'apprentissage personnel ne jouera qu'à partir de 5 sessions par spot, dont 2 avec prise.
6. **Le service de documents Claude était indisponible le 13 nov.** Ce rapport est donc dans le dépôt, et non dans un document Claude comme les précédents.

## 7. Critères d'acceptation

| Critère | Résultat | Statut |
| --- | --- | --- |
| Une fiche par critère, avec son niveau de preuve, sa courbe, ses points et son comportement si la donnée manque | Section 4 de la spécification | IMPLEMENTED |
| Trois scores sur 100, jamais fusionnés ; la confiance ne change pas le rang | Sections 4 à 6 et 8 | IMPLEMENTED |
| Filtre de sécurité non compensable, inconnu → à vérifier | Section 3 | IMPLEMENTED |
| Données manquantes : jamais « neutre », toujours dites | Section 7 | IMPLEMENTED |
| Scénarios de référence et plan Monte Carlo | Sections 9 et 10 | IMPLEMENTED |
| Tes décisions du 13 nov. intégrées | Section 0 | IMPLEMENTED |
| Aucun code de l'application | Construction identique | VÉRIFIÉ |
| Spécification validée par toi | — | **À DÉCIDER** |

Statut de la phase : **IMPLEMENTED, en attente de ta validation.** Pour une spécification, ta validation fait office de test.

## 8. Décisions attendues

| # | Question | Recommandation |
| --- | --- | --- |
| 1 | Valider la spécification, ou dire ce qu'il faut changer (poids des critères, paliers, seuil de pertinence 50, règle des 5 sessions du journal) | La valider telle quelle : les chiffres seront éprouvés en phase 8 |
| 2 | Ton inventaire complet de la boîte : leurres avec taille, poids et coloris, têtes et leurs grammages, hameçons texans, autres montages | Me l'envoyer avant la phase 7, même sous forme de photo ou de liste |
| 3 | Ton temps de trajet maximal pour aller pêcher (sous-critère distance) | Une durée en minutes depuis Logonna et depuis Pirou |
| 4 | Fusion des phases 5 et 6 dans `main` : elles ne changent pas l'application | Oui |
| 5 | Mise en ligne : activer Pages sur `spumy` (*Settings → Pages → main / root*), toujours pas fait au 13 nov. | À faire quand tu veux ; je vérifie ensuite le déploiement |
| 6 | Historique de tes sorties réelles au-delà des 3 sessions du journal, même partiel | Me l'envoyer : c'est la seule vérité terrain de la phase 8 |
| 7 | Rubriques « connaissance locale » non attribuées (9) et positions GPS des 7 spots de Pirou (phase 5) | Me dire celles qui viennent de toi ; me donner les points GPS |

## 9. Prochaine phase proposée, et arrêt

**Phase 7 : moteur v2.** Le lot 7.1 implémente les trois scores, comparés au v1 sur les mêmes journées, avec un réglage pour revenir au v1. Le lot 7.2 implémente le filtre de sécurité de la spécification. Viennent ensuite :
- les pastilles et l'affichage des niveaux de preuve ;
- le conseil de leurres tiré de ton inventaire ;
- les 16 scénarios en tests.

**STOP.** J'attends ta réponse « `APPROVED — PROCEED TO PHASE 7` », qui vaut validation de la spécification, avant d'aller plus loin.
