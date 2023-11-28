<template>
  <div
    ref="$answer"
    class="answer"
    :class="{
      error: answer.error,
      'el-icon-warning': answer.error,
    }"
    @click="chatItemClicked($event)">
    <div class="user-chat">
      <img
        crossorigin="anonymous"
        class="icon-chatdoc"
        src="../assets/chatdoc.png"
        alt="" />
      <span
        v-if="answer.modelType === AI_MODEL.GPT4 && !answer.error"
        class="model-name">
        {{ answer.modelType.toUpperCase() }}
      </span>
    </div>
    <div class="right">
      <div
        class="message"
        data-test="answer-message"
        v-html="getHtmlByMd(answer.content, true, answer.loading)"></div>
      <div class="right-bottom">
        <div v-if="answer.sources?.length" class="pages-wrap">
          <div class="answer-source">
            <span class="answer-source-label">
              <svg-icon name="pages" :size="24" color="#6b6c6f" />
            </span>
            <div class="answer-source-items">
              <source-item-btn
                v-for="source in answer.sources"
                :key="source.page"
                :source="source"
                :tooltip="getTooltip(source)"
                @clicked="sourceItemClicked" />
              <el-popover
                v-if="$invisiblePageSourceItems.length"
                placement="bottom"
                popper-class="invisible-pages-popover"
                :teleported="false">
                <template #reference>
                  <span class="invisible-pages-ellipsis" @click.stop>
                    ...
                  </span>
                </template>
                <source-item-btn
                  v-for="source in $invisiblePageSourceItems"
                  :key="`${source.page}-invisible`"
                  :source="source"
                  :tooltip="getTooltip(source)"
                  @clicked="sourceItemClicked" />
              </el-popover>
            </div>
          </div>
        </div>
        <slot> </slot>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineEmits, nextTick, onMounted, ref, watch } from 'vue';
import SvgIcon from './SvgIcon.vue';
import { convertSourceInfoItem } from '../utils/util.js';
import { getHtmlByMd } from '../utils/md.js';
import SourceItemBtn from './SourceItemBtn.vue';
import { AI_MODEL } from '../utils/constants.js';

const props = defineProps({
  answer: {
    type: Object,
    required: true,
  },
  docNameDict: {
    type: Object,
    default: () => null,
  },
});

const $answer = ref(null);
const $invisiblePageSourceItems = ref([]);
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

const getTooltip = (source) => {
  const docName = props.docNameDict?.[source.docId];
  return docName;
};

const setSourcePageInvisibleItemsMap = async () => {
  await nextTick();
  const invisibleItems = props.answer.sources.filter((source, index) => {
    const dom = $answer.value.querySelector(
      `.answer-source-item:nth-of-type(${index + 1})`,
    );
    return dom?.offsetTop > 0;
  });
  $invisiblePageSourceItems.value = invisibleItems;
};
onMounted(() => {
  setSourcePageInvisibleItemsMap();
});
watch(() => props.answer.sources, setSourcePageInvisibleItemsMap, {
  immediate: true,
});
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

  .user-chat {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;

    .model-name {
      margin-top: 5px;
      padding: 4px 6px;
      color: #f2af6d;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      white-space: nowrap;
      background: rgba(242, 175, 109, 10.2%);
      border-radius: 4px;
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
      line-height: 24px;
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
      }
    }
  }
}
</style>
