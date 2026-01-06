import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const resolvePath = (...segments) =>
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ...segments);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point directly to the ESM build to avoid Rollup missing default export warnings from the wrapper helper.
      '@supabase/supabase-js': '@supabase/supabase-js/dist/module/index.js',
      // Provide a browser-safe stub for the optional @emotion/is-prop-valid peer used by Framer Motion.
      '@emotion/is-prop-valid': resolvePath('./src/shims/emotion-is-prop-valid.js'),
    },
  },
  optimizeDeps: {
    // Ensure mixed ESM/CJS dependencies pre-bundle cleanly to avoid runtime require() in the browser.
    include: ['framer-motion', '@emotion/is-prop-valid'],
  },
  build: {
    commonjsOptions: {
      // Transform mixed modules so CommonJS bits don't leak require() into the browser bundle.
      transformMixedEsModules: true,
    },
  },
});
