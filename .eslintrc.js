module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {},
  settings: {
    "import/resolver": {
      node: {
        moduleDirectory: ["node_modules", "."],
      },
    },
  },
};
