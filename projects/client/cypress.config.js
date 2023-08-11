const { defineConfig } = require('cypress');

module.exports = defineConfig({
  // viewportWidth: 1280,
  // viewportHeight: 720,
  viewportWidth: 1920,
  viewportHeight: 1080,
  video: false,
  chromeWebSecurity: false,
  e2e: {
    // setupNodeEvents(on, config) {
    //   // implement node event listeners here
    // },
  },
});
