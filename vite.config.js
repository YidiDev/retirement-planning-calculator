import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

const appVersion = readFileSync('VERSION', 'utf8').trim();

export default defineConfig({
  plugins: [tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __GA_MEASUREMENT_ID__: JSON.stringify(process.env.GA_MEASUREMENT_ID || ''),
    __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN || ''),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    manifest: false,
    codeSplitting: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 8080,
    strictPort: true,
  },
});
