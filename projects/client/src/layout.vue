<template>
  <div class="main-layout">
    <div class="header">
      <img
        crossorigin="anonymous"
        class="icon-chatdoc"
        src="./assets/chatdoc.png"
        alt="" />
      <span class="title">ChatDPC API</span>
      <el-divider />
      <span class="title">Demo</span>
    </div>
    <router-view />
  </div>
</template>
<script setup>
import { ElDivider } from 'element-plus';
</script>
<style scoped lang="scss">
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: auto;
  background: url('./assets/imgs/api/home-bg.png') no-repeat right bottom,
    linear-gradient(180deg, #f6faff 0%, #eaf3ff 100%);

  .header {
    width: 100%;
    padding-left: 30px;

    .title {
      color: #142132;
      font-weight: 500;
      font-size: 20px;
    }
  }
}
</style>
