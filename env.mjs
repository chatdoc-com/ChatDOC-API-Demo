import * as dotenv from 'dotenv';

dotenv.config({
  path: '../../.env',
});

const API_KEY = process.env.API_KEY || '';
let API_HOST = process.env.API_HOST;
if (!API_HOST && API_KEY) {
  if (API_KEY.startsWith('ck')) {
    API_HOST = 'https://api.paodingjiewen.com';
  } else if (API_KEY.startsWith('gk')) {
    API_HOST = 'https://glm-chatdoc-api.test.paodingai.com';
  } else {
    API_HOST = 'https://api.chatdoc.com';
  }
}

const ENV = {
  API_HOST,
  API_KEY,
};

export default ENV;
