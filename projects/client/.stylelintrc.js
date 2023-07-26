module.exports = {
  extends: [
    'stylelint-config-rational-order',
    'stylelint-config-standard-scss',
    'stylelint-config-recommended-vue',
  ],
  plugins: ['stylelint-order', 'stylelint-prettier'],
  rules: {
    'prettier/prettier': true,
    'selector-pseudo-class-no-unknown': null,
    'no-empty-source': null,
    'no-descending-specificity': null,
    'at-rule-no-unknown': null,
    'font-family-no-missing-generic-family-keyword': null,
    'selector-type-no-unknown': null,
    'color-function-notation': null,
    'selector-class-pattern': null,
    'value-no-vendor-prefix': null,
    'block-no-empty': null,
    'value-keyword-case': null,
    'custom-property-pattern': null,
    'media-feature-range-notation': null,
  },
};
