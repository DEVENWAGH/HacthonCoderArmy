import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env': {}
  },
  envPrefix: 'VITE_'
});
