import Router from '@koa/router';
import appController from './app.controller.js';
import multer from '@koa/multer';
const upload = multer({
  limits: { fileSize: 36 * 1024 * 1024 },
}).single('file');

const prefix = '/api/v1';

const router = new Router({
  prefix,
});

router.post('/documents/collection', appController.createDocCollection);
router.post(
  '/documents/upload',
  async (ctx, next) => {
    try {
      await upload(ctx, next);
    } catch (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        ctx.throw(
          400,
          `Your file is larger than (36MB) so we can't deal with it.`,
        );
      }
      ctx.throw(400, error);
    }
  },
  appController.uploadDocuments,
);
router.post('/documents/website', appController.uploadWebsite);
router.get('/documents/:uploadId', appController.getDocByUploadId);
router.delete('/documents/:uploadId', appController.deleteDocByUploadId);
router.get('/documents/:id/elements', appController.getDocElements);
router.post('/documents/:id/chat', appController.chatWithDocument);
router.get('/documents/:id/download', appController.downloadDocument);
router.get(
  '/documents/:id/recommend-questions',
  appController.getRecommendQuestions,
);
router.get('/documents/:id/token', appController.getDocumentToken);
router.get('/questions/:id', appController.getQuestionDetail);

export default router;
