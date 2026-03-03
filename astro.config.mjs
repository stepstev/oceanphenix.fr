// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Domaine custom via CNAME → base: '/'
  // Si test sur stepstev.github.io/oceanphenix.fr → changer en base: '/oceanphenix.fr'
  site: 'https://oceanphenix.fr',
  base: '/',
  trailingSlash: 'ignore',
  build: {
    assets: 'assets',
  },
});
