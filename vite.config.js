import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env': {}
  },
  envPrefix: 'VITE_', // This allows you to use environment variables in your code
  build: {
    outDir: 'dist'
  }
});
