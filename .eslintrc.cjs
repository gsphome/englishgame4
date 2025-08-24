module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['warn', { 'varsIgnorePattern': '^(icon|description|feedbackContainer|MESSAGES|learningModules|auth|optionsContainer)$' }]
  },
  globals: {
    MESSAGES: 'readonly',
    auth: 'readonly',
    game: 'writable',
    learningModules: 'readonly',
    initializeGame: 'readonly',
    resetGame: 'readonly',
  },
};