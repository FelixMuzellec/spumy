# Indicateurs des standards internationaux, section par section

Généré par `node scripts/kpi/mesurer.mjs --ecrire` depuis `tests/pare-feux/kpis.mjs` et `data/kpi/mesures.json`. Ne pas modifier à la main.

Félix (25 nov. 2026, 9 h 37) : « Pour t'assurer de la qualité de tes tests et ne pas être biaisé, il y a des standards internationaux top tier. Ces standards sont assurés par des KPIs auxquels tu dois te confronter pour chaque section de l'application. »

## Comment lire ce tableau

- **Atteint** ou **non atteint** : valeur mesurée par un programme, jamais estimée.
- **Tenu** : un contrôle bloquant de la CI fait échouer les tests à la moindre violation.
- **À mesurer** : pas encore mesurable. La mesure doit exister avant la clôture de la phase indiquée, sinon les tests échouent.
- **Seuil de la norme** ou **seuil fixé** : la norme fixe le seuil, ou bien elle définit seulement la mesure et le seuil est fixé par Claude, par délégation de Félix (25 nov. 2026, 10 h 31), avec sa justification.
- **Objectif suivi** : indicateur des données des spots. Il n'écarte, ne cache ni ne bloque aucun spot (Félix, 10 h 31) : un spot peu documenté reste proposé, « à vérifier ». Son cliquet porte sur le nombre de fiches qui remplissent le critère, jamais sur un taux. À défaut de sources, l'expérience de pêche (le journal) complète.
- **Cliquet** : une valeur mesurée ne recule jamais sans une raison écrite (`data/kpi/reference.json`). La CI le vérifie à chaque proposition.

## Bilan

- atteints : 6
- non atteints, avec la phase où ils doivent l'être : 3
- objectifs suivis (données des spots, sans effet sur les spots) : 5
- tenus par un contrôle bloquant : 11
- à mesurer : 12

## Moteur BORD

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-01 | Score de Brier des chances de prise, rapporté à une référence naïve (Brier skill score) | Vérification des prévisions, OMM (groupe WWRP/WGNE de recherche sur la vérification des prévisions), méthodes de référence (score de Brier, fiabilité, ROC) | > 0 (seuil de la norme) | **à mesurer, phase 13** : outil posé et éprouvé en phase 8 (scripts/calibration/verification.mjs, tests/calibration.mjs) ; il faut au moins 40 sorties notées, dont 10 avec prise et 10 bredouilles déclarées, à note figée avant la sortie : 3 sont connues ; mesure sur le journal confirmé (phase 13, V-07 et V-08) |
| K-02 | Fiabilité des chances annoncées (pente de la courbe de fiabilité) | Vérification des prévisions, OMM (groupe WWRP/WGNE de recherche sur la vérification des prévisions), méthodes de référence (score de Brier, fiabilité, ROC) | entre 0.8 et 1.2 (seuil fixé : une prévision probabiliste bien calibrée a une pente de fiabilité de 1 ; ±0,2 tolère les petits échantillons de sorties de pêche) | **à mesurer, phase 13** : même besoin de sorties notées (outil posé en phase 8) ; jeux synthétiques de la phase 8 : à 40 sorties, un prévisionniste parfaitement calibré n'a sa pente entre 0,8 et 1,2 que 4 fois sur 10 (seuil à revoir en phase 9) |
| K-03 | Discrimination entre sorties avec et sans prise (aire sous la courbe ROC) | Vérification des prévisions, OMM (groupe WWRP/WGNE de recherche sur la vérification des prévisions), méthodes de référence (score de Brier, fiabilité, ROC) | ≥ 0.7 (seuil fixé : Hosmer et Lemeshow : de 0,7 à 0,8 la discrimination est acceptable, de 0,8 à 0,9 excellente ; 0,70 est la barre d'admissibilité, 0,80 l'objectif) | **à mesurer, phase 13** : même besoin de sorties notées (outil posé en phase 8) |
| K-04 | Couverture des branches du moteur (étude V3) par ses tests | Google Testing Blog, « Code Coverage Best Practices » (60 % acceptable, 75 % louable, 90 % exemplaire), 2020 ([source](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html)) | ≥ 90 % (seuil de la norme) | **non atteint** : 89,73 % (577/643 branches de scripts/etude-moteur-bord (c8, tests/etude-moteur-bord.mjs)) ; à atteindre en phase 11 : branches d'erreur et cas limites de l'étude non éprouvés ; à compléter à la stabilisation du moteur |
| K-05 | Couverture des instructions du moteur (étude V3) par ses tests | Google Testing Blog, « Code Coverage Best Practices » (60 % acceptable, 75 % louable, 90 % exemplaire), 2020 ([source](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html)) | ≥ 90 % (seuil de la norme) | **atteint** : 98,53 % (872/885 instructions) |
| K-06 | Score de mutation du moteur (part des règles cassées exprès que les tests repèrent) | Test de mutation, seuils de Stryker Mutator (élevé 80 %, bas 60 %), seuils par défaut | ≥ 80 % (seuil de la norme) | **à mesurer, phase 11** : le moteur entre dans src/ en phase 10 ; essais de mutation à la stabilisation (PF-45) |

