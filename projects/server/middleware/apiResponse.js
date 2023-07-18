import { AppException } from '../utils/AppException.js'

export default async function (ctx, next) {
  try {
    await next()
    return {
      status: 'ok',
      data: ctx.body,
      message: 'Request successful',
    }
  } catch (exception) {
    ctx.status = exception.getStatusCode?.() ?? 400
    if (exception instanceof AppException) {
      ctx.body = {
        status: 'fail',
        statusCode: exception.getStatusCode(),
        message: exception.getErrorMessage(),
        detail: exception.getErrorDetail(),
      }
    } else {
      ctx.body = {
        status: 'fail',
        message: exception.message,
        detail: exception.error,
      }
    }
  }
}
