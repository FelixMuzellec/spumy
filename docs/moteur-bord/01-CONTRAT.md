# Contrat du moteur BORD : Favorabilité, Confiance, sécurité, classement

Phase 6 V3, 24 nov. 2026. Statut : **PROVISOIRE**.
- Seuils, poids et formules restent ouverts jusqu'à la revue contradictoire de la phase 8 et à la consolidation de la phase 9.
- Les questions sont au registre (06, D6-01 à D6-20).
- Les points déjà validés avec Félix sont repris tels quels et signalés (VALIDÉE).
- L'**ordre des étapes du classement** suit le § 9.1.6 : il est **verrouillé** par cette phase. Les seuils restent provisoires.

Portée : le bar depuis le bord. Le mode BATEAU garde ses propres règles (§ 9.1.7) : rien de ce contrat ne s'y applique d'office.

Prototypes hors application, tous testés par `tests/etude-moteur-bord.mjs` :
- `scripts/etude-moteur-bord/architectures.mjs` (Favorabilité A1) ;
- `confiance.mjs` ;
- `securite.mjs` ;
- `classement.mjs`.

## 1. Deux indicateurs, et seulement deux (VALIDÉE, V3-006)

| | Favorabilité | Confiance |
| --- | --- | --- |
| Ce qu'elle dit | Potentiel halieutique attendu pour le bar, sur un poste, pour un créneau : échelle de synthèse 0 à 100 | Solidité des données et des preuves qui soutiennent cette Favorabilité, pour ce poste et ce créneau : 0 à 100 |
| Ce qu'elle n'est pas | Une probabilité de capture ; une note de sécurité ; une note de matériel | Une probabilité ; un coefficient ; un facteur de rang ; une note de sécurité |
| Ce qui la fait varier | Les données biologiques et environnementales retenues (document 02) | La qualité, la fraîcheur, la couverture, l'accord, la précision et la provenance de ces données et des règles |
| Effet sur le rang | Oui : Favorabilité décroissante parmi les admissibles | **Aucun** : ni éligibilité, ni ordre, ni départage |
| Effet sur la publication | — | Peut seulement **baisser** le niveau de précision publié (§ 5), jamais l'élever |

Interdits (§ 9.1) : toute note composite, tout produit Favorabilité × Confiance, tout bonus ou malus de Confiance.

Deux contrôles le vérifient :
- un test d'invariance : changer toutes les Confiances ne change ni l'éligibilité ni l'ordre ;
- un garde-fou structurel : le code de la règle de classement ne lit ni la Confiance, ni la Pertinence, ni la boîte.

## 2. Ce qui sort du calcul

| Élément V2 | Sort | Raison |
| --- | --- | --- |
| Pertinence (boîte, poids, distance) | Supprimée du calcul, de l'écran et du rang ; champs V2 en lecture pour la migration seulement | V3-006, REC-02, audit A1 |
| Boîte à leurres | Ne sert qu'à personnaliser « Leurres conseillés » ; le conseil générique est le même quelle que soit la boîte | § 9.1.6, REC-10 |
| Bonus du journal (±10) | Retiré de l'écran et de la note | § 9.1.9, audit A8 ; le journal alimente le moteur 2 (document 04) ; D6-11 |
| Probabilité interne de capture | Non calculée en production, non affichée | Document 04 : rien n'est estimable avec les données disponibles (D6-12) |
| Note sur 10 (moteur v1) | Retirée en BORD | ADR-V3-015, REC-12 |

## 3. Favorabilité : structure provisoire

L'architecture retenue à titre provisoire est **A1** (document 03) : les composantes du moteur V2, sans imputation.

