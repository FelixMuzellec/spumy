# Indicateurs des standards internationaux, section par section

Généré par `node scripts/kpi/mesurer.mjs --ecrire` depuis `tests/pare-feux/kpis.mjs` et `data/kpi/mesures.json`. Ne pas modifier à la main.

Félix (25 nov. 2026, 9 h 37) : « Pour t'assurer de la qualité de tes tests et ne pas être biaisé, il y a des standards internationaux top tier. Ces standards sont assurés par des KPIs auxquels tu dois te confronter pour chaque section de l'application. »

## Comment lire ce tableau

- **Atteint** ou **non atteint** : valeur mesurée par un programme, jamais estimée.
- **Tenu** : un contrôle bloquant de la CI fait échouer les tests à la moindre violation.
- **À mesurer** : pas encore mesurable. La mesure doit exister avant la clôture de la phase indiquée, sinon les tests échouent.
- **Seuil de la norme** ou **seuil proposé** : la norme fixe le seuil, ou bien elle définit seulement la mesure et le seuil est une proposition de Claude, à valider par Félix.
- **Cliquet** : une valeur mesurée ne recule jamais sans une raison écrite (`data/kpi/reference.json`). La CI le vérifie à chaque proposition.

## Bilan

- atteints : 4
- non atteints, avec la phase où ils doivent l'être : 9
- tenus par un contrôle bloquant : 11
- à mesurer : 12

## Moteur BORD

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-01 | Score de Brier des chances de prise, rapporté à une référence naïve (Brier skill score) | Vérification des prévisions, OMM (groupe WWRP/WGNE de recherche sur la vérification des prévisions), méthodes de référence (score de Brier, fiabilité, ROC) | > 0 (seuil de la norme) | **à mesurer, phase 8** : il faut des sorties notées en nombre : l'étude de la phase 6 en demande de 40 à 120 ; 3 sont connues |
| K-02 | Fiabilité des chances annoncées (pente de la courbe de fiabilité) | Vérification des prévisions, OMM (groupe WWRP/WGNE de recherche sur la vérification des prévisions), méthodes de référence (score de Brier, fiabilité, ROC) | entre 0.8 et 1.2 (seuil proposé) | **à mesurer, phase 8** : même besoin de sorties notées |
| K-03 | Discrimination entre sorties avec et sans prise (aire sous la courbe ROC) | Vérification des prévisions, OMM (groupe WWRP/WGNE de recherche sur la vérification des prévisions), méthodes de référence (score de Brier, fiabilité, ROC) | ≥ 0.7 (seuil proposé) | **à mesurer, phase 8** : même besoin de sorties notées |
| K-04 | Couverture des branches du moteur (étude V3) par ses tests | Google Testing Blog, « Code Coverage Best Practices » (60 % acceptable, 75 % louable, 90 % exemplaire), 2020 ([source](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html)) | ≥ 90 % (seuil de la norme) | **non atteint** : 89,71 % (576/642 branches de scripts/etude-moteur-bord (c8, tests/etude-moteur-bord.mjs)) ; à atteindre en phase 11 : branches d'erreur et cas limites de l'étude non éprouvés ; à compléter à la stabilisation du moteur |
| K-05 | Couverture des instructions du moteur (étude V3) par ses tests | Google Testing Blog, « Code Coverage Best Practices » (60 % acceptable, 75 % louable, 90 % exemplaire), 2020 ([source](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html)) | ≥ 90 % (seuil de la norme) | **atteint** : 98,53 % (872/885 instructions) |
| K-06 | Score de mutation du moteur (part des règles cassées exprès que les tests repèrent) | Test de mutation, seuils de Stryker Mutator (élevé 80 %, bas 60 %), seuils par défaut | ≥ 80 % (seuil de la norme) | **à mesurer, phase 11** : le moteur entre dans src/ en phase 10 ; essais de mutation à la stabilisation (PF-45) |

## Sécurité des avis

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-07 | Avis « au vert » à tort sur les scénarios de référence (donnée de sécurité inconnue, vent, houle, nuit, marée) | ISO/IEC 25010, modèle de qualité du produit logiciel, 2023 | = 0 (seuil proposé) | **tenu** (contrôle bloquant) : `tests/etude-moteur-bord.mjs`, `tests/v2.mjs` |
| K-08 | Fiches dont la sécurité est documentée (engagement, consigne sourcée, accès à marée, terrain : QUAL-5) | ISO/IEC 25012, modèle de qualité des données, 2008 | ≥ 80 % (seuil proposé) | **non atteint** : 18,4 % (18 fiches sur 98) ; à atteindre en phase 8 : données de sécurité encore inconnues sur la plupart des fiches ; deuxième passe (phase 7) et validation indépendante (phase 8) |

