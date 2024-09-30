<template>
  <div>
    <span class="label">Answer by</span>
    <el-select
      :model-value="modelType"
      placeholder="Select"
      size="small"
      style="width: 120px"
      popper-class="model-pop"
      @change="updateModelType">
      <el-option
        v-for="item in $models"
        :key="item.value"
        :class="item.value"
        :label="item.label"
        :value="item.value">
        <div class="option">
          <img :src="item.icon" width="16" />
          <span style="margin-left: 8px"> {{ item.label }}</span>
        </div>
      </el-option>
      <template #prefix>
        <img :src="$selectedModel.icon" width="16" />
      </template>
    </el-select>
  </div>
</template>
<script setup>
import { ElSelect, ElOption } from 'element-plus';
import { AI_MODEL, isBaidu } from '../utils/constants.js';
import { computed } from 'vue';
const props = defineProps({
  modelType: {
    type: String,
    default: AI_MODEL.default,
  },
});

const $models = computed(() => {
  const models = Object.values(AI_MODEL).map((value) => {
    return {
      label: value,
      value,
      icon: new URL(`../assets/${value.split('-')[0]}.svg`, import.meta.url)
        .href,
    };
  });
  if (isBaidu) {
    return models.filter((model) => model.value === AI_MODEL.BAIDU);
  } else {
    return models.filter((model) => model.value !== AI_MODEL.BAIDU);
  }
});

const $selectedModel = computed(() => {
  return $models.value.find((model) => model.value === props.modelType);
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

.option {
  display: flex;
  align-items: center;
  height: 100%;
}
</style>
