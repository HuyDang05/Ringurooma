describe('Appsmith Change Information Testing', () => {
  it('Change Bio and Custom Chat in profile', () => {
    
    //Mở trang login
    cy.visit('https://app.appsmith.com/app/application/login-682aa617963c41610a38412e'); 

    //Nhập email và password 
    cy.get('input.bp3-input[type="email"]', { timeout: 10000 }).eq(0).type('abc@gmail.com');
    cy.get('input.bp3-input[type="password"]').eq(0).type('abcxyz');

    //mockup phản hồi từ server
    cy.intercept('POST', 'https://n8nbyphd.duckdns.org/webhook-test/618598ab-30d4-469a-b7ff-858196846813', {
        statusCode: 200,
        body: { userId: '123' }, 
      }).as('loginRequest');

    //Nhấn nút login
    cy.get('button.bp3-button').contains('Log In').click({ force: true });
    cy.wait('@loginRequest');

    //Kiểm tra điều hướng
    cy.url().should('include', 'https://app.appsmith.com/app/application/home-6830c8fbb957923498a2c3b3');

    //Nhấn nút mở profile
    cy.get('button.bp3-button').contains('Profile').click({ force: true });
    
    //Cập nhật thông tin và tùy chỉnh
    cy.get('textarea[placeholder="Introduction about yourself"]').type('Xin chào, Tôi là Minh');
    cy.get('textarea[placeholder="Customize how you want your assistant to responce here"]')
    .type('Hãy phản hồi bằng tiếng Nhật');

    //Mockup phản hồi từ server
    cy.intercept('POST', 'https://n8nbyphd.duckdns.org/webhook-test/5beedbc7-26e3-4620-acc3-ce2400f0b9b2', {
        statusCode: 200,
        body: { }, 
      }).as('checkSuccess');

    //Nhấn confirm
    cy.get('button.bp3-button').contains('Confirm').click({ force: true });
    cy.wait('@checkSuccess');

    //Kiểm tra điều hướng
    cy.url().should('include', 'https://app.appsmith.com/app/application/home-6830c8fbb957923498a2c3b3');

  });
});
