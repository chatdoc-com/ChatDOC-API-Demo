<template>
  <div class="chat-footer">
    <div class="footer-container">
      <div class="footer-bar-wrapper">
        <div
          v-show="showRecommendList && !disabled"
          class="frequently-used ignore-border-top">
          <div class="tips">
            <svg-icon class="icon-bulb" name="bulb" />
            <span class="question-list-label">
              Ask me anything about the document, or just click one of the
              options below:
            </span>
          </div>
          <ul class="question-list">
            <li
              v-for="(text, i) of questionList"
              :key="i"
              @click="selectQuestion(text)">
              <p class="question">{{ text }}</p>
              <div class="icon">→</div>
            </li>
          </ul>
        </div>
        <div v-if="materialData" class="material-bar">
          <div
            class="material-content markdown-body"
            data-test="material-content">
            <el-scrollbar max-height="20vh" class="content" always>
              <div
                v-html="
                  $isHTMLMaterial
                    ? materialData.material
                    : getHtmlByMd(materialData.material)
                " />
            </el-scrollbar>
            <el-icon
              class="material-cancel-handler"
              @click="handleCancelMaterial">
              <circle-close-filled />
            </el-icon>
          </div>
        </div>
        <div class="bottom-bar" :class="{ 'multi-row': $multiRow }">
          <div
            ref="$questionContainer"
            class="question-container"
            :class="{ 'show-material': materialData }">
            <div
              ref="$inputBar"
              class="input-bar"
              :class="{ disabled: disabled }">
              <el-input
                ref="$inputRef"
                data-test="question-container-input"
                :model-value="currentQuestion"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 5 }"
                :placeholder="placeholder"
                :disabled="disabled"
                @keypress.enter="submitQuestion"
                @input="onInput" />
              <div ref="$inputHandler" class="input-handler">
                <button
                  class="input-handler-icon"
                  :disabled="disabled"
                  @click="toggleRecommendList">
                  <svg-icon
                    name="bulb"
                    class="recommend-question-icon"
                    :size="24"
                    :class="{
                      disabled: disabled,
                      active: showRecommendList && !disabled,
                    }" />
                </button>
                <button
                  class="input-handler-icon"
                  data-test="submit-question-button"
                  :disabled="disabled"
                  @click="submitQuestion">
                  <svg-icon
                    name="chat-send"
                    class="submit-question-icon"
                    :class="{ disabled: disabled }"
                    :size="24" />
                </button>
              </div>
            </div>
            <div class="actions">
              <span class="label">Answer by GPT-4</span>
              <el-tooltip
                trigger="click"
                :auto-close="5000"
                :disabled="modelType !== AI_MODEL.GPT4"
                content="It has been enabled, ChatDOC will use GPT-4 to answer questions.">
                <el-switch
                  :model-value="modelType"
                  :active-value="AI_MODEL.GPT4"
                  :inactive-value="AI_MODEL.GPT3_5"
                  @change="updateModelType" />
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch, computed } from 'vue';
import { ElInput, ElIcon, ElSwitch } from 'element-plus';
import { CircleCloseFilled } from '@element-plus/icons-vue';
import throttle from 'lodash-es/throttle';
import SvgIcon from './SvgIcon.vue';
import { getHtmlByMd } from '../utils/md.js';
import { getTextWidth } from '../utils/util.js';
import { AI_MODEL } from '../utils/constants.js';

const props = defineProps({
  questionList: {
    type: Array,
    default: () => [],
  },
  currentQuestion: {
    type: String,
    default: '',
  },
  materialData: {
    type: [Object, null],
    required: true,
  },
  disabled: Boolean,
  showRecommendList: Boolean,
  placeholder: { type: String, required: true },
  waitingAnswer: {
    type: Boolean,
    required: true,
  },
  modelType: {
    type: String,
    default: AI_MODEL.GPT3_5,
  },
});

const $inputRef = ref();
const $inputBar = ref();
const $questionContainer = ref();
const $multiRow = ref(false);
const $inputHandler = ref();
const $inputHandlerWidth = ref(0);
const questionConfig = reactive({
  questionMode: '',
});

