import Router from '@koa/router'
import appController from './app.controller.js'
import multer from '@koa/multer'
const upload = multer({
  path: '../upload'
})

const prefix = '/api/v1'

const router = new Router({
  prefix,
})

router.post('/documents/collection', appController.createDocCollection)
router.post(
  '/documents/upload',
  upload.single('file'),
  appController.uploadDocuments
)
router.get('/documents/:uploadId', appController.getDocByUploadId)
router.delete('/documents/:uploadId', appController.deleteDocByUploadId)
router.get('/documents/:id/elements', appController.getDocElements)
router.post('/documents/:id/chat', appController.chatWithDocument)
router.get('/documents/:id/download', appController.downloadDocument)
router.get('/documents/:id/recommend-questions', appController.getRecommendQuestions)
router.get('/documents/:id/token', appController.getDocumentToken)

export default router
