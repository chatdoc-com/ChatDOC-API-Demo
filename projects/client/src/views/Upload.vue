<template>
  <div class="main-layout" @click="handleClick">
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
      <div class="package-wrap">
        <div v-if="$packageError" class="error-tip" @click.stop>
          {{ $packageError }}
        </div>
        <package-select
          v-model:value="$package"
          label="Choose Your PDF_Package_Type:"
          :options="PACKAGE_TYPES" />
        <package-select
          v-model:value="$ocr"
          class="ocr-select"
          :options="OCR_TYPES" />
      </div>

      <div class="upload-input">
        <div class="upload-wrap">
          <el-upload
            ref="$upload"
            :accept="PACKAGE_ACCEPTS.join(',')"
            drag
            :data="{
              package_type: $package,
              ocr: $ocr,
            }"
            :multiple="false"
            :action="getUploadUrl()"
            :on-change="handleFileUpload"
            :on-error="handleError"
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
            <div class="upload-footer">
              <website-url-upload
                ref="$websiteUpload"
                :upload-handle="uploadWebsite"
                @uploaded="handleWebsiteUploaded" />
            </div>
          </el-upload>
          <div v-if="$progress && !$isCollection">
            <span>0/1</span>
            <el-progress :percentage="$progress" />
          </div>
        </div>
        <div class="upload-wrap">
          <el-upload
            ref="$collectionUpload"
            v-model:file-list="$files"
            drag
            :accept="PACKAGE_ACCEPTS.join(',')"
            :data="{
              package_type: $package,
              collection_id: $collectionId,
              ocr: $ocr,
            }"
            :limit="FILE_LIMIT.COLLECTION_FILES_LIMIT"
            :multiple="true"
            :action="getUploadUrl()"
            :show-file-list="false"
            :on-exceed="handleExceed"
            :on-change="handleMultiFileChange"
            :on-progress="handleProgress"
            :on-error="handleError"
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
          <span>{{ FILE_LIMIT.MAX_PAGES }} pages/pdf</span>
          <span>{{ FILE_LIMIT.MAX_SIZE }} MB/file</span>
          <span>{{ FILE_LIMIT.COLLECTION_FILES_LIMIT }} files/collection</span>
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
import { getUploadUrl, createCollection, uploadWebsite } from '../apis/api.js';
import { useRouter } from 'vue-router';
import {
  validateFileType,
  validateFileSize,
  isNeedToValideSize,
} from '../utils/file.js';
import {
  FILE_LIMIT,
  PACKAGE_ACCEPTS,
  PACKAGE_TYPES,
  OCR_TYPES,
} from '../utils/constants.js';
import PackageSelect from '../components/PackageSelect.vue';
import WebsiteUrlUpload from '../components/WebsiteUrlUpload.vue';

const router = useRouter();
const $collectionUpload = ref(null);
const $upload = ref(null);
const $collectionId = ref('');
const $files = ref([]);
const $validatedFilesCount = ref(0);

const $progress = ref(0);
const $uploadFiles = ref(0);
const $loading = ref(false);
const $packageError = ref('');
const $websiteUpload = ref();

const $isCollection = computed(() => {
  return $files.value.length > 0;
});

const $package = ref('elite');
const $ocr = ref('disable');

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
  if (!isNeedToValideSize(file)) {
    $validatedFilesCount.value += 1;
    return true;
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

const handleError = (error) => {
  const { message, detail } = JSON.parse(error.message);
  clearData();
  if (message.includes('400')) {
    $packageError.value = detail || message;
  } else {
    ElMessage({
      message: detail || message,
      type: 'error',
    });
  }
};
const handleClick = () => {
  $packageError.value = '';
  $websiteUpload.value.hideUrlInput();
};

const handleWebsiteUploaded = ({ id }) => {
  router.push({ name: 'chat', params: { id } });
};

watch(() => $package.value, handleClick);

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
  align-items: center;
  height: 100%;
  overflow-y: auto;
  background: url('../assets/home-bg.png') no-repeat right bottom,
    linear-gradient(180deg, #f6faff 0%, #eaf3ff 100%);

  .header {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
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

  .package-wrap {
    position: relative;
    display: flex;
    justify-content: center;
    width: 100%;

    .error-tip {
      position: absolute;
      top: -135px;
      margin: 40px auto;
      margin-bottom: 76px;
      padding: 13px 16px;
      color: #f6ab2f;
      font-weight: 400;
      font-size: 14px;
      line-height: 24px;
      background: linear-gradient(
          0deg,
          rgba(246, 171, 47, 10%) 0%,
          rgba(246, 171, 47, 10%) 100%
        ),
        #fff;
      border-radius: 4px;
    }

    :deep(.ocr-select) {
      margin-left: 15px;

      .el-input__wrapper {
        width: 220px;
      }
    }
  }

  .upload-demo {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 750px;

    .upload-input {
      display: flex;

      .upload-wrap + .upload-wrap {
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

    :deep(.wrapper) {
      margin-bottom: 60px;
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

    .upload-footer {
      position: absolute;
      bottom: 0;
      display: flex;
      justify-content: center;
      width: 100%;
      padding: 12px 0;
      border-top: 1px solid var(--el-border-color-primary);
    }
  }
}
</style>
