import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
const env = loadEnv('development', process.cwd());
export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), `src/assets/icons`)],
      symbolId: 'icon-[dir]-[name]',
    }),
  ],
  build: {
    outDir: '../server/static',
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: env.VITE_SERVER_HOST,
        changeOrigin: true,
      },
    },
  },
});
