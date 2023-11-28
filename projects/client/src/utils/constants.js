export const DOC_ERROR_STATUS = {
  TEXT_PARSE_ERROR: -1,
  ELEMENT_PARED_ERROR: -2,
  PDF_CONVERT_ERROR: -3,
  LINK_DOWNLOAD_ERROR: -4,
  EXCEED_SIZE_ERROR: -5,
  EXCEED_TOKENS_ERROR: -6,
  PAGE_PACKAGE_NOT_ENOUGH: -9,
  PAGE_LIMIT_ERROR: -10,
  TITLE_COMPLETE_ERROR: -11,
  READ_TMP_FILE_ERROR: -12,
  OCR_PAGE_LIMIT_ERROR: -13,
  PACKAGE_NOT_ENOUGH: -25,
};

export const DOC_STATUS_MESSAGE = {
  [DOC_ERROR_STATUS.TEXT_PARSE_ERROR]: 'Text embedding failed.',
  [DOC_ERROR_STATUS.ELEMENT_PARED_ERROR]: 'Element embedding failed.',
  [DOC_ERROR_STATUS.EXCEED_SIZE_ERROR]: 'File size limit exceeded.',
  [DOC_ERROR_STATUS.EXCEED_TOKENS_ERROR]: (tokens) =>
    `The content of a single page in a document must not exceed ${tokens} tokens.`,
  [DOC_ERROR_STATUS.PAGE_LIMIT_ERROR]: 'Page limit exceeded.',
  [DOC_ERROR_STATUS.TITLE_COMPLETE_ERROR]:
    'ChatGPT failed to generate a title by summarizing the article.',
  [DOC_ERROR_STATUS.READ_TMP_FILE_ERROR]: 'Temporary file reading error.',
  [DOC_ERROR_STATUS.OCR_PAGE_LIMIT_ERROR]: 'OCR page limit exceeded.',
  [DOC_ERROR_STATUS.PACKAGE_NOT_ENOUGH]:
    'Your documents tokens balance is insufficient. Please recharge your account and try again',
  [DOC_ERROR_STATUS.PAGE_PACKAGE_NOT_ENOUGH]:
    'Your pdf pages package balance is insufficient. Please recharge your account and try again',
};

export const DOC_STATUS_SHORT_MESSAGE = {
  [DOC_ERROR_STATUS.TEXT_PARSE_ERROR]: 'Text embedding failed',
  [DOC_ERROR_STATUS.ELEMENT_PARED_ERROR]: 'Element embedding failed',
  [DOC_ERROR_STATUS.EXCEED_TOKENS_ERROR]: 'Token limit exceeded',
  [DOC_ERROR_STATUS.READ_TMP_FILE_ERROR]: 'Temporary file reading error',
  [DOC_ERROR_STATUS.PACKAGE_NOT_ENOUGH]: 'Tokens balance is insufficient.',
  [DOC_ERROR_STATUS.PAGE_PACKAGE_NOT_ENOUGH]:
    'Pages package balance is insufficient.',
};

export const FILE_STATUS = {
  PARSED: '300',
};

export const FILE_LIMIT = {
  MAX_SIZE: 36, // MB
  MAX_PAGES: 10,
  COLLECTION_FILES_LIMIT: 30,
};

export const PACKAGE_TYPES = [
  {
    value: 'elite',
    name: 'Elite',
  },
  {
    value: 'basic',
    name: 'Basic',
  },
  {
    value: 'lite',
    name: 'Lite',
  },
];

export const OCR_TYPES = [
  {
    value: 'disable',
    name: 'Disable OCR',
  },
  {
    value: 'auto',
    name: 'Auto OCR',
  },
  {
    value: 'force',
    name: 'Force OCR',
  },
];
export const PACKAGE_ACCEPTS = ['.pdf', '.html', '.epub', '.txt', '.md'];

export const PDF_EXT_REG = /\.(pdf)$/i;

export const isBaidu = import.meta.env.VITE_IS_BAIDU === 'true';

export const isGLM = import.meta.env.VITE_IS_GLM === 'true';

export const AI_MODEL = {
  GPT3_5: 'gpt-3.5-turbo',
  GPT4: 'gpt-4',
};
