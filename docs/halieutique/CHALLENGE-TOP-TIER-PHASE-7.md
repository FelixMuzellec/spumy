# Revue contradictoire des TOP_TIER (phase 7)

Phase 7 V3, livrable « rapport de challenge des TOP_TIER ». Version 1 du 25 novembre 2026 ; première passe, par le producteur du travail. La passe d'un relecteur indépendant suit avant la clôture (cadrage, « Méthode et clôture »).

But du référentiel : tenter de réfuter l'intérêt, l'accessibilité, la fiabilité des coordonnées et les conditions d'exploitation des deux spots classés `TOP_TIER` par la phase 5 : la pointe de Mousterlin et la pointe de Penmarc'h. La phase 5 avait déjà ramené 6 TOP_TIER à 2 (`docs/halieutique/QUALIFICATION.md`). Cette revue ne la répète pas ; elle cherche ce qui reste fragile.

Aucune fiche n'est modifiée ici : le classement est calculé par `scripts/qualifier-fiches.mjs`. Une règle de qualification qui changerait serait présentée comme un changement.

## 1. Pointe de Mousterlin (Fouesnant)

| Angle | Ce qui tient | Ce qui est fragile | Verdict |
| --- | --- | --- | --- |
| Intérêt | 4 groupes de sources indépendants (QUAL-1) ; 3 lus page par page (QUAL-2) ; bar attaché au poste par une source de pêche | Sur les quatre groupes, lechasseursousmarin.com est une zone de chasse sous-marine : il compte comme groupe lu mais n'attache pas le bar (règle de la phase 5). Restent 3 groupes de pêche | **tient** |
| Poste précis | Toponyme IGN « Pointe de Mousterlin » à 16 m de la position | Une source (chtipecheur.com, 2022) place les pêcheurs à « l'exutoire des eaux pluviales ». Ses coordonnées écrites (47°50'52"N 4°02'08"O) sont à **environ 510 m** de la position de la fiche. La fiche décrit, elle, les bordures du platier. Deux postes probables d'un même site, non fusionnés | **réserve** : poste à préciser (demande à Félix, § 4) |
| Accessibilité | Parking touristique de la BD TOPO à 836 m ; 14 min de marche selon l'IGN | La marche sur l'estran et le platier n'est pas comptée. Par grand coefficient, le platier découvre « très loin » : le temps réel jusqu'au poste est plus long et inconnu | **réserve** |
| Conditions d'exploitation | Fenêtres de marée montante (BM à BM + 5 h) ; bande de coefficients 30 à 100 (V2) | Trois phases de marée sur quatre sont INCONNUES (basse, haute, descendante). `coef_max` et `windows.securite` sont INCONNUS, alors que la consigne cite un isolement au flot dès le coefficient 75. Exposition sud à sud-ouest « déduite de la carte » (INFÉRÉ) | **réserve forte** : avec D6-15 et D6-21, la fiche ne peut pas être SAFE |
| Biologie régionale | Au sud du 48ᵉ parallèle : stock du golfe de Gascogne, plus de résidents | Aucun marquage à Fouesnant ; la proposition de saison de la phase 7 n'y change rien | sans effet |

## 2. Pointe de Penmarc'h

| Angle | Ce qui tient | Ce qui est fragile | Verdict |
| --- | --- | --- | --- |
| Intérêt | 3 groupes indépendants (QUAL-1), 3 lus (QUAL-2) | Les groupes sont carnet-de-peche.com (lu sur l'extrait du moteur de recherche), une zone de chasse sous-marine (n'attache pas le bar) et Le Figaro Nautisme. Ce dernier est un « Top 10 » national de média généraliste : on ne sait pas s'il recopie une autre source. Si son indépendance tombe, il ne reste que deux groupes, dont un seul de pêche lu en entier | **réserve** : intérêt réel, preuve mince |
| Poste précis | Toponyme IGN à 89 m ; mieuxpecher.com : « autour du phare d'Eckmühl » | La pointe est un grand site ; Saint-Guénolé est une fiche distincte à 2,6 km, la Torche à 4,6 km | **tient** (postes distincts) |
| Accessibilité | 2 min de marche depuis le parking | — | **tient** |
| Conditions d'exploitation | Contrainte de marée connue (submersible à pleine mer) ; consignes sourcées | Engagement 3 ; vagues scélérates et ressac ; « ne viens pas seul ». La houle maximale de 1,2 m vient de la V2, sans source, pour une pointe ouverte à l'Atlantique : le spot serait souvent non admissible, ce qui est prudent mais non démontré. Phases haute et basse INCONNUES ; mouvements de terrain INCONNUS (absence de recensement, pas preuve d'absence) | **réserve forte** : jamais SAFE avec les données actuelles |
| Biologie régionale | Au sud du 48ᵉ parallèle | — | sans effet |

## 3. Conclusion de la première passe

- Aucun des deux spots n'est réfuté sur l'intérêt : le classement `TOP_TIER` tient sur ses critères QUAL-1 à QUAL-7.
- Les deux restent fragiles sur les **conditions d'exploitation** : phases de marée, fenêtre de sécurité et coefficient maximal inconnus. `TOP_TIER` dit la qualité de la preuve de l'intérêt halieutique, pas que le spot est sûr (PF-07).
- **Proposition** (changement à valider, sans effet sur l'application) : qu'un TOP_TIER exige aussi au moins deux phases de marée documentées. Impact : les deux TOP_TIER actuels passeraient « à vérifier ». Ce changement touche la qualification de la phase 5, validée : il est présenté à Félix, pas appliqué (PF-04).

## 4. Doublons probables et postes voisins, sans fusion

Paires de spots à moins de 1 km sur les 98 du registre :

| Spots | Distance | Lecture | Suite |
| --- | --- | --- | --- |
| Pointe d'Agon et Régnéville (Cotentin ouest, V2) | 0,95 km | Deux rives du havre de la Sienne : une pointe sableuse exposée à l'ouest, et l'intérieur du havre, abrité par le cordon dunaire. Postes distincts | garder séparés |
| Pointe de Beg en Aud et pointe du Percho (côte sauvage de Quiberon, candidats V3) | 0,51 km | Deux pointes rocheuses voisines d'un même grand site ; postes distincts probables | à confirmer (source ou Félix) ; aucune fusion |
| Mousterlin, pointe et exutoire (même fiche) | 0,51 km | Deux postes probables d'un même site | à préciser (§ 1) |

## 5. Demandes à Félix (§ 0.6), à porter au registre des inconnues

1. Mousterlin : où pêches-tu, à la pointe (bordures du platier) ou à l'exutoire des eaux pluviales ? Une photo du poste suffirait.
2. Penmarc'h : quel est ton poste habituel autour du phare d'Eckmühl, et à quelles phases de marée ?
