import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point directly to the ESM build to avoid Rollup missing default export warnings from the wrapper helper.
      '@supabase/supabase-js': '@supabase/supabase-js/dist/module/index.js',
    },
  },
  optimizeDeps: {
    // Ensure mixed ESM/CJS dependencies pre-bundle cleanly to avoid runtime require() in the browser.
    include: ['@emotion/is-prop-valid'],
  },
  build: {
    commonjsOptions: {
      // Transform mixed modules so CommonJS bits don't leak require() into the browser bundle.
      transformMixedEsModules: true,
    },
  },
});
