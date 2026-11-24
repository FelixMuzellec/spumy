# Audit scientifique et mathématique du moteur BORD V2

Phase 6 V3, 24 nov. 2026. Statut du document : **PROVISOIRE**. Rien n'est changé dans `src/` : le référentiel interdit tout changement de moteur avant l'approbation qui suit la phase 9.

Ce document est la première pièce du dossier de conception du moteur BORD (`docs/moteur-bord/`). Il audite le moteur qui tourne aujourd'hui, avant toute proposition.

## 1. Méthode

- **Code lu ligne à ligne** :
  - `src/bord/engine/v2.js` (486 lignes) et `src/bord/engine/v2-params.js` (44 lignes) ;
  - les fonctions de présence de `src/bord/engine/model.js` (l. 542 à 585) ;
  - le filtre de sécurité de `src/bord/engine/safety.js` (l. 40 à 111).
- **Moteur réel exécuté.** Le moteur est assemblé par esbuild pour chacun des sept guides, comme `tests/v2.mjs`, puis évalué sur une grille de créneaux :
  - 66 spots ;
  - 4 mois (février, mai, août, novembre), avec une eau d'essai à 9, 13, 17 et 12 °C ;
  - 3 coefficients (35, 70 et 100) ;
  - fenêtre « prime » ou « bonne » ;
  - 4 lumières ;
  - vent de force 1, 3 ou 5, de face ou de dos ;
  - ciel clair ou couvert de jour.
- **47 520 créneaux en tout.** La recombinaison des composantes renvoyées par le moteur redonne exactement sa note sur les 47 520 créneaux (`recombinaisonEgaleMoteur: true`, `data/moteur-bord/resultats-etude.json`, test 27 de `tests/etude-moteur-bord.mjs`) : les architectures du document 03 partent donc des vraies composantes.
- **Échelle de preuve.** Les niveaux de preuve cités (N1 à N5) sont ceux de `data/knowledge/bar-bord.json` (N1 scientifique ou institutionnel, N2 observation documentée, N3 retour local identifiable, N4 hypothèse, N5 heuristique).
- **Limite (VÉRIFIÉ).** La grille est un plan factoriel d'essai, pas un échantillon de vraies journées : les parts de variance et les répartitions qu'elle donne dépendent du plan. Les seules mesures sur de vraies journées sont celles de la phase 8 V2 (`docs/rapports/PHASE-8.md`, 241 journées-guides).

## 2. Inventaire du moteur V2

### 2.1 Chaîne de calcul

```
sécurité (windowSafety) : bloqué → non recommandé ; doute → « à vérifier » ; sinon « aucune alerte connue »
Favorabilité = arrondi( Conditions × Présence )                                     v2.js l. 160-165
  Conditions = 100 × Σ points des critères connus / Σ maximum des critères connus     (renormalisation)
  pas de note si la part des maximums connus < 0,5                                    v2-params.js l. 10
  Présence = min(facteur de saison, facteur thermique), plancher 0,3                  v2.js l. 86-108
Pertinence = 100 × (couverture technique 50 + poids 25 + distance 25) / maximum connu  v2.js l. 215-257
Confiance = données 40 + modèles 20 + preuves 25 + journal 15                         v2.js l. 266-307
Journal : ±10 points affichés à partir de 5 sessions dont 2 avec prise                v2.js l. 310-317
Rang : éligible, sans doute, pertinent (si boîte complète), Favorabilité, distance, id  v2.js l. 342-356
```

### 2.2 Variables, valeurs et preuves

