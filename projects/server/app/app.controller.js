import {
  chatWithDocumentAPI,
  createDocCollectionAPI,
  deleteDocByUploadIdAPI,
  getDocByUploadIdAPI,
  getDocElementsAPI,
  uploadDocumentsAPI,
  getSuggestedQuestionsAPI,
} from './app.api.js';
import { sendRequestWithCatch } from '../utils/tools.js';
import { throwAppError } from '../utils/AppException.js';
import {
  writeFileSync,
  mkdirSync,
  createReadStream,
  existsSync,
  statSync,
} from 'node:fs';
import path from 'path';
import { Readable } from 'stream';
import jwt from 'jsonwebtoken';

class AppController {
  async createDocCollection(ctx) {
    const { name } = ctx.request.body;
    ctx.body = await sendRequestWithCatch(() => createDocCollectionAPI(name));
  }

  async uploadDocuments(ctx) {
    const { collection_id: collectionId } = ctx.query;
    let file = ctx.file;
    if (!file) {
      throwAppError('The file cannot be empty.');
    }
    let buffer = [];
    const chunks = [];
    file.stream.on('readable', () => {
      let chunk;
      while ((chunk = file.stream.read()) !== null) {
        chunks.push(chunk);
      }
    });
    file.stream.on('end', () => {
      buffer = Buffer.concat(chunks);
    });

    const apiResponse = await sendRequestWithCatch(() =>
      uploadDocumentsAPI(collectionId, file),
    );
    if (!existsSync('upload')) {
      mkdirSync('upload');
    }
    const newPath = `upload/${apiResponse.data.id}${path
      .extname(file.originalName)
      .toLowerCase()}`;
    writeFileSync(newPath, buffer);

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
    const filePath = path.join('./upload', `${uploadId}.pdf`);
    if (!existsSync(filePath)) {
      ctx.status = 404;
      ctx.body = 'Document not found';
      return;
    }

    const stats = statSync(filePath);
    const fileSize = stats.size;

    ctx.set('Content-Type', 'application/pdf');
    ctx.set('Content-Disposition', `attachment; filename=${uploadId}.pdf`);
    ctx.set('Content-Length', fileSize.toString());

    const readStream = createReadStream(filePath);
    ctx.body = readStream;
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
}

export default new AppController();
