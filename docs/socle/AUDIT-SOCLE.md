# Audit du socle technique — phase 4 V3

23 novembre 2026, branche `claude/v3-phase-4` (depuis 080d5e3). Référentiel § 10.1 (« ne suppose jamais la stack »), § 10.4, § 12. Tout ce qui suit a été **mesuré** sur le dépôt ; une valeur non mesurée est marquée.

## 1. Pile réelle

| Élément | Version mesurée | Où |
| --- | --- | --- |
| Node | 22 (`.nvmrc`) ; v22.23.4 dans la session | `.nvmrc`, `package.json` (`engines: >=20`) |
| npm | 10.9.9 ; `package-lock.json` en lockfileVersion 3 | — |
| Modules | ES modules (`"type": "module"`) | `package.json` |
| Interface | React 18.3.1, react-dom 18.3.1 ; Leaflet 1.9.4 (4 fichiers de `src`) | dépendances |
| Construction | esbuild 0.28.2 (`scripts/build.mjs`) : le site est **construit et versionné à la racine** (HTML, `app.js` de 1,0 Mo, JSON, images), publié par GitHub Pages depuis `main` | `scripts/build.mjs` |
| Contrôle du code | ESLint 8.57.1 (`.eslintrc.json`), plugins react 7.37.5 et react-hooks 4.6.2 | — |
| Tests | Node (scripts maison), Playwright 1.56.0 (Chromium), axe-core 4.10.2, ajv 8.20.0 (schémas des fiches), Python 3 + Pillow, NumPy et SciPy pour `tests/brand.py` | `tests/` |
| Stockage sur l'appareil | `localStorage` (21 fichiers de `src`), IndexedDB (3 fichiers), synchronisation GitHub optionnelle (`src/core/ghsync.js`, jeton gardé sur l'appareil) | `src/core/` |
| Polices | @fontsource-variable (Roboto, Roboto Condensed, Montserrat) 5.3.0, embarquées | — |
| Types | **aucun contrôle de types** (pas de TypeScript, pas de `checkJs`) ; V3-020 décide JSDoc + `tsc --checkJs` | — |

## 2. Organisation du code (couches)

`tests/layers.mjs` fait respecter les couches : `design` → `core` → `bord` / `bateau` (jamais l'un l'autre) → `app` ; `studio`, `prototype` et `prototype-v3` sont à part (aucun moteur dans les prototypes). Mesure : 98 fichiers, 340 imports relatifs, **0 écart** ; 253 couleurs en dur hors de `src/design/`, au niveau de la référence.

Gestion d'erreurs (mesure) : 36 `throw new Error`, 185 `catch` dans `src`, sans type d'erreur commun ni code d'erreur : chaque module traite ses erreurs à sa façon. Pas de validation d'entrée commune hors des schémas de fiches (ajv, `tests/data.mjs`).

## 3. Dépendances et sécurité

- `npm audit` (23 nov.) : **0 vulnérabilité** (info, faible, modérée, haute, critique : 0).
- `npm outdated` :

| Paquet | Installé | Dernière | Lecture |
| --- | --- | --- | --- |
| eslint | 8.57.1 | 10.x | **ESLint 8 n'est plus maintenu** : passer à la configuration « flat » d'ESLint 9 ou 10 (proposition, § 6) |
| eslint-plugin-react-hooks | 4.6.2 | 7.x | suit ESLint |
| playwright | 1.56.0 | 1.65.1 | outil de test ; mise à jour mineure possible |
| axe-core | 4.10.2 | 4.14.1 | outil de test |
| react, react-dom | 18.3.1 | 19.x | **gardé** : la stack est conservée (V3-008) ; React 19 n'apporte rien de démontré ici |

- Actions GitHub : `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4`, **épinglées par étiquette**, pas par empreinte ; GitHub les force déjà sur Node 24 (avertissement de dépréciation de Node 20 dans les journaux de la CI).

## 4. Intégration continue

| Flux | Déclencheur | Contenu |
| --- | --- | --- |
| `tests.yml` (job `tests`) | push sur `main`, toute PR, à la main | construction, **site publié = sources reconstruites**, lint, couches, données, connaissances, design, design V3, moteur v2, unitaires (7 guides + fuseau Auckland), e2e Chromium, contrat simulé, mise à jour depuis `main`, studio, a11y, prototypes de la phase 11 et V3 |
| `contrat-open-meteo.yml` (job `contrat`) | chaque jour 04 h 17 UTC, toute PR, à la main | contrat réel d'Open-Meteo |
| `epreuve.yml` | à la main | journées de référence de l'épreuve du moteur |

