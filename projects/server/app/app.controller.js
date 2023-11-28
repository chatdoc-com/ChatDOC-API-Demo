import {
  chatWithDocumentAPI,
  createDocCollectionAPI,
  deleteDocByUploadIdAPI,
  getDocByUploadIdAPI,
  getDocElementsAPI,
  uploadDocumentsAPI,
  getSuggestedQuestionsAPI,
  downloadDocumentAPI,
  uploadWebsiteAPI,
  getQuestionDetailAPI,
} from './app.api.js';
import { sendRequestWithCatch } from '../utils/tools.js';
import { throwAppError } from '../utils/AppException.js';
// import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
// import path from 'path';
import { Readable } from 'stream';
import jwt from 'jsonwebtoken';

class AppController {
  async createDocCollection(ctx) {
    const { name } = ctx.request.body;
    ctx.body = await sendRequestWithCatch(() => createDocCollectionAPI(name));
  }

  async uploadDocuments(ctx) {
    let file = ctx.file;
    if (!file) {
      throwAppError('The file cannot be empty.');
    }

    const apiResponse = await sendRequestWithCatch(() =>
      uploadDocumentsAPI(file, ctx.request.body),
    );

    ctx.body = apiResponse;
  }

  async getDocByUploadId(ctx) {
    const { uploadId } = ctx.params;
    const resp = await sendRequestWithCatch(() =>
      getDocByUploadIdAPI(uploadId),
    );
    ctx.body = resp;
  }

  async deleteDocByUploadId(ctx) {
    const { uploadId } = ctx.params;
    ctx.body = await sendRequestWithCatch(() =>
      deleteDocByUploadIdAPI(uploadId),
    );
  }

  async getDocElements(ctx) {
    const { id: uploadId } = ctx.params;
    const { page } = ctx.query;

    ctx.body = await sendRequestWithCatch(() =>
      getDocElementsAPI(uploadId, page),
    );
  }

  async chatWithDocument(ctx) {
    const { id: uploadId } = ctx.params;
    const { dataString } = ctx.query;
    let chatParams = {
      ...ctx.request.body,
    };
    if (dataString) {
      chatParams = { ...ctx.request.body, ...JSON.parse(dataString) };
    }
    const response = await chatWithDocumentAPI(uploadId, chatParams);
    ctx.body = Readable.from(response.body);
    ctx.status = response.status;
  }

  async downloadDocument(ctx) {
    const { id: uploadId } = ctx.params;
    const response = await downloadDocumentAPI(uploadId);
    ctx.set(response.headers);
    ctx.body = response.data;
    ctx.status = response.status;
  }

  async getRecommendQuestions(ctx) {
    const { id: uploadId } = ctx.params;
    const resp = await sendRequestWithCatch(() =>
      getSuggestedQuestionsAPI(uploadId),
    );
    ctx.body = resp;
  }

  async getDocumentToken(ctx) {
    const { id: uploadId } = ctx.params;
    const token = jwt.sign({ upload_id: uploadId }, process.env.API_KEY, {
      noTimestamp: true,
    });
    ctx.body = {
      status: 'ok',
      data: { token },
    };
  }

  async uploadWebsite(ctx) {
    const resp = await sendRequestWithCatch(() =>
      uploadWebsiteAPI(ctx.request.body),
    );
    ctx.body = resp;
  }

  async getQuestionDetail(ctx) {
    const { id: questionId } = ctx.params;
    const resp = await sendRequestWithCatch(() =>
      getQuestionDetailAPI(questionId),
    );
    ctx.body = resp;
  }
}

export default new AppController();
