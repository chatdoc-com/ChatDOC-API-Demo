export class AppException extends Error {
  constructor(errorMessage, errorDetail = errorMessage, statusCode = 400) {
    super(errorMessage, statusCode)

    this.errorMessage = errorMessage

    this.errorDetail = errorDetail
  }

  getStatusCode() {
    return this.statusCode
  }

  getErrorMessage() {
    return this.errorMessage
  }

  getErrorDetail() {
    return this.errorDetail
  }
}

export const throwAppError = (msg, detail = msg, statusCode = 400) => {
  throw new AppException(msg, detail, statusCode)
}
