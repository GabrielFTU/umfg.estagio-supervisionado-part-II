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
});


