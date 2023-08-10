import 'dotenv/config';
import Koa from 'koa';
import bodyParser from '@koa/bodyparser';
import appRouter from './app/app.router.js';
import apiResponse from './middleware/apiResponse.js';
import cors from '@koa/cors';
import staticServer from 'koa-static';
import https from 'https';
import http from 'http';
import { readFileSync } from 'fs';
import enforceHttps from 'koa-sslify';
const app = new Koa();

// 设置静态文件中间件
app.use(staticServer('./static'));

app.use(cors()); // 添加跨域处理中间件

app.use(
  enforceHttps.default({
    port: 6030,
  }),
);

app.use(
  bodyParser({
    multipart: true,
    formidable: {
      maxFileSize: 200 * 1024 * 1024, // 默认2M
    },
  }),
);

app.use(apiResponse);
app.use(appRouter.routes());

// app.listen(6030);

const options = {
  key: readFileSync('./server.key', 'utf8'),
  cert: readFileSync('./server.cert', 'utf8'),
};

// start the server
http.createServer(app.callback()).listen(6031);
https.createServer(options, app.callback()).listen(6030, () => {
  // console.log(`➜  Network: https://localhost:6030/`);
});
