import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Treat args starting with `_` as deliberately ignored — matches the
      // existing convention in our framer-motion-stripping test mocks
      // (`_l`, `_i`, `_a`, `_e`, `_t`, `_wt`).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // React 19's new rule flags `useEffect(() => setState(read()), [])` as
      // a "cascading render" smell. For our case (one-time client-only
      // bootstrap reads from localStorage on page mount), the canonical fix
      // is `useSyncExternalStore`, which forces us to manage snapshot ===
      // identity for the nested progress/profile/mistakes objects we read —
      // not worth the complexity. The pattern is correct and idiomatic; keep
      // it as a hint only, not a build-breaker.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
