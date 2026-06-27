import { defineConfig } from 'vite';

export default defineConfig({
  // Set base to relative path so that the build assets load correctly
  // on GitHub Pages subfolder deployments, Vercel, Netlify, or local preview.
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
