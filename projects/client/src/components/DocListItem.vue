<template>
  <div class="item-block" :class="{ active }" @click="onItemClick">
    <el-tooltip :content="docInfo.name" placement="top" :show-after="500">
      <p class="name-block">
        <svg-icon
          v-if="$isPDF"
          name="pdf"
          :size="20"
          class="file-item-name-icon" />
        <svg-icon
          v-if="$isTXT"
          name="txt"
          :size="20"
          class="file-item-name-icon" />
        <svg-icon
          v-if="$isMD"
          name="md"
          :size="20"
          class="file-item-name-icon" />
        <svg-icon
          v-if="$isEPUB"
          name="epub"
          :size="20"
          class="file-item-name-icon" />
        <svg-icon
          v-if="$isHTML"
          name="website"
          :size="20"
          class="file-item-name-icon" />

        <span class="name">{{ docInfo.name }}</span>
      </p>
    </el-tooltip>
    <p class="status-block">
      <el-tooltip
        :content="$docStatusTooltip"
        placement="top"
        :show-after="500">
        <svg-icon
          v-if="$isShowStatusIcon.success"
          name="doc-ok"
          color="#9ace53" />
        <svg-icon
          v-else-if="$isShowStatusIcon.parsing"
          name="doc-ing"
          class="doc-ing-icon" />
        <svg-icon
          v-else-if="$isShowStatusIcon.error"
          name="doc-error"
          class="doc-error"
          color="#E6492D" />
      </el-tooltip>
    </p>
  </div>
</template>
<script setup>
import { computed, defineEmits, toRef } from 'vue';
import SvgIcon from './SvgIcon.vue';
import { FILE_STATUS, DOC_STATUS_SHORT_MESSAGE } from '../utils/constants.js';
import { useFileType } from '../hooks/useFileType.js';
const props = defineProps({
  docInfo: {
    type: Object,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['onClicked']);
const { $isPDF, $isEPUB, $isMD, $isHTML, $isTXT } = useFileType(
  toRef(props, 'docInfo'),
);
const $isShowStatusIcon = computed(() => {
  return {
    success:
      props.docInfo.status >= FILE_STATUS.PARSED && !props.docInfo.errorInfo,
    parsing:
      props.docInfo.status > 0 && props.docInfo.status < FILE_STATUS.PARSED,
    error: props.docInfo.status < 0,
  };
});
const $docStatusTooltip = computed(() => {
  if ($isShowStatusIcon.value.success) {
    return 'Analysis completed';
  }
  if ($isShowStatusIcon.value.parsing) {
    return 'Analyzing';
  }
  if ($isShowStatusIcon.value.error) {
    return (
      DOC_STATUS_SHORT_MESSAGE[props.docInfo.status] || 'File processing failed'
    );
  }
  return '';
});

const onItemClick = () => {
  emits('onClicked', props.docInfo.id);
};
</script>
<style scoped lang="scss">
.name-block {
  display: flex;
  margin: 0;
}

.item-block {
  margin: 5px 0;
  padding: 10px 5px;
  border-radius: 4px;
  cursor: pointer;

  &.active,
  &:hover {
    background-color: rgba(107, 108, 111, 10.2%);
  }
}

.status-block {
  display: flex;
  justify-content: end;
  margin: 0;

  .doc-ing-icon {
    animation: rotate 1.5s linear infinite;
  }
}

.name {
  display: inline-block;
  overflow: hidden;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.file-item-name-icon {
  position: relative;
  bottom: 2px;
  flex-shrink: 0;
  min-width: 12px;
  margin-right: 10px;
  color: #9ea0a5;
}
</style>
