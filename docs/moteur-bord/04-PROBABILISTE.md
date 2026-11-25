# Modèle probabiliste (moteur 1) et journal (moteur 2)

Phase 6 V3, 24 nov. 2026. Statut : **PROVISOIRE**. Ce document examine le modèle ZINB et GAMM du § 9.1.8 et la mise à jour bayésienne du § 9.1.9.

- **Code** : `scripts/etude-moteur-bord/zinb.mjs`.
- **Calculs** : expériences E1 à E3 de `etude.mjs`, résultats dans `data/moteur-bord/resultats-etude.json`.
- **Tests** : 20 tests dans `tests/etude-moteur-bord.mjs`.

## 1. Conclusion d'abord

- **Écriture du référentiel** : les formules sont justes, avec la convention π_zero = 1 − ψ (VÉRIFIÉ, § 2).
- **Ratio Gamma–Poisson** : il n'est le posterior exact que dans le cas Poisson sans excès de zéros. À k fini, il sous-estime l'incertitude. Avec des zéros structurels, le ratio naïf biaise θ vers le bas (VÉRIFIÉ, § 4).
- **Estimable aujourd'hui** : rien de statistique avec les données disponibles. Le journal compte 3 sessions ; ψ n'est pas identifiable sous plusieurs dizaines de sessions comparables, et ψ se confond avec l'effet de poste θ (VÉRIFIÉ par simulation, § 5).
- **ψ ne se tire pas de la présence P** : P vaut 1 de juin à octobre sur la côte ouverte, ce qui supprimerait tout zéro structurel et ramènerait l'estimateur au ratio naïf, biaisé de −34 à −36 % (§ 4.2, § 6.2).
- **Décision provisoire (D6-12)** : la probabilité interne de capture n'est ni calculée en production ni affichée. Elle reste un objet d'étude, hors application, jusqu'à ce que les conditions du § 9.1.8 soient réunies et qu'un affichage distinct soit approuvé en phase 9. Elle n'est jamais convertie en Favorabilité.

## 2. Vérifications mathématiques (E1)

| Identité | Vérification numérique | Résultat |
| --- | --- | --- |
| La NB2 de moyenne Λ et de taille k somme à 1, de moyenne Λ, de variance Λ + Λ²/k | sommes sur y = 0 à 399, pour (ψ, Λ, k) = (0,6 ; 0,8 ; 2), (0,9 ; 2,5 ; 0,7), (0,3 ; 0,2 ; 10) | égalités à 10⁻³ près |
| P(Y = 0) de la NB2 = (k / (k + Λ))^k | même calcul | égalité |
| P(Y ≥ 1) = ψ [1 − (1 + Λ/k)^(−k)] = 1 − P(Y = 0) du ZINB | même calcul | égalité |
| Limite k → ∞ : ψ (1 − e^(−Λ)) | écart à k = 1, 10, 100, 10⁴ : 0,107 ; 0,0145 ; 0,0015 ; 1,5 × 10⁻⁵ ; à 10⁸, moins de 10⁻⁸ (au niveau de la précision du calcul flottant) | décroissance monotone vers 0 |
| π_i⁽⁰⁾ (§ 9.1.9) = règle de Bayes (1 − ψ) / P(Y = 0) | même calcul | égalité |
| Convention : π_zero = 1 − ψ | ψ = 0,6, Λ = 0,8, k = 2 : P(Y = 0) = 0,7061 = 0,4 + 0,6 × (2/2,8)² et P(Y ≥ 1) = 0,2939 ; avec la convention inversée, ces valeurs changent | test dédié contre l'inversion silencieuse (valeurs non dégénérées) |
| Bornes | ψ = 0 : aucune capture ; 0 ≤ P(Y ≥ 1) ≤ 1 sur une grille de ψ, Λ et k | test |
| Une capture confirmée exclut le zéro structurel (q = 1) ; ψ = 1 : aucun zéro structurel | `zeroStructurel(1, Λ, k) = 0` | test |

## 3. Poisson, ZIP, NB, ZINB