| Élément | Donnée d'entrée | Valeurs (V2) | Code | Preuve de la règle | Preuve de la valeur |
| --- | --- | --- | --- | --- | --- |
| C1 Fenêtre de marée | fenêtres de la fiche du guide (priorité « prime » ou « bon ») | 25 ou 15 sur 25 ; hors fenêtre : aucun créneau | v2.js l. 120 ; `okWin` l. 322 | `maree-flot` N2 | points : N4, aucune source |
| C2 Coefficient | coefficient du créneau ou coefficient maximal du jour au port du guide | trapèze sur 20 : 0 sous `lo`, rampe, plateau `o1`–`o2`, rampe, 0 au-delà de `hi` ; par défaut [30, 45, 75, 105] | l. 123-131 ; contexte l. 445 | `coefficient-plage-utile` N4 ; `courant-coefficient` N2 | bornes : quelques-unes sourcées (Térénez, Cotentin), les autres N4 |
| C3 Lumière | tranche de lumière (aube, jour, crépuscule, nuit), ciel, houle | aube ou crépuscule 25 ; nuit 15 ; jour 5, + 3 si couvert, + 0 à 3 selon la houle (0 à 1 m) | l. 133-144 | `lumiere-basse` N2 ; `ciel-couvert` N5 | points : N4 |
| C4 Vent et mer | force (Beaufort), direction, exposition et régime du spot | table `VENT_MER` sur 30 (3 régimes × 3 expositions × forces 0 à 7) | l. 37-48, 146-159 | `vent-exposition` N2 | table : N4, « reprise de la courbe de la v1 » (l. 35-36) |
| Saison | mois, régime (roche, plage, abri) | roche et plage : 0,6 / 0,5 / 0,55 / 0,75 / 0,95 / 1 de juin à octobre / 0,95 / 0,75 ; abri : écart réduit de moitié | model.js l. 559-574 | `migration-saisonniere` N1 | `saison-coefficients` N4 : « valeurs chiffrées écrites dans aucune source » |
| Thermique | température de l'eau mesurée ou prévue (sinon ignorée) | 0,30 < 7,5 °C ; 0,50 < 9,5 ; 0,75 < 11,5 ; 0,92 < 13,5 ; 1 jusqu'à 19 ; 0,90 jusqu'à 21,5 ; 0,72 au-delà ; abri : plancher 0,5 ou 0,6 sous 9,5 °C | model.js l. 576-585 ; v2.js l. 92-103 | `frai-temperature` N1 (frai ≥ 9 °C) ; `abri-hiver` N4 | `seuils-thermiques` N4 : « aucune source ne donne ces paliers » |
| Couverture minimale | part des maximums connus | 0,5 | v2-params.js l. 10 | — | N4 |
| Paliers | Favorabilité | 75, 65, 55, 45 (cinq paliers) | v2-params.js l. 11 | — | recalés en phase 8 V2 sur la distribution, pas sur des prises |
| Égalité | écart entre deux spots | 3 points | v2-params.js l. 13 | — | N4 |
| Pertinence | boîte à leurres, distance de la fiche | 50 / 25 / 25 ; trajet 45 min, décroissance jusqu'à 90 | l. 215-257 | — | décision V2 remplacée par V3-006 et V3-007 |
| Confiance | âge et échéance de la prévision, couverture, accord AROME/ECMWF, niveaux de preuve, nombre de sessions | 15 + 10 + 15 + 20 + 25 + 15 ; haute ≥ 70, moyenne ≥ 40 | l. 266-307 | — | pondérations N4 |
| Journal | rapport observé / prédit borné à ±18 % | ±10 points dès 5 sessions dont 2 avec prise | l. 310-317 | — | N4 |
| Sécurité | vent, rafales, houle, coefficient, isolement, nuit, engagement | à vérifier dès force 6 ou rafales 60 km/h ; non recommandé dès force 8 ou rafales 90 km/h ; houle au-delà du maximum : à vérifier jusqu'à +0,5 m puis non recommandé (engagé : non recommandé) ; coefficient au-delà de `coefHardMax`, isolement actif, nuit sur un spot engagé, houle inconnue sur un spot engagé : non recommandé | safety.js l. 40-101 | `filtre-vent` N1 (Météo-France) ; `filtre-prudence-felix` N5, validé par Félix le 13 nov. 2026 ; `houle-max-spot` N4 ; `nuit-spot-engage` N5 | seuils de vent validés ; maximums de houle par fiche N4 |

