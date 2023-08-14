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
    cy.url()
      .should('include', '/chat')
      .get('[data-test="sdk-container"] iframe')
      .should('be.visible')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .find('.page[data-page-number="1"]')
      .should('have.attr', 'data-loaded', 'true')
      .should('be.visible')
      .find('canvas')
      .should('be.visible')
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
      .click()
      // Material content visible
      .then(() => {
        return cy.get('[data-test="material-content"]');
      })
      .should('be.visible')
      // Find the question input box and enter the content
      .then(() => {
        return cy.get('[data-test="question-container-input"]');
      })
      .should('be.visible')
      .type('Summary in one sentence')
      // Find the submit button for the question and click it
      .then(() => {
        return cy.get('[data-test="submit-question-button"]');
      })
      .should('be.visible')
      .click()
      // Find the first chat in the chat list
      .then(() => {
        cy.get('[data-test="chat-list"] [data-test="chat-item"]:first-child');
      })
      .should('be.visible')
      // Check the content of the answer
      .then(($firstChatItem) => {
        return $firstChatItem.find('[data-test="answer-message"]');
      })
      .should('not.be.empty');
  });
});
