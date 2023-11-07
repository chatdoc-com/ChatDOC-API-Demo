import { ref, onMounted, toRaw } from 'vue';
import { initSDK, EVENT_TYPES } from '@chatdocai/chatdoc-sdk';
import { getDocumentToken } from '../apis/api.js';
import { PDF_EXT_REG } from '../utils/constants.js';

const host = import.meta.env.VITE_SERVER_HOST || `${window.location.origin}/`;
const pdfViewUrl =
  import.meta.env.VITE_SDK_HOST || `${import.meta.env.API_HOST}/pdf-viewer/`;
export const useSdk = ($pdfDom) => {
  const $materialData = ref();
  const $docId = ref();
  let sdk = null;
  let cachedSources = [];
  const addSdkEventListener = () => {
    sdk.on(EVENT_TYPES.CHAT_ICON_CLICKED, (data) => {
      $materialData.value = {
        ...data,
        upload_id: $docId.value,
      };
    });
    sdk.on(EVENT_TYPES.SELECTION_CHANGED, () => {
      sdk.clearSources();
    });
    sdk.on(EVENT_TYPES.VIEWER_CREATED, () => {
      if (cachedSources.length) {
        sdk.drawSources(cachedSources, true);
        cachedSources = [];
      }
    });
  };

  const getToken = async () => {
    const { token } = await getDocumentToken($docId.value);
    return token;
  };

  onMounted(() => {
    sdk = initSDK({
      el: $pdfDom.value,
      url: pdfViewUrl,
      getToken,
    });
    addSdkEventListener();
  });

  return {
    $materialData,
    EVENT_TYPES,
    sdk,
    openFile(documentInfo) {
      const viewerType = PDF_EXT_REG.test(documentInfo.name) ? 'pdf' : 'html';
      sdk.open({
        url: `${host}api/v1/documents/${documentInfo.id}/download`,
        viewerType,
      });
      $docId.value = documentInfo.id;
    },
    drawSources(sources, needViewCreated) {
      const results = [];
      sources.forEach((source) => {
        const { page, rects, spreads = [] } = source;
        results.push({
          pageNumber: page + 1,
          rects: toRaw(rects),
        });
        spreads.forEach((spread) => {
          results.push({
            pageNumber: spread.page + 1,
            rects: toRaw(spread.rects),
          });
        });
      });
      if (needViewCreated) {
        cachedSources = results;
        return;
      }
      sdk.drawSources(results);
    },
    destroy() {
      sdk.destroy();
    },
  };
};
