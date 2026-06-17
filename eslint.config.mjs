import nextCoreWebVitals from "eslint-config-next/core-web-vitals"

/** Flat ESLint config (ESLint 9 / Next 16). */
const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...nextCoreWebVitals,
  {
    // The intentional `eslint-disable @next/next/no-img-element` comments stay as documentation
    // even though the rule is off below; don't report them as unused.
    linterOptions: { reportUnusedDisableDirectives: "off" },
    rules: {
      // The site deliberately uses raw <img>/<picture> for the cosmic AVIF/WebP layers and
      // external Spotify artwork (next.config sets images.unoptimized), so next/image adds nothing.
      "@next/next/no-img-element": "off",

      // eslint-plugin-react-hooks v7 bundles React Compiler readiness rules. This project does
      // not use the React Compiler, and these flag correct, idiomatic patterns (resetting state
      // on a prop change, reading a ref inside a memo). The classic rules-of-hooks and
      // exhaustive-deps checks remain active.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/use-memo": "off",
    },
  },
]

export default eslintConfig