| Modèle | Paramètres | D'où viennent les zéros | Ce qu'il faut pour l'estimer | Quand le préférer |
| --- | --- | --- | --- | --- |
| Poisson | λ (et θ) | du seul comptage | quelques sessions avec effort | aucune surdispersion ni excès de zéros visibles |
| ZIP | ψ, λ | état absent (1 − ψ) ou comptage | assez de sessions pour séparer les deux sources de zéros (§ 5) | excès de zéros, pas de surdispersion du comptage |
| NB | λ, k | comptage surdispersé | assez de sessions avec prise pour voir la dispersion | captures groupées, pas d'état absent distinct |
| ZINB | ψ, λ, k | état absent ou comptage surdispersé | le plus de données : ψ et k se confondent (beaucoup de zéros = ψ faible ou k faible) | seulement si ZIP et NB sont rejetés hors échantillon |

Règle du référentiel, reprise : le modèle le plus parcimonieux et stable au regard des données, jamais le plus sophistiqué par principe (§ 9.1.8).

## 4. Le ratio Gamma–Poisson contre le posterior exact (E2)

### 4.1 Démonstration

- **Cas Poisson, état actif connu, sans poids.** L'a priori est θ ~ Gamma(b₀, b₀), en forme et taux.
  - Vraisemblance : ∏ (θ Λᵢ)^{yᵢ} e^{−θ Λᵢ} / yᵢ! ∝ θ^{Σy} e^{−θ ΣΛ}.
  - Le posterior est donc Gamma(b₀ + Σy, b₀ + ΣΛ).
  - Sa moyenne est exactement le ratio (b₀ + Σy) / (b₀ + ΣΛ), son écart type √(b₀ + Σy) / (b₀ + ΣΛ).
- **Avec des poids ωᵢ.** Élever chaque vraisemblance à la puissance ωᵢ donne Gamma(b₀ + Σωy, b₀ + ΣωΛ).
  - C'est un posterior « tempéré » : la moyenne est exacte pour cette convention de travail.
  - Ce n'est pas le posterior d'un modèle génératif standard. Les poids sont une convention à documenter, pas une vérité.
- **Cas NB2, k fini.** La vraisemblance d'une session est ∝ θ^{y} (k + θΛ)^{−(k + y)}. Le facteur (k + θΛ)^{−(k + y)} n'est pas de la forme e^{−cθ}.
  - L'a priori Gamma n'est plus conjugué : le ratio n'est pas le posterior.
- **Cas ZINB.** Une bredouille a une vraisemblance (1 − ψ) + ψ P_NB(0 | θΛ), qui est un mélange.
  - Avec y = 0, le ratio naïf compte chaque bredouille comme un zéro de comptage, ce qui tire θ vers le bas.
  - L'estimateur de travail remplace le poids de chaque session par qᵢ, l'espérance de l'état actif (approximation de type EM, § 9.1.9).

### 4.2 Mesure

Mêmes 8 sessions fictives : y = 2, 0, 1, 0, 3, 0, 1, 0 et Λ_base de 0,6 à 1,6 ; b₀ = 2. Le posterior exact est calculé sur une grille fine (pas de 10⁻³).

| Cas | Ratio | Moyenne exacte | Écart type du ratio | Écart type exact | Intervalle exact 5 %–95 % |
| --- | --- | --- | --- | --- | --- |
| Poisson (k → ∞), ψ = 1 | 0,849 | 0,849 | 0,283 | 0,283 | 0,44 à 1,36 |
| k = 10, ψ = 1 | 0,849 | 0,854 | 0,283 | 0,297 | 0,44 à 1,40 |
| k = 2, ψ = 1 | 0,849 | 0,877 | 0,283 | 0,347 | 0,41 à 1,52 |
| k = 0,5, ψ = 1 | 0,849 | 0,940 | 0,283 | 0,470 | 0,37 à 1,83 |

