import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    host: true, // Add this to expose to network
  },
  css: {
    postcss: './postcss.config.cjs',
    devSourcemap: true
  },
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: true,
    assetsDir: 'assets'
  },
  publicDir: 'public',
  optimizeDeps: {
    include: ['gsap', 'lenis']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
