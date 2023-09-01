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
    <div
      v-show="$fileInfo && $fileInfo.status >= FILE_STATUS.PARSED"
      ref="$pdfDom"
      class="pdf-container"></div>
    <div
      v-if="$fileInfo && $fileInfo.status < FILE_STATUS.PARSED"
      class="empty-container">
      <empty-view :file-info="$fileInfo" />
    </div>
    <div class="chat-container">
      <chat-view
        v-if="$fileInfo"
        :disabled="!$fileParsed"
        :file-info="$fileInfo"
        :material-data="$materialData"
        :upload-id="$collectionId"
        :doc-name-dict="$collectionDocNameDict"
        :suggested-questions="$suggestedQuestions"
        @source-item-clicked="onSourceItemClicked" />
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { fetchFileInfo, getRecommendedPrompts } from '../apis/api.js';
import ChatView from '../components/ChatView.vue';
import { FILE_STATUS } from '../utils/constants.js';
import { useSdk } from '../hooks/useSdk';
import DocListItem from '../components/DocListItem.vue';
import EmptyView from '../components/EmptyView.vue';

const route = useRoute();
const $fileList = ref([]);
const $collectionId = computed(() => {
  return route.params.id;
});
const $collectionDocNameDict = computed(() => {
  return $fileList.value.reduce((res, cur) => {
    res[cur.id] = cur.name;
    return res;
  }, {});
});
const $docId = ref('');
const $pdfDom = ref(null);
const $sources = ref([]);
const { $materialData, initSDK, setFileUrl, EVENT_TYPES } = useSdk(
  $pdfDom,
  $docId,
);
let sdk = null;
const $fileInfo = computed(() => {
  return $fileList.value.find((file) => file.id === $docId.value);
});
const $fileParsed = computed(() => {
  const hasPassed = $fileList.value.find(
    (file) => file.status >= FILE_STATUS.PARSED,
  );
  const hasPassing = $fileList.value.find(
    (file) => file.status > 0 && file.status < FILE_STATUS.PARSED,
  );
  return hasPassed && !hasPassing;
});
const $suggestedQuestions = ref([]);
const $collectionName = ref('');

const onSourceItemClicked = async ({ sources }) => {
  const results = [];

  sources.forEach((source) => {
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

const changeFile = async (docId) => {
  $docId.value = docId;
  setFileUrl(sdk, docId);
};

const pollingFetchFileList = async () => {
  let hasProcessing = $fileList.value.find(
    (file) => file.status > 0 && file.status < FILE_STATUS.PARSED,
  );
  if (hasProcessing) {
    const intervalId = setInterval(async () => {
      const resp = await fetchFileInfo($collectionId.value);
      $fileList.value = resp.documents;
      hasProcessing = $fileList.value.find(
        (file) => file.status > 0 && file.status < FILE_STATUS.PARSED,
      );
      if (!hasProcessing) {
        clearInterval(intervalId);
        $suggestedQuestions.value = await getRecommendedPrompts(
          $collectionId.value,
        );
      }
    }, 10000);
  }
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
    pollingFetchFileList();
    $suggestedQuestions.value = await getRecommendedPrompts(
      $collectionId.value,
    );
  } catch (error) {
    ElMessage({
      message: error.message,
      type: 'error',
    });
  }
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
  width: 250px;
  overflow: hidden;
  border-right: 1px solid #8080803d;

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

.empty-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  overflow: hidden;
  background-color: #f5f5f5;
}

.chat-container {
  width: 35%;
  overflow: hidden;
}
</style>
