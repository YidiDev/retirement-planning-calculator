import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.mjs', 'src/**/*.js'],
    ignores: ['src/legacy-calculator.js', 'src/worker.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        window: 'readonly',
        document: 'readonly',
        __APP_VERSION__: 'readonly',
      },
    },
  },
];
