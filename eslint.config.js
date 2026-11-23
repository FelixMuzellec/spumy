// Configuration ESLint 10 (configuration « flat »), phase 4 V3, sous-tâche 4.12.
// Reprend une à une les règles de l'ancien .eslintrc.json (ESLint 8, en fin de vie depuis le 5 oct. 2024).
// Mêmes fichiers, mêmes règles, mêmes résultats : voir docs/socle/MAINTENANCE-OUTILS.md.
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // ESLint 8 ignorait les dossiers cachés (dont tests/.build, fichiers générés par les tests) ; ESLint 10 non.
  { ignores: ["**/.*/"] },
  {
    files: ["**/*.js", "**/*.jsx", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser },
    },
    linterOptions: {
      // Le code V2 garde des commentaires « eslint-disable-line react-hooks/exhaustive-deps » pour une règle
      // qui n'est pas activée ; ESLint 8 ne les signalait pas. Comportement conservé.
      reportUnusedDisableDirectives: "off",
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      "no-undef": "error",
      "no-dupe-keys": "error",
      "no-redeclare": "error",
      "no-const-assign": "error",
      "no-use-before-define": ["error", { functions: false, classes: true, variables: false }],
      "react-hooks/rules-of-hooks": "error",
      // ESLint 10 suit les références JSX : « no-undef » et « no-unused-vars » couvrent désormais
      // react/jsx-no-undef et react/jsx-uses-vars (eslint-plugin-react ne déclare pas encore ESLint 10).
      // caughtErrors « none » : valeur par défaut d'ESLint 8, gardée.
      "no-unused-vars": ["warn", { args: "none", caughtErrors: "none", varsIgnorePattern: "^_" }],
      // Remplace react/jsx-key : un élément JSX rendu par .map() doit porter une clé.
      "no-restricted-syntax": [
        "warn",
        {
          selector: "CallExpression[callee.property.name='map'] > :function > JSXElement.body > JSXOpeningElement:not(:has(JSXAttribute[name.name='key']))",
          message: "Élément JSX rendu par .map() sans attribut key (ancienne règle react/jsx-key).",
        },
        {
          selector: "CallExpression[callee.property.name='map'] > :function ReturnStatement > JSXElement.argument > JSXOpeningElement:not(:has(JSXAttribute[name.name='key']))",
          message: "Élément JSX rendu par .map() sans attribut key (ancienne règle react/jsx-key).",
        },
      ],
    },
  },
  {
    files: ["tests/**/*.mjs", "scripts/**/*.mjs"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
