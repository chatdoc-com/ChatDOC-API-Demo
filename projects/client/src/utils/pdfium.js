import wasmUrl from '@paodingai/pdflux-wasm-trial/lib/node/pdflux.wasm?url';
export let DocManager = null;
let wasmPromise = null;
const loadWasm = async () => {
  ({ DocManager } = await import('@paodingai/pdflux-wasm-trial/index'));
};
export const loadDoc = async (docData, password = '') => {
  if (!wasmPromise) {
    wasmPromise = loadWasm();
  }
  await wasmPromise;
  await DocManager.preloadWasmModule({
    locateFile() {
      return wasmUrl;
    },
    isDesktopEnv: false,
    disableExternalFont: false,
    maxWasmMemory: 3000 * 1024 * 1024,
    token: 'KncbNhJ7SmtoQVAzc3laZAchAGlwEQVqaWNPd1ptQHs3',
  });
  return DocManager.loadDocument({
    data: docData,
    disableExternalFont: false,
    enableLoadLinearizedPdf: true,
    enableWordSegmentation: true,
    isDesktopEnv: false,
    isRangeSupported: false,
    password,
  });
};
