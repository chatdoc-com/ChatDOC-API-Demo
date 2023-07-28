<template>
  <div class="container">
    <div ref="$pdfDom" class="pdf-container"></div>
    <div class="chat-container">
      <chat-view
        v-if="$fileInfo"
        :disabled="!$fileParsed"
        :file-info="$fileInfo"
        :material-data="$materialData"
        :upload-id="$docId"
        @source-item-clicked="onSourceItemClicked" />
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { fetchFileInfo } from '../apis/api.js';
import ChatView from '../components/ChatView.vue';
import { FILE_STATUS } from '../constant.js';
import { useSdk } from '../hooks/useSdk';
const route = useRoute();
const $pdfDom = ref(null);
const $docId = computed(() => {
  return route.params.id;
});

const { $materialData, initSDK } = useSdk($pdfDom, $docId);
let sdk = null;

const $fileInfo = ref(null);
const $fileParsed = computed(() => {
  return $fileInfo.value && $fileInfo.value.status >= FILE_STATUS.PARSED;
});
let timeout = null;

const getFileInfo = async () => {
  const data = await fetchFileInfo($docId.value);
  $fileInfo.value = data;

  if (!$fileParsed.value) {
    timeout = setTimeout(() => {
      getFileInfo();
    }, 10000);
  } else {
    clearTimeout(timeout);
    timeout = null;
  }
};

const onSourceItemClicked = ({ sources }) => {
  const results = [];
  sources.slice().forEach((source) => {
    const { page, rects, spreads = [] } = source;
    results.push({
      pageNumber: page + 1,
      rects,
    });
    spreads.forEach((spread) => {
      results.push({
        pageNumber: spread.page + 1,
        rects: spread.rects,
      });
    });
  });
  sdk.drawSources(results);
};

onMounted(async () => {
  getFileInfo();
  sdk = initSDK();
});

onBeforeUnmount(() => {
  sdk.destroy();
  clearTimeout(timeout);
  timeout = null;
});
</script>
<style scoped>
.container {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.pdf-container {
  flex: 1;
  overflow: hidden;
}

.chat-container {
  flex: 1;
  overflow: hidden;
}
</style>
