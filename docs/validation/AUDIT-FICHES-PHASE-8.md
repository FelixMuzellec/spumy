# Audit stratifié des fiches de spots (phase 8)

Phase 8 V3, 27 nov. 2026. Référentiel, phase 8 : contrôle par échantillonnage stratifié et par risque, avec une attention accrue :
- aux TOP_TIER ;
- aux accès difficiles et aux zones isolées ;
- aux marées et aux alertes de sécurité.

Outils :
- `scripts/audit-fiches-phase-8.mjs`, qui écrit `data/spots/audit-phase-8.json` et dont le résultat est testé par `tests/calibration.mjs` ;
- un contrôle de 10 fiches sur les pages publiques (§ 3).

## 1. Échantillon

Le tirage est fait à graine fixe. Les strates à risque sont tirées en entier ; ailleurs, une fiche sur trois.

| Strate | Fiches | Tirées |
| --- | --- | --- |
| TOP_TIER et corroborées | 3 | 3 |
| Postes engagés (niveau 3) | 15 | 15 |
| Engagement inconnu (dont les 32 candidats V3) | 32 | 32 |
| Contrainte de marée connue | 15 | 15 |
| Position douteuse (QUAL-3 en échec) | 13 | 13 |
| Fiches V2, autres | 20 | 7 |
| **Total** | **98** | **85** |

Une fiche n'est comptée que dans sa première strate à risque. La strate « engagement inconnu » a été ajoutée après la revue indépendante : au sens de D6-15, ce sont les fiches les plus risquées.

## 2. Contrôles automatiques (85 fiches tirées)

| Contrôle | Fiches touchées | Lecture |
| --- | --- | --- |
| P, position | 16 | 8 jamais contrôlées par l'IGN ; 8 dont le toponyme officiel est entre 1,5 et 4,7 km (Laïta 4,7 km ; Paluden 4,1 km ; Merrien 3,3 km). Aucune hors de la Bretagne et du Cotentin |
| S, corroboration (QUAL-1) | 42 | moins de deux groupes de sources halieutiques indépendants ; sur 279 sources distinctes citées, 174 n'ont jamais été évaluées page par page |
| D, dates | 0 | chaque fiche porte une date de dernière vérification |
| M, marée | 32 | aucune phase documentée. Sur l'échantillon, les phases non documentées sont : la basse mer 79 fois, la pleine mer 73 fois, le jusant 45 fois, la montante 36 fois |
| G, dangers | 85 | au moins une donnée de sécurité inconnue sur chaque fiche tirée. 22 des 23 contraintes de marée connues n'ont pas de fenêtre de sécurité : ces spots ne sont jamais présentés comme praticables |
| C, contradictions | 0 (sur les 98) | aucun texte ne parle d'isolement par la marée sans contrainte connue ; aucun poste « facile » n'est décrit comme engagé |
| I, sites isolés | 3 (sur les 98) | Pointe de Dinan, Feunteun Aod et Penn Enez : secours plus lents, attention accrue |
| T, TOP_TIER | 0 | chaque statut suit ses sept critères ; aucune note ni popularité n'entre dans le calcul |

**Phases de marée des TOP_TIER.**
- Mousterlin n'a qu'une phase documentée, la montante.
- Penmarc'h en a deux : la montante et le jusant.
- La règle plus stricte proposée à Félix (Q7-04 : deux phases au moins) ferait passer Mousterlin à « à vérifier ». Aucune note ne remplace cette preuve manquante.

**Premier essai écarté.** Le premier passage signalait 3 contradictions :
- Dinan et Feunteun Aod : « site isolé » au sens d'un lieu reculé, pas d'un isolement par la marée ;
- Paluden : le verbe « s'engager », pas un poste engagé.

Les motifs ont été resserrés, et « site isolé » est désormais compté à part (I), sur toutes les fiches, avec un motif qui reconnaît les lettres accentuées (constat de la revue indépendante).

## 3. Contrôle sur les pages publiques (10 fiches à haut risque)

Agent séparé, pages publiques seulement (14 recherches, 19 pages lues). Aucune coordonnée de carnet-de-peche.com n'est reprise et aucune donnée OpenStreetMap n'est stockée.

| Fiche | Lieu réel | Constat principal | Suite |
| --- | --- | --- | --- |
| Mousterlin (TOP_TIER) | oui (office de tourisme de Fouesnant) | le seuil « coefficient 75 » n'a qu'une source, non corroborée ; aucune page ne parle du retour coupé | réserve gardée ; retour terrain |
| Penmarc'h (TOP_TIER) | oui (office du Pays Bigouden, 2025) | **complète** : lame de fond meurtrière en 1870 ; décès d'un pêcheur à pied en 2021 par fort coefficient (presse) | consigne à sourcer en phase 9 |
| Sainte-Marguerite (corroborée) | oui (mairie de Landéda) | **position douteuse** : c'est exactement le point de départ (parking) de la balade de la mairie, pas le rivage | position du poste à confirmer |
| Pointe du Raz | oui (Grand Site, 2026) | **contredit en partie** : le site demande de ne pas aller à « l'extrême pointe escarpée », avec un « risque de chute », alors que la fiche propose un poste en falaise ; parking payant d'avril à octobre | engagement et consigne à revoir (Félix) |
| Pen-Hir | oui | complète : falaises abruptes, sentiers difficiles. L'approche de la fiche part du centre d'un guide V2 : itinéraire qui n'a plus de sens sans secteur (PF-09) | approche à rendre neutre |
| Goury | oui | complète : courants du raz Blanchard jusqu'à 10 à 12 nœuds ; la fiche dit « plus de 6 nœuds » (exact, mais faible) et « non proposé du bord au-delà du coefficient 90 » | chiffre à compléter |
| Pointe de Dinan | oui | complète : passages « proches du vide » ; la consigne « gaffe aux lames » vient d'un forum de 2012 | date de la consigne affichée |
| Paluden | oui (pont submersible) | commune à préciser (Plouguerneau ou Lannilis) ; la règle citée est celle de Landéda, la commune voisine | commune et règle à revoir |
| Laïta | oui | position non contrôlable (rive) ; consigne de baignade (courants violents du chenal), pas de pêche | réserve gardée |
| Merrien | oui | complète l'accès (parking du port, places limitées) ; rien sur les dangers | à compléter |

**Lecture.** Les 10 lieux existent. Les constats graves sont deux :
- la Pointe du Raz, où la fiche propose un poste en falaise que le Grand Site déconseille ;
- Sainte-Marguerite, où la position est celle d'un parking.

Ni l'un ni l'autre ne rend un spot praticable à tort : les deux fiches restent « à vérifier » (D6-15). Les corrections touchent des données de sécurité de fiches V2. Elles sont donc présentées à Félix et à la phase 9, et non faites d'office : la consigne du Grand Site irait dans le sens de la prudence, mais l'engagement du poste est un jugement à valider.

## 4. Limites

- Le contrôle automatique relit les fiches ; il ne vaut pas une visite. Seules 10 fiches ont été confrontées au web.
- Les contrôles de position restent ceux de l'IGN (distance au toponyme), sans carte lue.
- Aucune fiche n'a été retirée ni rétrogradée (PF-05, PF-04, K-37).
