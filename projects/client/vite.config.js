import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { readFileSync } from 'fs';
import ENV from '../../env.mjs';

process.env.API_HOST = ENV.API_HOST;
process.env.IS_BAIDU = ENV.IS_BAIDU;
process.env.IS_GLM = ENV.IS_GLM;

const env = loadEnv('development', process.cwd());
export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), `src/assets/icons`)],
      symbolId: 'icon-[dir]-[name]',
    }),
  ],
  envPrefix: ['VITE_', 'API_HOST', 'IS_GLM', 'IS_BAIDU'],
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
