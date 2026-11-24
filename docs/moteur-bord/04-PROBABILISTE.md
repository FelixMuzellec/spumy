# Modèle probabiliste (moteur 1) et journal (moteur 2)

Phase 6 V3, 24 nov. 2026. Statut : **PROVISOIRE**. Ce document examine le modèle ZINB et GAMM du § 9.1.8 et la mise à jour bayésienne du § 9.1.9.

- **Code** : `scripts/etude-moteur-bord/zinb.mjs`.
- **Calculs** : expériences E1 à E3 de `etude.mjs`, résultats dans `data/moteur-bord/resultats-etude.json`.
- **Tests** : 14 tests dans `tests/etude-moteur-bord.mjs`.

## 1. Conclusion d'abord

- **Écriture du référentiel** : les formules sont justes, avec la convention π_zero = 1 − ψ (VÉRIFIÉ, § 2).
- **Ratio Gamma–Poisson** : il n'est le posterior exact que dans le cas Poisson sans excès de zéros. À k fini, il sous-estime l'incertitude. Avec des zéros structurels, le ratio naïf biaise θ vers le bas (VÉRIFIÉ, § 4).
- **Estimable aujourd'hui** : rien de statistique avec les données disponibles. Le journal compte 3 sessions, et ψ n'est pas identifiable sous quelques dizaines de sessions comparables, même dans le cas le plus favorable (VÉRIFIÉ par simulation, § 5).
- **Décision provisoire (D6-12)** : la probabilité interne de capture n'est ni calculée en production ni affichée. Elle reste un objet d'étude, hors application, jusqu'à ce que les conditions du § 9.1.8 soient réunies et qu'un affichage distinct soit approuvé en phase 9. Elle n'est jamais convertie en Favorabilité.

## 2. Vérifications mathématiques (E1)

| Identité | Vérification numérique | Résultat |
| --- | --- | --- |
| La NB2 de moyenne Λ et de taille k somme à 1, de moyenne Λ, de variance Λ + Λ²/k | sommes sur y = 0 à 399, pour (ψ, Λ, k) = (0,6 ; 0,8 ; 2), (0,9 ; 2,5 ; 0,7), (0,3 ; 0,2 ; 10) | égalités à 10⁻³ près |
| P(Y = 0) de la NB2 = (k / (k + Λ))^k | même calcul | égalité |
| P(Y ≥ 1) = ψ [1 − (1 + Λ/k)^(−k)] = 1 − P(Y = 0) du ZINB | même calcul | égalité |
| Limite k → ∞ : ψ (1 − e^(−Λ)) | écart à k = 1, 10, 100, 10⁴, 10⁸ : 0,107 ; 0,0145 ; 0,0015 ; 1,5 × 10⁻⁵ ; 9,6 × 10⁻¹⁰ | décroissance monotone vers 0 |
| π_i⁽⁰⁾ (§ 9.1.9) = règle de Bayes (1 − ψ) / P(Y = 0) | même calcul | égalité |
| Convention : π_zero = 1 − ψ | Λ → 0 : P(Y = 0) = 1 ; ψ = 1, Λ = 0 : P(Y ≥ 1) = 0 | test dédié contre l'inversion silencieuse |
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
- **Bredouilles.** Le ratio naïf sous-estime θ de 25 % quand une partie des bredouilles sont des zéros structurels. Avec qᵢ, l'écart au posterior exact tombe à 1,2 %.
- **Conclusion.** Le § 9.1.9 a raison d'interdire la formule naïve sur des données avec zéros structurels.

## 5. Identifiabilité (E3)

- **Plan de simulation** :
  - ψ = 0,6 et k = 2 vrais ;
  - λ = 0,45 capture par heure, connu ;
  - effort de 1 à 4 h, θ = 1 connu ;
  - 120 répétitions par taille d'échantillon, graine 20261124.