## Données des spots

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-09 | Crédibilité : fiches nommées par au moins deux groupes de sources indépendants (QUAL-1) | ISO/IEC 25012, modèle de qualité des données, 2008 | ≥ 90 % (seuil proposé) | **non atteint** : 49 % (48 fiches sur 98) ; à atteindre en phase 8 : un seul groupe de sources pour la moitié des fiches |
| K-10 | Exactitude : position contrôlée par l'IGN ou corrigée, sans anomalie (QUAL-3) | ISO/IEC 25012, modèle de qualité des données, 2008 | ≥ 100 % (seuil proposé) | **non atteint** : 70,4 % (69 fiches sur 98) ; à atteindre en phase 8 : positions sans toponyme officiel proche, ou avec anomalie, à reprendre |
| K-11 | Complétude moyenne des fiches | ISO/IEC 25012, modèle de qualité des données, 2008 | ≥ 90 % (seuil proposé) | **non atteint** : 64,1 % (moyenne sur 98 fiches) ; à atteindre en phase 8 : champs encore inconnus (marée, fenêtres, accès, photos) |
| K-12 | Conformité : règles locales recherchées et sans réserve (QUAL-6) | ISO/IEC 25012, modèle de qualité des données, 2008 | ≥ 100 % (seuil proposé) | **non atteint** : 64,3 % (63 fiches sur 98) ; à atteindre en phase 8 : règles locales à vérifier au poste ou zone CIEM incertaine |
| K-13 | Confidentialité : aucune fiche publique ne cite une source privée (QUAL-7) | ISO/IEC 25012, modèle de qualité des données, 2008 | ≥ 100 % (seuil proposé) | **atteint** : 100 % (98 fiches sur 98) |
| K-14 | Actualité : fiches vérifiées depuis moins de 12 mois | ISO/IEC 25012, modèle de qualité des données, 2008 | ≥ 100 % (seuil proposé) | **atteint** : 100 % (vérification datée de moins de 365 jours) |

## Interface et ergonomie

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-15 | Satisfaction (SUS), cinq personnes au moins | System Usability Scale (Brooke) ; moyenne de référence 68, 80 et plus = premier quartile, 1996 | ≥ 80 /100 (seuil de la norme) | **à mesurer, phase 12** : questionnaire auprès de Félix et de ses proches sur l'application intégrée |
| K-16 | Efficacité : tâches réussies sans aide (choisir un spot, lire la sécurité, noter une sortie) | ISO 9241-11, utilisabilité (efficacité, efficience, satisfaction), 2018 | ≥ 80 % (seuil proposé) | **à mesurer, phase 12** : test de tâches auprès de cinq personnes |
| K-17 | Compréhension des deux indicateurs (« 53/100, à vérifier » et « 69/100, moyenne ») : UX-04 | ISO 9241-11, utilisabilité (efficacité, efficience, satisfaction), 2018 | ≥ 80 % (seuil proposé) | **à mesurer, phase 12** : 4 personnes sur 5 au moins ; test jamais mené (écart UX-04) |

## Accessibilité

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-18 | Violations automatiques graves ou critiques (axe-core) sur chaque écran | WCAG, W3C, 2.2 niveau AA | = 0 (seuil de la norme) | **tenu** (contrôle bloquant) : `tests/prototype-v3.mjs`, `tests/a11y.mjs` |
| K-19 | Contraste minimal du texte courant, dans les deux thèmes (critère 1.4.3) | WCAG, W3C, 2.2 niveau AA | ≥ 4.5 :1 (seuil de la norme) | **atteint** : 4,71 :1 (39 associations texte / fond, deux thèmes (tests/design-v3.mjs)) |
| K-20 | Taux de conformité RGAA (audit manuel des critères applicables) | RGAA, référentiel général d'amélioration de l'accessibilité (France), 4.1.2 (RGAA 5 attendu fin 2026) | ≥ 100 % (seuil de la norme) | **à mesurer, phase 14** : l'outil automatique ne couvre qu'une partie des critères : audit manuel à la QA globale |

