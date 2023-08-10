<template>
  <div class="chat-page-container">
    <div ref="$questionListWrapRef" class="chat-view-main">
      <chat-list
        :disabled="$waitingAnswer"
        :file-info="fileInfo"
        :chat-list="$chatList"
        :chat-list-first-loaded="true"
        :doc-name-dict="docNameDict"
        @material-chat="materialChat"
        @source-item-clicked="handleSourceItemClicked" />
    </div>
    <chat-input
      id="chat-input"
      v-model:current-question="$currentQuestion"
      v-model:show-recommend-list="$showRecommendList"
      v-model:material-data="$materialData"
      :material-data="$materialData"
      :question-list="$questionList"
      :disabled="disabled"
      :waiting-answer="$waitingAnswer"
      :placeholder="$placeholder"
      @on-submit-question="submitQuestion" />
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch, defineEmits } from 'vue';
import {
  getRecommendedPrompts,
  fetchChatStream,
  readStream,
} from '../apis/api.js';
import ChatList from './chatList.vue';
import chatInput from './chatInput.vue';
import { convertSourceInfoToSources } from '../utils/util.js';
import { DOC_STATUS_MESSAGE } from '../utils/constants.js';
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
});

const emits = defineEmits(['sourceItemClicked']);

const $chatList = ref([]);
const $currentQuestion = ref('');
const $showRecommendList = ref(true);

// meta data from pdf selection
const $materialData = ref(null);
const $questionList = ref([]);
const $waitingAnswer = ref(false);
const $questionListWrapRef = ref(null);

const $docId = computed(() => {
  return props.fileInfo.id;
});

const $placeholder = computed(() => {
  if (props.disabled) {
    if (props.fileInfo.status < 0) {
      return (
        DOC_STATUS_MESSAGE[props.fileInfo.status] || 'File processing failed.'
      );
    } else {
      return 'You may take a sip of your coffee while I am working hard on processing the file.';
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
    node?.scroll(0, Number.MAX_SAFE_INTEGER);
  });
};

const getQuestionList = async () => {
  let prompts = await getRecommendedPrompts($docId.value);
  prompts = prompts
    .map((str) => {
      return str.replace(/\d\./, '').trim();
    })
    .filter((str) => !!str);
  $questionList.value = prompts;
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
    const selectedMeta = $materialData.value
      ? {
          ...$materialData.value,
          upload_id: $docId.value,
        }
      : null;
    const isFromSelectText = !!selectedMeta;
    const data = {
      question: $currentQuestion.value,
      selected_meta: selectedMeta,
      search_entire_doc: !isFromSelectText,
      detailed_citation: true,
      // language: "english",
      history: history,
    };
    clearCurrentQuestion();
    // return a ReadableStream
    response = await fetchChatStream(props.uploadId, data);
    clearCurrentQuestion();

    // read stream
    await readStream(response.body, (text, source_info, id) => {
      newChatItem.answer.loading.value = false;
      answer += text;
      newChatItem.answer.content.value = answer;
      if (source_info) {
        sourceInfo = source_info;
      }
      if (!newChatItem.id && id) {
        newChatItem.id = id;
      }
      scrollToQuestionListBottom();
    });

    if (!newChatItem.answer.content.value) {
      throw new Error('An unknown error occurred, please try again.');
    }
    newChatItem.answer.originalSources = JSON.parse(JSON.stringify(sourceInfo));

    newChatItem.answer.sources.value = convertSourceInfoToSources(sourceInfo);

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

onMounted(async () => {
  await getQuestionList();
});

watch(
  () => props.materialData,
  (value) => {
    $materialData.value = value;
  },
);

watch(
  () => props.disabled,
  () => {
    if (!props.disabled && $questionList.value.length === 0) {
      getQuestionList();
    }
  },
);
</script>
<style lang="scss" scoped>
.chat-page-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-left: 1px solid #8080803d;

  .thread-drawer {
    overflow: hidden;

    .chat-view-main {
      height: calc(
        (var(--vh, 1vh) * 100) - var(--header-height) - var(--footerHeight)
      );
    }
  }
}

.chat-view-main {
  /* stylelint-disable */
  height: calc((var(--vh, 1vh) * 100) - var(--footer-height));
  /* stylelint-enable */
  overflow-y: scroll;
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