### 2.3 Données et dépendances

- **Prévisions** : Open-Meteo, avec deux modèles, AROME (`meteofrance_seamless`) et ECMWF (`ecmwf_ifs`), pour le vent, les rafales et le ciel ; l'API marine d'Open-Meteo pour la houle et la température de surface de l'eau (`src/core/wxcore.js` l. 4-15).
- **Marée** : calcul du guide (`makeTideFor`) au port de référence de chaque guide.
- **Spots** : fiches des sept guides V2 (`data/sites/<guide>.config.js`), avec régime, exposition, fenêtres de marée, plage de coefficient, maximum de houle, niveau d'engagement et règles d'isolement.
- **Niveaux de preuve** : `data/knowledge/preuves-niveaux.json` et `data/knowledge/bar-bord.json`.
- **Sans effet sur la Favorabilité V2** :
  - la pression atmosphérique, ce qui est conforme au § 9.1.3 ;
  - la pluie, les proies, la lune, la tendance de la température de l'eau et la vitesse du courant au poste.
  - La pluie, la houle (turbidité) et les proies servent aux conseils de leurres.

## 3. Ce qui est sain et doit rester

| Point | Preuve | Pourquoi le garder |
| --- | --- | --- |
| La sécurité passe avant tout et ne se compense jamais | `spotV2` ne note que les créneaux éligibles (l. 322-338) ; `windowSafety` bloque avant toute note | Conforme au § 9.5 et à SEC-01 |
| Une donnée de sécurité inconnue n'est jamais « au vert » | `windSafety` : vent, rafales ou houle inconnus → « à vérifier » (safety.js l. 55-62) | Conforme à SEC-02 (mais voir A12 pour l'engagement) |
| La Confiance ne change pas le rang | `rankCompareV2` ne lit jamais `conf` (l. 342-356), VÉRIFIÉ par lecture | Conforme à V3-006 et REC-03 |
| La présence multiplie les conditions | l. 165 : une note ≥ 65 exige des conditions ≥ 65 et une présence ≥ 0,65 ; sur la grille, aucune des 10 366 notes ≥ 65 n'a une présence < 0,6 | Une bonne météo ne compense jamais l'absence probable du poisson : c'est la chaîne « biologie d'abord » du § 9.1.1 |
| La note dit sur quelle part elle est calculée | `favLine` (l. 170-178) : « calculée sur N % des critères » ; « Pas de note » sous la moitié | Base de l'explicabilité (§ 9.4) et de REC-08 |
| Une température d'eau de saison n'est pas comptée deux fois | l. 92 : seule une mesure ou un modèle entre dans le facteur thermique | Évite un double compte saison–eau |
| Pas de pression atmosphérique | aucune lecture dans `favorability` | Conforme au § 9.1.3 et au § 9.1.8 |

## 4. Constats

Gravité :
- **MAJEUR** : contraire au référentiel ou à une décision validée, ou qui fausse la note ou la sécurité ;
- **MINEUR** : défaut réel d'effet limité ;
- **INFO** : limite à connaître.

Chaque constat est **VÉRIFIÉ** par le code et, quand c'est mesurable, par l'étude.

