import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true,
      include: ['*.js', 'src/**/*']  // Watch root js files and src directory
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  publicDir: 'public'
});