- **Disponibilité biologique** P ∈ [0,3 ; 1] : la plus restrictive de la saison et de la température de l'eau (structure V2 gardée, valeurs N4 à challenger, audit A6).
- **Conditions** : somme des points des critères C1 à C4 sur leurs maximums (25, 20, 25, 30).
- **Note** : `arrondi(P × Σ points)`. Elle **n'existe que si tous les critères et la température de l'eau sont connus**. C'est alors elle qui est publiée, et elle seule qui sert au rang.
- **Données incomplètes** : jamais de renormalisation (§ 9.1.5), jamais de valeur imputée pour le rang. La note est « qualifiée » au sens du § 13.2 (« retirer/qualifier le score si les données deviennent insuffisantes ») :
  - `bas = arrondi(P_bas × Σ points connus)` ;
  - `haut = arrondi(P_haut × (Σ points connus + Σ maximums inconnus))` ;
  - un critère inconnu prend sa plage entière ;
  - une eau inconnue donne P entre le plancher 0,3 et la saison, faute de climatologie sourcée qui resserre l'intervalle (D6-03).
  - Le spot va alors dans « à vérifier » (§ 7, D6-01).
- **Condition qui rend le poste non pêchable** (coefficient hors plage utile, audit A15) : plafond ou veto, plutôt qu'une addition (D6-04).

La note /100 reste une échelle de synthèse, jamais une probabilité.
- **Écran V3** : les six classes du référentiel (§ 6.7.5.1), communes à la Favorabilité et à la Confiance :
  - 0–19 Très faible ;
  - 20–39 Faible ;
  - 40–59 Moyen ;
  - 60–74 Bon ;
  - 75–89 Très bon ;
  - 90–100 Excellent.
- **« Favorables »** : 75 et plus, sécurité permise, pas « à vérifier » (VALIDÉE, V3-021).
- **Application en ligne** : les paliers V2 (75, 65, 55, 45) restent jusqu'à l'intégration (registre V2).

## 4. Ce que la Confiance mesure

Six dimensions, chacune notée de 0 à 100 par une règle écrite, toutes visibles dans « Pourquoi ? ». Prototype : `confiance.mjs`, 4 tests.

| Dimension | Règle provisoire | Source de la règle |
| --- | --- | --- |
| Données : fraîcheur et échéance | Âge de la prévision < 6 h : 100 ; < 24 h : 50 ; au-delà, ou âge inconnu : 0. Jour même : 100 ; J+1 : 83 ; J+2 : 67 ; J+3 et au-delà : 50. On garde la plus basse des deux | Règles V2 (`confidenceV2` l. 270-277), N4 ; âge inconnu : 0 au lieu de 50 en V2 (D6-17) |
| Couverture | 100 × part des maximums de critères connus | V2 l. 278, N4 |
| Accord des modèles | AROME contre ECMWF, sur la force et la direction du vent (règle V2, ramenée à 100) ; un seul modèle : 40, sans corroboration | V2 l. 282-292 ; 40 au lieu de 0 en V2 (D6-17) |
| Preuves des règles | Moyenne des niveaux de preuve des critères pondérée par leur maximum (N1 100, N2 80, N3 60, N4 40, N5 20), et niveau de la présence (N4 : 40). On garde la plus basse des deux | Échelle V2 `NIVEAU_FACTEUR` |
| Preuves du poste | Qualification de la fiche (`TOP_TIER` 100, `corroboree` 80, `a_verifier` 50, `candidate` 30), qui compte déjà les groupes de sources indépendants (QUAL-1, QUAL-2). Position non contrôlée : 40 au plus | Qualification de la phase 5 |
| Domaine de validité et précision | 100, moins les extrapolations et l'imprécision déclarées : plancher d'hiver de l'abri utilisé (60) ; régime déduit du type de poste (80) ; eau hors de 7 à 21,5 °C (60) ; maille de l'eau à plus de 15 km du poste (60) | Audit A6 ; `marineMaxKm`, `sstMaxKm` (`src/core/wxcore.js`) ; provisoire |

