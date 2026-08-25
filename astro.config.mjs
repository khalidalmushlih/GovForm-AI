// @ts-nocheck
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Full SSR mode for Cloudflare Workers
  adapter: cloudflare({
    imageService: 'cloudflare',
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: true,
    }),
  ],
  vite: {
    ssr: {
      noExternal: ['@google/genai'],
    },
    optimizeDeps: {
      exclude: ['@astrojs/cloudflare'],
    },
  },
});
