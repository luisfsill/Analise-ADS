// Gate focado em correção assíncrona (type-aware). Roda separado do lint rápido: npm run lint:typed
import defaultConfig from "./eslint.config.mjs";

const config = [
  ...defaultConfig,
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}", "proxy.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      // Linha de base em 21/10/2026: 11 violações (handlers async em onSubmit/onClick).
      // Volta para "error" quando a contagem chegar a zero. Ver docs/quality.md.
      "@typescript-eslint/no-misused-promises": "warn",
    },
  },
];

export default config;
