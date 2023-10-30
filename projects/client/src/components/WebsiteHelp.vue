<template>
  <div class="website-help">
    <h1>Chat with the text content of the website.</h1>
    <div>
      <span>
        Currently, it is mainly suitable for scenarios such as help centers,
        user manuals, or knowledge Q&A. <br />
        <br />For example:
      </span>
      <ul class="url-list">
        <li v-for="url of $websiteExpUrls" :key="url">
          <a :href="url" target="_blank" rel="noopener noreferrer">
            {{ url }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isBaidu: {
    type: Boolean,
    default: false,
  },
});

const $websiteExpUrls = computed(() => {
  return props.isBaidu
    ? [
        'https://paodingjiewen.com/term_of_service.html',
        'https://api-reference.paodingjiewen.com',
      ]
    : [
        'https://chatdoc.com/term_of_service.html',
        'https://api-reference.chatdoc.com',
      ];
});
</script>

<style scoped lang="scss">
.website-help {
  width: 440px;
  padding: 8px;
  color: var(--el-text-color-primary);
  line-height: 24px;
  text-align: left;
  word-break: keep-all;

  h1 {
    margin-bottom: 10px;
    padding-bottom: 22px;
    font-weight: 500;
    font-size: 20px;
    font-style: normal;
    line-height: 30px;
    border-bottom: 1px solid var(--el-text-color-slight);
  }

  .url-list {
    padding-left: 20px;

    li {
      margin-bottom: 5px;
      list-style: disc;

      &:nth-last-of-type(1) {
        margin-bottom: 0;
      }
    }
  }

  a {
    position: relative;
    color: var(--el-text-color-primary);
    font-weight: 400;
  }

  img {
    width: 100%;
    margin-top: 20px;
  }
}
</style>