## Sécurité des avis

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-07 | Avis « au vert » à tort sur les scénarios de référence (donnée de sécurité inconnue, vent, houle, nuit, marée) | ISO/IEC 25010, modèle de qualité du produit logiciel, 2023 | = 0 (seuil fixé : la sécurité ne se compense jamais (§ 0.2) : aucune tolérance) | **tenu** (contrôle bloquant) : `tests/etude-moteur-bord.mjs`, `tests/v2.mjs` |
| K-08 | Fiches dont la sécurité est documentée (engagement, consigne sourcée, accès à marée, terrain : QUAL-5) | ISO/IEC 25012, modèle de qualité des données, 2008 | ≥ 80 % (seuil fixé : objectif : 8 fiches sur 10 à sécurité documentée ; une fiche sans sécurité documentée reste proposée, toujours « à vérifier », jamais « au vert ») | **objectif suivi** : 22,4 % (22 fiches sur 98) ; objectif non atteint ; n'écarte, ne cache ni ne bloque aucun spot |

## Données des spots

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-09 | Crédibilité : fiches nommées par au moins deux groupes de sources indépendants (QUAL-1) | ISO/IEC 25012, modèle de qualité des données, 2008 | ≥ 90 % (seuil fixé : objectif : 9 fiches sur 10 recoupées par deux groupes de sources indépendants ; l'expérience de pêche (journal) complète, à défaut de sources) | **objectif suivi** : 49 % (48 fiches sur 98) ; objectif non atteint ; n'écarte, ne cache ni ne bloque aucun spot |
| K-10 | Exactitude : position contrôlée par l'IGN ou corrigée, sans anomalie (QUAL-3) | ISO/IEC 25012, modèle de qualité des données, 2008 | ≥ 100 % (seuil fixé : objectif : toutes les positions contrôlées ; une position non contrôlée reste affichée, avec sa précision) | **objectif suivi** : 70,4 % (69 fiches sur 98) ; objectif non atteint ; n'écarte, ne cache ni ne bloque aucun spot |
| K-11 | Complétude moyenne des fiches | ISO/IEC 25012, modèle de qualité des données, 2008 | ≥ 90 % (seuil fixé : objectif : 9 champs sur 10 renseignés en moyenne ; un champ inconnu est dit inconnu, jamais remplacé) | **objectif suivi** : 64,4 % (moyenne sur 98 fiches) ; objectif non atteint ; n'écarte, ne cache ni ne bloque aucun spot |
| K-12 | Conformité : règles locales recherchées et sans réserve (QUAL-6) | ISO/IEC 25012, modèle de qualité des données, 2008 | ≥ 100 % (seuil fixé : objectif : toutes les règles locales recherchées ; une règle incertaine reste « à vérifier au poste ») | **objectif suivi** : 64,3 % (63 fiches sur 98) ; objectif non atteint ; n'écarte, ne cache ni ne bloque aucun spot |
| K-13 | Confidentialité : aucune fiche publique ne cite une source privée (QUAL-7) | ISO/IEC 25012, modèle de qualité des données, 2008 | ≥ 100 % (seuil fixé : décision de Félix du 23 nov. 2026, 22 h 25 : aucun texte privé dans une fiche publique, sans exception) | **atteint** : 100 % (98 fiches sur 98) |
| K-14 | Actualité : fiches vérifiées depuis moins de 12 mois | ISO/IEC 25012, modèle de qualité des données, 2008 | ≥ 100 % (seuil fixé : une vérification par an au moins : les accès et les règles changent d'une saison à l'autre) | **atteint** : 100 % (vérification datée de moins de 365 jours) |
| K-37 | Spots gardés : aucun spot retiré pour améliorer un indicateur (nombre de fiches) | ISO/IEC 25012, modèle de qualité des données, 2008 | ≥ 98 fiches (seuil fixé : Félix (25 nov. 2026, 10 h 31) : « Il ne faut pas que ces tests soient au détriment des spots » ; CLAUDE.md : ne jamais supprimer un spot V2. Le nombre de fiches ne baisse jamais (cliquet)) | **atteint** : 98 fiches (66 spots V2 gardés et 32 spots V3 recherchés) |

## Interface et ergonomie

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-15 | Satisfaction (SUS), cinq personnes au moins | System Usability Scale (Brooke) ; moyenne de référence 68, 80 et plus = premier quartile, 1996 | ≥ 80 /100 (seuil de la norme) | **à mesurer, phase 12** : questionnaire auprès de Félix et de ses proches sur l'application intégrée |
| K-16 | Efficacité : tâches réussies sans aide (choisir un spot, lire la sécurité, noter une sortie) | ISO 9241-11, utilisabilité (efficacité, efficience, satisfaction), 2018 | ≥ 80 % (seuil fixé : taux moyen de réussite des tâches dans les études d'utilisabilité : 78 % environ (MeasuringU, Sauro) ; barre 80 %, et 100 % pour la tâche critique « lire la sécurité d'un spot ») | **à mesurer, phase 12** : test de tâches auprès de cinq personnes |
| K-17 | Compréhension des deux indicateurs (« 53/100, à vérifier » et « 69/100, moyenne ») : UX-04 | ISO 9241-11, utilisabilité (efficacité, efficience, satisfaction), 2018 | ≥ 80 % (seuil fixé : exigence UX-04 validée : 4 personnes sur 5) | **à mesurer, phase 12** : 4 personnes sur 5 au moins ; test jamais mené (écart UX-04) |

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
| K-24 | Planchers de qualité graphique tenus (photos, logos, rééchantillonnage) : la vitesse ne se gagne pas aux dépens de l'image | ISO/IEC 25010, modèle de qualité du produit logiciel, 2023 | = 0 (seuil fixé : contrainte de Félix du 25 nov. 2026, 7 h 25 : la vitesse ne se gagne jamais aux dépens de l'image) | **tenu** (contrôle bloquant) : `tests/pare-feux.mjs` |

