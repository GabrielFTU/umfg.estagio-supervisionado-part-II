import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  resolve: {
    alias: { '@': './src' }
  },
  plugins: [pluginReact()],
  
});


