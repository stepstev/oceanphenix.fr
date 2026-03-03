// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  // Domaine custom via CNAME → base: '/'
  // Si test sur stepstev.github.io/oceanphenix.fr → changer en base: '/oceanphenix.fr'
  site: 'https://oceanphenix.fr',
  base: '/',
  trailingSlash: 'ignore',
  build: {
    assets: 'assets',
  },
});
