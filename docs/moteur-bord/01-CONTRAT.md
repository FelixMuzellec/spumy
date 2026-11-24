# Contrat du moteur BORD : Favorabilité, Confiance, sécurité, classement

Phase 6 V3, 24 nov. 2026. Statut : **PROVISOIRE**.
- Seuils, poids et formules restent ouverts jusqu'à la revue contradictoire de la phase 8 et à la consolidation de la phase 9.
- Les questions sont au registre (06, D6-01 à D6-14).
- Les points déjà validés avec Félix sont repris tels quels et signalés (VALIDÉE).

Portée : le bar depuis le bord. Le mode BATEAU garde ses propres règles (§ 9.1.7) : rien de ce contrat ne s'y applique d'office.

## 1. Deux indicateurs, et seulement deux (VALIDÉE, V3-006)

| | Favorabilité | Confiance |
| --- | --- | --- |
| Ce qu'elle dit | Potentiel halieutique attendu pour le bar, sur un poste, pour un créneau : échelle de synthèse 0 à 100 | Solidité des données et des preuves qui soutiennent cette Favorabilité, pour ce poste et ce créneau : 0 à 100 |
| Ce qu'elle n'est pas | Une probabilité de capture ; une note de sécurité ; une note de matériel | Une probabilité ; un coefficient ; un facteur de rang ; une note de sécurité |
| Ce qui la fait varier | Les données biologiques et environnementales retenues (document 02) | La qualité, la fraîcheur, la couverture, l'accord et la provenance de ces données et des règles |
| Effet sur le rang | Oui : Favorabilité décroissante parmi les admissibles | **Aucun** : ni éligibilité, ni ordre, ni départage |
| Effet sur la publication | — | Peut seulement **baisser** le niveau de précision publié (§ 5), jamais l'élever |

Interdits (§ 9.1) : toute note composite, tout produit Favorabilité × Confiance, tout bonus ou malus de Confiance. Le test d'invariance correspondant existe : changer toutes les Confiances ne change ni l'éligibilité ni l'ordre (`tests/etude-moteur-bord.mjs`).

## 2. Ce qui sort du calcul

| Élément V2 | Sort | Raison |
| --- | --- | --- |
| Pertinence (boîte, poids, distance) | Supprimée du calcul, de l'écran et du rang ; champs V2 en lecture pour la migration seulement | V3-006, REC-02, audit A1 |
| Boîte à leurres | Ne sert qu'à personnaliser « Leurres conseillés » ; le conseil générique est le même quelle que soit la boîte | § 9.1.6, REC-10 |
| Bonus du journal (±10) | Retiré de l'écran et de la note | § 9.1.9, audit A8 ; le journal alimente le moteur 2 (document 04) |
| Probabilité interne de capture | Non calculée en production, non affichée | Document 04 : rien n'est estimable avec les données disponibles (décision provisoire D6-12) |
| Note sur 10 (moteur v1) | Retirée en BORD | ADR-V3-015, REC-12 |

## 3. Favorabilité : structure provisoire

L'architecture retenue à titre provisoire est **A1** (document 03) : les composantes du moteur V2, sans imputation cachée.

- **Disponibilité biologique** P ∈ [0,3 ; 1] : la plus restrictive de la saison et de la température de l'eau (structure V2 gardée, valeurs N4 à challenger, audit A6).
- **Conditions** : somme des points des critères connus C1 à C4 sur leurs maximums (25, 20, 25, 30). Un critère inconnu n'est pas retiré puis renormalisé : il prend sa plage entière, de 0 à son maximum.
- **Intervalle** :
  - `bas = arrondi(P × Σ points connus)` ;
  - `haut = arrondi(P × (Σ points connus + Σ maximums inconnus))` ;
  - quand tout est connu, `bas = haut` = la note.
- **Eau inconnue** : la saison seule fixe P aujourd'hui, ce qui remonte la note (audit A6). Provisoire : le facteur thermique inconnu élargit l'intervalle (P de « minimum plausible du mois » à « saison »), au lieu d'être ignoré (D6-03).
- **Valeur de rang** : la borne basse `bas`. Une donnée inconnue ne fait donc jamais monter un spot (D6-01).
- **Condition qui rend le poste non pêchable** (coefficient hors plage utile, audit A15) : plafond ou veto, plutôt qu'une addition (D6-04).

