import { loadDoc, DocManager } from './pdfium';
import { FILE_LIMIT, PACKAGE_ACCEPTS } from '../utils/constants.js';

export const validateFileType = (file) => {
  const ext = file.name.split('.').at(-1).toLowerCase();
  return PACKAGE_ACCEPTS.includes(`.${ext}`);
};
export const isNeedToValideSize = (file) => {
  const ext = file.name.split('.').at(-1).toLowerCase();
  return ext === 'pdf';
};

export const validateFileSize = async (file) => {
  try {
    if (!file) {
      throw new Error();
    }

    // 检查文件大小
    if (file.size / 1024000 > FILE_LIMIT.MAX_SIZE) {
      throw new Error(
        `Your file is larger than (${FILE_LIMIT.MAX_SIZE}MB) so we can't deal with it.`,
      );
    }
    const buf = await file.arrayBuffer();
    const docData = new Uint8Array(buf);
    let pdfiumDoc = await loadDoc(docData);
    if (pdfiumDoc.lastError.includes('password')) {
      throw new Error(
        "Your file is protected by a password so we can't open it.",
      );
    }
    if (pdfiumDoc.lastError !== 'success') {
      throw new Error('Sorry, but your document seems to be malformed.');
    }
    const count = await pdfiumDoc.executeCommand({
      name: 'getPageCount',
      args: [],
    });
    if (count === 0) {
      throw new Error('Your file has no pages.');
    }
    if (count > FILE_LIMIT.MAX_PAGES) {
      throw new Error(
        `Your pdf file has too many pages (${count}) which is larger than our limit (${FILE_LIMIT.MAX_PAGES}).`,
      );
    }
  } finally {
    DocManager?.destroy();
  }
};
