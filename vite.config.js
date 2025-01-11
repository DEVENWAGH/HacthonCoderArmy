import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env': {}
  },
  // This allows you to use environment variables in your code
  envPrefix: 'VITE_'
});
