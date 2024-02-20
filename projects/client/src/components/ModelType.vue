<template>
  <div>
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
</template>
<script setup>
import { ElTooltip, ElSwitch } from 'element-plus';
import { AI_MODEL } from '../utils/constants.js';

defineProps({
  modelType: {
    type: String,
    default: AI_MODEL.GPT3_5,
  },
});

const emits = defineEmits(['update:modelType']);
const updateModelType = (val) => {
  emits('update:modelType', val);
};
</script>
<style lang="scss" scoped>
.label {
  margin-right: 10px;
  color: #6b6c6f;
  font-weight: 500;
  font-size: 12px;
  line-height: 44px;
}
</style>
