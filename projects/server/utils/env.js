import * as dotenv from 'dotenv';

dotenv.config({
  path: '../../.env',
});

const API_KEY = process.env.API_KEY || '';
let API_HOST = process.env.API_HOST;
if (!API_HOST && API_KEY) {
  API_HOST = API_KEY.startsWith('ck')
    ? 'https://api.paodingjiewen.com'
    : 'https://api.chatdoc.com';
}

const ENV = {
  API_HOST,
  API_KEY,
};

export default ENV;
