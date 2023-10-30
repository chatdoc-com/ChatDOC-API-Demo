import { getAxiosInstance } from '../utils/http.js';
import FormData from 'form-data';
import fetch from 'node-fetch';
import ENV from '../../../env.mjs';

const proxyHost = ENV.API_HOST;
const proxyApiKey = ENV.API_KEY;
const prefix = '/api/v2';
const baseURL = `${proxyHost}${prefix}`;
const options = {
  baseURL,
  headers: {
    Authorization: `Bearer ${proxyApiKey}`,
  },
};
const http = getAxiosInstance(options);

export async function createDocCollectionAPI(name) {
  return http.post('/collections', {
    name,
  });
}

export async function uploadDocumentsAPI(file, body) {
  const formData = new FormData();

  formData.append('file', file.stream, file.originalName);
  formData.append('package_type', body.package_type);
  if (body.collection_id) {
    formData.append('collection_id', body.collection_id);
  }
  return http.post('documents/upload', formData);
}

export async function downloadDocumentAPI(uploadId) {
  const url = `documents/${uploadId}/download`;
  return http.get(url, { responseType: 'stream' });
}

export async function getDocByUploadIdAPI(uploadId) {
  const url = `documents/${uploadId}`;
  return http.get(url);
}

export async function deleteDocByUploadIdAPI(uploadId) {
  const url = `documents/${uploadId}`;
  return http.delete(url);
}

export async function getDocElementsAPI(uploadId, pages) {
  const url = `documents/${uploadId}/elements`;
  const search = new URLSearchParams();

  [].concat(pages).forEach((id) => {
    search.append('page', id);
  });

  return http.get(url, {
    params: search,
  });
}

export async function chatWithDocumentAPI(uploadId, chatParams) {
  const response = await fetch(`${baseURL}/questions?upload_id=${uploadId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${proxyApiKey}`,
    },
    body: JSON.stringify(chatParams),
  });
  return response;
}

export async function getSuggestedQuestionsAPI(uploadId) {
  const url = `questions/suggested`;
  return http.get(url, { params: { upload_id: uploadId } });
}

export async function uploadWebsiteAPI(website) {
  const url = `/documents/website`;
  return http.post(url, { website });
}
