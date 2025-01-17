import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

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
  plugins: [vue()],
  css: {
    postcss: './postcss.config.js',
  },
});
