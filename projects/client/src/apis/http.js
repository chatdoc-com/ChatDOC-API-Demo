import axios from 'axios';
import get from 'lodash-es/get';

export const baseURL = `./api/v1`;

export const fileBase = `${window.location.origin}${window.location.pathname}`;

export const fileBaseApiURL = `${fileBase}api/v1`;

const timeout = 120e3;

const http = axios.create({
  baseURL,
  timeout,
});

export const fileHttp = axios.create({
  baseURL,
  timeout,
});

http.interceptors.request.use(
  (config) => {
    if (config.data && !(config.data instanceof FormData)) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers['content-type'] = 'application/json';
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  },
);

http.interceptors.response.use(
  function resolve(result) {
    if (result.status !== 200) {
      return Promise.reject(new Error('Failed to get data'));
    }

    const { data } = result;

    if (data.status === 'ok') {
      return data.data;
    }
  },
  function reject(error) {
    const { response, message } = error;
    if (error.name === 'CanceledError') {
      return Promise.reject({ type: 'cancel', message });
    }
    if (error.message.includes('timeout')) {
      return Promise.reject({ type: 'http', message: 'request timeout' });
    }
    if (!response) {
      return Promise.reject({ type: 'http', message: 'unknown error' });
    }

    if (response.data && response.data.byteLength > 0) {
      let errorText = message;
      try {
        errorText = new TextDecoder().decode(response.data);
        response.data = JSON.parse(errorText);
      } catch {
        response.data = { detail: errorText || 'parse error' };
      }
    }

    const baseErrorData = {
      type: 'http',
      status: response.status,
    };

    const errorMessage = get(response, 'data.detail');

    const errorInfo = get(response, 'data.data');

    switch (response.status) {
      case 401: {
        return Promise.reject({
          ...baseErrorData,
          message: 'Authorization expired, please sign in again.',
          info: errorInfo || {},
        });
      }
      case 403: {
        return Promise.reject({
          ...baseErrorData,
          message: errorMessage || 'no operation permission',
          info: errorInfo || {},
        });
      }
      case 404:
        return Promise.reject({
          ...baseErrorData,
          message: errorMessage || 'not found',
          info: errorInfo || {},
        });
      case 400:
      case 422:
        return Promise.reject({
          ...baseErrorData,
          message: errorMessage || 'request error',
          info: errorInfo || {},
        });
      case 500:
      case 502:
        return Promise.reject({
          ...baseErrorData,
          message: 'service error',
          info: errorInfo || {},
        });
      default:
        return Promise.reject({
          ...baseErrorData,
          message: errorMessage || 'unknown error',
          info: errorInfo || {},
        });
    }
  },
);

export default http;