## Sécurité de l'application

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-25 | Exigences applicables de l'ASVS niveau 2 vérifiées | OWASP ASVS, Application Security Verification Standard, 5.0.0 (mai 2025) ([source](https://owasp.org/www-project-application-security-verification-standard/)) | ≥ 100 % (seuil de la norme) | **à mesurer, phase 14** : vérification exigence par exigence à la QA globale et sécurité |
| K-26 | Score OpenSSF Scorecard du dépôt | OpenSSF Scorecard, santé de la chaîne d'approvisionnement d'un dépôt, en vigueur à la mesure | ≥ 7 /10 (seuil fixé : le score pénalise un dépôt tenu par une seule personne (revue de code par un tiers impossible) : 7 sur 10 est la barre d'admissibilité, 8 l'objectif) | **à mesurer, phase 14** : l'outil lit les réglages GitHub du dépôt publié : mesure à la fusion de la V3 dans main |
| K-27 | Failles graves ou critiques connues dans les bibliothèques | OWASP ASVS, Application Security Verification Standard, 5.0.0 (mai 2025) ([source](https://owasp.org/www-project-application-security-verification-standard/)) | = 0 (seuil de la norme) | **tenu** (contrôle bloquant) : `.github/workflows/tests.yml` |
| K-28 | Actions épinglées, verrou npm intègre, installation sans scripts, politique de sécurité stricte des pages | OWASP ASVS, Application Security Verification Standard, 5.0.0 (mai 2025) ([source](https://owasp.org/www-project-application-security-verification-standard/)) | = 0 (seuil de la norme) | **tenu** (contrôle bloquant) : `tests/actions-epinglees.mjs`, `tests/pare-feux.mjs` |

## Qualité du code et des tests

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-29 | Fonctions du code V3 au-delà de 15 en complexité cyclomatique sans jugement écrit (nécessaire, hors produit, prototype, ou à simplifier avant une phase : tests/pare-feux/complexite.mjs) | NIST SP 500-235 (McCabe) : complexité cyclomatique 10 par fonction, 15 au plus avec justification, 1996 | = 0 (seuil de la norme) | **atteint** : 0 (13 fonctions au-delà de 15 : 5 prototype, 3 à simplifier, 4 hors produit, 1 nécessaire) |
| K-30 | Erreurs de lint et de types | ISO/IEC 25010, modèle de qualité du produit logiciel, 2023 | = 0 (seuil fixé : outils bloquants : aucune tolérance) | **tenu** (contrôle bloquant) : `.github/workflows/tests.yml` |
| K-31 | Exigences des phases closes reliées à leur preuve, ou à leur écart écrit | ISO/IEC/IEEE 29119, essais logiciels (traçabilité exigences et tests), 2022 | = 0 (seuil de la norme) | **tenu** (contrôle bloquant) : `tests/pare-feux.mjs` |
| K-32 | Violations simulées des consignes arrêtées par les pare-feux | ISO/IEC/IEEE 29119, essais logiciels (traçabilité exigences et tests), 2022 | ≥ 100 % (seuil fixé : un pare-feu qui laisse passer une violation simulée est un trou) | **tenu** (contrôle bloquant) : `tests/pare-feux-sabotage.mjs` |

## Compatibilité et fiabilité

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-33 | Moteurs de navigateur éprouvés (Chromium, WebKit, Firefox) | ISO/IEC 25010, modèle de qualité du produit logiciel, 2023 | ≥ 3 /3 (seuil fixé : les trois moteurs de rendu du marché : Chromium, WebKit (Safari, iPhone), Gecko (Firefox)) | **non atteint** : 1 /3 (chromium) ; à atteindre en phase 12 : Chromium seul aujourd'hui (PF-44) |
| K-34 | Données de l'utilisateur perdues à la mise à jour ; fonctionnement hors ligne | ISO/IEC 25010, modèle de qualité du produit logiciel, 2023 | = 0 (seuil fixé : aucune perte des saisies de l'utilisateur, sans exception) | **tenu** (contrôle bloquant) : `tests/upgrade.mjs` |

## Confidentialité

| KPI | Indicateur | Norme | Seuil | État |
| --- | --- | --- | --- | --- |
| K-35 | Traceurs, publicité ou mesure d'audience tiers ; localisation par l'adresse IP | RGPD, article 5 (minimisation des données), règlement (UE) 2016/679 | = 0 (seuil de la norme) | **tenu** (contrôle bloquant) : `tests/pare-feux.mjs` |
| K-36 | Position gardée en cache arrondie à 100 m au plus | RGPD, article 5 (minimisation des données), règlement (UE) 2016/679 | ≤ 100 m (seuil fixé : exigence PRV-01 validée : cache arrondi à 100 m) | **tenu** (contrôle bloquant) : `tests/socle.mjs` |

## Complexité jugée, fonction par fonction

Félix (25 nov. 2026, 10 h 31) : « Pour la complexité, il faut juger si elle est nécessaire pour répondre aux contraintes demandées ou non. » Fonctions du code V3 au-delà de 15 (registre `tests/pare-feux/complexite.mjs`) :

| Fonction | Complexité | Jugement | Raison |
| --- | --- | --- | --- |
| `scripts/etude-moteur-bord/securite.mjs#etatSecurite` | 54 | à simplifier, avant la fin de la phase 10 | La logique est nécessaire : chaque donnée de sécurité (vent, rafales, deux modèles, houle, engagement, marée, isolement, nuit, consignes, fermeture) a son cas « inconnu », et la sécurité ne se compense jamais. Sa concentration dans une seule fonction ne l'est pas : à l'implémentation, une règle par fonction (chacune rend un état et sa raison), combinées par « le pire l'emporte ». Chaque règle devient lisible et testable seule. |
| `scripts/etude-moteur-bord/classement.mjs#classer` | 19 | à simplifier, avant la fin de la phase 10 | Les étapes du classement sont imposées (§ 9.1.6 : contrôles d'entrée, exclusions, sécurité, « à vérifier » séparé, tri, égalités, place réservée), mais rien n'oblige à les écrire dans une seule fonction : une fonction par étape à l'implémentation. |
| `scripts/etude-moteur-bord/architectures.mjs#a1` | 18 | à simplifier, avant la fin de la phase 10 | Le calcul de la fourchette et le choix du niveau de publication (nombre, fourchette, qualitatif, aucun) sont deux décisions distinctes, à séparer à l'implémentation. |
| `scripts/etude-moteur-bord/zinb.mjs#thetaPosterieur` | 16 | nécessaire | Un point au-dessus de la limite. Il vient des contrôles d'entrée exigés (ψ dans ]0 ; 1], k > 0, q présent pour chaque bredouille) et du contrôle de troncature de la grille : les retirer affaiblirait le calcul. |
| `scripts/etude-moteur-bord/etude.mjs#grille` | 23 | hors produit | Expérience de l'étude de la phase 6 (grille de situations) : elle ne passe jamais dans l'application et ne touche aucun utilisateur ; sa lisibilité suffit à rejouer l'étude. |
| `scripts/etude-moteur-bord/etude.mjs#e8` | 24 | hors produit | Expérience E8 de l'étude (lecture des données de sécurité des fiches) : hors de l'application. |
| `scripts/etude-moteur-bord/etude.mjs#(fléchée 1)` | 18 | hors produit | Fonction interne de l'expérience E8 : hors de l'application. |
| `scripts/etude-moteur-bord/etude.mjs#e9` | 32 | hors produit | Expérience E9 de l'étude (fiches qui pourraient être « au vert ») : hors de l'application. |
| `src/prototype-v3/effets.js#terrain` | 46 | prototype, avant la fin de la phase 12 | Prototype : chaque type de terrain a son explication, écrite en conditions enchaînées. La diversité des terrains est nécessaire, pas la forme : à l'intégration, une table de connaissances (une ligne par terrain et par effet, sourcée) lue par une fonction simple. |
| `src/prototype-v3/app.jsx#App` | 24 | prototype, avant la fin de la phase 12 | Prototype : la coquille gère à la fois les onglets, le mode, la position et les écrans. À l'intégration, un composant par responsabilité. |
| `src/prototype-v3/geomap.jsx#GeoMap` | 26 | prototype, avant la fin de la phase 12 | Prototype : la carte gère dessin, gestes, sélection et légende. À l'intégration, ces rôles sont séparés. |
| `src/prototype-v3/geomap.jsx#Ring` | 20 | prototype, avant la fin de la phase 12 | Prototype : la pastille de score cumule ses variantes (score, « à vérifier », groupe, sélection). À l'intégration, une variante par composant du Design System. |
| `src/prototype-v3/modele.js#favorability` | 19 | prototype, avant la fin de la phase 12 | Copie de démonstration du modèle V2 dans le prototype : remplacée par le vrai moteur V3 (phases 10 à 12). |
