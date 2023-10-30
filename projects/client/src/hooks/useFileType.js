import { computed } from 'vue';
const getExt = (name) => {
  return name.split('.').at(-1).toLowerCase();
};
export const useFileType = ($file) => {
  const $isPDF = computed(() => {
    return getExt($file.value.name) === 'pdf';
  });
  const $isEPUB = computed(() => {
    return getExt($file.value.name) === 'epub';
  });
  const $isTXT = computed(() => {
    return getExt($file.value.name) === 'txt';
  });
  const $isMD = computed(() => {
    return getExt($file.value.name) === 'md';
  });
  const $isHTML = computed(() => {
    return getExt($file.value.name) === 'html';
  });
  return {
    $isPDF,
    $isEPUB,
    $isMD,
    $isHTML,
    $isTXT,
  };
};
