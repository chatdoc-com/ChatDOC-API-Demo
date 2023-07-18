<template>
  <ol v-if="chatListFirstLoaded" class="chat-list">
    <li
      v-for="item of chatList"
      ref="$chatItemRefs"
      :key="item.id"
      class="chat-item"
      :data-id="item.id">
      <qustion-card :question="item.question" />
      <answer-card
        :answer="item.answer"
        @chat-item-clicked-on-source="
          (itemsWithPage) =>
            handleClickOnAnswerContent({ itemsWithPage, chatId: item.id })
        "
        @source-item-clicked="
          ({ page }) => handleSourceItemClicked({ page, chatId: item.id })
        " />
    </li>
  </ol>
</template>

<script setup>
import { ref } from 'vue';
import QustionCard from './QustionCard.vue';
import AnswerCard from './AnswerCard.vue';

const $chatItemRefs = ref(null);

const props = defineProps({
  fileInfo: {
    type: Object,
    required: true,
  },
  chatList: {
    type: Array,
    default: () => [],
  },
  chatListFirstLoaded: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits(['sourceItemClicked']);
const handleSourceItemClicked = ({ page, chatId }) => {
  const chatItem = props.chatList.find((item) => item.id === chatId);
  if (chatItem) {
    const sourceItem = chatItem.answer.sources.find(
      (item) => item.page === page,
    );
    emits('sourceItemClicked', { sources: [sourceItem] });
  }
};

const handleClickOnAnswerContent = ({ itemsWithPage }) => {
  emits('sourceItemClicked', { sources: itemsWithPage });
};
</script>

<style lang="scss" scoped>
.chat-list {
  flex: 1;

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
    font-size: var(--chat-view-font-size, 14px);
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

  .question-input-content {
    font-weight: bold;
    font-size: var(--chat-view-font-size, 14px);
  }

  .question-bottom-wrap {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;

    .question-bottom-create-at {
      padding: 6px 0;
      color: var(--el-text-color-secondary);
      line-height: 12px;
    }
  }

  .handlers-wrap {
    display: flex;
    align-items: center;
    padding: 0 0 0 15px;
    column-gap: 18px;

    svg {
      margin: 0;
      color: var(--el-text-color-shallow);
      transition: color 0.3s;

      &:active {
        color: var(--el-color-primary);
      }
    }
    .thread-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: start;
      column-gap: 2px;
      cursor: pointer;

      &:disabled {
        opacity: 0.5;

        .thread-icon {
          pointer-events: none;
        }
      }

      .quote-number {
        color: var(--el-text-color-shallow);
        transition: color 0.3s;
      }

      &:hover {
        .quote-number {
          color: var(--el-color-primary);
        }
      }
    }
  }
}

.disabled-svg {
  opacity: 0.5;
}
</style>