| N° | Gravité | Constat | Preuve | Effet | Proposition (PROVISOIRE) |
| --- | --- | --- | --- | --- | --- |
| A1 | MAJEUR | La Pertinence (boîte à leurres et distance) agit sur le rang : un spot « pas pertinent » passe derrière les autres quand la boîte est déclarée complète | `rankCompareV2` l. 348-350 ; `pertinence` l. 215-257 | Contraire à V3-006, REC-02, REC-10 et au § 9.1.6 (« ne pas déclasser un spot parce que l'utilisateur n'a pas renseigné son matériel ») | Supprimer la Pertinence du calcul et du rang ; garder les champs V2 en lecture pour la migration ; les leurres restent dans « Leurres conseillés » (01-CONTRAT § 3) |
| A2 | MAJEUR | Un critère manquant est retiré puis la note est renormalisée sur les critères connus : c'est une imputation cachée du critère manquant au taux moyen des autres | l. 160-165 | Vent inconnu sur la grille : erreur moyenne de 6,6 points, 16 au 95ᵉ centile, 26 au plus ; plus de 10 points d'erreur sur 21 % des créneaux (`e4.ventInconnu`). Contraire au § 9.1.5 (« jamais remplacée par zéro ou une valeur neutre ») ; REC-08, notée « Conforme » au registre, n'est que partielle | Publier un intervalle (critère manquant à 0 et à son maximum), jamais une renormalisation (architecture A1, document 03) |
| A3 | MAJEUR | La fenêtre de marée est une porte, pas un critère : hors fenêtre de la fiche, il n'y a pas de créneau. Dans une fenêtre, C1 ne prend que deux valeurs (25 ou 15) | `okWin` l. 322 ; l. 120 | Une fiche sans fenêtre documentée ne peut jamais être classée. Au format V3, les 98 fiches ont `windows.habituelles` INCONNU : les 66 spots V2 gardent les fenêtres de leur guide, les 32 candidates V3 n'en ont aucune ; l'accès selon la marée est INCONNU sur 75 fiches sur 98. Le R² univarié de C1 sur la grille n'est que de 0,066 | Contrat de fenêtre : `HH:MM–HH:MM` ou « Fenêtre non déterminable » avec sa raison (REC-09) ; une fiche sans fenêtre reste « à vérifier », jamais notée par défaut |
| A4 | MAJEUR | Saut de la lumière à l'aube et au crépuscule : une minute fait passer C3 de 25 à 5 à 11 points | l. 136-143 | Même créneau, aube contre plein jour ciel clair : 15,2 points d'écart en moyenne, 18 au plus (`e4.sautLumiereAubeContreJour`). `lumiere-basse` (N2) dit « davantage en lumière basse », sans ampleur ni marche ; la valeur de nuit (15) n'a aucune source | Fonction continue de la hauteur du soleil, ou classes gardées mais déclarées comme hypothèses ; À DÉCIDER (06, D6-05) |
| A5 | MINEUR | Une houle inconnue retire tout le critère « vent et mer » (30 points) alors que sa valeur ne lit que la force et l'exposition du vent ; et l'agitation est comptée deux fois (vent de mer en C4, « mer formée » en C3) | l. 148 ; l. 139-141 | Sur le vrai moteur : 55 spots sur 66 touchés, jusqu'à 20 points d'écart, 5,7 en moyenne (`e7.houleInconnueRetireLeVent`) ; double compte limité à 3 points | Séparer le vent (effet sur le poisson) de la houle (effet sur le poisson et la sécurité) ; une houle inconnue relève de la sécurité (INSUFFICIENT_DATA en côte ouverte), pas d'un retrait du vent |
| A6 | MAJEUR | Les valeurs de présence sont des hypothèses (N4), pour une part contredites, et elles pèsent le plus | model.js l. 559-585 ; `seuils-thermiques` : bars suivis jusqu'à 6,5 °C (de Pontual 2023), hivernage à 6,9 °C (Edwards 2025) | R² univarié de la présence sur la grille : 0,487, le plus fort ; première source de variance de la phase 8 V2 (21,4 %). La présence à ×0,6 ou ×1,4 change le palier de 22 % ou 8 % des créneaux (`e5`). Une eau inconnue fait remonter la note, parce que le minimum ne s'applique plus : +1,1 en moyenne sur la grille, et **+20 points** au retour de mai quand l'eau est en réalité à 10,5 °C (95 au lieu de 75, scénario S11) | Garder la structure (disponibilité biologique d'abord, § 9.1.4) ; porter l'incertitude des facteurs dans l'intervalle ; une eau inconnue élargit l'intervalle au lieu de remonter la note ; valeurs à challenger en phase 7 (recherche) et 8 (journal) |
| A7 | MAJEUR | La Confiance V2 est une somme pondérée arbitraire (15, 10, 15, 20, 25, 15) qui n'encadre rien : une note précise est publiée quelle que soit la Confiance. Le volet « journal » compte des sessions (15 points à 10 sessions), pas une qualité | l. 266-307 | Contraire au § 9.1.5 (dimensions visibles, pondération justifiée, Confiance qui encadre la précision publiée) ; REC-03 « Absent (précision affichée) » | Dimensions nommées, maillon le plus faible plutôt que somme, publication encadrée (01-CONTRAT § 5) |
| A8 | MAJEUR | Le journal donne un bonus ou un malus direct de ±10 points, affiché à côté de la note ; le rapport observé / prédit ignore les zéros structurels | l. 310-317 ; `calibrate` (journal.js) | Contraire au § 9.1.9 (« aucun bonus/malus direct et arbitraire ») ; le ratio naïf sous-estime θ de 25 % quand ψ = 0,6 (`e2.avecExces`) | Moteur 2 : θ et ψ séparés, attribution q_i des zéros, posterior exact en une dimension (document 04) ; aucun effet sur la note avant validation |
| A9 | MINEUR | Égalité : l'application annonce l'égalité à 3 points près, mais le rang départage au point près, puis par la durée fixe de la fiche, puis par l'identifiant | l. 351-355 ; v2-params.js l. 13 | Contraire au § 9.1.7 (égalité stricte, 4 ou 5 spots, départage validé seulement) ; REC-05 « Non conforme » | Égalité stricte sur la valeur de rang publiée ; départage par le temps de route réel ; plus de 5 ex æquo : les 5 premiers et un accès aux autres (`classement.mjs`) |
| A10 | MAJEUR | Le trajet est une durée fixe de la fiche, depuis l'origine du guide, dans la Pertinence (45 min, décroissance jusqu'à 90) ; la place réservée est celle d'une zone « local » | l. 238-245 ; v2-params.js l. 15 | Contraire à V3-007 (60 min de route réelle depuis la position, en filtre) et à V3-016 (15 min de route vérifiée) | Filtre explicite des 60 min ; place réservée sur route vérifiée, sans bonus (`classement.mjs`, tests) |
| A11 | MAJEUR | Trois états de sécurité (bloqué, doute, rien) contre cinq en V3 : une donnée inconnue et une prudence connue tombent dans le même « à vérifier » | safety.js l. 83-101, 107-111 | Le § 9.5 exige SAFE, CAUTION, DANGER, BLOCKED et INSUFFICIENT_DATA, avec `blocking_reasons[]` | Contrat en cinq états (`securite.mjs`, 01-CONTRAT § 6) |
| A12 | MAJEUR | Sécurité : un niveau d'engagement absent est lu comme « non engagé ». La nuit et la houle inconnue ne sont alors plus bloquées | safety.js l. 88 (`spot?.dangerLevel >= 3`) ; sur le vrai moteur : engagé de nuit bloqué, engagement absent de nuit ni bloqué ni « à vérifier » (`e7.engagementInconnuDeNuit`) | Sans effet sur les 66 spots V2 (tous ont un niveau). Sur les 32 fiches V3 dont l'engagement est INCONNU, ce serait une recommandation dangereuse (défaut bloquant du § 14.2) | Engagement inconnu → INSUFFICIENT_DATA ; de nuit, jamais SAFE (`securite.mjs`, test) |
| A13 | MAJEUR | La précision publiée dépasse ce que le moteur sait | Phase 8 V2 : trois premiers stables dans 80 % des tirages sur 20 journées sur 241 seulement (FAILED). Étude, paramètres seuls, météo fixe : Top 3 inchangé dans 85 % des tirages, et tenu dans 80 % des tirages sur 478 situations sur 672 (`e6`). Un poids de critère à ±40 % change le palier V2 de 12 à 18 % des créneaux, et la classe d'affichage V3 (§ 6.7.5.1) de 8 à 12 % (`e5`) | Une note entière sur 100 et cinq paliers de 10 points suggèrent une précision que rien ne soutient (§ 9.1.4 : « une précision trompeuse ») | Publication encadrée par l'intervalle et la Confiance : nombre, fourchette, qualitatif ou « — » (01-CONTRAT § 5) |
| A14 | INFO | Les paliers V2 75, 65, 55, 45 sont recalés sur la distribution des notes, pas sur des prises ; la note /100 n'est pas une probabilité. L'écran V3 suit d'autres classes, les six du référentiel (§ 6.7.5.1 : 0–19, 20–39, 40–59, 60–74, 75–89, 90–100) | v2-params.js l. 11 ; phase 8 V2 | Sur la grille : 36,7 % des créneaux sous 45 et 8,1 % à 75 et plus (paliers V2) ; 0,8 % à 90 et plus (classes V3) ; dépend du plan | Paliers V2 gardés dans l'application en ligne jusqu'à l'intégration (décision consignée) ; classes V3 pour l'écran V3, sans sens de probabilité ; recalibration en phase 8 |
| A15 | MAJEUR | Compensation à l'intérieur des conditions : la somme des quatre critères laisse une note « favorable » à un créneau dont le coefficient est hors de la plage utile du spot | l. 129, 160-162 | 609 des 10 366 créneaux à 65 ou plus ont 0 point de coefficient (« l'eau ne travaille pas » ou courant trop fort du bord) ; 617 ont un critère à 20 % ou moins de son maximum (`e4.compensation`). La grille n'applique pas la sécurité : au-delà de `coefHardMax`, le créneau serait bloqué | Une condition qui rend le poste non pêchable plafonne la note au lieu de s'additionner (veto ou plafond) ; À DÉCIDER (06, D6-04) |
| A16 | MINEUR | Le coefficient sert de substitut au courant : coefficient maximal du jour au port du guide quand le créneau n'en a pas ; plage par défaut [30, 45, 75, 105] pour les spots sans bornes | l. 123-127 ; l. 445 | `courant-coefficient` N2 relie le coefficient à la vitesse du courant, pas au courant du poste ; la plage par défaut est une hypothèse posée sur les spots non documentés | Plage utile déclarée INCONNUE quand la fiche n'en a pas (intervalle) ; courant du poste : candidat de recherche (02) |
| A17 | INFO | Variables absentes : tendance de la température de l'eau, vitesse du courant au poste, turbidité (sauf conseils de leurres), apports d'eau douce, lune, pression | `favorability` | Conforme pour la pression et la lune (aucune preuve de gain) ; les autres sont examinées au document 02 | Aucun ajout sans preuve et sans donnée (02) |

