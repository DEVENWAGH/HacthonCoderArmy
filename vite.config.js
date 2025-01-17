import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true,
      include: ['*.js', 'src/**/*']
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  publicDir: 'public',
  css: {
    postcss: true
  }
});
