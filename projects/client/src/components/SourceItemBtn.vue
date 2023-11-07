<template>
  <span class="answer-source-item" @click.stop="() => $emit('clicked', source)">
    <el-tooltip
      v-if="tooltip"
      placement="top"
      :hide-after="0"
      :content="tooltip">
      <span class="page">{{ source.page + 1 }}</span>
    </el-tooltip>
    <span v-else class="page">{{ source.page + 1 }}</span>
  </span>
</template>
<script setup>
import { ElTooltip } from 'element-plus';
defineProps({
  source: {
    type: Object,
    required: true,
  },
  tooltip: {
    type: String,
    default: '',
  },
});
defineEmits(['clicked']);
</script>

<style scoped lang="scss">
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
</style>
