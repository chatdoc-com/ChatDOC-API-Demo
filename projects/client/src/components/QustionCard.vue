<template>
  <div class="question">
    <div class="flex-fixed-size">
      <svg-icon class="user" name="mobile-user" :size="28" margin="0 0" />
    </div>
    <div class="right">
      <div class="message">
        <div
          v-if="question.materialData"
          class="markdown-body question-material"
          @click="questionMaterialClicked"
          v-html="
            $isHTMLMaterial
              ? question.materialData.material
              : getHtmlByMd(question.materialData.material)
          " />
        <div class="question-input-content">
          {{ question.content }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue';
import SvgIcon from './SvgIcon.vue';
import { getHtmlByMd } from '../utils/md.js';
const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
});
const emits = defineEmits(['questionMaterialClicked']);
const $isHTMLMaterial = computed(() => {
  return !!props.question.materialData.anchorNode;
});
const questionMaterialClicked = () => {
  emits('questionMaterialClicked');
};
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
    position: relative;
    margin-bottom: 5px;
    padding: 5px 5px 5px 23px;
    font-size: 14px;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;

    :deep() {
      :is(li, p, table, h1, h2, h3, h4, h5) {
        margin: 10px 0 0;

        &:first-child {
          margin-top: 0;
        }
      }

      table {
        display: block;
        width: 100%;
        max-width: 100%;
        overflow: auto;
        border: 1px solid var(--el-border-color-primary) !important;
        border-collapse: collapse;
        border-spacing: 0;

        :is(td, th) {
          padding: 6px !important;
          text-align: left;
          border: 1px solid var(--el-border-color-primary) !important;
        }

        tr {
          word-break: keep-all;
        }
      }

      pre {
        white-space: pre-wrap;
      }
    }

    &::after {
      position: absolute;
      top: 0;
      left: 0;
      color: rgba(158, 160, 165, 40%);
      font-size: 40px;
      content: '"';
    }

    &::before {
      position: absolute;
      top: 30px;
      left: 8px;
      width: 3px;
      height: calc(100% - 35px);
      background: rgba(158, 160, 165, 40%);
      content: '';
    }

    :deep(blockquote) {
      margin-inline: 1em;
    }
  }

  .question-input-content {
    font-weight: bold;
    font-size: 14px;
  }
}
</style>
