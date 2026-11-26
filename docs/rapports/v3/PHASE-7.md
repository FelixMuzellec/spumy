# Rapport de phase 7 — SPUMY V3 : deuxième passe de recherche et enrichissement halieutique

26 nov. 2026 (close à 12 h 10). Branche `claude/v3-phase-07-enrichissement-halieutique`, proposition n° 28 en brouillon (base `claude/v3-phase-6`).

Ouverte le 25 nov. 2026 à 21 h 30 à la demande de Félix (21 h 23 : « tu peux la lancer maintenant et la finir demain si non terminée »), par le jeton conditionnel du 23 nov., 23 h 15. Reprise le 26 nov. à 8 h 01 par la tâche planifiée.

## 1. Objectif et périmètre

Référentiel, « PHASE 7 — Deuxième passe de recherche, couverture et enrichissement halieutique » (lignes 2678 à 2694), et cadrage `docs/phases/PHASE-7-CADRAGE.md` :
- challenger la phase 5 sans la répéter, et combler ses lacunes ;
- priorité n° 1 (Félix, 24 nov., 10 h 57) : comportement et alimentation du bar en Bretagne et au Cotentin, documentés au meilleur niveau, avec une proposition chiffrée de révision du moteur ;
- revue contradictoire des TOP_TIER, doublons sans fusion ;
- informations par phase de marée, poste, accès, sécurité ; permanent et périssable distingués ;
- audit du mode BATEAU (toute extension proposée, jamais développée) ;
- lacunes impossibles à résoudre et demandes à Félix (§ 0.6) ;
- couverture, matrice des sources, niveaux de preuve.

Limites tenues :
- aucun changement du moteur dans `src/` (PF-19) ;
- aucune zone de validité à l'écran (PF-09) ;
- le journal de Félix reste hors du dépôt (PF-17).

## 2. Synthèse exécutive

- **Le bar, région par région.** Lecture complète ou ciblée de 9 sources de premier rang : de Pontual 2019 et 2023, Goossens 2023 et 2024, Fritsch 2005, entre autres. Sur 25 bars d'Iroise suivis au moins un hiver, 68 % partent au golfe de Gascogne, 24 % en mer Celtique et 8 % restent. Tous ceux suivis plus d'un an reviennent. Ils ne passent que 0,33 % de leurs jours sous 9 °C.
- **Connaissances du moteur.** 34 connaissances BORD, chacune avec sa zone de validité. Le pare-feu PF-33 est posé, puis durci après la revue indépendante. 13 règles restent sans source régionale (AUCUNE) : ce sont des lacunes déclarées.
- **Révision de la saison.** Proposition chiffrée, non appliquée, pour 42 spots sur 66 au nord du 48ᵉ parallèle. Le creux passe de février à mars et avril est abaissé. La rade de Brest, le goulet, les abers et la baie de Douarnenez y sont rangés par extrapolation, ce qui est dit.
- **Réglementation de la Manche.** Recherchée pour les 17 fiches dans le projet officiel, lu en entier. L'arrêté signé (n° 116/2026) n'a pas pu être lu, donc ses règles restent « à vérifier ». Trois cantonnements anciens sont ajoutés aux fiches voisines.
- **TOP_TIER.** Mousterlin et Penmarc'h tiennent sur l'intérêt, mais restent fragiles sur les conditions d'exploitation. Une proposition de règle plus stricte est soumise à Félix (Q7-04).
- **Mode BATEAU.** Une régression corrigée : les règles des marques de démonstration étaient fausses. Les seuils sont dits « à valider ». Les écarts sont gardés pour l'intégration.
- **Couverture.** Aucun nouveau candidat admis : les sources lues nomment des zones, pas des postes. Le Trégor est le trou le plus long.
- **Sécurité.** Aucune fiche ne peut encore être SAFE. Les données manquantes (accès selon la marée pour 75 fiches, fenêtres de sécurité pour 23) ne sont dans aucune source publique lue. Elles sont demandées à Félix (Q7-03).

## 3. Travail réalisé