const emits = defineEmits([
  'onSubmitQuestion',
  'update:currentQuestion',
  'update:showRecommendList',
  'update:materialData',
  'update:modelType',
]);
const $isHTMLMaterial = computed(() => {
  return !!props.materialData.anchorNode;
});

const submitQuestion = async () => {
  emits('onSubmitQuestion');
};

const selectQuestion = (text) => {
  emits('update:currentQuestion', text);
  submitQuestion();
};

const updateModelType = (val) => {
  emits('update:modelType', val);
};

onMounted(() => {
  const { width, right } = window.getComputedStyle($inputHandler.value);
  const { padding } = window.getComputedStyle($questionContainer.value);
  $inputHandlerWidth.value =
    Number.parseInt(width) + Number.parseInt(right) + Number.parseInt(padding);
  setMultiRow(props.placeholder);
});

const setMultiRow = throttle((text) => {
  if (!$inputRef.value) {
    return;
  }
  const { font } = window.getComputedStyle($inputRef.value.ref);
  const { width } = window.getComputedStyle($inputBar.value);
  const w = getTextWidth(text, font);
  $multiRow.value = w > Number.parseInt(width) - $inputHandlerWidth.value;
}, 200);

const onInput = (val) => {
  emits('update:currentQuestion', val);
};

watch(
  () => props.currentQuestion,
  (val) => {
    setMultiRow(val);
  },
);
watch(
  () => props.placeholder,
  (val) => {
    setMultiRow(val);
  },
);

const toggleRecommendList = () => {
  emits('update:showRecommendList', !props.showRecommendList);
};

const handleCancelMaterial = () => {
  emits('update:materialData', null);
};

defineExpose({
  getQuestionConfig: () => {
    return questionConfig;
  },
});
</script>

<style scoped lang="scss">
.chat-footer {
  position: sticky !important;
  bottom: 0;
  z-index: 100;
  box-sizing: border-box;
  background-color: white;
  border-top: 1px solid var(--el-border-color-primary);
}

.footer-container {
  position: relative;
  z-index: 100;
  box-sizing: border-box;
  width: 100%;
  background-color: var(--el-bg-color);
}

.ignore-border-top {
  border-top: 2px solid var(--el-text-color-slight);
}

.footer-bar-wrapper {
  z-index: 100;
  width: 100%;
  padding-bottom: 10px;
}

.frequently-used {
  max-height: calc(var(--vh, 1vh) * 50);
  padding: 22px 15px 0;
  overflow: auto;
  color: var(--el-text-color-primary);
  background-color: #f7f8fa;

  .tips {
    display: flex;

    :deep(.icon-bulb) {
      display: inline-block;
      width: 24px;
      height: 24px;
      margin-right: 6px;
      vertical-align: middle;
    }
  }

  .question-list {
    padding-left: 1em;
    font-size: 14px;
    list-style: decimal;

    li {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      padding: 6px 9px;
      color: var(--el-text-color-shallow);
      font-weight: 400;
      background-color: var(--el-bg-color);
      border-radius: 5px;
      box-shadow: 1px 1px 5px 0 #3f4a8b1a;
      cursor: pointer;

      p {
        margin: 8px 0;
      }
    }
  }

  .question-list-label {
    margin-bottom: 10px;
    font-size: var(--chat-view-font-size, 14px);
  }
}

.material-bar {
  margin: 0 15px;
  margin-top: 10px;
  margin-bottom: -11px;
  background-color: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-primary);
  border-bottom: none;
  border-radius: 4px 4px 0 0;

  .material-content {
    position: relative;
    padding-left: 20px;
    font-size: var(--chat-view-font-size, 14px);
    background: transparent;

    :deep() {
      :is(li, p, table, h1, h2, h3, h4, h5) {
        margin: 10px 0 0;

        &:first-child {
          margin-top: 0;
        }
      }

      table {
        width: 100%;
        border: 1px solid var(--el-border-color-primary) !important;
        border-collapse: collapse;

        :is(td, th) {
          padding: 6px !important;
          text-align: left;
          border: 1px solid var(--el-border-color-primary) !important;
        }
      }

      pre {
        white-space: pre-wrap;
      }
    }

    &::after {
      position: absolute;
      top: 12px;
      left: 0;
      color: var(--el-text-color-secondary);
      font-size: 40px;
      line-height: 40px;
      opacity: 0.4;
      content: '"';
    }

    &::before {
      position: absolute;
      top: 40px;
      left: 8px;
      width: 3px;
      height: calc(100% - 56px);
      background: var(--el-text-color-secondary);
      opacity: 0.4;
      content: '';
    }

    > .content {
      padding: 10px 10px 10px 0;

      :deep(table) {
        width: max-content;
        max-width: max-content;
      }

      :deep(.el-scrollbar__bar) {
        z-index: 2;
      }
    }
  }

  .material-cancel-handler {
    position: absolute;
    top: -12px;
    right: -12px;
    z-index: 2;
    color: #888;
    font-size: 24px;
    background: var(--el-bg-color);
    border-radius: 50%;

    &:hover {
      color: #333;
    }
  }
}