La note /100 reste une échelle de synthèse, jamais une probabilité.
- **Écran V3** : les six classes du référentiel (§ 6.7.5.1), communes à la Favorabilité et à la Confiance : 0–19 Très faible, 20–39 Faible, 40–59 Moyen, 60–74 Bon, 75–89 Très bon, 90–100 Excellent. « Favorables » = 75 et plus, sécurité permise, pas « à vérifier » (VALIDÉE, V3-021).
- **Application en ligne** : les paliers V2 (75, 65, 55, 45) restent jusqu'à l'intégration (registre V2).

## 4. Ce que la Confiance mesure

Six dimensions, chacune notée de 0 à 100 par une règle écrite, toutes visibles dans « Pourquoi ? ».

| Dimension | Règle provisoire | Source de la règle |
| --- | --- | --- |
| Données : fraîcheur et échéance | âge de la prévision < 6 h : 100 ; < 24 h : 50 ; au-delà : 0. Jour même : 100 ; J+1 : 83 ; J+2 : 67 ; J+3 et au-delà : 50 ; on garde la plus basse des deux | Règles V2 (`confidenceV2` l. 270-277), N4 |
| Couverture | 100 × part des maximums de critères connus | V2 l. 278, N4 |
| Accord des modèles | AROME contre ECMWF, sur la force et la direction du vent (règle V2, ramenée à 100) ; un seul modèle : 50, accord inconnu | V2 l. 282-292 ; le 50 est un choix provisoire |
| Preuves des règles | moyenne des niveaux de preuve des critères pondérée par leur maximum (N1 100, N2 80, N3 60, N4 40, N5 20), et niveau de la présence (N4 : 40) ; on garde la plus basse des deux | Échelle V2 `NIVEAU_FACTEUR` |
| Preuves du poste | qualification de la fiche : `TOP_TIER` 100, `corroboree` 80, `a_verifier` 50, `candidate` 30 ; position non contrôlée : 40 au plus | Qualification de la phase 5 (QUAL-1 à QUAL-7) |
| Domaine de validité | 100, moins les extrapolations déclarées : plancher d'hiver de l'abri utilisé (60), régime déduit du type de poste (80), eau hors de 7 à 21,5 °C (60) | Audit A6 ; provisoire |

**Agrégation provisoire** : la Confiance est la plus basse des six dimensions, et la dimension limitante est nommée (« Confiance faible : preuves du poste »). Un maillon faible ne se compense pas par un maillon fort ; c'est la logique de la sécurité, appliquée à la preuve. L'alternative est une moyenne pondérée (V2) : D6-07.

Niveaux : haute ≥ 70, moyenne ≥ 40, faible < 40 (seuils V2 repris, provisoires).

Le nombre de sessions du journal ne compte plus dans la Confiance (audit A7) : un journal ne dit quelque chose qu'à travers le moteur 2, quand ses intervalles sont assez étroits (document 04).

Conséquence chiffrée, sans données : la présence est N4, donc « preuves des règles » vaut 40 au plus et la Confiance BORD est **moyenne au mieux** tant que les valeurs de présence n'ont pas de meilleure preuve. C'est voulu : c'est ce que le moteur sait aujourd'hui.

## 5. Comment la Confiance encadre la publication

| Niveau publié | Conditions (toutes) | À l'écran |
| --- | --- | --- |
| Nombre | intervalle ≤ 10 points ; Confiance moyenne ou haute ; fenêtre déterminée ; sécurité SAFE | « 72 » |
| Fourchette | intervalle ≤ 20 points ; ou intervalle ≤ 10 avec une Confiance faible | « 60 à 75 » |
| Qualitatif | intervalle > 20 points et au moins la moitié des maximums connue | « au moins Moyen » (palier de la borne basse) |
| Aucune note « — » | moins de la moitié des maximums connue ; fenêtre non déterminable ; ou sécurité DANGER ou BLOCKED (« Non recommandé », raison écrite) | « — », avec la raison |

- La Confiance ne déplace jamais la valeur ni le rang.
- **Fourchette et jauge.** La jauge du § 6.7.5.1 montre une seule valeur, et son chiffre, sa longueur et sa couleur doivent correspondre. Une fourchette demande donc un état de jauge à dessiner (phases 9 et 12). Le filtre « Favorables » lit la borne basse.
- La Confiance ne peut que faire passer d'un nombre à une fourchette.
- Le seuil de 10 points est provisoire (D6-02).

