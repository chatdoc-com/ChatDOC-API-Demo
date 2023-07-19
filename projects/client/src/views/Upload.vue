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
            <el-icon class="el-icon--upload">
              <svg-icon name="upload" :size="60" fill="#6576DB" />
            </el-icon>
            <div class="el-upload__text">Drop file here or click to upload.</div>
          </el-upload>
          <div v-if="$progress && $files.length === 0">
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
            <el-icon class="el-icon--upload">
              <svg-icon
                name="folder"
                :size="50"
                color="var(--el-color-primary)" />
            </el-icon>
            <div class="el-upload__text">
              Drop multiple files as collection <br />or click to upload.
            </div>
          </el-upload>
          <div v-if="$progress && $files.length > 0">
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
import { computed, ref } from 'vue';
import every from 'lodash-es/every';
import { ElUpload, ElMessage, ElProgress } from 'element-plus';
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

const clearData = () => {
  $collectionId.value = null;
  $validatedFilesCount.value = 0;
  $files.value = [];
  $progress.value = 0;
};

const createCollect = async () => {
  try {
    const name = `${$files.value[0].name.slice(0, 5)}_collection`;
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
    $progress.value = 1;
    const isValid = await validateFile(file.raw);
    if (isValid) {
      $upload.value.submit();
    } else {
      $upload.value.clearFiles();
    }
  }
  if (file.status === 'success') {
    const id = file.response.data.id;
    router.push({ name: 'chat', params: { id } });
    clearData();
  }
};

const handleMultiFileChange = async (file, files) => {
  if (file.status === 'ready') {
    $progress.value = 1;
    await validateFile(file.raw);
    if (files.length === $files.value.length) {
      // wait for file validated
      setTimeout(async () => {
        if (allFilesValidated()) {

          await createCollect();
          $collectionUpload.value.submit();
        } else {
          clearData();
        }
      });
    }
  }
  if (file.status === 'success') {
    if (allFilesUploaded(files)) {
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
  $uploadFiles.value = files.length;
  $progress.value = Math.floor(e.percent);
};
</script>
<style scoped lang="scss">
.main-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: url('../assets/home-bg.png') no-repeat right bottom,
    linear-gradient(180deg, #f6faff 0%, #eaf3ff 100%);

  .header {
    padding-left: 100px;
    height: 64px;
    display: flex;
    align-items: center;
    .icon-chatdoc {
      width: 48px;
      height: 48px;
      margin-right: 15px;
    }
    .title {
      color: #142132;
      font-size: 20px;
      font-weight: 500;
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
        border-radius: 40px;
        width: 448px;
        height: 313px;
        border: 1px solid rgba(222, 222, 222, 1);
        display: flex;
        flex-direction: column;
        padding: 78px;
        align-items: center;
        flex-shrink: 0;
        flex-grow: 0;
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
    }
    .upload-limits {
      border-radius: 40px;
      border: 1px solid rgba(222, 222, 222, 1);
      background-color: rgb(246, 245, 241);
      padding: 15px 30px;
      margin-top: 20px;
      .title {
        color: rgba(62, 63, 66, 1);
        font-size: 16px;
        font-weight: 700;
        line-height: 24px;
      }

      :deep(.el-divider) {
        margin: 12px 0;
      }
      .limit {
        color: rgba(107, 108, 111, 1);
        font-size: 14px;
        font-weight: 500;
        line-height: 21px;

        span + span {
          margin-left: 10px;
        }
      }
    }
  }
}
</style>