- **Agrégation provisoire** :
  - la Confiance est la plus basse des six dimensions, et la dimension limitante est nommée (« Confiance moyenne : preuves des règles ») ;
  - un maillon faible ne se compense pas par un maillon fort : c'est la logique de la sécurité, appliquée à la preuve ;
  - l'alternative est une moyenne pondérée (V2) : D6-07.
- **Niveaux** : haute ≥ 70, moyenne ≥ 40, faible < 40 (seuils V2 repris, provisoires).
- **Journal** : le nombre de sessions ne compte plus (audit A7). Un journal ne dit quelque chose qu'à travers le moteur 2, quand ses intervalles sont assez étroits (document 04).
- **Conséquence, sans données** : la présence est N4, donc « preuves des règles » vaut 40 au plus, et la Confiance BORD est **moyenne au mieux** tant que les valeurs de présence n'ont pas de meilleure preuve (test). C'est voulu : c'est ce que le moteur sait aujourd'hui.

## 5. Comment la Confiance encadre la publication

| Niveau publié | Conditions | À l'écran |
| --- | --- | --- |
| Nombre | tous les critères et l'eau connus (largeur 0), Confiance moyenne ou haute, fenêtre déterminée | « 72 », avec sa classe d'affichage |
| Classe d'affichage seule | tout est connu, mais la Confiance est faible | « Bon », sans nombre |
| Fourchette | intervalle de 1 à 20 points | « 60 à 75 » |
| Qualitatif | intervalle de plus de 20 points, au moins la moitié des maximums connue | « au moins Moyen » (classe de la borne basse) |
| Aucune note « — » | moins de la moitié des maximums connue, ou fenêtre non déterminable | « — », avec la raison ; aucune valeur de rang |
| Non recommandé | sécurité DANGER ou BLOCKED | « Non recommandé », avec la raison ; la Favorabilité n'est pas affichée à côté |

- **Rôle de la Confiance** : elle ne déplace jamais la valeur ni le rang ; elle peut seulement retirer le nombre (`publier`, test).
- **Sécurité autre que SAFE** : un spot CAUTION ou INSUFFICIENT_DATA est publié selon les mêmes règles, avec son état de sécurité écrit à côté, dans le groupe « à vérifier » (§ 7).
- **Fourchette et jauge.** La jauge du § 6.7.5.1 montre une seule valeur, et son chiffre, sa longueur et sa couleur doivent correspondre. Une fourchette demande donc un état de jauge à dessiner (phases 9 et 12). Le filtre « Favorables » ne lit que les notes complètes.
- **Question ouverte, chiffrée (D6-02)** : l'incertitude des paramètres eux-mêmes est-elle à publier ?
  - Avec tout connu, la note d'un spot varie, sous les tirages de paramètres de niveau 4 (poids ±40 %, présence), dans un intervalle à 90 % de **12 points** en médiane et de 28 au 95ᵉ centile (`e6.incertitudeDeModeleParSpot`).
  - Ces chiffres sont **optimistes** : l'étude ne perturbe que les poids globaux et la présence. Avec les hypothèses seules, la phase 8 V2 trouvait un Top 3 tenu 80 % du temps sur 63 journées sur 241 seulement (document 05 § 3).
  - L'inclure ferait publier une fourchette presque partout. C'est un changement de l'écran validé, présenté avec son impact et non appliqué.

## 6. Contrat de sécurité BORD (§ 9.5)

Indépendant des deux scores, appliqué avant toute recommandation. Prototype : `securite.mjs`, 14 tests.

- **Entrées normalisées** : seule une valeur numérique finie compte comme connue ; un oui-non absent est inconnu.
- **Côte ouverte** : tout ce qui n'est pas une rade connue (définition V2, `isRade`). Un havre ou une embouchure hors rade est en côte ouverte ; un poste dont la situation est inconnue aussi.

