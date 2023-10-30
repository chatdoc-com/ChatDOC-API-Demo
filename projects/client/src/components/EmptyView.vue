<template v-if="fileInfo.status < 0">
  <template v-if="fileInfo.status < 0">
    <div style="margin: 0 0 40px">
      <img crossorigin="anonymous" src="../assets/icons/sad.svg" alt="" />
    </div>
    <div class="status-info tips">
      <div>{{ fileInfo.name }}</div>
      <div v-if="fileInfo.status === DOC_ERROR_STATUS.EXCEED_TOKENS_ERROR">
        {{
          $isPDF
            ? 'The content of a single page in a document must not exceed 14,000 tokens.'
            : 'The content of the markdown, epub, txt, and website must not exceed 300,000 tokens.'
        }}
      </div>
      <div v-else-if="fileInfo.status === DOC_ERROR_STATUS.PACKAGE_NOT_ENOUGH">
        {{ DOC_STATUS_MESSAGE[fileInfo.status] }}
      </div>
      <div
        v-else-if="
          fileInfo.status === DOC_ERROR_STATUS.PAGE_PACKAGE_NOT_ENOUGH
        ">
        {{ DOC_STATUS_MESSAGE[fileInfo.status] }}
      </div>
      <div v-else>File processing failed, please try again later.</div>
    </div>
  </template>
  <template v-else>
    <p>
      <svg-icon name="wait-analysis" :size="130" />
    </p>
    <p class="tips">
      Processing the document, please wait
      <span class="dot-loading" />
    </p>
  </template>
</template>

<script setup>
import { toRef } from 'vue';
import { DOC_ERROR_STATUS, DOC_STATUS_MESSAGE } from '../utils/constants.js';
import { useFileType } from '../hooks/useFileType';
import SvgIcon from './SvgIcon.vue';
const props = defineProps({
  fileInfo: {
    type: Object,
    required: true,
  },
});
const { $isPDF } = useFileType(toRef(props, 'fileInfo'));
</script>
<style scoped>
.status-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tips {
  color: rgb(154, 162, 178);
  font-weight: 500;
  font-size: 16px;
  line-height: 22px;
}
</style>
