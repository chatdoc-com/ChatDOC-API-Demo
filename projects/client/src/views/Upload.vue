<template>
  <div class="main-layout">
    <div class="header">
      <img
        crossorigin="anonymous"
        class="icon-chatdoc"
        src="../assets/chatdoc.png"
        alt="" />
      <span class="title">ChatDOC API</span>
      <el-divider direction="vertical" />
      <span class="title">Demo</span>
    </div>
    <div class="upload-demo">
      <div class="upload-input">
        <div>
          <el-upload
            ref="$upload"
            accept=".pdf"
            drag
            :multiple="false"
            :action="$uploadUrl"
            :on-change="handleFileUpload"
            :on-progress="handleProgress"
            :show-file-list="false"
            :auto-upload="false">
            <el-icon
              v-if="$loading && !$isCollection"
              color="var(--el-color-primary)"
              :size="67"
              class="el-icon--loading">
              <loading />
            </el-icon>
            <el-icon v-else class="el-icon--upload">
              <svg-icon name="upload" :size="60" fill="#6576DB" />
            </el-icon>
            <div class="el-upload__text">
              Drop file here or click to upload.
            </div>
          </el-upload>
          <div v-if="$progress && !$isCollection">
            <span>0/1</span>
            <el-progress :percentage="$progress" />
          </div>
        </div>
        <div>
          <el-upload
            ref="$collectionUpload"
            v-model:file-list="$files"
            drag
            accept=".pdf"
            :limit="FILE_LIMIT.COLLECTION_FILES_LIMIT"
            :multiple="true"
            :action="$uploadUrl"
            :show-file-list="false"
            :on-exceed="handleExceed"
            :on-change="handleMultiFileChange"
            :on-progress="handleProgress"
            :auto-upload="false">
            <el-icon
              v-if="$loading && $isCollection"
              color="var(--el-color-primary)"
              :size="67"
              class="el-icon--loading">
              <loading />
            </el-icon>
            <el-icon v-else class="el-icon--upload">
              <svg-icon
                name="folder"
                :size="50"
                color="var(--el-color-primary)" />
            </el-icon>
            <div class="el-upload__text">
              Drop multiple files as collection <br />or click to upload.
            </div>
          </el-upload>
          <div v-if="$progress && $isCollection">
            <span>{{ $uploadFiles }}/{{ $files.length }}</span>
            <el-progress :percentage="$progress" />
          </div>
        </div>
      </div>
      <div class="upload-limits">
        <p class="title">Upload limit</p>
        <el-divider />
        <p class="limit">
          <span>10 pages/pdf</span>
          <span>10 MB/file</span>
          <span>30 files/collection</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import every from 'lodash-es/every';
import { ElUpload, ElMessage, ElProgress } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import SvgIcon from '../components/SvgIcon.vue';
import { getUploadUrl, createCollection } from '../apis/api.js';
import { useRouter } from 'vue-router';
import { validateFileType, validateFileSize } from '../utils/file.js';
import { FILE_LIMIT } from '../constant';

const router = useRouter();
const $collectionUpload = ref(null);
const $upload = ref(null);
const $collectionId = ref('');
const $files = ref([]);
const $validatedFilesCount = ref(0);
const $uploadUrl = computed(() => {
  return getUploadUrl($collectionId.value);
});
const $progress = ref(0);
const $uploadFiles = ref(0);
const $loading = ref(false);

const $isCollection = computed(() => {
  return $files.value.length > 0;
});

const clearData = () => {
  $collectionId.value = null;
  $validatedFilesCount.value = 0;
  $files.value = [];
  $progress.value = 0;
  $loading.value = false;
  $uploadFiles.value = 0;
};

const createCollect = async () => {
  try {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const name = `collection_${date}`;
    const resp = await createCollection(name);
    $collectionId.value = resp.id;
  } catch (error) {
    ElMessage({
      message: 'Collection creation failed',
      type: 'error',
    });
  }
};

const validateFile = async (file) => {
  if (!validateFileType(file)) {
    ElMessage({
      message: 'Invalid file type',
      type: 'error',
    });
    return false;
  }
  try {
    await validateFileSize(file);
  } catch (e) {
    ElMessage({
      message: e.message,
      type: 'error',
    });
    return false;
  }
  $validatedFilesCount.value += 1;
  return true;
};

