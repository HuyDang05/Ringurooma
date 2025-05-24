describe('Appsmith Login Testing', () => {
  it('it logs in with existed user data', () => {
    
    //Mở trang login
    cy.visit('https://app.appsmith.com/app/application/login-682aa617963c41610a38412e'); 

    //Nhập email và password 
    cy.get('input.bp3-input[type="email"]').eq(0).type('abc@gmail.com');
    cy.get('input.bp3-input[type="password"]').eq(0).type('abcxyz');

    //mockup phản hồi từ server
    cy.intercept('POST', 'https://n8nbyphd.duckdns.org/webhook-test/618598ab-30d4-469a-b7ff-858196846813', {
        statusCode: 200,
        body: { userId: 'abc123' }, 
      }).as('loginRequest');

    //Nhấn nút login
    cy.get('button.bp3-button').contains('Log In').click({ force: true });
    cy.wait('@loginRequest');

    //Kiểm tra điều hướng
    cy.url().should('include', 'https://app.appsmith.com/app/application/home-6830c8fbb957923498a2c3b3');


  });
});
