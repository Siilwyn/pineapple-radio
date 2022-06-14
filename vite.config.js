import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [
    preact(),
  ],
});
