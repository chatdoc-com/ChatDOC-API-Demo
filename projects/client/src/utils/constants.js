export const DOC_ERROR_STATUS = {
  TEXT_PARSE_ERROR: -1,
  ELEMENT_PARED_ERROR: -2,
  PDF_CONVERT_ERROR: -3,
  LINK_DOWNLOAD_ERROR: -4,
  EXCEED_SIZE_ERROR: -5,
  EXCEED_TOKENS_ERROR: -6,
  PAGE_LIMIT_ERROR: -10,
  TITLE_COMPLETE_ERROR: -11,
  READ_TMP_FILE_ERROR: -12,
  OCR_PAGE_LIMIT_ERROR: -13,
};

export const DOC_STATUS_MESSAGE = {
  [DOC_ERROR_STATUS.TEXT_PARSE_ERROR]: 'Text embedding failed.',
  [DOC_ERROR_STATUS.ELEMENT_PARED_ERROR]: 'Element embedding failed.',
  [DOC_ERROR_STATUS.EXCEED_SIZE_ERROR]: 'File size limit exceeded.',
  [DOC_ERROR_STATUS.EXCEED_TOKENS_ERROR]:
    'The content of a single page in a document must not exceed 4500 tokens.',
  [DOC_ERROR_STATUS.PAGE_LIMIT_ERROR]: 'Page limit exceeded.',
  [DOC_ERROR_STATUS.TITLE_COMPLETE_ERROR]:
    'ChatGPT failed to generate a title by summarizing the article.',
  [DOC_ERROR_STATUS.READ_TMP_FILE_ERROR]: 'Temporary file reading error.',
  [DOC_ERROR_STATUS.OCR_PAGE_LIMIT_ERROR]: 'OCR page limit exceeded.',
};

export const DOC_STATUS_SHORT_MESSAGE = {
  [DOC_ERROR_STATUS.TEXT_PARSE_ERROR]: 'Text embedding failed',
  [DOC_ERROR_STATUS.ELEMENT_PARED_ERROR]: 'Element embedding failed',
  [DOC_ERROR_STATUS.EXCEED_TOKENS_ERROR]: 'Token limit exceeded',
  [DOC_ERROR_STATUS.READ_TMP_FILE_ERROR]: 'Temporary file reading error',
};

export const FILE_STATUS = {
  PARSED: '300',
};

export const FILE_LIMIT = {
  MAX_SIZE: 10, // MB
  MAX_PAGES: 10,
  COLLECTION_FILES_LIMIT: 30,
};
