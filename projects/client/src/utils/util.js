export const convertSourceInfoItem = (sourceInfoItem) => {
  const { upload_id, rects } = sourceInfoItem;
  const rectObjByPageKey = rects || sourceInfoItem;
  const pages = Object.keys(rectObjByPageKey).map((pageKey) => Number(pageKey));

  return pages.map((page) => {
    return {
      page,
      docId: upload_id,
      rects: [...rectObjByPageKey[page]],
    };
  });
};

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

export const convertReceivedMaterialToSourceInfo = (rectsData) => {
  const requestSourceInfo = [];
  const rects = rectsData;
  rects.forEach((rectInfo) => {
    const { pageNumber, outline, docId } = rectInfo;
    requestSourceInfo.push({
      upload_id: docId,
      rects: {
        [pageNumber - 1]: [outline],
      },
    });
  });
  return requestSourceInfo;
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

export function getSelectedMaterial(materialData, docId) {
  if (!materialData) {
    return null;
  }
  const rects = [];
  materialData.rects.forEach((rectInfo) => {
    const { pageNumber, outline } = rectInfo;
    rects.push({
      upload_id: docId,
      rects: {
        [pageNumber - 1]: [outline],
      },
    });
  });

  return {
    selected_text: materialData.material,
    selected_source: rects,
  };
}