| Cas avec excès de zéros (ψ = 0,6, k = 2) | θ |
| --- | --- |
| Ratio naïf, sans q | 0,849 |
| Estimateur de travail avec qᵢ (point fixe, 50 itérations) | 1,125 |
| Posterior exact (moyenne ; écart type) | 1,139 ; 0,479 |
| ψ de travail, a priori Beta(2, 2), mise à jour pondérée par qᵢ | 0,627 |

- **Lecture.** À k fini, le ratio donne presque la bonne moyenne quand k est grand, mais il sous-estime l'incertitude : d'un facteur 1,66 à k = 0,5. Afficher son écart type ferait croire à une précision qui n'existe pas.
- **Bredouilles, sur ce jeu.** Le ratio naïf sous-estime θ de 25 % quand une partie des bredouilles sont des zéros structurels. Avec qᵢ, l'écart au posterior exact tombe à 1,2 %.
- **Bredouilles, sur 400 jeux simulés** (θ vrai = 1, ψ = 0,6, k = 2, λ = 0,45 par heure, effort de 1 à 4 h, graine 777 ; `e2b`) :

| Sessions par jeu | Ratio naïf (moyenne) | Ratio de travail avec qᵢ | Posterior exact | Écart travail–exact : moyen (maximum) |
| --- | --- | --- | --- | --- |
| 8 | 0,66 | 0,95 | 1,01 | 0,08 (0,40) |
| 40 | 0,64 | 1,02 | 1,05 | 0,03 (0,16) |

  Le biais du ratio naïf ne diminue pas avec le nombre de sessions : c'est un biais, pas du bruit. Le ratio de travail reste un contrôle utile, mais l'écart peut atteindre 0,4 sur peu de sessions : la méthode proposée est le posterior exact (§ 6.2).
- **Conclusion.** Le § 9.1.9 a raison d'interdire la formule naïve sur des données avec zéros structurels.

## 5. Identifiabilité (E3)