## Performance et qualité graphique

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-21 | Plus grand affichage (LCP), en laboratoire, téléphone moyen en 4G lente, écrans V3 | Core Web Vitals, web.dev (Google) : seuils « bons » au 75e centile, mise à jour du 7 mai 2025 ([source](https://web.dev/articles/defining-core-web-vitals-thresholds)) | ≤ 2500 ms (seuil de la norme) | **non atteint** : 2820 ms (Home du prototype V3 (v3-prototype-home), mesure du 2026-11-23 (scripts/mesure-perf.mjs)) ; à atteindre en phase 12 : Home du prototype à 2,8 s (mesure du 23 nov. 2026) : photo d'en-tête et polices à charger plus tôt, sans perte de qualité (PF-43) |
| K-22 | Réactivité (INP) au 75e centile | Core Web Vitals, web.dev (Google) : seuils « bons » au 75e centile, mise à jour du 7 mai 2025 ([source](https://web.dev/articles/defining-core-web-vitals-thresholds)) | ≤ 200 ms (seuil de la norme) | **à mesurer, phase 12** : mesure sur l'application intégrée, interactions réelles |
| K-23 | Stabilité de l'affichage (CLS) au 75e centile | Core Web Vitals, web.dev (Google) : seuils « bons » au 75e centile, mise à jour du 7 mai 2025 ([source](https://web.dev/articles/defining-core-web-vitals-thresholds)) | ≤ 0.1 (seuil de la norme) | **à mesurer, phase 12** : mesure sur l'application intégrée |
| K-24 | Planchers de qualité graphique tenus (photos, logos, rééchantillonnage) : la vitesse ne se gagne pas aux dépens de l'image | ISO/IEC 25010, modèle de qualité du produit logiciel, 2023 | = 0 (seuil proposé) | **tenu** (contrôle bloquant) : `tests/pare-feux.mjs` |

## Sécurité de l'application

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-25 | Exigences applicables de l'ASVS niveau 2 vérifiées | OWASP ASVS, Application Security Verification Standard, 5.0.0 (mai 2025) ([source](https://owasp.org/www-project-application-security-verification-standard/)) | ≥ 100 % (seuil de la norme) | **à mesurer, phase 14** : vérification exigence par exigence à la QA globale et sécurité |
| K-26 | Score OpenSSF Scorecard du dépôt | OpenSSF Scorecard, santé de la chaîne d'approvisionnement d'un dépôt, en vigueur à la mesure | ≥ 7 /10 (seuil proposé) | **à mesurer, phase 14** : l'outil lit les réglages GitHub du dépôt publié : mesure à la fusion de la V3 dans main |
| K-27 | Failles graves ou critiques connues dans les bibliothèques | OWASP ASVS, Application Security Verification Standard, 5.0.0 (mai 2025) ([source](https://owasp.org/www-project-application-security-verification-standard/)) | = 0 (seuil de la norme) | **tenu** (contrôle bloquant) : `.github/workflows/tests.yml` |
| K-28 | Actions épinglées, verrou npm intègre, installation sans scripts, politique de sécurité stricte des pages | OWASP ASVS, Application Security Verification Standard, 5.0.0 (mai 2025) ([source](https://owasp.org/www-project-application-security-verification-standard/)) | = 0 (seuil de la norme) | **tenu** (contrôle bloquant) : `tests/actions-epinglees.mjs`, `tests/pare-feux.mjs` |

## Qualité du code et des tests

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-29 | Fonctions du code V3 au-delà de 15 en complexité cyclomatique | NIST SP 500-235 (McCabe) : complexité cyclomatique 10 par fonction, 15 au plus avec justification, 1996 | = 0 (seuil de la norme) | **non atteint** : 13 (dont scripts/etude-moteur-bord/securite.mjs:56 (54)) ; à atteindre en phase 11 : 13 fonctions de l'étude et du prototype (la plus complexe : l'état de sécurité, 54) ; réécriture à l'implémentation du moteur |
| K-30 | Erreurs de lint et de types | ISO/IEC 25010, modèle de qualité du produit logiciel, 2023 | = 0 (seuil proposé) | **tenu** (contrôle bloquant) : `.github/workflows/tests.yml` |
| K-31 | Exigences des phases closes reliées à leur preuve, ou à leur écart écrit | ISO/IEC/IEEE 29119, essais logiciels (traçabilité exigences et tests), 2022 | = 0 (seuil de la norme) | **tenu** (contrôle bloquant) : `tests/pare-feux.mjs` |
| K-32 | Violations simulées des consignes arrêtées par les pare-feux | ISO/IEC/IEEE 29119, essais logiciels (traçabilité exigences et tests), 2022 | ≥ 100 % (seuil proposé) | **tenu** (contrôle bloquant) : `tests/pare-feux-sabotage.mjs` |

## Compatibilité et fiabilité

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-33 | Moteurs de navigateur éprouvés (Chromium, WebKit, Firefox) | ISO/IEC 25010, modèle de qualité du produit logiciel, 2023 | ≥ 3 /3 (seuil proposé) | **non atteint** : 1 /3 (chromium) ; à atteindre en phase 12 : Chromium seul aujourd'hui (PF-44) |
| K-34 | Données de l'utilisateur perdues à la mise à jour ; fonctionnement hors ligne | ISO/IEC 25010, modèle de qualité du produit logiciel, 2023 | = 0 (seuil proposé) | **tenu** (contrôle bloquant) : `tests/upgrade.mjs` |

## Confidentialité

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-35 | Traceurs, publicité ou mesure d'audience tiers ; localisation par l'adresse IP | RGPD, article 5 (minimisation des données), règlement (UE) 2016/679 | = 0 (seuil de la norme) | **tenu** (contrôle bloquant) : `tests/pare-feux.mjs` |
| K-36 | Position gardée en cache arrondie à 100 m au plus | RGPD, article 5 (minimisation des données), règlement (UE) 2016/679 | ≤ 100 m (seuil proposé) | **tenu** (contrôle bloquant) : `tests/socle.mjs` |