## 5. Synthèse

- **Structure** : le moteur V2 suit la bonne chaîne, la présence du poisson d'abord, puis les conditions, la sécurité à part. Il garde ce qu'il faut garder (§ 3).
- **Défauts de contrat** :
  - la Pertinence dans le rang (A1) ;
  - l'imputation cachée des données manquantes (A2) ;
  - la Confiance qui n'encadre rien (A7) ;
  - le bonus du journal (A8) ;
  - l'égalité et le trajet (A9, A10) ;
  - les trois états de sécurité (A11).
- **Défaut de sécurité latent** : l'engagement inconnu (A12), sans effet en V2, à ne pas reprendre en V3.
- **Défauts de modélisation** : le saut de lumière (A4), le vent retiré par une houle inconnue (A5), la compensation additive (A15), le coefficient comme substitut du courant (A16).
- **Défaut de preuve** : les valeurs qui pèsent le plus, la présence et les tables de points, sont des hypothèses N4 (A6).
- **Défaut de précision publiée** : la stabilité ne permet pas de publier une note entière sans encadrement (A13).

Aucun constat ne conduit à changer le moteur en ligne maintenant : le référentiel l'interdit avant la phase 9. Les propositions sont reprises dans le contrat (01), les architectures (03) et le registre des décisions (06).