- **Plan de simulation** :
  - ψ = 0,6 et k = 2 vrais ;
  - deux taux de captures, λ = 0,45 et 1,5 par heure (valeurs d'essai, non sourcées) ;
  - effort de 1 à 4 h ;
  - θ = 1 connu ;
  - 100 répétitions par taille d'échantillon, graine 20261124.
- **Estimation** : ψ et k par maximum de vraisemblance sur une grille (ψ de 0,04 à 1 ; k de 0,2 à 10⁶). « k ≥ 50 » signifie qu'on ne distingue pas la surdispersion d'un Poisson.

| Sessions | ψ à ±0,15 du vrai (λ = 0,45) | k ≥ 50 (λ = 0,45) | ψ à ±0,15 du vrai (λ = 1,5) | k ≥ 50 (λ = 1,5) |
| --- | --- | --- | --- | --- |
| 3 | 37 % | 51 % | 28 % | 36 % |
| 10 | 35 % | 58 % | 62 % | 26 % |
| 40 | 59 % | 25 % | 85 % | 4 % |
| 80 | 82 % | 16 % | 99 % | 0 % |
| 120 | 94 % | 10 % | 97 % | 0 % |
| 200 | 99 % | 2 % | 100 % | 0 % |

**ψ et θ ensemble** (k = 2 connu, λ = 0,45, 60 répétitions) : quand l'effet de poste θ doit aussi être estimé, comme au § 9.3, les deux se confondent.

| Sessions | ψ à ±0,15 | θ à ±25 % | Corrélation entre ψ̂ et θ̂ |
| --- | --- | --- | --- |
| 10 | 28 % | 27 % | −0,45 |
| 40 | 52 % | 45 % | −0,68 |
| 200 | 95 % | 87 % | −0,72 |

- **Lecture.**
  - Avec 3 ou 10 sessions, ψ n'est pas estimable, et la surdispersion est le plus souvent invisible.
  - Le nombre de sessions nécessaire dépend du taux de captures, inconnu : entre 40 environ (λ = 1,5 par heure) et 80 à 120 (λ = 0,45 par heure) pour estimer ψ huit fois sur dix, θ connu.
  - Il faut plus encore quand θ est aussi à estimer : une bredouille s'explique aussi bien par un poste moins productif (θ bas) que par un bar absent (ψ bas), d'où la corrélation négative.
  - Ces sessions doivent être comparables, dans un même groupe (même mode, même espèce, même saison, postes semblables). Le journal de Félix en compte 3, sur un seul guide (phase 8 V2).
  - **Rien n'est estimable aujourd'hui. Le premier niveau utile est descriptif** (§ 9.3.1, niveau 1).

## 6. Moteur 2 du journal : conception provisoire

### 6.1 Données admissibles (reprend le § 9.1.9, sans assouplissement)

| Enregistrement | Effet sur θ_x | Effet sur ψ |
| --- | --- | --- |
| Session complète, effort effectif Eᵢ, y confirmé ≥ 1 | oui, qᵢ = 1 | oui, qᵢ = 1 |
| Session complète, y = 0 confirmé explicitement | oui, avec qᵢ = 1 − πᵢ⁽⁰⁾ | oui, avec qᵢ |
| Résultat non confirmé, session interrompue, effort inexploitable | aucun | aucun |
| Prise isolée ajoutée après coup | aucun (pas de dénominateur d'effort) | aucune mise à jour ; indice de présence descriptif à son instant |
| Session marquée « dérangement manifeste » | exclue des mises à jour structurelles, coût statistique noté | idem |
| Autre espèce capturée | aucun pour le bar | aucun |
| Session dont les conditions historiques ne peuvent pas être reconstruites | aucune mise à jour environnementale | aucune |

- **Λ̂ᵢ^base** se reconstruit avec la version du moteur environnemental de la date de la session et les prévisions archivées de cette date. L'archive d'Open-Meteo a déjà servi à la phase 8 V2 : la reconstruction est faisable (INFÉRÉ).

### 6.2 Estimation proposée

1. **θ_x** : posterior en une dimension calculé sur une grille, a priori Gamma(b₀, b₀), vraisemblance ZINB de chaque session (`thetaPosterieur`).
   - Pour ψ et k fixés, c'est le posterior exact. Le calcul est léger : 12 000 points de grille, chacun évaluant toutes les sessions.
   - ψ et k doivent être donnés : aucun défaut silencieux vers ψ = 1 et k infini (test).
   - Un contrôle de troncature vérifie que la densité au bord de la grille reste négligeable (test).
   - Une bredouille sans qᵢ n'est jamais comptée active par défaut : le calcul s'arrête (test).
   - Le ratio de travail avec qᵢ reste la référence de contrôle, jamais la méthode.
2. **ψ et k** : fixés par l'a priori tant qu'ils ne sont pas identifiables (§ 5).
   - ψ : un a priori Beta(a_ψ, b_ψ) déclaré, de moyenne inférieure à 1 et jamais égale à 1, avec une analyse de sensibilité. Il n'est **jamais tiré de la présence P** : P est un facteur d'échelle N4 non calibré, pas une probabilité, et il vaut 1 l'été, ce qui supprimerait les zéros structurels et rendrait au ratio naïf son biais (§ 4.2).
   - P pourra orienter la moyenne a priori de ψ par saison seulement après une calibration (phase 8 et au-delà).
   - k est fixé par une hypothèse documentée, avec une analyse de sensibilité (k = 0,5 à ∞).
   - Mise à jour Beta pondérée par qᵢ seulement dans un groupe homogène défini d'avance (§ 9.1.9), et seulement quand son intervalle devient informatif.
3. **Poids ωᵢ** : forme candidate ω_long × ω_saison × exp(−ln 2 Δt / h_récent) (`poidsTemporel`), sans valeur approuvée.
   - La saison ne doit pas être comptée deux fois : si λ_env porte déjà la saison, ω_saison mesure seulement la transférabilité entre saisons (D6-13).
4. **Séparation θ et ψ** : avec peu de sessions, une bredouille s'explique aussi bien par ψ que par θ.
   - Fixer ψ par la biologie évite de faire porter à θ des zéros structurels, et l'inverse.
   - θ_x ne remplace jamais un effet aléatoire de poste équivalent dans λ_env (§ 9.1.8).
5. **Garde-fous** :
   - aucun effet de θ ou de ψ sur la Favorabilité, la Confiance, la sécurité ou le rang avant validation et approbation en phase 9 ;
   - toute version est versionnée et réversible ;
   - une seule prise ne déclenche rien ;
   - l'apprentissage est cloisonné par mode et par espèce (JRN-05).

### 6.3 Paramètres et biais à fixer avant toute implémentation

| Élément | Proposition provisoire | Limite |
| --- | --- | --- |
| Offset d'effort Eᵢ | durée effective du chronomètre (Start, Pause, Reprise, Stop), pauses et déplacements exclus | à valider sur de vraies sessions : un effort mal saisi fausse θ directement |
| Familles de techniques g | familles stables du conseil de leurres (surface, souple, poisson nageur, autres) | λ_env par famille n'est pas estimable avec peu de sessions : famille gardée comme description |
| Effet pêcheur e^{a_p} | fixé à 1 (usage individuel, § 9.1.8) | aucun apprentissage multi-utilisateurs sans consentement distinct |
| b₀ | a priori Gamma(b₀, b₀) avec b₀ = 2 dans l'étude : variance a priori 0,5 | à justifier par une sensibilité (b₀ de 1 à 10) |
| a_ψ, b_ψ | Beta(2, 2) dans l'étude (moyenne 0,5) : valeur d'essai, à remplacer par un a priori justifié, de moyenne inférieure à 1 | à justifier et faire approuver (§ 9.1.9) |
| Biais de sélection du journal | sessions déclarées surtout quand on pense que « ça mord », bredouilles sous-déclarées | bilan obligatoire à l'arrêt (y compris 0) ; résultat inconnu sans effet ; part des sessions sans bilan suivie |

### 6.4 Ce qui est affiché

- **Rien qui ressemble à une probabilité.**
- **Statistiques descriptives seulement** : sessions confirmées, effort cumulé, sessions avec prise, et l'intervalle de θ_x quand il existe, présenté comme « ton journal sur ce poste : compatible avec le modèle » ou « au-dessus » ou « en dessous de ce qu'il attend, avec N sessions ».
- **Critère du libellé** : « au-dessus » seulement si l'intervalle à 90 % de θ_x est tout entier au-dessus de 1 ; « en dessous » s'il est tout entier en dessous ; sinon « compatible ».
- **Seuil d'affichage** : 5 sessions dont 2 avec prise, le seuil V2 de JRN-05. Il est repris à titre provisoire. Le § 5 montre qu'il ne permet aucune conclusion statistique : il ne sert qu'à l'affichage descriptif.

## 7. Le GAMM-ZINB

- **Données nécessaires** : sessions avec covariables, de nombreux postes et saisons, plusieurs pêcheurs consentants pour un effet pêcheur.
- **État actuel** : rien de cela n'existe. Le GAMM-ZINB reste l'architecture cible de long terme. Il n'est pas estimable dans le périmètre actuel, et le référentiel interdit de le remplacer par des coefficients manuels présentés comme calibrés.
- **En attendant** :
  - la Favorabilité reste l'échelle de synthèse A1 (document 03) ;
  - le journal ne fait que des statistiques descriptives et prépare les données (définition de Y, effort effectif, bilans confirmés).

## 8. Cas de test à écrire avant toute implémentation (§ 9.3)

- Prise isolée.
- Session complète avec zéro explicite.
- Résultat inconnu.
- Pauses.
- Efforts très courts (moins de 15 min) et très longs.
- Dérangement.
- Changement d'habitat daté.
- Correction d'une saisie (jamais comptée deux fois).
- Inversion ψ et π_zero.
- k très faible.
- Poids nuls.
- Session sans conditions historiques reconstructibles.

Les 20 tests actuels couvrent :
- les identités, la limite de Poisson, la convention de signe et les bornes ;
- les limites du ratio et le biais simulé ;
- la garde des bredouilles sans q, l'exigence de ψ et de k, et le contrôle de troncature, appliqué aussi aux 400 jeux simulés ;
- l'identifiabilité de ψ, de k et de θ.