.bottom-bar {
  margin-top: 10px;
  background-color: var(--el-bg-color);

  &.disabled {
    background-color: var(--el-disabled-bg-color);

    .input-handler-icon {
      background-color: var(--el-disabled-bg-color);

      .icon {
        width: 24px;
        height: 24px;
      }
    }
  }

  &.multi-row {
    .input-bar {
      padding-top: 0;
      padding-right: 0;
    }

    .el-textarea {
      padding-bottom: 40px !important;
    }
  }

  .question-container {
    margin: 0 15px;
    overflow: hidden;
    border: 1px solid var(--el-border-color-primary);
    border-radius: 4px;
    box-shadow: rgba(89, 87, 90, 8%) 0 4px 12px;

    &.show-material {
      border-top: none;
      border-radius: 0 0 4px 4px;

      .input-bar {
        margin-top: 0;
        border-top: 1px solid #e4e4e4;
        border-radius: 0 0 4px 4px;
      }
    }

    .actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 40px;
      padding: 0 15px;

      .label {
        margin-right: 10px;
        color: #6b6c6f;
        font-weight: 500;
        font-size: 12px;
        line-height: 44px;
      }
    }
  }

  .input-bar {
    position: sticky;
    bottom: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
    border-bottom: 1px solid var(--el-border-color-primary);
    border-radius: 0;
    box-shadow: 0 4px 12px rgba(89, 87, 90, 8%);

    .el-textarea {
      position: relative;
      display: flex;
      align-items: center;
      min-height: 24px;

      :deep(.el-textarea__inner) {
        height: 50px !important;
        padding: 13px;
        color: var(--el-text-color-primary);
        font-size: var(--chat-view-font-size, 14px);
        background-color: transparent;
        border: none;
        outline: none;
        box-shadow: none;
        resize: none;

        &::placeholder {
          color: #999;
        }
      }
    }

    .input-handler {
      position: absolute;
      right: 13px;
      bottom: 14px;
      display: inline-flex;
      column-gap: 10px;
      background-color: var(--el-bg-color);

      .input-handler-icon {
        width: 24px;
        height: 24px;
        margin: 0;
        padding: 0;
        color: var(--el-text-color-shallow);
        background: var(--el-bg-color);
        border: none;
        outline: none;

        > svg {
          margin: 0 !important;
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .recommend-question-icon {
          color: #6b6c6f;
          transition: color 0.3s;

          &:not(.disabled) {
            cursor: pointer;

            &:hover,
            &.active {
              color: #facf55;
            }
          }
        }

        .submit-question-icon {
          color: #6b6c6f;
          transition: color 0.3s;

          &:not(.disabled) {
            cursor: pointer;

            &:hover {
              color: var(--el-color-primary);
            }
          }
        }
      }
    }
  }
}

.input-alert-wrapper {
  position: absolute;
  top: 50%;
  left: 15px;
  padding-right: 80px;
  color: var(--el-text-color-desalt);
  font-size: 14px;
  transform: translateY(-50%);

  .guide-to-sign-in-text {
    color: var(--el-color-primary);
    font-weight: bold;
    text-decoration: underline;
    cursor: pointer;
    text-underline-offset: 5px;
  }

  :deep(.upgrade-button) {
    margin-left: 20px;
  }
}
</style>
