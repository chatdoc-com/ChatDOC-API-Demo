const uploadUrl = 'https://localhost:5173/#/upload';

describe('Upload files and chat.', async () => {
  it('Single file upload and chat should be successful.', async () => {
    // Upload the file page
    cy.visit(uploadUrl);

    // Upload file
    cy.fixture('test.pdf', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((fileContent) => {
        cy.get('.el-upload:first .el-upload__input').attachFile({
          fileContent,
          filePath: 'test.pdf',
          encoding: 'utf-8',
          lastModified: new Date().getTime(),
        });
      });

    // Chat page
    // Find the first page of the PDF
    cy.wait(5000)
      .get('.pdf-viewer-js-sdk-iframe')
      .should('be.visible')
      .then(($iframe) => {
        return cy
          .wrap($iframe)
          .its('0.contentDocument.body')
          .should('not.be.empty');
      })
      .then(cy.wrap)
      .wait(200)
      .find('.page[data-page-number="1"]')
      .should('be.visible')
      .then(cy.wrap)
      .find('canvas')
      .should('be.visible')
      .then(cy.wrap)
      .wait(200)

      // Simulate user mouse movement.
      .trigger('mousemove', { which: 1, offsetX: 200, offsetY: 270 })
      .trigger('mousemove', { which: 1, offsetX: 202, offsetY: 272 })
      .trigger('mousemove', { which: 1, offsetX: 200, offsetY: 270 })

      .trigger('mousemove', { which: 1, offsetX: 430, offsetY: 710 })
      .trigger('mousemove', { which: 1, offsetX: 433, offsetY: 713 })
      .trigger('mousemove', { which: 1, offsetX: 435, offsetY: 215 })

      // Find the chat icon and click
      .closest('.pdf-document-viewer')
      .then((pdfContainer) => {
        return pdfContainer.children('.dissociative');
      })
      .should('be.visible')
      .then(cy.wrap)
      .wait(200)
      .click()
      // Material content visible
      .then(() => {
        return cy.get('.material-content');
      })
      .should('be.visible')

      // Find the question input box and enter the content
      .then(() => {
        return cy.get('.question-container textarea');
      })
      .should('be.visible')
      .then(cy.wrap)
      .type('Summary in one sentence')

      // Find the submit button for the question and click it
      .then(() => {
        return cy.get('.submit-question-icon');
      })
      .should('be.visible')
      .then(cy.wrap)
      .closest('.input-handler-icon')
      .should('be.visible')
      .then(($el) => {
        return cy.wrap($el);
      })
      .click()

      // Find the first chat in the chat list
      .then(() => {
        cy.get('.chat-list .chat-item:first-child');
      })
      .should('be.visible')
      .wait(10)

      // Check the content of the answer
      .then(($firstChatItem) => {
        return $firstChatItem.find('.answer .message');
      })
      .then(cy.wrap)
      .should('not.be.empty');
  });
});