Manques mesurés :
- **pas de contrôle de types** (n'existe pas encore) ;
- **`tests/brand.py` n'est pas en CI** (prévu en phase 4 par le manifeste de marque) ;
- **polices non attendues avant mesure** : le 23 nov., deux CI ont échoué (5 px de débordement sur Home à 390 px) parce que la mesure se faisait avec la police de secours ; corrigé dans l'interface, mais les tests du prototype V3 ne les attendent toujours pas ;
- la CI ne garde pas de trace de la version de Chromium utilisée (dépend de Playwright).

## 5. Configuration et secrets

- Aucun fichier `.env` ni `.env.example` : le site statique n'a **aucun secret côté serveur**. Les seuls jetons sont ceux que l'utilisateur colle dans l'application (sauvegarde GitHub du journal), gardés sur l'appareil.
- Recherche dans **tout l'historique Git** (toutes les branches) des motifs de jetons GitHub (`ghp_`, `github_pat_`), clés AWS, clés privées, jetons Slack, clés Google et `sk-` : **aucune occurrence**. Dans l'arbre, la seule occurrence de `github_pat_` est l'exemple de saisie de l'interface (« github_pat_… »).
- Le relais Météo-France (V3-011) n'existe pas encore : sa clé devra vivre hors du dépôt.
- `.gitignore` : `node_modules/`, `tests/shots/`, `tests/.build/`, `studio-build/`, `tests/tmp/`, `__pycache__/`. Manquent : `.env*` (sauf `.env.example`), `out/` (sortie de `epreuve.yml`), fichiers de système (`.DS_Store`).

## 6. Dépôt et branches

- 536 fichiers suivis (37 Mo), dont `assets/` 18 Mo ; 162 commits sur la branche ; `.git` 72 Mo.
- `main` **n'est pas protégée** (lecture de l'API : « Branch not protected », aucun ruleset). Protection « complète » accordée par Félix le 23 nov. ; pose bloquée par le relais de la session (`docs/socle/PROTECTION-MAIN.md`).
- Branches distantes : 13 branches `claude/phase-*` et de suivi de la V2 **déjà fusionnées** dans `main` ; `claude/phase-13-bateau` et `claude/transfert-spumy` non fusionnées ; `claude/v3-phase-2`, `-3`, `-4` en cours. Leur nettoyage relève de V3-019 (**À DÉCIDER**, non exécuté) : registre au § 7, aucune suppression.

## 7. Inventaire de nettoyage (registre)

Méthode : références statiques (`git grep`, y compris scripts, tests, CI et documentation), imports, usage au moment de la construction. Restauration : `git checkout <commit> -- <fichier>` (l'historique garde tout).

| Élément | Références | Décision de phase 4 |
| --- | --- | --- |
| `src/prototype-v3/map.jsx` | aucun import (remplacé par `geomap.jsx` en version 6) | **supprimé** en 4.7 (code mort) |
| `assets/brand/spumy-*-sombre.png`, `web/spumy-logo-sombre.webp`, `logo-spumy.webp` (racine) | site en ligne (`index.html`, `scripts/build.mjs`, `scripts/sites.mjs`) | **gardés** : non conformes (A01) mais encore utilisés par le site ; remplacés à l'intégration (phases 10 à 12) |
| Fichiers publiés à la racine (HTML, JSON, PNG des 7 guides, `app.js`, `sw.js`, polices, icônes) | GitHub Pages, contrôle « site publié = sources » | **gardés** : c'est le site |
| `audit/AUDIT-SPUMY-v9.1.md`, `audit/UX-SPUMY-v9.2.md` | `docs/ARCHITECTURE.md`, rapport de phase 1 | **gardés** (historique cité) ; déplacement vers `docs/historique/` proposé à la phase 15 |
| Générateurs V2 (`scripts/logos.py`, `photos.py`, `brand.mjs`, `prototype-data.mjs`, `avant-prototype.mjs`, `carte-prototype.py`) | documentation et CHANGELOG ; certains régénèrent des fichiers encore publiés | **gardés** jusqu'au remplacement des fichiers qu'ils produisent |
| `prototype/` (phase 11 de la V2) | CI (`test:prototype`), documentation | **gardé** tant que la CI le teste ; retrait proposé quand le prototype V3 l'aura entièrement remplacé |
| Branches V2 fusionnées (13) | fusionnées dans `main` | **registre seulement** (V3-019) |

## 8. Reproductibilité (mesures du 23 nov.)

`npm ci` → 0 ; `npm run build` puis `git status --porcelain` → aucun écart (la construction est déterministe pour les fichiers publiés) ; `npm test` → 0 ; `test:a11y`, `test:upgrade`, `test:prototype`, `test:prototype-v3`, `tests/brand.py` → 0. Installation depuis un clone neuf : à faire en 4.10.

## 9. Ce que la phase 4 en tire

1. Contrats typés JSDoc et `tsc --checkJs` sur les contrats communs de la V3, en CI (V3-020).
2. Erreurs typées communes (codes, messages en français, cause gardée) et validation des entrées aux frontières.
3. CI : contrôle de types, `tests/brand.py`, attente des polices dans les tests de mise en page, `.gitignore` complété.
4. Détection de secrets dans la CI (arbre et nouveaux commits).
5. Proposition à Félix : passer à ESLint 9 ou 10 (configuration « flat ») ; épingler les actions par empreinte.
6. Nettoyage : le seul élément mort sûr (`map.jsx`) ; le reste en registre.
