/// <reference types="vitest" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.SUPABASE_URL': JSON.stringify(env.INSFORGE_URL),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.INSFORGE_ANON_KEY),
        'process.env.INSFORGE_URL': JSON.stringify(env.INSFORGE_URL),
        'process.env.INSFORGE_ANON_KEY': JSON.stringify(env.INSFORGE_ANON_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './test/setup.ts',
        css: true,
      }
    };
});
