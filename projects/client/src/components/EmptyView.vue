<template v-if="fileInfo.status < 0">
  <template v-if="fileInfo.status < 0">
    <div style="margin: 0 0 40px">
      <img crossorigin="anonymous" src="../assets/icons/sad.svg" alt="" />
    </div>
    <div class="status-info tips">
      <div>{{ fileInfo.name }}</div>
      <div v-if="fileInfo.status === DOC_ERROR_STATUS.EXCEED_TOKENS_ERROR">
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
import { DOC_ERROR_STATUS, DOC_STATUS_MESSAGE } from '../utils/constants.js';
import SvgIcon from './SvgIcon.vue';
defineProps({
  fileInfo: {
    type: Object,
    required: true,
  },
});
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
