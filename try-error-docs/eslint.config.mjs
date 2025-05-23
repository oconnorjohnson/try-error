import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable strict rules for documentation content
      "react/no-unescaped-entities": "off",
      "react/jsx-no-comment-textnodes": "off",
      "@typescript-eslint/no-unused-vars": "warn", // Change to warning instead of error
    },
  },
];

export default eslintConfig;