const allFilesUploaded = (files) => {
  return every(files, (file) => file.status === 'success');
};

const allFilesValidated = () => {
  return $validatedFilesCount.value === $files.value.length;
};

const handleFileUpload = async (file) => {
  if (file.status === 'ready') {
    $loading.value = true;
    const isValid = await validateFile(file.raw);
    if (isValid) {
      $upload.value.submit();
      $progress.value = 1;
    } else {
      $loading.value = false;
      $upload.value.clearFiles();
    }
  }
  if (file.status === 'success') {
    const id = file.response.data.id;
    $loading.value = false;
    router.push({ name: 'chat', params: { id } });
    clearData();
  }
};

const handleMultiFileChange = async (file, files) => {
  if (file.status === 'success') {
    if (allFilesUploaded(files)) {
      $loading.value = false;
      router.push({
        name: 'collectiontChat',
        params: { id: $collectionId.value },
      });
      clearData();
    }
  }
};

const handleExceed = () => {
  ElMessage({
    message: `You can upload a maximum of (${FILE_LIMIT.COLLECTION_FILES_LIMIT}) documents`,
    type: 'error',
  });
};

const handleProgress = (e, file, files) => {
  if (!$isCollection.value) {
    $progress.value = Math.floor(e.percent);
    return;
  }
  const percent = Math.floor(
    files.reduce((p, c) => p + c.percentage, 0) / files.length,
  );
  $uploadFiles.value = Math.floor((percent * files.length) / 100);
  $progress.value = percent;
};

watch(
  () => $files.value,
  async () => {
    if ($files.value.length === 0) {
      return;
    }
    $loading.value = true;
    for (const file of $files.value) {
      await validateFile(file.raw);
    }
    if (allFilesValidated()) {
      await createCollect();
      $collectionUpload.value.submit();
      $progress.value = 1;
    } else {
      $loading.value = false;
      clearData();
    }
  },
);
</script>
<style scoped lang="scss">
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: url('../assets/home-bg.png') no-repeat right bottom,
    linear-gradient(180deg, #f6faff 0%, #eaf3ff 100%);

  .header {
    display: flex;
    align-items: center;
    height: 64px;
    padding-left: 100px;

    .icon-chatdoc {
      width: 48px;
      height: 48px;
      margin-right: 15px;
    }

    .title {
      color: #142132;
      font-weight: 500;
      font-size: 20px;
    }
  }

  .upload-demo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;

    .upload-input {
      display: flex;

      div + div {
        margin-left: 20px;
      }

      :deep(.el-upload-dragger) {
        display: flex;
        flex-direction: column;
        flex-grow: 0;
        flex-shrink: 0;
        align-items: center;
        width: 448px;
        height: 313px;
        padding: 78px;
        border: 1px solid rgba(222, 222, 222, 100%);
        border-radius: 40px;
      }

      :deep(.el-upload__text) {
        margin-top: 14px;
        color: var(--el-color-primary);
        font-weight: 700;
        font-size: 18px;
        line-height: 27px;
        text-align: center;
      }

      :deep(.el-upload-list) {
        width: 448px;
        max-height: 150px;
        overflow-y: auto;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      :deep(.el-upload-list__item) {
        margin-bottom: 20px;
        text-align: center;
      }

      .el-icon--loading {
        margin-bottom: 16px;
        animation: rotate 2s linear infinite;
      }
    }

    .upload-limits {
      margin-top: 20px;
      padding: 15px 30px;
      background-color: rgb(246, 245, 241);
      border: 1px solid rgba(222, 222, 222, 100%);
      border-radius: 40px;

      .title {
        color: rgba(62, 63, 66, 100%);
        font-weight: 700;
        font-size: 16px;
        line-height: 24px;
      }

      :deep(.el-divider) {
        margin: 12px 0;
      }

      .limit {
        color: rgba(107, 108, 111, 100%);
        font-weight: 500;
        font-size: 14px;
        line-height: 21px;

        span + span {
          margin-left: 10px;
        }
      }
    }
  }
}
</style>
