<template>
  <ol v-if="chatListFirstLoaded" class="chat-list" data-test="chat-list">
    <li
      v-for="item of chatList"
      ref="$chatItemRefs"
      :key="item.id"
      class="chat-item"
      data-test="chat-item"
      :data-id="item.id">
      <qustion-card
        :question="item.question"
        @question-material-clicked="handleQuestionMaterialClicked(item)" />
      <answer-card
        :answer="item.answer"
        :doc-name-dict="docNameDict"
        @chat-item-clicked-on-source="
          (itemsWithPage) =>
            handleClickOnAnswerContent({ itemsWithPage, chatId: item.id })
        "
        @source-item-clicked="handleSourceItemClicked" />
    </li>
  </ol>
</template>

<script setup>
import { ref } from 'vue';
import QustionCard from './QustionCard.vue';
import AnswerCard from './AnswerCard.vue';
import {
  convertMaterialDataToSources,
  convertSourceInfoToSourcesForHTML,
} from '../utils/util.js';

const $chatItemRefs = ref(null);

defineProps({
  chatList: {
    type: Array,
    default: () => [],
  },
  chatListFirstLoaded: {
    type: Boolean,
    default: true,
  },
  docNameDict: {
    type: Object,
    default: () => null,
  },
});

const emits = defineEmits(['sourceItemClicked']);
const handleSourceItemClicked = (source) => {
  emits('sourceItemClicked', { sources: [source] });
};

const handleClickOnAnswerContent = ({ itemsWithPage }) => {
  emits('sourceItemClicked', { sources: itemsWithPage });
};

const handleQuestionMaterialClicked = (data) => {
  const {
    question: { materialData },
  } = data;
  let source = [];
  if (materialData.anchorNode) {
    source = convertSourceInfoToSourcesForHTML([materialData]);
  } else {
    source = [convertMaterialDataToSources(materialData)];
  }
  emits('sourceItemClicked', { sources: source });
};
</script>

<style lang="scss" scoped>
.chat-list {
  flex: 1;
  padding-left: 0;
  list-style-type: none;

  .chat-item {
    border-bottom: 8px solid #e6e6e6;

    &:last-of-type {
      border-bottom: none;

      .answer {
        border-bottom: none;
      }
    }

    .icons-wrap {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      padding: 0 18px 20px;
      background-color: #fbfbfb;
    }
  }

  .chat-item-loading {
    width: 100%;
    height: 50px;

    :deep(.el-loading-mask) {
      background: linear-gradient(0deg, #fbfbfb, #fbfbfb),
        linear-gradient(90deg, #2764ce 0%, #6561e9 100%);
    }
  }

  .message {
    position: relative;
    display: flex;
    flex-direction: column;
    color: var(--el-text-color-primary);
    font-size: 14px;
    line-height: 24px;
    word-break: break-word;
  }

  .question-material {
    position: relative;
    margin-bottom: 5px;
    padding: 12px 0 5px 23px;
    overflow-y: hidden;
    font-size: 14px;
    background-color: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-primary);
    border-radius: 4px;
    transition: background 0.3s;

    .content {
      min-height: calc(var(--vh, 1vh) * 7);
      max-height: calc(var(--vh, 1vh) * 25);
      overflow-y: auto;
    }

    &::after {
      position: absolute;
      top: 16px;
      left: 0;
      color: var(--question-material-quote-color);
      font-size: 40px;
      content: '"';
    }

    &::before {
      position: absolute;
      top: 30px;
      left: 8px;
      width: 3px;
      height: calc(100% - 35px);
      background: var(--question-material-quote-color);
      content: '';
    }
  }
}
</style>