| Étape | Produit |
| --- | --- |
| Revue régionale du bar | `docs/halieutique/REVUE-REGIONALE-BAR.md` (version 2) |
| Connaissances par zone de validité | `data/knowledge/bar-bord.json` ; PF-33 dans `tests/knowledge.mjs` et `tests/pare-feux-sabotage.mjs` |
| Proposition de révision de la saison | `docs/moteur-bord/07-REVISION-PHASE-7.md`, `scripts/revision-saison.mjs`, `data/moteur-bord/revision-saison-phase-7.json` |
| Revue contradictoire des TOP_TIER et doublons | `docs/halieutique/CHALLENGE-TOP-TIER-PHASE-7.md` |
| Audit du mode BATEAU | `docs/halieutique/AUDIT-BATEAU-PHASE-7.md` ; corrections dans `src/prototype-v3/` (texte des marques de démonstration et verdict de Home BATEAU) |
| Règles locales de la Manche | `scripts/reglementation-locale.mjs`, 17 fiches, `data/sources/manuelles.json` (2 sources) |
| Registre des inconnues et demandes | `docs/halieutique/REGISTRE-INCONNUES-PHASE-7.md` |
| Couverture | `docs/halieutique/COUVERTURE.md`, § 7 |
| Exigences de la phase (PF-46) | `tests/pare-feux/exigences.mjs`, preuves ajoutées à `tests/spots-v3.mjs` |

## 4. Justification des changements

Chaque changement de données vient d'une source lue : chiffres, pages et statuts sont dans les documents de la phase. Les décisions validées ne sont pas touchées (PF-04). La révision de la saison et la règle TOP_TIER sont proposées, pas appliquées.

### Solutions comparées

Comment faire entrer la biologie régionale dans le moteur :