| État | Quand (règles V2 existantes ou contrat V3, aucune valeur inventée) | Source |
| --- | --- | --- |
| BLOCKED | Fermeture ou interdiction officielle **applicable au poste** à la date (arrêté lu, application au poste vérifiée) | Réglementation de la fiche |
| DANGER | Vent moyen force 8 et plus, ou rafales de 90 km/h et plus | `filtre-vent` N1 (Météo-France) |
| DANGER | Houle au-delà du maximum du poste + 0,5 m, ou au-delà du maximum sur un poste engagé ; houle inconnue sur un poste engagé | Règle V2, maximums N4 |
| DANGER | Coefficient au-delà de la limite de courant documentée ; isolement par le flot pendant le créneau ; nuit sur un poste engagé | Fiche du poste ; règle V2 validée |
| INSUFFICIENT_DATA | Vent, rafales, direction (force 2 et plus) ou houle (côte ouverte) inconnus ou illisibles ; maximum de houle inconnu en côte ouverte ; engagement inconnu ; accès selon la marée inconnu ; coefficient inconnu face à une limite documentée ; nuit, ou heure de lever ou de coucher inconnue, sur un poste engagé ou d'engagement inconnu ; réglementation locale non lue, ou application au poste « à vérifier » (exemple : la fermeture du bar au cap Fréhel, du 1er mars au 31 mai, dont l'application au poste reste à vérifier) | § 9.5 ; audit A12 ; D6-15 |
| CAUTION | Force 6 ou 7, ou rafales de 60 à 89 km/h ; houle au-dessus du maximum de 0,5 m au plus sur un poste non engagé | Prudence validée par Félix le 13 nov. 2026 |
| SAFE | Aucune des règles ci-dessus | « Aucune alerte connue sur les facteurs évalués » : ce n'est pas « sûr » ; « vérifie sur place » reste affiché |

- **Résultat** :
  - l'état le plus sévère, dans l'ordre BLOCKED, DANGER, INSUFFICIENT_DATA, CAUTION, SAFE (provisoire, D6-09) ;
  - `blocking_reasons[]` avec toutes les raisons, chacune avec sa règle et sa source ;
  - les données utilisées, avec leur heure.
- **Prudences V2, reprises telles quelles (D6-19)** : consignes actives de la fiche (par exemple « la mer qui monte coupe le retour »), poste engagé, nuit sur un poste de niveau 2.
  - Elles sont affichées au premier niveau (SEC-04), comme l'indicateur « prudence » de la V2 (`safetyOf`).
  - Elles ne changent ni l'état ni le rang, comme en V2. Les classer en CAUTION retirerait du Top documenté les 16 spots engagés : c'est l'option à arbitrer.
- **Facteurs du § 9.5 non évalués**, toujours listés avec l'état :
  - période et direction de la houle ;
  - ressac et rochers glissants ;
  - échappatoire et repli ;
  - visibilité ;
  - limite de courant quand la fiche n'en documente pas (92 fiches sur 98).
  - Les traiter comme inconnus rendrait tous les postes INSUFFICIENT_DATA pour toujours (D6-16).
- **Impact mesuré (D6-15)** : avec les données de sécurité actuelles des fiches, **8 fiches sur 98 seulement peuvent être SAFE un jour**, quelle que soit la météo (`e9`). Ce sont barnenez, carantec, kermorvan, kernic, mousterlin, penmarch, saintemarguerite et terenez. Pour les 90 autres :
  - l'accès selon la marée est inconnu sur 75 fiches ;
  - la réglementation locale n'est pas lue sur 35 (dont la Manche) ;
  - l'engagement est inconnu sur 32 ;
  - la houle maximale est inconnue sur 32.
  - En V2, l'absence de règle d'isolement valait « pas d'isolement ». La règle V3 « une donnée de sécurité inconnue n'est jamais au vert » change ce comportement. Ce changement est présenté avec son impact, et la phase 7 doit combler ces données (06, I6-04).
