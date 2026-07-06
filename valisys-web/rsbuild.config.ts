/// <reference types="node" />
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  resolve: {
    alias: { '@': './src' },
  },
  html: {
    favicon: './public/icon-white.png',
    title: 'Althel ERP',
  },
  plugins: [pluginReact()],
  source: {
    define: {
      'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL ?? ''),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5019',
        changeOrigin: true,
      },
    },
  },
});


