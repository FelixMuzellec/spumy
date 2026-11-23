# Maintenance des outils de contrôle

Phase 4 V3, complément du 23 novembre 2026. Félix (14 h 54) : « est-ce la meilleure solution technique ? Si c'est effectivement le cas, on avance. » Les deux changements sont faits maintenant plutôt qu'en phase 14. L'essentiel du code V3 sera écrit pendant les phases 5 à 12 : il doit être contrôlé dès le début par des outils maintenus. Plus tard, la migration coûterait plus cher.

## 1. ESLint 10 (sous-tâche 4.12)

### Pourquoi la 10, et pas la 9

Sources consultées le 23 nov. 2026 : https://eslint.org/version-support/ et les notes de version d'ESLint 10.0.0.

| Ligne | Statut |
| --- | --- |
| ESLint 8 (utilisé jusqu'ici) | en fin de vie depuis le 5 oct. 2024 |
| ESLint 9 | en fin de vie depuis le 6 août 2026 |
| ESLint 10 | seule ligne maintenue (depuis le 6 févr. 2026) |

Le rapport de phase 4 proposait « 9 ou 10 » : la 9 n'est plus une option.

### Ce qui change

| Élément | Avant | Après |
| --- | --- | --- |
| eslint | 8.57.1 (`^`) | **10.15.0** exacte |
| Configuration | `.eslintrc.json` | `eslint.config.js` (« flat ») |
| eslint-plugin-react-hooks | 4.6.2 (`^`) | **7.1.1** exacte, qui déclare ESLint 10 |
| eslint-plugin-react | 7.37.5 | **retiré** |
| globals | — | **17.14.0** exacte (remplace `env`) |
| Commande | `eslint -c .eslintrc.json --ext .js,.jsx,.mjs …` | `eslint src data scripts tests && node tests/lint-regles.mjs` |
| Node exigé (`engines`) | `>=20` | `^20.19.0 \|\| ^22.13.0 \|\| >=24` (exigence d'ESLint 10) ; `.nvmrc` = 22, poste de travail 22.23.4 |

Notes :
- **Version 10.15.0, et pas 10.14.0** : la 10.14.0 tirait une version de minimatch touchée par une faille de déni de service (GHSA-g3hv-75wg-m249, gravité modérée). Avec la 10.15.0, `npm audit` revient à 0 vulnérabilité.
- **Pourquoi retirer eslint-plugin-react** : sa dernière version (7.37.5, 3 avril 2025) ne déclare pas ESLint 10, et l'installer quand même demanderait de forcer les dépendances. Ses trois règles utilisées sont reprises ainsi :
  - `react/jsx-no-undef` est couverte par `no-undef` : ESLint 10 suit les références JSX ;
  - `react/jsx-uses-vars` est couverte par `no-unused-vars`, pour la même raison ;
  - `react/jsx-key` est remplacée par deux sélecteurs `no-restricted-syntax`, en avertissement, comme avant : un élément JSX rendu par `.map()`, directement ou par `return`, doit porter une clé.

### Équivalence mesurée

- **Mêmes fichiers** : 149 fichiers contrôlés avant (ESLint 8, depuis une copie propre de 22e705b) et après, liste identique. ESLint 10 contrôlait aussi les dossiers cachés (`tests/.build`, généré par les tests) : ils sont exclus, comme avec ESLint 8.
- **Mêmes résultats** : 0 erreur et 0 avertissement, avant comme après.
- **Mêmes règles** : `tests/lint-regles.mjs` soumet 19 cas aux deux versions et obtient des résultats identiques (19/19 avec ESLint 8.57.1, en ramenant les règles `react/*` à leur équivalent ; 19/19 avec ESLint 10.15.0). Les cas couvrent :
  - un composant JSX inconnu ;
  - un import utilisé seulement en JSX, et un import inutilisé ;
  - `.map()` avec et sans clé ;
  - un hook dans une condition ;
  - la redéclaration, les clés en double, une constante réaffectée ;
  - une utilisation avant définition ;
  - les globales du navigateur et celles de Node.

  Le test tourne dans `npm run lint`, donc dans `npm test` et dans la CI. Une règle perdue lors d'une prochaine mise à jour fera échouer la CI.
- Deux comportements d'ESLint 8 sont gardés explicitement :
  - `caughtErrors: "none"` : une erreur capturée inutilisée n'est pas signalée ;
  - les 14 commentaires `eslint-disable-line react-hooks/exhaustive-deps` du code V2 ne sont pas signalés comme inutiles.

### Écart connu

L'ancienne règle `react/jsx-key` couvrait plus de cas que les deux sélecteurs :
- fragments ;
- ternaires dans `.map()` ;
- tableaux littéraux d'éléments JSX.

Ces cas ne sont plus signalés. C'était un avertissement, et aucun ne se présente aujourd'hui (0 avertissement). **Prochaine étape** : remettre eslint-plugin-react dès qu'il déclarera ESLint 10, à vérifier à chaque phase.

### Retour arrière

`git revert` du commit de la sous-tâche 4.12. Ou bien :
1. `git checkout 22e705b -- .eslintrc.json package.json package-lock.json tests/upgrade.mjs` ;
2. supprimer `eslint.config.js` et `tests/lint-regles.mjs` ;
3. `npm ci`.

## 2. Actions GitHub épinglées par empreinte (sous-tâche 4.13)

### Pourquoi

- **Empreinte plutôt qu'étiquette.** Le guide de sécurité de GitHub Actions recommande d'épingler une action sur l'empreinte complète de son commit : c'est la seule façon d'utiliser une version immuable. Une étiquette (`@v4`) peut être déplacée vers un autre code, par erreur ou après une compromission du dépôt de l'action.
- **Versions à jour.** Node 20 a été retiré des runners de GitHub le 23 sept. 2026. Les actions v4 tournaient de force sous Node 24, d'où l'avertissement dans les journaux. Les versions retenues sont écrites pour Node 24 (`runs.using: node24`, vérifié dans leur `action.yml`).

### Versions retenues

Empreintes lues le 23 nov. 2026 sur les dépôts officiels (`git ls-remote`) et contrôlées par une copie à l'étiquette :

| Action | Avant | Après | Publiée le | Changements qui nous touchent |
| --- | --- | --- | --- | --- |
| actions/checkout | `@v4` | `@3d3c42e5aac5ba805825da76410c181273ba90b1` (v7.0.1) | 17 juil. 2026 | aucun : identifiants gardés hors de `.git/config` (v6) ; refus des PR de forks pour `pull_request_target` et `workflow_run` (v7), déclencheurs que nous n'utilisons pas |
| actions/setup-node | `@v4` | `@949feb2413d6458794dcd2491c4babbbce0c15c1` (v7.1.0) | 7 oct. 2026 | aucun : `cache: npm` reste explicite ; `always-auth` et le faux `NODE_AUTH_TOKEN` retirés (v6, v7), options que nous n'utilisons pas |
| actions/upload-artifact | `@v4` | `@cf430e030ddbb5b0abf93d22962f4752f3646cd9` (v7.0.2) | 7 oct. 2026 | aucun : `name`, `path`, `retention-days`, `if-no-files-found` inchangés ; archive zip par défaut |

Toutes ces versions ont plus de six semaines : aucune n'est trop récente pour avoir été éprouvée.

Le contrat Open-Meteo tournait sur `ubuntu-latest`, qui change d'image sans prévenir. Il tourne désormais sur `ubuntu-24.04`, comme les autres passages. Les noms des passages `tests` et `contrat` ne changent pas : ce sont les contrôles exigés par la protection de `main`.

### Contrôle permanent

`tests/actions-epinglees.mjs`, lancé dans `npm run lint` (donc dans `npm test` et dans la CI), refuse :
- une action sans empreinte de 40 caractères suivie de sa version en commentaire ;
- une image de runner `*-latest`.

Les deux cas négatifs ont été essayés (`@v7`, `ubuntu-latest`) : code de sortie 1.

### Mettre à jour une action

1. `git ls-remote --tags https://github.com/actions/<action>` : empreinte de l'étiquette voulue.
2. Lire ses notes de version, et `runs.using` dans `action.yml`.
3. Attendre qu'elle ait au moins sept jours.
4. Remplacer l'empreinte et le commentaire de version, puis faire passer la CI sur une proposition.

**Dependabot** (décision de Félix, 23 nov. 2026, 19 h 07) : `.github/dependabot.yml`, pour les actions GitHub seulement.
- Une proposition par mois au plus, toutes les actions ensemble.
- Une version n'est proposée qu'après 7 jours d'attente : Dependabot sait appliquer ce délai aux actions GitHub.
- Dependabot met à jour l'empreinte **et** le commentaire de version.
- Il ne lit sa configuration que dans la branche par défaut : **il sera actif à la fusion de la V3 dans `main`**. Ses propositions viseront `main` et devront passer `tests` et `contrat`, comme toutes les autres.
- La procédure manuelle ci-dessus reste valable d'ici là.

### Retour arrière

`git revert` du commit de la sous-tâche 4.13.
