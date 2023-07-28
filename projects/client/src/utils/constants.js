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
  [DOC_ERROR_STATUS.TEXT_PARSE_ERROR]: 'text embedding failed',
  [DOC_ERROR_STATUS.ELEMENT_PARED_ERROR]: 'element embedding failed',
  [DOC_ERROR_STATUS.PDF_CONVERT_ERROR]: 'docx to pdf failed',
  [DOC_ERROR_STATUS.LINK_DOWNLOAD_ERROR]: 'file link download failed',
  [DOC_ERROR_STATUS.EXCEED_SIZE_ERROR]: 'file size exceed limit',
  [DOC_ERROR_STATUS.EXCEED_TOKENS_ERROR]:
    'The content of a single page in a document must not exceed 4500 tokens.',
  [DOC_ERROR_STATUS.PAGE_LIMIT_ERROR]: 'page limit error',
  [DOC_ERROR_STATUS.TITLE_COMPLETE_ERROR]: 'complete title failed',
  [DOC_ERROR_STATUS.READ_TMP_FILE_ERROR]: 'read tmp file error',
  [DOC_ERROR_STATUS.OCR_PAGE_LIMIT_ERROR]: 'ocr page limit error',
};
