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
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
  {
    // Design-token guard: colors live in app/globals.css (+ the lib/tokens.ts mirror for
    // framer/canvas/SVG). Raw hex in components bypasses the world-theming system.
    files: ["app/**/*.tsx", "components/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]",
          message:
            "Raw hex color — use a token utility (text-ink-300, border-world, …) or import from lib/tokens.ts.",
        },
        {
          selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]",
          message:
            "Raw hex color in template string — use a token utility or import from lib/tokens.ts.",
        },
      ],
    },
  },
  {
    // The viewport themeColor is metadata, not styling; it mirrors --ink-900.
    files: ["app/layout.tsx"],
    rules: { "no-restricted-syntax": "off" },
  },
]

export default eslintConfig
