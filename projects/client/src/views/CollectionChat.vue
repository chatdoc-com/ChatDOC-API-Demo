<template>
  <div class="container">
    <div class="collection-list">
      <p class="name">{{ $collectionName }}</p>
      <el-scrollbar ref="scrollbarRef" class="list-container" alway>
        <doc-list-item
          v-for="item in $fileList"
          :key="item.id"
          :active="$docId === item.id"
          :doc-info="item"
          @on-clicked="changeFile" />
      </el-scrollbar>
      <div class="list-container"></div>
    </div>
    <div ref="$pdfDom" class="pdf-container"></div>
    <div class="chat-container">
      <chat-view
        v-if="$fileInfo"
        :disabled="!$fileParsed"
        :file-info="$fileInfo"
        :material-data="$materialData"
        :upload-id="$collectionId"
        @source-item-clicked="onSourceItemClicked" />
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { fetchFileInfo } from '../apis/api.js';
import ChatView from '../components/ChatView.vue';
import { FILE_STATUS } from '../constant.js';
import { useSdk } from '../hooks/useSdk';
import DocListItem from '../components/DocListItem.vue';

const route = useRoute();
const $fileList = ref([]);
const $collectionId = computed(() => {
  return route.params.id;
});
const $docId = ref('');
const $pdfDom = ref(null);
const $sources = ref([]);
const { $materialData, initSDK, setFileUrl, EVENT_TYPES } = useSdk(
  $pdfDom,
  $docId,
);
let sdk = null;
const $fileInfo = ref(null);
const $fileParsed = computed(() => {
  return $fileInfo.value && $fileInfo.value.status >= FILE_STATUS.PARSED;
});
const $collectionName = ref('');
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

const onSourceItemClicked = async ({ sources }) => {
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
  const docId = sources[0].docId;

  if (docId !== $docId.value) {
    changeFile(docId);
    $sources.value = results;
    // drawSources on VIEWER_CREATED envent
    return;
  }
  sdk.drawSources(results);
};

const changeFile = (docId) => {
  $docId.value = docId;
  setFileUrl(sdk, docId);
  getFileInfo();
};

onMounted(async () => {
  try {
    const resp = await fetchFileInfo($collectionId.value);
    $fileList.value = resp.documents;
    $collectionName.value = resp.name;
    $docId.value = $fileList.value.length > 0 && $fileList.value[0].id;
    sdk = initSDK();

    sdk.on(EVENT_TYPES.VIEWER_CREATED, () => {
      if ($sources.value.length > 0) {
        sdk.drawSources($sources.value);
        $sources.value = [];
      }
    });
    getFileInfo();
  } catch (error) {
    ElMessage({
      message: error.message,
      type: 'error',
    });
  }
});

onBeforeUnmount(() => {
  clearTimeout(timeout);
  timeout = null;
});
</script>
<style scoped lang="scss">
.container {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.collection-list {
  width: 230px;
  overflow: hidden;

  .name {
    display: flex;
    align-items: center;
    height: 40px;
    margin: 0;
    padding-left: 10px;
    font-weight: 500;
    line-height: 100%;
    background-color: rgb(249, 249, 249);
    border-bottom: 1px solid rgb(231, 234, 241);
  }

  .list-container {
    height: calc(100% - 40px);
    padding: 0 10px;
    overflow-y: auto;
  }
}

.pdf-container {
  flex: 1;
  overflow: hidden;
}

.chat-container {
  width: 35%;
  overflow: hidden;
}
</style>
