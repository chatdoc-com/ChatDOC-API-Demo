<template>
  <div v-show="visible" class="quote-wrap">
    <div class="quote-header">
      <el-tooltip placement="bottom-start">
        <template #content>
          <div class="thread-bank-tips">
            <span> Leave thread. Start new chat for unrelated talk. </span>
            <el-icon>
              <close />
            </el-icon>
          </div>
        </template>
        <svg-icon
          name="arrow-left"
          class="quote-header-icon"
          @click="backToFullList" />
      </el-tooltip>

      <div class="quote-header-title">
        {{ `!Thread@"${title}"` }}
      </div>
    </div>
    <slot> </slot>
  </div>
</template>
<script setup>
import { defineEmits } from 'vue';
import SvgIcon from './SvgIcon.vue';
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['backToFullList']);

const backToFullList = () => {
  emits('backToFullList');
};
</script>
<style lang="scss" scoped>
.quote-wrap {
  position: fixed;
  top: 0;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: calc(100vh);
  overflow: auto;
  background-color: var(--el-bg-color);

  .quote-header {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    height: 56px;
    padding: 0 10px 0 20px;
    background-color: #fbfbfb;
    box-shadow: 0 1px 0 var(--el-border-color-primary),
      0 2px 6px rgba(0, 0, 0, 5%);

    .quote-header-icon {
      margin-right: 20px;
      cursor: pointer;

      &.disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }

    .quote-header-title {
      flex: 1;
      padding: 0 5px 0 20px;
      color: var(--el-text-color-primary);
      font-weight: 500;
      font-size: var(--chat-view-font-size, 16px);
      border-left: 1px solid #eee;
    }

    :is(.chat-handlers) {
      flex: inherit;
    }
  }
}
</style>
