# Architectures candidates de la Favorabilité BORD, comparées à des baselines

Phase 6 V3, 24 nov. 2026. Statut : **PROVISOIRE**.

- **Code** : `scripts/etude-moteur-bord/architectures.mjs`.
- **Calcul** : `scripts/etude-moteur-bord/etude.mjs`.
- **Résultats** : `data/moteur-bord/resultats-etude.json`, recalculés à l'identique par `npm run test:etude-moteur`.

## 1. Ce que cette comparaison peut et ne peut pas dire

- **Aucune vérité terrain** : le journal compte 3 sessions (phase 8 V2). Aucune architecture ne peut donc être déclarée « plus juste ». La comparaison porte sur :
  - le respect du contrat (01) ;
  - l'explicabilité ;
  - l'absence d'imputation cachée ;
  - la robustesse aux hypothèses ;
  - l'écart entre les classements.
- **Mêmes composantes pour toutes** : les points des critères et la présence que calcule le vrai moteur V2. La recombinaison B-V2 redonne exactement la note du moteur sur les 47 520 créneaux (VÉRIFIÉ, test). Seule la manière de combiner et de publier change.
- **Deux grilles** :
  - la grille des créneaux (66 spots, 47 520 créneaux, vent de face ou de dos propre à chaque spot) sert aux distributions et aux données manquantes ;
  - la grille du classement (672 situations : 7 guides × 4 mois × 3 coefficients × aube ou jour × vent d'ouest ou de nord-est × force 2 ou 4, le même vent pour tous les spots d'un guide) sert aux comparaisons de rang.
- **Limite** : les grilles sont des plans d'essai, pas de vraies journées.
- **Les « guides »** ne sont ici que les conteneurs de données de la V2 (un fichier de spots par guide), utilisés pour comparer des spots proches les uns des autres. Ce n'est pas un découpage du produit : la V3 n'en a aucun, et son classement part de la position de référence (V3-007).

## 2. Les candidates

| Code | Nom | Formule | Rôle |
| --- | --- | --- | --- |
| B-simple | Baseline simple | arrondi(saison × (fenêtre + lumière) / 50 × 100) | La plus simple défendable : calendrier biologique et deux critères N2, sans vent ni coefficient |
| B-V2 | Baseline V2 | arrondi(Conditions renormalisées × Présence) | Le moteur en ligne, à auditer (document 00) |
| A1 | V2 sans imputation, publication encadrée | intervalle [P × Σ points connus ; P × (Σ connus + Σ maximums inconnus)] ; rang sur la borne basse ; publication selon la largeur et la Confiance | Candidate provisoire retenue |
| A2 | Ordinale | disponibilité (forte ≥ 0,9, moyenne ≥ 0,6, faible) puis conditions (bonnes ≥ 70, moyennes ≥ 45, faibles) : 9 classes ordonnées, sans nombre | Présentation qualitative du § 9.1.4, pour le cas où aucun nombre n'aurait de sens stable |
| A3 | Forme probabiliste ZIP, non calibrée | ψ ← présence ; Λ = E λ₀ exp(β (C − 50) / 25), E = 2 h, λ₀ = 0,3, β = 1 ; P(Y ≥ 1) = ψ (1 − e^(−Λ)) | Illustration de la structure du § 9.1.8 ; paramètres sans valeur prédictive |

## 3. Résultats

