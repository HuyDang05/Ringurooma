describe('Appsmith SignUp Testing', () => {
  it('tests sign up function', () => {
    
    //Mở trang Signup
    cy.visit('https://app.appsmith.com/app/application/sign-up-683015e298214916b7c6f5ae'); 

    //Nhập email và password 
    cy.get('input.bp3-input[type="email"]', { timeout: 10000 }).eq(0).type('abc@gmail.com');
    cy.get('input.bp3-input[type="password"]').eq(0).type('abcxyz');

    //mockup phản hồi từ server
    cy.intercept('POST', 'https://n8nbyphd.duckdns.org/webhook-test/c33c04d1-13f8-4a7c-b5be-13274c27a024', {
        statusCode: 200,
        body: {}, 
      }).as('signUpRequest');

    //Nhấn nút sign up
    cy.get('button.bp3-button').contains('Sign up').click({ force: true });
    cy.wait('@signUpRequest');

    //Kiểm tra điều hướng
    cy.url().should('include', 'https://app.appsmith.com/app/application/login-682aa617963c41610a38412e');


  });
});
