module.exports = {
  extends: [
    "eslint:recommended",
    "eslint-config-standard",
    "plugin:@typescript-eslint/strict-type-checked",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "import-newlines"],
  root: true,
  overrides: [
    {
      files: ["src/routes/*"],
      rules: {
        "@typescript-eslint/no-misused-promises": "off",
      },
    },
    {
      files: ["*.js"],
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
      },
    },
    {
      files: ["**/*.test.ts", "**/*.spec.ts"],
      rules: {
        "@typescript-eslint/unbound-method": "off"
      }
    }
  ],
  rules: {
    "import-newlines/enforce": ["error", { items: 2, "max-len": 120 }],
    curly: ["error", "multi"],
    quotes: "off",
    "brace-style": "off",
    "comma-dangle": "off",
    "max-params": "off",
    "no-console": "error",
    "no-param-reassign": "error",
    "no-var": "error",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "no-multi-spaces": "off",
    "key-spacing": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "_.*" },
    ],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "variable",
        types: ["boolean"],
        format: ["PascalCase"],
        prefix: ["is", "should", "has", "can", "did", "will"],
      },
      {
        selector: ["variable", "function", "parameter"],
        format: ["camelCase"],
        leadingUnderscore: "allow",
      },
      {
        selector: "enumMember",
        format: ["UPPER_CASE"],
      },
      {
        selector: ["class", "interface", "enum"],
        format: ["PascalCase"],
      },
    ],
    "@typescript-eslint/max-params": ["error", { max: 3 }],
    "@typescript-eslint/comma-dangle": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
  },
};
