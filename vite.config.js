import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './', // Set root to project root
  server: {
    port: 3000,
    host: true,
    watch: {
      ignored: ['**/src/output.css'],
    }
  },
  css: {
    postcss: './postcss.config.cjs'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  publicDir: 'public'
});
