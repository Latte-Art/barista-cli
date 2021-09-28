module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['google', 'prettier', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'require-jsdoc': 'off',
    'no-unused-vars': 'warn',
  },
};