**Question ouverte, chiffrée (D6-02)** : l'incertitude des paramètres eux-mêmes est-elle à publier ?
- Avec tous les critères connus, la note d'un spot varie, sous les tirages de paramètres de niveau 4 (poids ±40 %, présence), dans un intervalle à 90 % de **12 points** en médiane et de 28 au 95ᵉ centile, et de plus de 10 points dans 81 % des cas (`e6.incertitudeDeModeleParSpot`).
- L'inclure ferait publier une fourchette presque partout. C'est un changement de l'écran validé, présenté avec son impact et non appliqué.

## 6. Contrat de sécurité BORD (§ 9.5)

Indépendant des deux scores, appliqué avant toute recommandation ; prototype `scripts/etude-moteur-bord/securite.mjs`, 9 tests.

| État | Quand (règles V2 existantes, aucune inventée) | Source |
| --- | --- | --- |
| BLOCKED | fermeture ou interdiction officielle à la date (arrêté lu dans la fiche, par exemple la fermeture du bar au cap Fréhel du 1er mars au 31 mai) | réglementation de la fiche |
| DANGER | vent moyen force 8 et plus, ou rafales de 90 km/h et plus | `filtre-vent` N1 (Météo-France) |
| DANGER | houle au-delà du maximum du poste + 0,5 m, ou au-delà du maximum sur un poste engagé ; houle inconnue sur un poste engagé | règle V2, maximums N4 |
| DANGER | coefficient au-delà de la limite de courant documentée ; isolement par le flot pendant le créneau ; nuit sur un poste engagé | fiche du poste ; règle V2 validée |
| INSUFFICIENT_DATA | vent, rafales, direction (force ≥ 2) ou houle (côte ouverte) inconnus ; maximum de houle inconnu en côte ouverte ; **engagement inconnu** ; accès selon la marée inconnu ; nuit sur un poste dont l'engagement est inconnu | § 9.5 ; audit A12 |
| CAUTION | force 6 ou 7, ou rafales de 60 à 89 km/h ; houle au-dessus du maximum de 0,5 m au plus sur un poste non engagé | prudence validée par Félix le 13 nov. 2026 |
| SAFE | aucune des règles ci-dessus | « aucune alerte connue » : ce n'est pas « sûr » ; « vérifie sur place » reste affiché |

- **Résultat** :
  - l'état le plus sévère, dans l'ordre BLOCKED, DANGER, INSUFFICIENT_DATA, CAUTION, SAFE (ordre provisoire, D6-09) ;
  - `blocking_reasons[]` avec toutes les raisons, chacune avec sa règle et sa source ;
  - les données utilisées, avec leur heure.
- **Désaccord des modèles** : quand AROME et ECMWF diffèrent, la sécurité lit le plus sévère des deux, et le pire moment du créneau (D6-14 ; scénarios S12 et S13).
- **Vigilance Météo-France** : non lue tant que V3-011 n'est pas réalisé. Un rappel s'affiche toujours, jamais « aucune vigilance ».
- **Seuils de vent** (Félix, 13 nov. 2026, « à revoir en phase 6 ») : revus. Aucune preuve trouvée ne justifie de les changer :
  - le seuil de non-recommandation suit Météo-France ;
  - le seuil de prudence ne coûte que 1 % des spots praticables (phase 8 V2).
  - Proposition : les garder (D6-10).

## 7. Règle de classement (§ 9.1.6, § 9.1.7)

Prototype `scripts/etude-moteur-bord/classement.mjs`, 10 tests.

1. **Sécurité** : DANGER et BLOCKED ne sont pas recommandés (liste à part, avec la raison) ; INSUFFICIENT_DATA ne vaut jamais SAFE.
2. **Séparer « à vérifier »** : un spot va dans le groupe « à vérifier » quand sa sécurité est CAUTION ou INSUFFICIENT_DATA, ou quand la fiche a une lacune critique nommée :
   - position non contrôlée ;
   - accès inconnu ;
   - fenêtre non déterminable ;
   - contradiction.
   Ce groupe n'est jamais mêlé aux spots documentés ni utilisé pour compléter le Top. Le statut dépend des lacunes nommées, jamais du chiffre de la Confiance.
3. **Filtres opérationnels explicites** :
   - accès fermé ;
   - pêche interdite au poste à la date ;
   - plus de 60 min de route (VALIDÉE, V3-007 : 60 gardé, 61 exclu) ;
   - temps de route inconnu.
   Chaque exclusion porte sa raison. Un temps estimé hors ligne sert au filtre et s'affiche « estimation » (RTE-02).
