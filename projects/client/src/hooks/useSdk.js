import { ref } from 'vue';
import { initSDK, EVENT_TYPES } from '@chatdocai/chatdoc-sdk';
import { getDocumentToken } from '../apis/api.js';
const host = import.meta.env.VITE_SERVER_HOST || `${window.location.origin}/`;
const pdfViewUrl =
  import.meta.env.VITE_SDK_HOST || `${import.meta.env.API_HOST}/pdf-viewer/`;
export const useSdk = ($pdfDom, $docId) => {
  const $materialData = ref();
  const addSdkEventListener = (sdk) => {
    sdk.on(EVENT_TYPES.CHAT_ICON_CLICKED, (data) => {
      $materialData.value = { ...data, upload_id: $docId.value };
    });
    sdk.on(EVENT_TYPES.SELECTION_CHANGED, () => {
      sdk.clearSources();
    });
  };

  const getToken = async () => {
    const { token } = await getDocumentToken($docId.value);
    return token;
  };

  return {
    $materialData,
    EVENT_TYPES,
    initSDK: () => {
      if (!$docId.value) {
        return;
      }

      const sdk = initSDK({
        el: $pdfDom.value,
        url: pdfViewUrl,
        fileUrl: `${host}api/v1/documents/${$docId.value}/download`,
        getToken,
      });
      addSdkEventListener(sdk);
      return sdk;
    },
    setFileUrl: (sdk, id) => {
      sdk.setFileUrl(`${host}api/v1/documents/${id}/download`);
    },
  };
};
