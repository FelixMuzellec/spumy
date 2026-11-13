# Contribuer à SPUMY

## Principes

- On ne modifie jamais à la main les fichiers compilés de la racine (`*.html`, `home.js`, `sw.js`, `manifest.json`, icônes) : on change `src/` ou `data/`, puis `npm run build`.
- Chaque fichier va dans sa couche : `src/core/` (commun au bord et au bateau), `src/bord/`, `src/bateau/`, `src/design/` (style sans métier), `src/app/` (coquille), `data/` (fiches des sites). Le bord et le bateau ne s'importent jamais l'un l'autre ; `npm run test:layers` le vérifie.
- Couleurs, tailles de texte, rayons : par les jetons de `src/design/tokens.js`, jamais une valeur écrite en dur ailleurs (`npm run test:layers` compte les couleurs en dur hors de `src/design/` ; ce compte ne peut que baisser).
- Un changement qui ne doit pas changer l'écran se prouve par les captures : `node tests/visual.mjs capture <avant>` sur l'ancienne construction, puis `capture <après>` et `compare <avant> <après>` (22 vues, pixel par pixel).
- Aucun secret dans le dépôt : ni jeton GitHub, ni clé d'API, ni coordonnées d'un spot personnel.
- Toute information halieutique ajoutée porte sa source, sa date et son niveau de preuve (scientifique ou institutionnel, observation documentée, retour local identifiable, hypothèse, heuristique).
- Une valeur inconnue reste inconnue : jamais remplacée en silence par une valeur neutre.

## Modifier une fiche de site

Le seul fichier à changer est `data/sites/<site>.config.js` (donnée pure : ni fonction, ni calcul). Le schéma `data/schema/site.schema.json` décrit chaque champ ; la construction refuse une fiche qui ne le respecte pas. `npm run test:data` signale chaque spot modifié par son empreinte : si la modification est voulue, lancer `node tests/data.mjs --update-ref` et joindre `tests/ref/sites.json` au même commit, avec la source de l'information dans le message.

## Proposer une modification

1. Créer une branche depuis `main` (`claude/<sujet>` pour les travaux de Claude).
2. Faire des commits petits et explicites, en français, qui disent ce qui change et pourquoi.
3. Lancer `npm test` (contrôle du code, règles de couches, fiches des sites, unitaires, parcours, contrat simulé) ; selon le changement, `npm run test:a11y` et `npm run test:studio`.
4. Ouvrir une demande de fusion vers `main` avec : objectif, fichiers concernés, tests lancés et résultats, risques, retour arrière.
5. Rien n'est fusionné dans `main`, donc publié, sans tests verts et sans l'accord de Félix.

## Versions

Chaque version publiée est décrite dans [CHANGELOG.md](CHANGELOG.md). Le numéro de version et l'identifiant de construction s'affichent en bas de l'accueil.