| Mesure | Valeur | Lecture |
| --- | --- | --- |
| Corrélation de rang (Spearman) entre B-V2 et B-simple, sur les créneaux | 0,82 | Le vent et le coefficient changent beaucoup l'ordre des créneaux |
| B-V2 contre A2 | 0,92 | L'ordinal garde l'ordre général, par classes |
| B-V2 contre A3 | 0,99 | La forme probabiliste, non calibrée, ne change presque pas l'ordre |
| Top 3 d'un guide identique à celui de B-V2 : B-simple | 12 % des situations (Jaccard moyen 0,29) | B-simple ne départage presque pas les spots d'un même guide : saison et lumière leur sont communes, il reste surtout des ex æquo départagés par le nom |
| Top 3 identique : A3 | 92 % (Jaccard moyen 0,96) | La forme ψ (1 − e^(−Λ)) déplace parfois l'arbitrage entre présence et conditions, entre régimes |
| A2 : taille de la classe de tête d'un guide | 7 spots en médiane, 11 au 95ᵉ centile | L'ordinal ne sait pas désigner trois spots : il en met sept ex æquo |
| A1 avec tous les critères connus | égale à B-V2 (intervalle de largeur 0) | A1 ne change rien quand les données sont complètes |
| Vent inconnu : erreur de la renormalisation B-V2 | 6,6 points en moyenne, 16 au 95ᵉ centile, 26 au plus ; plus de 10 points sur 21 % des créneaux | Imputation cachée (audit A2) |
| Vent inconnu : A1 | intervalle de 28 points en médiane (30 au plus) ; publié en fourchette sur 11 880 créneaux, en qualitatif sur 35 640, jamais en nombre | A1 dit ce qu'on ne sait pas |
| Eau inconnue : B-V2 | note plus haute de 1,1 point en moyenne (3 au 95ᵉ centile) | Le minimum saison–eau ne s'applique plus (audit A6) |
| R² univarié sur la grille : présence, coefficient, lumière, vent, fenêtre | 0,49 ; 0,17 ; 0,15 ; 0,10 ; 0,07 | La présence domine ; dépend du plan d'essai |
| Notes ≥ 65 avec présence < 0,6 | 0 sur 10 366 | Pas de compensation entre biologie et météo |
| Notes ≥ 65 avec un coefficient à 0 point | 609 sur 10 366 | Compensation additive à l'intérieur des conditions (audit A15) |
| Saut aube contre plein jour, même créneau | 15,2 points en moyenne, 18 au plus | Marche de la lumière (audit A4) |

## 4. Lecture et choix provisoire

1. **B-simple** est trop pauvre pour classer les spots d'un même guide : saison et lumière sont communes à tous à un instant donné, et la baseline ne départage presque que par le nom. Elle reste la référence de « ce qu'apporte le reste » : le vent et le coefficient (N2 pour la règle, N4 pour les valeurs) font tout l'écart de classement entre spots.
2. **B-V2** a la bonne chaîne. Mais elle impute les données manquantes (A2), compense à l'intérieur des conditions (A15) et publie une précision qu'elle n'a pas (A13).
3. **A1** garde exactement B-V2 quand tout est connu. Elle enlève l'imputation cachée et rend la publication honnête quand des données manquent. Elle est conforme au § 9.1.5 et à REC-08. **Choix provisoire.**
4. **A2** ne départage pas assez : 7 spots en tête. C'est le repli d'affichage pour le cas où la phase 8 conclurait qu'aucun nombre n'a de sens stable (§ 9.1.4) ; pas un moteur.
5. **A3** ne change presque rien tant qu'elle n'est pas calibrée. Elle n'a d'intérêt que calibrée, ce qui est impossible aujourd'hui (document 04). Elle n'est pas proposée pour la Favorabilité.

## 5. Ce que A1 laisse ouvert (registre, document 06)

- **D6-01** Valeur de rang : borne basse (choix provisoire) ou valeur centrale de l'intervalle. La borne basse ne récompense jamais une donnée manquante ; la valeur centrale impute la moitié du maximum, ce que le § 9.1.5 interdit.
- **D6-02** Seuils de publication (10 et 20 points) et publication de l'incertitude de modèle (intervalle à 90 % de 12 points en médiane, même avec tous les critères connus).
- **D6-03** Eau inconnue : intervalle sur la présence.
- **D6-04** Plafond ou veto quand un critère rend le poste non pêchable (coefficient hors plage).
- **D6-05** Lumière continue ou par classes.
- **D6-06** Valeurs de présence et tables de points : à challenger (phases 7 et 8).
