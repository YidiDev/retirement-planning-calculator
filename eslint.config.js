import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.mjs', 'tests/**/*.js', 'src/**/*.js'],
    ignores: ['src/worker.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        Worker: 'readonly',
        setTimeout: 'readonly',
        document: 'readonly',
        __APP_VERSION__: 'readonly',
      },
    },
  },
  {
    files: ['src/worker.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        onmessage: 'writable',
        postMessage: 'readonly',
        Float64Array: 'readonly',
        Math: 'readonly',
        Infinity: 'readonly',
        console: 'readonly',
      },
    },
  },
];