| Solution | Avantage | Inconvénient |
| --- | --- | --- |
| A. Garder la table V2 partout | aucun risque de régression | ignore les marquages : le creux de février contredit la ponte et les débarquements |
| B. Une table par zone de validité, lue sur la position du spot (proposée) | suit les sources ; zones jamais affichées ; changement chiffré et réversible | valeurs non sourcées (seul le sens l'est) ; extrapolation aux rades |
| C. Apprendre la saison sur le journal seulement | colle au terrain de Félix | trop peu de sorties par mois et par zone pour conclure (JRN-05) |

**Recommandée : B, éprouvée contre le journal à la phase 8**, puis C pour l'affiner (boucle contrôlée, V3-030). B suit les sources sans rien cacher, et l'épreuve dira si elle classe mieux que A.

Pour la Manche, deux options : attendre le texte signé, ou consigner le projet lu. **Recommandée : consigner le projet avec la réserve « à vérifier »**. L'information est utile tout de suite et ne donne jamais de feu vert.

### Mise en œuvre pas à pas

1. Lire `docs/moteur-bord/07-REVISION-PHASE-7.md` : la table proposée et son impact sur les 66 spots y sont chiffrés.
2. Recalculer : `node scripts/revision-saison.mjs --verifier` doit afficher « proposition à jour (66 spots) ».
3. À la phase 8, lancer l'épreuve avec la table V2, puis avec la table proposée, contre le journal. Comparer le rang des spots des sorties à prise.
4. Si la table proposée l'emporte, l'écrire dans le moteur 2, après l'approbation qui suit la phase 9 (PF-19).
5. Manche : dès qu'une copie lisible de l'arrêté n° 116/2026 paraît au recueil des actes de la préfecture de Normandie, la relire, puis passer les règles de « à vérifier » à VÉRIFIÉ dans `scripts/reglementation-locale.mjs`. Relancer `node scripts/reglementation-fiches.mjs`, puis `node scripts/qualifier-fiches.mjs`.

## 5. Livrables

| Livrable du référentiel | Fichier |
| --- | --- |
| Registre d'enrichissement complémentaire | `docs/halieutique/REVUE-REGIONALE-BAR.md` ; `data/knowledge/bar-bord.json` (version 2) ; `data/sources/registre.json` (365 sources) |
| Liste des nouveaux candidats | `docs/halieutique/COUVERTURE.md` § 7 : aucun admis ; pistes gardées (estuaire du Léguer, côte de granit rose, Trieux) |
| Fiches enrichies | 17 fiches de la Manche (réglementation) ; connaissances régionales |
| Rapport de challenge des TOP_TIER | `docs/halieutique/CHALLENGE-TOP-TIER-PHASE-7.md` |
| Carte et rapport de couverture | `docs/halieutique/COUVERTURE.md` § 7 |
| Registre des inconnues et demandes | `docs/halieutique/REGISTRE-INCONNUES-PHASE-7.md` |
| Audit BATEAU | `docs/halieutique/AUDIT-BATEAU-PHASE-7.md` |
| Proposition de révision du moteur | `docs/moteur-bord/07-REVISION-PHASE-7.md` |

## 6. Git et état du dépôt

- **Commits** : 14 commits atomiques sur la branche avant ce rapport, tous poussés. `main` est inchangée et rien n'est fusionné.
- **Proposition** : n° 28, en brouillon vers `claude/v3-phase-6`.
- **Fichiers** : 49 touchés avant ce rapport.
- **`src/`** : seulement `src/prototype-v3/data.js` et `home.jsx` (textes du prototype BATEAU). Aucun changement dans `src/bord`, `src/bateau` ni `src/shared`.
- **Données** : aucun spot V2 retiré, aucun secret, aucune donnée OpenStreetMap.

## 7. Preuves

Gate sur un **clone neuf** de la branche, le 26 nov. 2026 (codes consignés). Le premier passage, sur 4e83c56, a donné :

| Commande | Code | Résultat |
| --- | --- | --- |
| `npm ci --ignore-scripts` | 0 | 0 faille |
| `npm run -s verifier` | 1 | 7 suites sur 8 au vert ; « mise à jour sans perte » : 2/3, `page.reload` arrêté au bout de 30 s |
| `npm run -s test:upgrade`, relancé dans le même clone | 0 | 12/12 : l'échec était un délai de l'environnement, pas un défaut |

Le gate final, sur le commit de ce rapport, est consigné au § 7 bis.

Contrôles lancés pendant la phase :
- connaissances 28/28 ;
- spots V3 1266/1266 ;
- pare-feux 2035/2035 ;
- sabotage 51/51 ;
- prototype V3 215/215 ;
- `revision-saison --verifier` à jour.

CI de la proposition sur 2d4ddc8 : « Tests », « Contrat IGN » et « Contrat Open-Meteo » en succès (passage 45767430356).

### 7 bis. Gate final

Gate rejoué sur un clone neuf de 442db1f, le commit de ce rapport, le 26 nov. 2026 :

| Commande | Code | Résultat |
| --- | --- | --- |
| `npm ci --ignore-scripts` | 0 | 0 faille |
| `npm run -s verifier` | 0 | 8 suites sur 8 au vert : npm test, accessibilité (0 violation), mise à jour 12/12, prototype V2 244/244, prototype V3 227/227, marque 35/35, indicateurs |
| CI « Tests », « Contrat IGN », « Contrat Open-Meteo » sur 442db1f | success | passages 45808420072, 45808420219, 45808420032 |

Un premier passage sur ce même commit avait échoué : un gate oublié tournait encore dans un autre clone et occupait le port 8765 (`EADDRINUSE`). Il a été arrêté, puis le gate a été relancé en entier. Ce n'est pas un défaut du code.

## 8. Résultats fonctionnels et qualité

| Indicateur (objectif suivi, jamais au détriment des spots) | Valeur | Commentaire |
| --- | --- | --- |
| K-08 sécurité documentée | 18 fiches sur 98 (18,4 %) | inchangé : accès selon la marée et consignes sourcées manquent |
| K-09 crédibilité | 48 sur 98 | inchangé |
| K-10 exactitude de la position | 69 sur 98 | inchangé |
| K-11 complétude moyenne | 64,3 % | + 0,2 (règles de la Manche) |
| K-12 conformité réglementaire | 63 sur 98 | inchangé : la Manche est recherchée, mais sa règle reste « à vérifier » |

- **Ce qui fonctionne** : les connaissances régionales sont tracées et contrôlées, la proposition se recalcule, et le prototype BATEAU affiche les règles de 2026.
- **Ce qui ne fonctionne pas encore** : aucune fiche n'est SAFE, et le moteur garde la saison V2.
- **Ce qui reste incertain** : les valeurs de la table proposée (niveau 4) ; l'abri en rade (niveau 4) ; la côte ouest du Cotentin.

## 9. Matrice des exigences

| Exigence | État en fin de phase 7 | Preuve, ou écart |
| --- | --- | --- |
| SPOT-02 | acceptée | schéma § 7.4 : `tests/spots-v3.mjs` (rubrique sans statut refusée, information V3 sans source refusée) |
| SPOT-03 | acceptée | quatre phases et fenêtres présentes ou marquées inconnues sur 98 fiches ; 32 sans aucune phase documentée (registre) |
| MAP-06 | acceptée | 98 positions en décimales ; 29 signalées par QUAL-3, jamais corroborées |
| RTE-04 | écart jusqu'à la phase 10 | point d'accès distinct, connu pour 91 fiches ; la mention « jusqu'au poste » vient avec l'écran |
| SPOT-09 | tenue sur le prototype, acceptation en phase 12 | courbe et horaires de la fiche |
| REC-11 | à faire, phase 8 | proposition de la phase 7 ; épreuve en phase 8 |
| SPOT-07 | à faire, phase 8 | couverture mesurée ; revue indépendante en phase 8 |
| SPOT-01, BAT-01, QA-03, OPS-01 | acceptées | aucun spot perdu ; e2e BATEAU ; CI ; branche |
| QA-02 | à faire, phase 14 | — |

Tableau complet : `docs/regles/EXIGENCES.md`.

## 10. Red-team et risques

**Passe 1 (auteur, 25 nov.)** : challenge des TOP_TIER et des doublons ; source « *Movement Ecology* » mal identifiée, corrigée le 26 nov.

**Passe 2 (relecteur indépendant, lecture seule, 26 nov.)** : 14 constats, dont aucun bloquant. Les plus importants, tous corrigés :
- calendrier de ponte attribué à des registres que la source ne cite pas : corrigé, et INFÉRÉ pour l'Iroise ;
- minimum de 6,5 °C mal attribué ;
- cantonnements marqués VÉRIFIÉ sur la foi d'un projet non signé : ramenés à INFÉRÉ ;
- côte d'Émeraude rangée au Cotentin dans la proposition : la limite est revue ;
- extrapolation à la rade de Brest non dite ;
- PF-33 trop faible : domaines et règles de `model.js` désormais couverts, avec deux essais de sabotage ;
- règle du bar des marques BATEAU incomplète, et test trop lâche.

**Passe 3 (contre-vérification, second relecteur indépendant)** : 8 constats corrigés, 5 partiels et 1 reporté (l'état de reprise). Les partiels sont repris : rades, goulet et abers nommés ; règles de `model.js` couvertes ; libellé de l'abri ; tableau des règles AUCUNE complété ; « aire nord » alignée. Limite restante, écrite : PF-33 contrôle l'étiquetage des sources, pas leur lecture.

Risques :
- **valeurs de saison non sourcées** : seule l'épreuve dira si elles aident ;
- **règles de la Manche** : le texte signé peut différer du projet ; elles restent « à vérifier » ;
- **sécurité** : tant que Q7-03 n'a pas de réponse, aucun spot n'est présenté comme praticable.

### Menaces actuelles et parades

Veille du 26 nov. 2026, qui complète celle du 25 nov. (`docs/security/THREAT_MODEL.md`) :

| Menace | Parade dans SPUMY | Contrôle |
| --- | --- | --- |
| Nouvelles campagnes npm signalées à l'automne 2026 : paquet piégé qui va chercher sa charge sur la chaîne Ethereum (PolinRider, Sonatype) ; campagne « SANDWORM_MODE » (SecurityWeek). Titres lus, articles non lus : dates et détails INCONNUS | installation sans scripts (`npm ci --ignore-scripts`), verrou intègre, délai de 7 jours, liste des failles en CI | `scripts/pare-feux/bibliotheques.mjs` (CI) |
| Vers npm auto-propagés (ChainDrop, Mini Shai-Hulud) | mêmes parades ; aucun jeton dans le dépôt | `tests/secrets.mjs` |
| Pages lues par Claude qui tentent de lui donner des ordres : sources de pêche, PDF officiels, rapports d'agents | ce qui est lu reste une donnée ; les rapports des relecteurs ont été vérifiés dans les fichiers avant chaque correction | conduite de session |

Sources :
- [Sonatype, campagne PolinRider](https://www.sonatype.com/resources/videos/polinrider-campaign)
- [SecurityWeek, SANDWORM_MODE](https://www.securityweek.com/new-sandworm_mode-supply-chain-attack-hits-npm/amp/)
- [Microsoft, ChainDrop, août 2026](https://microsoft.com/en-us/security/blog/2026/08/04/chaindrop-supply-chain-compromise-anatomy-self-propagating-worm)

## 11. Qualité et conformité

Critères du § 13.4 :

| N° | Critère | État |
| --- | --- | --- |
| 1 | Périmètre réalisé | oui pour chaque point du référentiel ; les lacunes sans source publique sont documentées et demandées à Félix. Restent, reportés et écrits (§ 13) : 242 pages V2 à évaluer, 89 postes sans second éditeur, fenêtres de marée au format V3, règle des 15 m du Morbihan |
| 2 | Livrables produits | oui (§ 5) |
| 3 | Exigences couvertes | oui : preuve ou écart écrit (§ 9 ; PF-46 vert) |
| 4 | Tests exécutés, codes consignés | oui (§ 7, § 7 bis) |
| 5 | Preuves accessibles | oui : scripts et tests recalculent |
| 6 | Risques documentés | oui (§ 10) |
| 7 | Red-team | trois passes, dont deux par des relecteurs indépendants |
| 8 | Aucun défaut bloquant ouvert | oui : aucun constat bloquant, tous les « à corriger » repris |
| 9 | Validations utilisateur requises | aucune pour clore : les questions Q7-01 à Q7-05 ne bloquent rien ; statut par délégation, à confirmer par Félix |
| 10 | Documentation conforme | oui, après la contre-vérification ; état de reprise mis à jour avec ce rapport |

- **UX et UI** : seuls deux textes du prototype BATEAU ont changé ; aucun nouvel écran.

## 12. Questions utilisateur et décisions attendues

Registre : `docs/halieutique/REGISTRE-INCONNUES-PHASE-7.md`. Une seule question est posée à la fois.

- **Posée maintenant : Q7-03.** Pour les 23 spots où la marée coupe le retour ou noie le poste, combien de temps avant ou après la basse mer repars-tu, et au-dessus de quel coefficient n'y vas-tu pas ? C'est la condition d'une fiche SAFE.
- **En attente** :
  - Q7-01 : poste de Mousterlin ;
  - Q7-02 : poste et phases de Penmarc'h ;
  - Q7-04 : règle TOP_TIER plus stricte ;
  - Q7-05 : prises d'hiver en rade, réponse gardée hors du dépôt.
- **Déjà ouvertes** : confirmation des phases 6 et 7 ; décisions D6-01 à D6-21 ; niveaux d'engagement ; seuils BATEAU.

## 13. Prochaine phase proposée

**Phase 8 du référentiel (épreuve)**, avec son propre jeton.

- **Venu de cette phase** :
  - éprouver la table de saison proposée contre le journal ;
  - intégrer les réponses de Félix ;
  - relire l'arrêté signé de la Manche ;
  - évaluer les 242 pages V2 (QUAL-2) ;
  - chercher un second éditeur pour les 89 postes ;
  - fenêtres de marée au format V3 ;
  - règle des 15 m des concessions du Morbihan.
- **Prérequis** : jeton de Félix « APPROVED — PROCEED TO PHASE 8 ».

## 14. Arrêt

Phase 7 close : **VALIDATED (par délégation de Félix, 23 nov., 23 h 15 ; à confirmer par Félix)**. Aucune phase 8 sans son propre jeton ; rien n'est planifié au-delà. Aucun changement du moteur avant l'approbation qui suit la phase 9.

## Complément du 26 nov. 2026 (après la réponse de Félix à Q7-03)

Félix ne connaît pas les 23 spots de la question Q7-03. Il laisse le choix entre une recherche et ses retours terrain. Recherche faite sur la branche de la phase, sans toucher au moteur (registre, § 4) :
- Grand Bé et Petit Bé : fenêtre sourcée de 1 h 30 avant à 1 h 30 après la basse mer (office de tourisme de Saint-Malo) ;
- 12 autres fiches reçoivent des consignes sourcées ;
- K-08 passe de 18 à 22 fiches ;
- l'étude du moteur est recalculée : 22 contraintes de marée encore sans fenêtre au lieu de 23, et toujours aucune fiche SAFE.

Les 10 spots sans rien de concret attendent les retours terrain de Félix. Le statut de la phase ne change pas.

