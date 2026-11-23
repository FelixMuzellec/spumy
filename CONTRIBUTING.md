# Contribuer à SPUMY

## Principes

- On ne modifie jamais à la main les fichiers compilés de la racine (`*.html`, `app.js`, les fiches `<guide>.json`, `sw.js`, `manifest.json`, icônes) : on change `src/` ou `data/`, puis `npm run build`.
- Chaque fichier va dans sa couche : `src/core/` (commun au bord et au bateau), `src/bord/`, `src/bateau/`, `src/design/` (style sans métier), `src/app/` (coquille), `data/` (fiches des sites). Le bord et le bateau ne s'importent jamais l'un l'autre ; `npm run test:layers` le vérifie.
- Couleurs, tailles de texte, rayons : par les jetons de `src/design/tokens.js`, jamais une valeur écrite en dur ailleurs (`npm run test:layers` compte les couleurs en dur hors de `src/design/` ; ce compte ne peut que baisser).
- Un changement qui ne doit pas changer l'écran se prouve par les captures : `node tests/visual.mjs capture <avant>` sur l'ancienne construction, puis `capture <après>` et `compare <avant> <après>` (22 vues, pixel par pixel).
- Aucun secret dans le dépôt : ni jeton GitHub, ni clé d'API, ni coordonnées d'un spot personnel.
- Toute information halieutique ajoutée porte sa source, sa date et son niveau de preuve (scientifique ou institutionnel, observation documentée, retour local identifiable, hypothèse, heuristique).
- Une valeur inconnue reste inconnue : jamais remplacée en silence par une valeur neutre.

## Conventions de la V3 (phase 4)

Elles complètent les principes ci-dessus sans les changer. Le référentiel (`docs/SPUMY_MASTER_PROMPT.md`) et `CLAUDE.md` priment.

- **Branches** : une par phase (`claude/v3-phase-N`), proposition en brouillon vers la branche de la phase précédente ; **jamais de push sur `main`** (protégée : `docs/socle/PROTECTION-MAIN.md`). Fusionner dans `main` publie le site : seulement avec l'accord explicite de Félix.
- **Commits** : atomiques, en français, qui disent quoi et pourquoi, avec les tests lancés et leurs résultats ; les deux lignes d'attribution de la session pour les commits de Claude.
- **Code commun nouveau** (`src/core/`) : types en JSDoc, vérifiés par `npm run typecheck` (strict, ADR-V3-020) ; contrats de `src/core/contracts/` ; erreurs en `SpumyError` (`src/core/errors.js`), jamais un `catch` vide hors des accès au stockage du navigateur, documentés ; entrées validées aux frontières (`src/core/validate.js`). Une fonction qui peut échouer renvoie un `Result` ou lève une `SpumyError`, jamais une valeur devinée.
- **Données affichées** : chaque chiffre a sa source et son heure ; sans source sûre, rien n'est affiché. Les données de démonstration sont marquées « démo » à l'écran.
- **Statuts** : `VÉRIFIÉ`, `INFÉRÉ`, `HYPOTHÈSE`, `INCONNU`, `À DÉCIDER` dans les documents ; `TESTED` seulement avec les commandes réellement lancées et leurs codes de sortie.
- **Contrôles avant une proposition** : `npm test` (dont types, secrets, socle), puis selon le changement `npm run test:a11y`, `test:upgrade`, `test:prototype`, `test:prototype-v3`, `python3 tests/brand.py` (logos), `node scripts/mesure-perf.mjs` (performances, budgets de `docs/ARCHITECTURE-V3.md` § 11.5).
- **Outillage** : aucune nouvelle règle de style ni dépendance sans vérifier l'existant et le bénéfice (référentiel § 10.2 et § 10.4) ; versions épinglées pour l'outillage (TypeScript, paquets Python de `tests/requirements-marque.txt`).
- **Suppression** : rien sans audit des références (code, scripts, tests, CI, documentation) et stratégie de restauration ; registre dans `docs/socle/NETTOYAGE.md`.

## Modifier une fiche de site

Le seul fichier à changer est `data/sites/<site>.config.js` (donnée pure : ni fonction, ni calcul). Le schéma `data/schema/site.schema.json` décrit chaque champ ; la construction refuse une fiche qui ne le respecte pas. `npm run test:data` signale chaque spot modifié par son empreinte : si la modification est voulue, lancer `node tests/data.mjs --update-ref` et joindre `tests/ref/sites.json` au même commit, avec la source de l'information dans le message.

## Proposer une modification

1. Créer une branche (`claude/<sujet>` pour les travaux de Claude ; en V3, `claude/v3-phase-N`).
2. Faire des commits petits et explicites, en français, qui disent ce qui change et pourquoi.
3. Lancer `npm test` (contrôle du code, types, secrets, règles de couches, socle commun, fiches des sites, connaissances, moteur v2, unitaires, parcours, contrat simulé) ; selon le changement, `npm run test:a11y`, `npm run test:upgrade` (mise à jour d'un téléphone depuis `main`) et `npm run test:studio`. Un changement du moteur se mesure aussi sur les journées de référence (`scripts/epreuve-analyse.mjs`, `scripts/epreuve-mc.mjs`), avec une règle de décision écrite avant le passage.
4. Ouvrir une demande de fusion vers `main` avec : objectif, fichiers concernés, tests lancés et résultats, risques, retour arrière.
5. Rien n'est fusionné dans `main`, donc publié, sans tests verts et sans l'accord de Félix.

## Versions

Chaque version publiée est décrite dans [CHANGELOG.md](CHANGELOG.md). Le numéro de version et l'identifiant de construction s'affichent en bas de l'accueil.
