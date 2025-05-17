import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist/**", "node_modules/**"]),
  {
    files: ["**/*.{js,ts}"],
    plugins: { js },
    extends: ["js/recommended"],
    rules: {
      "no-console": "error",
    },
  },
  {
    files: ["**/*.{js,ts}"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
]);
