import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "migrations/**", "dist/**", "**/*.ts"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": "off",
    },
  },
];