4. **Favorabilité décroissante** (valeur de rang, § 3).
5. **Égalité stricte** sur la valeur de rang : 3 spots par défaut, 4 ou 5 en cas d'égalité stricte au 3ᵉ rang, au-delà de 5 les 5 premiers et l'accès aux autres ex æquo. Départage d'affichage par le temps de route, puis par le nom ; ce départage ne fait pas sortir un ex æquo du Top.
6. **Place réservée** (VALIDÉE, V3-016) :
   - si aucun spot affiché n'est à 15 min ou moins de route **vérifiée**, le meilleur spot documenté à 15 min ou moins prend la 3ᵉ place, sans bonus et avec la mention « le plus proche » ;
   - jamais un spot « à vérifier » ou bloqué ;
   - les spots déplacés restent nommés (D6-08).
7. **La Confiance** est affichée à côté, sans effet sur 1 à 6.

## 8. Données manquantes (§ 9.1.5)

| Donnée | Si elle manque | Effet sur la Favorabilité | Effet sur la sécurité | Effet sur la Confiance |
| --- | --- | --- | --- | --- |
| Vent (force ou direction) | exclue du calcul | C4 de 0 à 30 : intervalle | INSUFFICIENT_DATA | couverture et accord baissent |
| Rafales | — | aucun | INSUFFICIENT_DATA | données |
| Houle (côte ouverte) | — | lumière de jour : « mer formée » de 0 à 3 | INSUFFICIENT_DATA, DANGER sur un poste engagé | couverture |
| Coefficient | exclu | C2 de 0 à 20 | — | couverture |
| Plage utile du coefficient (fiche) | INCONNUE, pas de plage par défaut | C2 de 0 à 20 | — | preuves du poste |
| Lumière (heure de lever ou de coucher) | exclue | C3 de 0 à 25 | nuit inconnue sur un poste engagé : INSUFFICIENT_DATA | couverture |
| Température de l'eau | ignorée aujourd'hui | intervalle sur P (D6-03) | — | domaine de validité |
| Fenêtre de marée de la fiche | « Fenêtre non déterminable » | « — » | — | fiche « à vérifier » |
| Engagement, accès selon la marée, maximum de houle | INCONNU | aucun | INSUFFICIENT_DATA | preuves du poste |
| Temps de route | inconnu | aucun | — | spot exclu, raison écrite |

## 9. Explicabilité (§ 9.4 ; V3-029, du général au spécifique)

Le « Pourquoi ? » d'un spot donne, dans cet ordre :
1. la règle générale avant le cas du spot ;
2. la sécurité (état, raisons, données et heure) ;
3. la fenêtre `HH:MM–HH:MM` ou « Fenêtre non déterminable » et sa raison ;
4. la disponibilité biologique (saison, eau, lequel des deux limite, niveau de preuve) ;
5. chaque critère (valeur lue, points sur maximum, raison, niveau de preuve et source) ;
6. les critères manquants et la part couverte ;
7. l'intervalle et le niveau publié, avec la raison ;
8. la Confiance par dimension, avec la dimension limitante ;
9. le rang : quels spots le précèdent, égalité, place réservée.

Sans connaissance sourcée, une valeur s'affiche sans effet annoncé (MET-05). Aucune décomposition n'est inventée : chaque nombre affiché sort du calcul réel.

## 10. Couverture des exigences

| Exigence | Ce que le contrat fixe | Preuve |
| --- | --- | --- |
| REC-01 | deux indicateurs, aucun composite | § 1 ; audit A7 |
| REC-02, REC-10 | Pertinence et boîte sans effet | § 2 ; audit A1 |
| REC-03 | Confiance sans effet sur le rang, encadre la publication | § 4, § 5 ; test d'invariance |
| REC-04, REC-05, REC-06 | ordre, égalité stricte, place réservée | § 7 ; 10 tests |
| REC-08 | aucune imputation, couverture affichée, « — » | § 3, § 8 ; audit A2, tests |
| REC-09 | fenêtre ou « non déterminable » | § 7, § 9 ; audit A3 |
| REC-11 | Favorabilité sur la biologie, paramètres tracés | § 3 ; documents 02 à 05 |
| SEC-01, SEC-02 | sécurité indépendante, inconnu jamais vert | § 6 ; 9 tests |
| SEC-05 | seuils validés avant toute mise en ligne | § 6 ; D6-10 |
| RTE-01, RTE-02 | 60 min ; estimation marquée | § 7 ; tests |
| JRN-05 | aucune conclusion sur trop peu de sorties | document 04 (identifiabilité) |

Statut : spécifié à titre provisoire. Rien n'est implémenté dans l'application (phases 9 et 10).
