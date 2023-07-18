<template>
  <svg
    ref="$triggerRef"
    aria-hidden="true"
    :style="getStyle"
    :fill="fill"
    :stroke="stroke"
    class="svg-icon-base"
    :class="{ 'is-has-interactive': $attrs.onClick }"
    @mouseenter="svgMouseEnter">
    <use :href="symbolId" />
  </svg>
</template>
<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  prefix: {
    type: String,
    default: 'icon',
  },
  size: {
    type: [Number, String],
    default: 16,
  },
  name: {
    type: String,
    required: true,
  },
  stroke: {
    type: String,
  },
  fill: {
    type: String,
  },
  title: {
    type: String,
    default: null,
  },
  showAfter: {
    type: Number,
    default: 1000,
  },
  hideAfter: {
    type: Number,
    default: 0,
  },
  margin: {
    type: String,
    default: '0 5px',
  },
});

const $triggerRef = ref(null);

const symbolId = computed(() => `#${props.prefix}-${props.name}`);

const getStyle = computed(() => {
  const { size, color } = props;

  let s = `${size}`;
  s = `${s.replace('px', '')}px`;
  return {
    width: s,
    height: s,
    color: color,
  };
});

const marginStyle = computed(() => {
  return props.margin;
});

const svgMouseEnter = () => {
  if (!props.title) {
    return;
  }
};
</script>
<style lang="scss">
.svg-icon-base {
  z-index: 10;
  margin: v-bind(marginStyle);
  overflow: visible;
  vertical-align: middle;

  &:focus {
    outline: none;
  }

  &.mobile {
    cursor: none !important;
  }

  &.is-has-interactive {
    cursor: pointer;
  }

  .tooltip {
    display: none;
    user-select: none;
    fill: var(--el-bg-color);

    &.show {
      display: block;
    }
  }
}
</style>
