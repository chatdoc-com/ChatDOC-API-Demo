<template>
  <div class="chat-page-container">
    <div class="header"></div>
    <el-scrollbar ref="$questionListWrapRef" class="chat-view-main">
      <chat-list
        :disabled="$waitingAnswer"
        :chat-list="$chatList"
        :chat-list-first-loaded="true"
        :doc-name-dict="docNameDict"
        @material-chat="materialChat"
        @source-item-clicked="handleSourceItemClicked" />
    </el-scrollbar>
    <chat-input
      id="chat-input"
      v-model:current-question="$currentQuestion"
      v-model:show-recommend-list="$showRecommendList"
      v-model:material-data="$materialData"
      v-model:model-type="$modelType"
      :material-data="$materialData"
      :question-list="$questionList"
      :disabled="disabled"
      :waiting-answer="$waitingAnswer"
      :placeholder="$placeholder"
      @on-submit-question="submitQuestion" />
  </div>
</template>
<script setup>
import { ref, computed, watch, defineEmits, toRef } from 'vue';
import { ElScrollbar } from 'element-plus';
import { fetchChatStream, readStream, getQuestionDetail } from '../apis/api.js';
import ChatList from './chatList.vue';
import chatInput from './chatInput.vue';
import {
  convertSourceInfoToSources,
  convertSourceInfoToSourcesForHTML,
} from '../utils/util.js';
import {
  DOC_STATUS_MESSAGE,
  DOC_STATUS_SHORT_MESSAGE,
  AI_MODEL,
} from '../utils/constants.js';
import { useFileType } from '../hooks/useFileType';
const props = defineProps({
  fileInfo: {
    type: Object,
    required: true,
  },
  materialData: {
    type: Object,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  uploadId: {
    type: String,
    required: true,
  },
  docNameDict: {
    type: Object,
    default: () => null,
  },
  suggestedQuestions: {
    type: Array,
    default: () => [],
  },
});

const { $isPDF } = useFileType(toRef(props, 'fileInfo'));

const emits = defineEmits(['sourceItemClicked']);

const $chatList = ref([]);
const $currentQuestion = ref('');
const $showRecommendList = ref(true);

// meta data from pdf selection
const $materialData = ref(null);
const $waitingAnswer = ref(false);
const $questionListWrapRef = ref(null);
const $modelType = ref(AI_MODEL.GPT3_5);

const $questionList = computed(() => {
  return props.suggestedQuestions
    .map((str) => {
      return str.replace(/\d\./, '').trim();
    })
    .filter((str) => !!str);
});

const $placeholder = computed(() => {
  if (props.disabled) {
    if (props.fileInfo.status < 0) {
      return (
        DOC_STATUS_SHORT_MESSAGE[props.fileInfo.status] ||
        DOC_STATUS_MESSAGE[props.fileInfo.status] ||
        'File processing failed.'
      );
    } else {
      return 'Please wait for document analysis results';
    }
  } else {
    return '+ New chat.';
  }
});

const materialChat = (data) => {
  $materialData.value = data;
  $showRecommendList.value = false;
  scrollToQuestionListBottom();
};

const scrollToQuestionListBottom = () => {
  requestAnimationFrame(() => {
    const node = $questionListWrapRef.value;
    node?.scrollTo(0, Number.MAX_SAFE_INTEGER);
  });
};

const initChatItem = () => {
  const newChatItem = {
    id: null,
    question: {
      content: $currentQuestion.value,
      materialData: $materialData.value,
    },
    answer: {
      content: ref(''),
      sources: ref([]),
      error: ref(false),
      loading: ref(true),
      isStreamComplete: false,
      modelType: $modelType.value,
    },
    feedback: null,
  };
  return newChatItem;
};

const getHistory = (chatList) => {
  const history = [];
  chatList.forEach((item) => {
    history.push(
      {
        role: 'user',
        content: item.question.content,
      },
      {
        role: 'assistant',
        content: item.answer.content,
      },
    );
  });
  return history;
};

const clearCurrentQuestion = () => {
  $currentQuestion.value = '';
  $materialData.value = null;
};

const sendQuestion = async () => {
  $showRecommendList.value = false;

  scrollToQuestionListBottom();

  let answer = '';
  let sourceInfo = [];

  const $id = ref(null);

  const history = getHistory($chatList.value);

  const newChatItem = initChatItem($id);
  $chatList.value.push(newChatItem);
  try {
    let response = null;
    const isFromSelectText = !!$materialData.value;
    const data = {
      question: $currentQuestion.value,
      selected_meta: $materialData.value,
      search_entire_doc: !isFromSelectText,
      // language: "english",
      history: history,
      model_type: $modelType.value,
    };
    clearCurrentQuestion();
    // return a ReadableStream
    response = await fetchChatStream(props.uploadId, data);
    clearCurrentQuestion();

    // read stream
    await readStream(response.body, (text, id) => {
      newChatItem.answer.loading.value = false;
      answer += text;
      newChatItem.answer.content.value = answer;
      if (!newChatItem.id && id) {
        newChatItem.id = id;
      }
      scrollToQuestionListBottom();
    });

    const questionDetail = await getQuestionDetail(newChatItem.id);
    sourceInfo = questionDetail.source_info;

    if (!newChatItem.answer.content.value) {
      throw new Error('An unknown error occurred, please try again.');
    }
    newChatItem.answer.originalSources = sourceInfo;

    newChatItem.answer.sources.value = $isPDF.value
      ? convertSourceInfoToSources(sourceInfo)
      : convertSourceInfoToSourcesForHTML(sourceInfo);

    newChatItem.answer.isStreamComplete = true;
  } catch (e) {
    const { status, message, info } = e;
    if (status === 403 && info.reason === 'banned') {
      throw e;
    }

    if (status === 404) {
      throw e;
    }

    if (status === 429) {
      newChatItem.answer.content.value =
        'You have reached the limit count of questions.';
    } else {
      newChatItem.answer.content.value = message || 'network error';
    }

    newChatItem.answer.error.value = true;
  } finally {
    $waitingAnswer.value = false;
    newChatItem.answer.loading.value = false;
  }
};

const submitQuestion = async () => {
  const formatQuestionText = $currentQuestion.value.replace(/\s+/g, ' ');
  const isEmpty = !formatQuestionText || formatQuestionText === ' ';
  if (isEmpty) {
    $currentQuestion.value = '';
    return;
  }
  await sendQuestion();
};

const handleSourceItemClicked = (source) => {
  emits('sourceItemClicked', source);
};

watch(
  () => props.materialData,
  (value) => {
    $materialData.value = value;
  },
);
</script>
<style lang="scss" scoped>
.chat-page-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-left: 1px solid #8080803d;

  .header {
    height: var(--header-height);
    border-bottom: 1px solid var(--el-border-color-primary);
  }
}

.chat-view-main {
  /* stylelint-disable */
  height: calc(
    (var(--vh, 1vh) * 100) - var(--footer-height) - var(--header-height)
  );
  /* stylelint-enable */
  box-shadow: 0 2px 12px 0 var(--el-text-color-slight);

  .answer {
    background-color: #fbfbfb;
    box-shadow: 0 1px 0 #dedede, 0 -1px 0 #dedede;
    cursor: pointer;

    &.highlight {
      background: var(--el-bg-color-shallow-primary);
    }

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
      }

      &::before {
        position: absolute;
        bottom: 28px;
        left: 48px;
        color: red;
      }
    }

    .right {
      position: relative;
      flex: 1;

      .message {
        font-size: var(--chat-view-font-size, 14px);
      }

      // overflow: hidden;
      .quote {
        text-align: right;
      }
    }
  }
}
</style>
