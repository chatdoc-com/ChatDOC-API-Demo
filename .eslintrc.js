module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
    "cypress/globals": true,
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly',
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/prettier',
  ],
  plugins: ['vue', 'cypress'],
  rules: {
    curly: ['error', 'all'],
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
    'vue/multi-word-component-names': 0,
    'vue/multiline-html-element-content-newline': [
      'error',
      {
        ignoreWhenEmpty: true,
        ignores: ['pre', 'textarea'],
        allowEmptyLines: true,
      },
    ],
    'vue/no-template-target-blank': [
      'error',
      {
        allowReferrer: true,
        enforceDynamicLinks: 'always',
      },
    ],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'any',
          normal: 'any',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'vue/custom-event-name-casing': [
      'error',
      'camelCase',
      {
        ignores: [],
      },
    ],
  },
};
