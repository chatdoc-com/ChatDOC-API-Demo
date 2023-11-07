export const convertSourceInfoItemForHTML = (sourceInfoItem) => {
  if ('anchorNode' in sourceInfoItem) {
    let { indexes = [] } = sourceInfoItem;
    if (indexes.length === 0) {
      indexes = [0];
    }
    return indexes.map((index) => {
      return {
        page: index,
        docId: sourceInfoItem.upload_id,
        rects: [
          sourceInfoItem.anchorNode,
          sourceInfoItem.focusNode,
          Number(sourceInfoItem.anchorOffset),
          Number(sourceInfoItem.focusOffset),
        ],
      };
    });
  }
  let rectObjByPageKey = {};
  if ('rects' in sourceInfoItem) {
    // collection
    rectObjByPageKey = sourceInfoItem.rects;
  } else {
    rectObjByPageKey = sourceInfoItem;
  }
  const pages = Object.keys(rectObjByPageKey).map((pageKey) => Number(pageKey));
  return pages.map((page) => {
    return {
      page,
      docId: sourceInfoItem.upload_id,
      rects: [...rectObjByPageKey[page]],
    };
  });
};

/**
 * Converts the source info item to a compatible format for both single document and collections source info.
 *
 * @param {Object} sourceInfoItem - The source info item to be converted.
 * @param {string} sourceInfoItem.upload_id - The ID of the uploaded document.
 * @param {Object} sourceInfoItem.rects - The rectangles information of the source info item.
 * @return {Array} The converted source info item in a compatible format.
 */
export const convertSourceInfoItem = (sourceInfoItem) => {
  // PDF
  let rectObjByPageKey = {};
  if ('rects' in sourceInfoItem) {
    // collection
    rectObjByPageKey = sourceInfoItem.rects;
  } else {
    // 单文档
    rectObjByPageKey = sourceInfoItem;
  }
  const pages = Object.keys(rectObjByPageKey).map((pageKey) => Number(pageKey));
  return pages.map((page) => {
    return {
      // 非PDF文档中，page实为元素块的index
      page,
      docId: sourceInfoItem.upload_id,
      rects: [...rectObjByPageKey[page]],
    };
  });
};

export const convertSourceInfoToSourcesForHTML = (sourceInfo, docId) => {
  const sources = [];
  sourceInfo.forEach((item) => {
    if (!Object.keys(item).length) {
      console.warn('the source info is empty.');
      return;
    }
    const itemsWithPage = convertSourceInfoItemForHTML(item);
    itemsWithPage.forEach(({ page, docId: _docId, rects }) => {
      sources.push({
        page,
        docId: _docId || docId,
        rects: [...rects],
      });
    });
  });
  return sources;
};

/**
 * @typedef SourceInfoItem {Object}
 * @property rects {Object}
 * @property upload_id {string}
 */

/**
 * @typedef SourcesItem {Object}
 * @property docId {string}
 * @property page {number}
 * @property rects {number[][]}
 * @property spreads {Object[]}
 */

/**
 * Translate the sourceInfo data returned by the API
 * @param sourceInfo {SourceInfoItem[]}
 * @returns {SourcesItem[]}
 */
export const convertSourceInfoToSources = (sourceInfo) => {
  const sources = [];
  sourceInfo.forEach((item) => {
    if (!Object.keys(item).length) {
      console.warn('the source info is empty.');
      return;
    }
    const itemsWithPage = convertSourceInfoItem(item);
    let formattedItem = {};
    itemsWithPage.forEach(({ page, docId, rects }, index) => {
      const mainSourcePageInfoIndex = 0;
      const isCurrentMainSourcePage = index === mainSourcePageInfoIndex;
      const itemInfo = {
        page,
        docId,
        rects: [...rects],
      };
      if (isCurrentMainSourcePage) {
        formattedItem = {
          ...itemInfo,
          spreads: [],
        };
        return;
      }
      formattedItem.spreads.push(itemInfo);
    });
    const existedSourceItem = sources.find((source) => {
      const isSamePage = source.page === formattedItem.page;
      const isSameDocId = source.docId === formattedItem.docId;
      return formattedItem.docId ? isSamePage && isSameDocId : isSamePage;
    });
    if (existedSourceItem) {
      existedSourceItem.rects = [
        ...existedSourceItem.rects,
        ...formattedItem.rects,
      ];
      existedSourceItem.spreads = [
        ...existedSourceItem.spreads,
        ...formattedItem.spreads,
      ];
      return;
    }
    sources.push(formattedItem);
  });
  return sources;
};

/**
 * @typedef materialData {Object}
 * @property material {string}
 * @property rect {Object[]}
 * @property upload_id {string}
 * @property spreads {Object[]}
 */

/**
 * Translate the sourceInfo data returned by the API
 * @param materialData {materialData}
 * @returns {SourcesItem}
 */
export const convertMaterialDataToSources = (materialData) => {
  const { rects, upload_id: docId } = materialData;
  const pages = rects.map((rect) => {
    return rect.pageNumber - 1;
  });
  const source = {
    docId,
    page: pages[0],
    rects: rects
      .filter((rect) => {
        return rect.pageNumber - 1 === pages[0];
      })
      .map((rect) => {
        return rect.outline;
      }),
    spreads: pages.slice(1).map((page) => {
      return {
        page,
        rects: rects
          .filter((rect) => {
            return rect.pageNumber - 1 === page;
          })
          .map((rect) => {
            return rect.outline;
          }),
      };
    }),
  };
  return source;
};

export function getTextWidth(text, font) {
  const canvas =
    getTextWidth.canvas ||
    (getTextWidth.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}

export function isPdfFile(file) {
  return file.name.split('.').at(-1).toLowerCase() === 'pdf';
}
