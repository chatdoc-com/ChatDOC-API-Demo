<template>
  <div class="item-block" :class="{ active }" @click="onItemClick">
    <p class="name-block">
      <svg-icon name="pdf" :size="20" class="file-item-name-icon" />
      <span class="name">{{ docInfo.name }}</span>
    </p>
    <p class="status-block">
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
    </p>
  </div>
</template>
<script setup>
import { computed, defineEmits } from 'vue';
import SvgIcon from './SvgIcon.vue';
import { FILE_STATUS } from '../constant';
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
const $isShowStatusIcon = computed(() => {
  return {
    success: !props.docInfo.errorInfo,
    parsing:
      props.docInfo.status > 0 && props.docInfo.status < FILE_STATUS.PARSED,
    error: props.docInfo.status < 0,
  };
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
}

.name {
  display: inline-block;
  overflow: hidden;
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
