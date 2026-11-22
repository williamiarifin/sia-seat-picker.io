import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // The 3D layer is intentionally imperative: materials, instance matrices
    // and the camera are mutated inside useFrame for performance. React
    // Compiler's immutability rules do not apply to that pattern.
    files: [
      "components/aircraft/**/*.{ts,tsx}",
      "components/cabin/**/*.{ts,tsx}",
      "components/scene/**/*.{ts,tsx}",
    ],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/use-memo": "off",
    },
  },
]);

export default eslintConfig;
