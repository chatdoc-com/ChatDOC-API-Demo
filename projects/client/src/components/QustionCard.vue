<template>
  <div class="question">
    <div class="flex-fixed-size">
      <svg-icon class="user" name="mobile-user" :size="28" margin="0 0" />
    </div>
    <div class="right">
      <div class="message">
        <div v-if="question.materialData" class="question-material">
          <div
            class="content"
            v-html="getHtmlByMd(question.materialData.material)" />
        </div>
        <div class="question-input-content">
          {{ question.content }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import SvgIcon from './SvgIcon.vue';
import { getHtmlByMd } from '../utils/md.js';
defineProps({
  question: {
    type: Object,
    required: true,
  },
});
</script>
<style scoped lang="scss">
.question {
  display: flex;
  justify-content: space-between;
  padding: 20px 18px;
  column-gap: 15px;

  .avater {
    width: 28px;
    height: 28px;
  }

  .right {
    flex: 1;
    overflow: auto;
  }

  .question-material {
    font-size: 14px;
  }

  .question-input-content {
    font-weight: bold;
    font-size: 14px;
  }
}
</style>
