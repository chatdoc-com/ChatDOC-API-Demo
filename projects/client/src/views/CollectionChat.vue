<template>
  <div class="container">
    <div class="collection-list">
      <p class="name">{{ $collectionName }}</p>
      <website-url-upload
        placement="right"
        :upload-handle="handleWebsiteUpload"
        @uploaded="fetchFileList">
        <template #reference>
          <el-button class="chat-website-btn"> Chat with website </el-button>
        </template>
      </website-url-upload>

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
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { fetchFileInfo, getRecommendedPrompts } from '../apis/api.js';
import ChatView from '../components/ChatView.vue';
import { FILE_STATUS, FILE_LIMIT } from '../utils/constants.js';
import { useSdk } from '../hooks/useSdk';
import DocListItem from '../components/DocListItem.vue';
import EmptyView from '../components/EmptyView.vue';
import WebsiteUrlUpload from '../components/WebsiteUrlUpload.vue';
import { uploadWebsite } from '../apis/api.js';
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
const { $materialData, openFile, drawSources } = useSdk($pdfDom);
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
let intervalId = null;

const onSourceItemClicked = async ({ sources }) => {
  const docId = sources[0].docId;

  if (docId !== $docId.value) {
    changeFile(docId);
    drawSources(sources, true);
    return;
  }
  drawSources(sources);
};

const changeFile = async (docId) => {
  $docId.value = docId;
};

const pollingFetchFileList = async () => {
  let hasProcessing = $fileList.value.find(
    (file) => file.status > 0 && file.status < FILE_STATUS.PARSED,
  );
  if (hasProcessing) {
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(async () => {
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

const handleWebsiteUpload = (url) => {
  const successedFiles = $fileList.value.filter((file) => file.status >= 0);
  if (successedFiles.length >= FILE_LIMIT.COLLECTION_FILES_LIMIT) {
    throw new Error("There aren't enough files slots left in the collection");
  }
  return uploadWebsite(url, $collectionId.value);
};

const fetchFileList = async () => {
  try {
    const resp = await fetchFileInfo($collectionId.value);
    $fileList.value = resp.documents;
    $collectionName.value = resp.name;
    $docId.value = $fileList.value.length > 0 && $fileList.value[0].id;
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
};

onMounted(async () => {
  fetchFileList();
});

watch($fileInfo, () => {
  if ($fileInfo.value.status >= FILE_STATUS.PARSED) {
    openFile($fileInfo.value);
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
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 250px;
  overflow: hidden;
  border-right: 1px solid #8080803d;

  .name {
    display: flex;
    align-items: flex-start;
    box-sizing: border-box;
    width: 100%;
    margin: 0;
    padding: 18px 10px;
    font-weight: 500;
    line-height: 100%;
    background-color: rgb(249, 249, 249);
    border-bottom: 1px solid rgb(214 216 222);
  }

  .list-container {
    width: 250px;
    padding: 0 10px;
    overflow-y: auto;
    background-color: #f9f9f9;
  }

  .chat-website-btn {
    width: 250px;
    padding: 25px 10px;
    color: #5a6bd6;
    font-weight: 500;
    font-size: 16px;
    background-color: #eeeffa;
    border: none;
    border-bottom: 1px solid rgb(214 216 222);
    border-radius: 0;

    &:hover {
      background-color: #e6e7f6;
    }
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
