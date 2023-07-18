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
        @source-item-clicked="onSourceItemClicked" />
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
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
const { $materialData, initSDK, setFileUrl } = useSdk($pdfDom, $docId);
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
  const docId = sources[0].docId;
  if (docId !== $docId.value) {
    setFileUrl(sdk, docId);
    await sdk.ready();
  }

  sources.slice().forEach((source) => {
    const { page, rects } = source;
    // const spreadSource
    results.push({
      pageNumber: page + 1,
      rects,
    });
  });

  sdk.drawSources(results);
};

const changeFile = (docId) => {
  $docId.value = docId;
  setFileUrl(sdk, docId);
  // getFileInfo()
};

onMounted(async () => {
  try {
    const resp = await fetchFileInfo($collectionId.value);
    $fileList.value = resp.documents;
    $collectionName.value = resp.name;
    $docId.value = $fileList.value.length > 0 && $fileList.value[0].id;
    sdk = initSDK();
    await getFileInfo();
  } catch (error) {
    ElMessage({
      message: error.message,
      type: 'error',
    });
  }
});
</script>
<style scoped>
.container {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.collection-list {
  width: 230px;
  overflow: hidden;
  .name {
    height: 40px;
    background-color: rgb(249, 249, 249);
    line-height: 100%;
    margin: 0;
    padding-left: 10px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgb(231, 234, 241);
    font-weight: 500;
  }
  .list-container {
    height: calc(100% - 40px);
    overflow-y: auto;
    padding: 0 10px;
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
