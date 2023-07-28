<template>
  <div
    class="answer"
    :class="{
      error: answer.error,
      'el-icon-warning': answer.error,
    }"
    @click="chatItemClicked($event)">
    <div>
      <img
        crossorigin="anonymous"
        class="icon-chatdoc"
        src="../assets/chatdoc.png"
        alt="" />
    </div>
    <div class="right">
      <div
        class="message"
        v-html="getHtmlByMd(answer.content, true, answer.loading)"></div>
      <div class="right-bottom">
        <div v-if="answer.sources?.length" class="pages-wrap">
          <div class="answer-source">
            <span class="answer-source-label">
              <svg-icon name="pages" :size="24" />
            </span>
            <div class="answer-source-items">
              <span
                v-for="source in answer.sources"
                :key="source.page"
                class="answer-source-item"
                @click.stop="sourceItemClicked(source)">
                <span class="page">{{ source.page + 1 }}</span>
              </span>
            </div>
          </div>
        </div>
        <slot> </slot>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineEmits } from 'vue';
import SvgIcon from './SvgIcon.vue';
import { convertSourceInfoItem } from '../utils/util.js';
import { getHtmlByMd } from '../utils/md.js';

const props = defineProps({
  answer: {
    type: Object,
    required: true,
  },
});
const emits = defineEmits(['sourceItemClicked', 'chatItemClickedOnSource']);
const sourceItemClicked = (source) => {
  emits('sourceItemClicked', source);
};

const chatItemClicked = (event) => {
  if (props.answer.loading) {
    return;
  }
  if (event.target.tagName === 'SPAN') {
    const index = Number(event.target.dataset.index);
    if (!Number.isNaN(index)) {
      const source = props.answer.originalSources[index];
      if (!source) {
        return;
      }
      const itemsWithPage = convertSourceInfoItem(source);

      if (source && itemsWithPage.length) {
        emits('chatItemClickedOnSource', itemsWithPage);
        return;
      }
    }
  }
};
</script>
<style scoped lang="scss">
.answer {
  display: flex;
  justify-content: space-between;
  padding: 20px 18px;
  column-gap: 15px;
  background-color: #fbfbfb;

  :is(span[data-index]) {
    padding: 0 2px;
    color: var(--el-color-primary);
    font-weight: 600;
    cursor: pointer;
  }

  &.error {
    position: relative;

    .message {
      color: red;

      p {
        margin-top: 0;
        white-space: pre-line;
      }
    }

    &::before {
      position: absolute;
      bottom: 28px;
      left: 48px;
      color: red;
    }
  }

  .icon-chatdoc {
    width: 28px;
    height: 28px;
  }

  .right {
    position: relative;
    flex: 1;

    .message {
      margin-top: -1em;
      font-size: var(--chat-view-font-size, 14px);
    }

    .quote {
      text-align: right;
    }
  }

  .avater {
    width: 28px;
    height: 28px;
  }

  .right-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 30px;
    margin-top: 10px;

    .pages-wrap {
      position: relative;
      padding-right: 10px;

      .invisible-pages-ellipsis {
        position: absolute;
        right: -4px;
        bottom: 7px;
        font-weight: bold;
        font-size: 14px;
        line-height: 16px;
        border-bottom: 1px solid #000;
      }

      :is(.invisible-pages-popover) {
        display: flex;
        flex-wrap: wrap;
        width: max-content !important;
        min-width: 50px;
        max-width: 300px;
      }
    }

    .answer-source {
      display: flex;

      .answer-source-label {
        padding: 2px 0;
        color: var(--el-text-color-shallow);
        font-weight: bold;
        font-size: 16px;
      }

      .answer-source-items {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        height: 30px;
        overflow: hidden;

        .answer-source-item {
          padding: 5px 8px;
          color: var(--el-text-color-primary);
          font-size: 14px;
          line-height: 20px;
          text-decoration: underline;
          cursor: pointer;
          transition: color 0.2s, transform 0.2s;
          text-underline-offset: 3px;

          &:hover {
            color: var(--el-color-primary);
          }

          &.active {
            color: var(--el-color-primary);
            font-weight: bold;
            transform: scale(1.28);
          }

          &.is-deleted {
            color: var(--el-text-color-regular);
            text-decoration: none !important;
          }
        }
      }
    }
  }
}
</style>
