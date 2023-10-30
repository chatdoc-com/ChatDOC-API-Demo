<template>
  <div class="container">
    <div
      v-show="$fileInfo && $fileInfo.status >= FILE_STATUS.PARSED"
      ref="$pdfDom"
      class="pdf-container"
      data-test="sdk-container"></div>
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
        :upload-id="$docId"
        :suggested-questions="$suggestedQuestions"
        @source-item-clicked="onSourceItemClicked" />
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { fetchFileInfo, getRecommendedPrompts } from '../apis/api.js';
import ChatView from '../components/ChatView.vue';
import EmptyView from '../components/EmptyView.vue';
import { FILE_STATUS } from '../utils/constants.js';
import { useSdk } from '../hooks/useSdk';
const route = useRoute();
const $pdfDom = ref(null);
const $docId = computed(() => {
  return route.params.id;
});

const { $materialData, openFile, drawSources, destroy } = useSdk($pdfDom);

const $fileInfo = ref(null);
const $fileParsed = computed(() => {
  return $fileInfo.value && $fileInfo.value.status >= FILE_STATUS.PARSED;
});
const $suggestedQuestions = ref([]);
let timeout = null;

const getFileInfo = async () => {
  const data = await fetchFileInfo($docId.value);
  $fileInfo.value = data;

  if (!$fileParsed.value && data.status > 0) {
    timeout = setTimeout(() => {
      getFileInfo();
    }, 10000);
  } else {
    clearTimeout(timeout);
    timeout = null;
    $suggestedQuestions.value = await getRecommendedPrompts($docId.value);
  }
};

const onSourceItemClicked = ({ sources }) => {
  drawSources(sources);
};

onMounted(async () => {
  getFileInfo();
});

watch($fileInfo, () => {
  if ($fileInfo.value.status >= FILE_STATUS.PARSED) {
    openFile($fileInfo.value);
  }
});

onBeforeUnmount(() => {
  destroy();
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
</style>