- **Désaccord des modèles et météo changeante** : la sécurité lit le plus fort des deux modèles et des heures du créneau (D6-14 ; test et scénarios S12, S13).
- **Vigilance Météo-France** : non lue tant que V3-011 n'est pas réalisé. Un rappel s'affiche toujours, jamais « aucune vigilance ». Proposition pour quand elle sera lue : orange ou rouge vent ou vagues-submersion → DANGER, jaune → CAUTION (D6-20).
- **Seuils de vent** (Félix, 13 nov. 2026, « à revoir en phase 6 ») : revus. Aucune preuve trouvée ne justifie de les changer :
  - le seuil de non-recommandation suit Météo-France ;
  - le seuil de prudence fait passer 1 % des spots praticables en « à vérifier » sur l'année, mais 13 % en février (phase 8 V2).
  - Proposition : les garder (D6-10).

## 7. Règle de classement (§ 9.1.6, § 9.1.7)

Prototype : `classement.mjs`, 12 tests. Ordre des étapes verrouillé.

1. **Sécurité** : DANGER et BLOCKED ne sont pas recommandés (liste à part, avec la raison). INSUFFICIENT_DATA ne vaut jamais SAFE.
2. **Séparer « à vérifier »** : un spot va dans le groupe « à vérifier » quand l'un de ces cas se présente (liste provisoire, D6-18) :
   - sa sécurité est CAUTION (le « à vérifier » validé en V2) ou INSUFFICIENT_DATA ;
   - sa note n'est qu'un intervalle (critère ou eau inconnus, § 3) ;
   - la fiche a une lacune critique nommée : position non contrôlée, accès inconnu, fenêtre non déterminable, contradiction.

   Ce groupe n'est jamais mêlé aux spots documentés, ni utilisé pour compléter le Top. Son ordre d'affichage suit la borne basse, puis le temps de route. Le statut dépend des lacunes nommées, jamais du chiffre de la Confiance.
3. **Filtres opérationnels explicites** :
   - accès fermé ;
   - plus de 60 min de route (VALIDÉE, V3-007 : 60 gardé, 61 exclu) ;
   - temps de route inconnu (provisoire, D6-18).

   Chaque exclusion porte sa raison. Un temps estimé hors ligne sert au filtre et s'affiche « estimation » (RTE-02). Une impossibilité réglementaire passe par la sécurité (BLOCKED), pas par un second filtre.
4. **Favorabilité décroissante** : la note complète, sur la meilleure fenêtre SAFE du spot pour la date (choix de la fenêtre servant au rang : D6-18). Les fenêtres différentes sont signalées (REC-09).
5. **Égalité stricte** sur la note :
   - 3 spots par défaut ;
   - 4 ou 5 en cas d'égalité stricte au 3ᵉ rang ;
   - au-delà de 5 ex æquo, les 5 premiers par temps de route puis par identifiant du spot, et un accès aux autres ex æquo.

   Ce départage d'affichage ne fait sortir aucun ex æquo du Top.
6. **Place réservée** (VALIDÉE, V3-016 ; « route vérifiée » vient de REC-06) :
   - si aucun spot affiché n'est à 15 min ou moins de route vérifiée, le meilleur spot documenté à 15 min ou moins prend la 3ᵉ place, sans bonus et avec la mention « le plus proche » ;
   - jamais un spot « à vérifier » ou bloqué ;
   - les spots déplacés restent nommés (D6-08).
7. **La Confiance** est affichée à côté, sans effet sur les étapes 1 à 6.

## 8. Données manquantes (§ 9.1.5)

