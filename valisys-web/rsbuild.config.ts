/// <reference types="node" />
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  resolve: {
    alias: { '@': './src' },
  },
  html: {
    favicon: './public/icon-white.png',
    title: 'Valisys ERP',
  },
  plugins: [pluginReact()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5019',
        changeOrigin: true,
      },
    },
  },
});


