<template>
  <el-popover
    :teleported="false"
    :visible="$showUrlInput"
    :placement="placement"
    trigger="click"
    :width="390"
    :show-after="0"
    :hide-after="0"
    :popper-style="{ padding: '10px' }"
    @click.prevent
    @hide="handlePopoverHide">
    <template #reference>
      <div class="upload-website" @click.stop="onClickWebsite">
        <slot name="reference">
          <div>
            <svg-icon
              name="upload-link"
              :size="20"
              margin="0 10px 0 0"
              class="upload-link-icon" />
            <span>Chat with website</span>
            <el-popover placement="right" width="480px" :show-after="500">
              <template #reference>
                <span class="website-help" @click.stop>
                  <svg-icon
                    name="question"
                    :size="20"
                    margin="0"
                    class="upload-link-icon" />
                </span>
              </template>
              <website-help :is-baidu="isBaidu" />
            </el-popover>
          </div>
        </slot>
      </div>
    </template>
    <el-input
      v-model="$url"
      placeholder="Enter a website to chat."
      class="url-upload-input"
      @click.stop
      @keyup.enter="handleUploadByUrl"
      @keydown.esc.stop>
      <template #append>
        <el-button
          class="upload-btn"
          type="primary"
          :loading="$loading"
          @click.stop="handleUploadByUrl">
          Chat
        </el-button>
      </template>
    </el-input>
  </el-popover>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ElInput, ElPopover, ElButton, ElMessage } from 'element-plus';
import SvgIcon from './SvgIcon.vue';
import WebsiteHelp from './WebsiteHelp.vue';
import { isBaidu } from '../utils/constants';

const props = defineProps({
  uploadHandle: {
    type: Function,
    required: true,
  },
  placement: {
    type: String,
    default: 'top',
  },
});

const emits = defineEmits(['uploaded']);

const $url = ref('');
const $loading = ref(false);
const $showUrlInput = ref(false);

const handlePopoverHide = () => {
  $url.value = '';
};

const onClickWebsite = () => {
  $showUrlInput.value = !$showUrlInput.value;
};

const handleUploadByUrl = async () => {
  const url = $url.value.trim();
  if (!url) {
    ElMessage.warning('Please give us a valid URL.');
    return;
  }
  try {
    $loading.value = true;
    const resp = await props.uploadHandle(url);
    emits('uploaded', resp);
    $showUrlInput.value = false;
  } catch ({ message }) {
    if (Array.isArray(message)) {
      ElMessage.error(message[0]?.msg);
    } else {
      ElMessage.error(message);
    }
  } finally {
    $loading.value = false;
    $url.value = '';
  }
};

const hideUrlInput = () => {
  $showUrlInput.value = false;
};
onMounted(() => {
  window.addEventListener('click', hideUrlInput);
});
onBeforeUnmount(() => {
  window.removeEventListener('click', hideUrlInput);
});
defineExpose({
  hideUrlInput,
});
</script>
<style scoped lang="scss">
.upload-website {
  display: flex;
  align-items: center;
  justify-content: center;
  justify-content: space-between;
  box-sizing: border-box;
  height: 49px;
  height: max-content;
  color: var(--el-color-primary);
  font-weight: bolder;
  column-gap: 5px;
  cursor: pointer;

  .upload-link-icon {
    color: var(--el-color-primary);
  }

  .website-help {
    margin-left: 10px;
    padding: 6px;
    border-radius: 4px;

    &:hover {
      background-color: #ebebec;
    }
  }
}

.url-upload-input {
  height: 36px;
  overflow: hidden;
  font-size: 14px;
  line-height: 36px;

  :is(.el-input__wrapper) {
    padding: 1px 12px;
    background-color: var(--el-bg-color);
    border-right: 0 none;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  .upload-link-prefix-icon {
    margin-right: 12px;
  }

  .file-url-upload-loading {
    animation: rotate 1.5s linear infinite;
  }

  .upload-btn {
    display: inline-flex;
    height: 36px;
    color: var(--el-button-text-color);
    background: var(--el-color-primary);
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;

    &:hover,
    &:focus {
      color: var(--el-button-hover-text-color);
      background-color: var(--el-button-hover-bg-color);
      border-color: var(--el-button-hover-border-color);
      outline: none;
    }
  }
}
</style>
