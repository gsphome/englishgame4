export default [
  {
    ignores: ['dist', 'node_modules', '*.config.*', 'scripts/**']
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Only essential rules for CI/CD
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Disable problematic rules
      'no-console': 'off',
      'no-debugger': 'off',
      'no-alert': 'off',
      'no-unused-vars': 'off',
      'no-empty-pattern': 'off',
      'no-undef': 'off',
      'no-control-regex': 'off',
    },
  },
]