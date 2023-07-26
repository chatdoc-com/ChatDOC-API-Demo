import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { readFileSync } from 'fs';

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
    https: {
      key: readFileSync('../server/server.key', 'utf8'),
      cert: readFileSync('../server/server.cert', 'utf8'),
    },
    proxy: {
      '/api': {
        target: env.VITE_SERVER_HOST || 'https://0.0.0.0:6030/',
        changeOrigin: true,
        secure: false, // 忽略自签名证书错误
      },
    },
  },
});