- **Estimation** : ψ et k par maximum de vraisemblance sur une grille (ψ de 0,04 à 1 ; k de 0,2 à 10⁶, où 10⁶ vaut le Poisson).
- **Cas le plus favorable** : en vrai, λ et θ ne sont pas connus, et l'identifiabilité est pire.

| Sessions | ψ estimé : médiane (5 %–95 %) | Part des estimations de ψ à ±0,15 du vrai | k : médiane | Part où k est pris pour un Poisson |
| --- | --- | --- | --- | --- |
| 3 | 0,52 (0,04 à 1) | 33 % | Poisson | 53 % |
| 10 | 0,56 (0,16 à 1) | 34 % | Poisson | 57 % |
| 40 | 0,60 (0,40 à 0,94) | 68 % | 3 | 30 % |
| 200 | 0,60 (0,50 à 0,72) | 95 % | 2 | 3 % |

- **Lecture.**
  - Avec 3 ou 10 sessions, l'estimation de ψ va de presque 0 à 1. Plus d'une fois sur deux, la surdispersion est invisible.
  - Il faut de l'ordre de 200 sessions comparables dans un même groupe (même mode, même espèce, même saison, postes semblables) pour séparer ψ et k dans ce cas idéal.
  - Le journal de Félix en compte 3, sur un seul guide (phase 8 V2).
  - **Rien n'est estimable aujourd'hui. Le premier niveau utile est descriptif** (§ 9.3.1, niveau 1).

## 6. Moteur 2 du journal : conception provisoire

### 6.1 Données admissibles (reprend le § 9.1.9, sans assouplissement)

| Enregistrement | Effet sur θ_x | Effet sur ψ |
| --- | --- | --- |
| Session complète, effort effectif Eᵢ, y confirmé ≥ 1 | oui, qᵢ = 1 | oui, qᵢ = 1 |
| Session complète, y = 0 confirmé explicitement | oui, avec qᵢ = 1 − πᵢ⁽⁰⁾ | oui, avec qᵢ |
| Résultat non confirmé, session interrompue, effort inexploitable | aucun | aucun |
| Prise isolée ajoutée après coup | aucun (pas de dénominateur d'effort) | indice de présence à son instant, sans mise à jour du taux |
| Session marquée « dérangement manifeste » | exclue des mises à jour structurelles, coût statistique noté | idem |
| Autre espèce capturée | aucun pour le bar | aucun |
| Session dont les conditions historiques ne peuvent pas être reconstruites | aucune mise à jour environnementale | aucune |

- **Λ̂ᵢ^base** se reconstruit avec la version du moteur environnemental de la date de la session et les prévisions archivées de cette date. L'archive d'Open-Meteo a déjà servi à la phase 8 V2 : la reconstruction est faisable (INFÉRÉ).

### 6.2 Estimation proposée

1. **θ_x** : posterior en une dimension calculé sur une grille, a priori Gamma(b₀, b₀), vraisemblance ZINB de chaque session (`thetaPosterieur`).
   - Pour ψ et k fixés, c'est le posterior exact. Le calcul est léger (12 000 points de grille par session).
   - Le ratio de travail avec qᵢ reste la référence de contrôle, jamais la méthode.
2. **ψ et k** : fixés par l'a priori tant qu'ils ne sont pas identifiables (§ 5).
   - ψ vient de la disponibilité biologique (saison et eau, N4), déclarée comme a priori.
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

### 6.3 Ce qui est affiché

- **Rien qui ressemble à une probabilité.**
- **Statistiques descriptives seulement** : sessions confirmées, effort cumulé, sessions avec prise, et l'intervalle de θ_x quand il existe, présenté comme « ton journal sur ce poste : compatible avec le modèle » ou « au-dessus » ou « en dessous de ce qu'il attend, avec N sessions ».
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

Les 14 tests actuels couvrent les identités, la limite de Poisson, la convention de signe, les limites du ratio et l'identifiabilité.
