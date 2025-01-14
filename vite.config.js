import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env': {}
  },
  envPrefix: 'VITE_', // This allows you to use environment variables in your code
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true // This ensures Vite only uses port 3000
  }
});