| Donnée | Si elle manque | Effet sur la Favorabilité | Effet sur la sécurité | Effet sur la Confiance |
| --- | --- | --- | --- | --- |
| Vent (force ou direction) | exclu du calcul | C4 de 0 à 30 : intervalle | INSUFFICIENT_DATA | couverture, accord |
| Rafales | — | aucun | INSUFFICIENT_DATA | données |
| Houle (côte ouverte) | — | contrat : seulement « mer formée » de jour, de 0 à 3. Le prototype A1, qui reprend les composantes V2, hérite encore du retrait du vent (audit A5, scénario S10) | INSUFFICIENT_DATA ; DANGER sur un poste engagé | couverture |
| Coefficient | exclu | C2 de 0 à 20 | INSUFFICIENT_DATA face à une limite documentée | couverture |
| Plage utile du coefficient (fiche) | INCONNUE, pas de plage par défaut | C2 de 0 à 20 | — | preuves du poste |
| Lumière (heure de lever ou de coucher) | exclue | C3 de 0 à 25 | INSUFFICIENT_DATA sur un poste engagé ou d'engagement inconnu | couverture |
| Température de l'eau | — | P de 0,3 à la saison : intervalle (D6-03) | — | domaine de validité |
| Fenêtre de marée de la fiche | « Fenêtre non déterminable » | « — » | — | fiche « à vérifier » |
| Engagement, accès selon la marée, maximum de houle, réglementation locale | INCONNU, non lue | aucun | INSUFFICIENT_DATA | preuves du poste |
| Temps de route | inconnu | aucun | — | spot exclu, raison écrite |
| Âge de la prévision | inconnu | aucun | — | données : 0 |

## 9. Explicabilité (§ 9.4 ; V3-029, du général au spécifique)

Le « Pourquoi ? » d'un spot donne, dans cet ordre :
1. la règle générale avant le cas du spot ;
2. la sécurité : état, raisons, prudences, facteurs non évalués, données et heure ;
3. la fenêtre `HH:MM–HH:MM` ou « Fenêtre non déterminable » et sa raison ;
4. la disponibilité biologique : saison, eau, lequel des deux limite, niveau de preuve ;
5. chaque critère : valeur lue, points sur maximum, raison, niveau de preuve et source ;
6. les critères manquants et la part couverte ;
7. l'intervalle et le niveau publié, avec la raison ;
8. la Confiance par dimension, avec la dimension limitante ;
9. le rang : quels spots le précèdent, égalité, place réservée ;
10. les alternatives : les spots au potentiel plus haut mais « à vérifier » ou plus loin, et les spots aux conditions plus prudentes.

Sans connaissance sourcée, une valeur s'affiche sans effet annoncé (MET-05). Aucune décomposition n'est inventée : chaque nombre affiché sort du calcul réel.

## 10. Couverture des exigences

| Exigence | Ce que le contrat fixe | Preuve |
| --- | --- | --- |
| REC-01 | Deux indicateurs, aucun composite | § 1 ; audit A7 |
| REC-02, REC-10 | Pertinence et boîte sans effet | § 2 ; garde-fou structurel ; scénario S18 |
| REC-03 | Confiance sans effet sur le rang, encadre la publication | § 4, § 5 ; tests d'invariance et de publication |
| REC-04, REC-05, REC-06 | Ordre, égalité stricte, place réservée | § 7 ; 12 tests |
| REC-08 | Aucune imputation, couverture affichée, « — » | § 3, § 8 ; audit A2 ; tests |
| REC-09 | Fenêtre ou « non déterminable » | § 7, § 9 ; audit A3 |
| REC-11 | Favorabilité sur la biologie, paramètres tracés | § 3 ; documents 02 à 05 |
| SEC-01, SEC-02, SEC-04 | Sécurité indépendante, inconnu jamais SAFE, poste engagé visible | § 6 ; 14 tests |
| SEC-05 | Seuils validés avant toute mise en ligne | § 6 ; D6-10 |
| RTE-01, RTE-02 | 60 min ; estimation marquée | § 7 ; tests |
| JRN-05 | Aucune conclusion sur trop peu de sorties | document 04 (identifiabilité, critère d'affichage) |

Statut : spécifié à titre provisoire. Rien n'est implémenté dans l'application (phases 9 et 10).
