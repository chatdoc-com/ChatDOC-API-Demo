import * as dotenv from 'dotenv';

dotenv.config({
  path: '../../.env',
});

const API_KEY = process.env.API_KEY || '';
let API_HOST = process.env.API_HOST;
let IS_BAIDU = false;
let IS_GLM = false;
if (!API_HOST && API_KEY) {
  if (API_KEY.startsWith('ck')) {
    API_HOST = 'https://api.paodingjiewen.com';
    IS_BAIDU = true;
  } else if (API_KEY.startsWith('gk')) {
    API_HOST = 'https://glm-chatdoc-api.test.paodingai.com';
    IS_GLM = true;
  } else {
    API_HOST = 'https://api.chatdoc.com';
  }
}

const ENV = {
  API_HOST,
  API_KEY,
  IS_BAIDU,
  IS_GLM,
};

export default ENV;
