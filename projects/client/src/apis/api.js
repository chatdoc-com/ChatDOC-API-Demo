import http from './http';
import { createParser } from 'eventsource-parser';

import get from 'lodash-es/get';

export const getUploadUrl = () => {
  return `api/v1/documents/upload`;
};

export const uploadWebsite = (url, collectionId) => {
  return http.post(`/documents/website`, {
    website: url,
    collection_id: collectionId,
  });
};
export const getDocumentToken = (id) => {
  return http.get(`/documents/${id}/token`);
};

export const createCollection = (name) => {
  return http.post(`/documents/collection`, { name });
};

export const fetchFileInfo = (id) => {
  return http.get(`/documents/${id}`);
};

export const getRecommendedPrompts = (id) => {
  return http.get(`/documents/${id}/recommend-questions`);
};

export const getQuestionDetail = (id) => {
  return http.get(`/questions/${id}`);
};

export const chatStream = (id) => {
  return `./api/v1/documents/${id}/chat`;
};

export const fetchChatStream = async (id, data) => {
  const response = await fetch(`api/v1/documents/${id}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status !== 200) {
    let errMsg = 'Network exception, please try again later.';
    let errInfo = {};
    try {
      const errorData = await response.json();
      errMsg =
        get(errorData, 'data[0].msg') || get(errorData, 'detail') || errMsg;
      errInfo = get(errorData, 'data') || {};
    } catch (e) {
      console.error(e);
    }
    return Promise.reject({
      status: response.status,
      message: errMsg,
      info: errInfo,
      type: 'http',
    });
  }
  return response;
};

export const readStream = (readableStream, readable) => {
  const reader = readableStream.getReader();
  function onParse(event) {
    if (event.type === 'event') {
      try {
        const { answer, id } = JSON.parse(event.data);
        readable(answer, id);
      } catch (e) {
        console.error(e);
      }
    }
  }

  // 用eventsource-parser确保返回的是完整的jsonString数据
  const parser = createParser(onParse);
  return reader.read().then(function processText({ done, value }) {
    if (done) {
      parser.reset();
      return;
    }
    const text = new TextDecoder().decode(value);
    parser.feed(text);

    return reader.read().then(processText);
  });
};
