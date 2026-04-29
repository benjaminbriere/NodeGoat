/// <reference types="Cypress" />

describe("/allocations behaviour", () => {
  "use strict";

  before(() => {
    cy.dbReset();
  });

  afterEach(() => {
    cy.visitPage("/logout");
  });

  it("Should redirect if the user has not logged in", () => {
    cy.visitPage("/allocations/1");
    cy.url().should("include", "login");
  });

  it("Should be accesible for a logged user", () => {
    cy.userSignIn();
    cy.visitPage("/allocations/1");
    cy.url().should("include", "allocations");
  });

  it("Should be an input", () => {
    cy.userSignIn();
    cy.visitPage("/allocations/1");
    cy.get("label[for='threshold']")
      .should("contain", "Stocks Threshold");

    cy.get("input[name='threshold']")
      .should("have.attr", "type", "number")
      .should("have.attr", "min", "0")
      .should("have.attr", "max", "99");
  });

  it("Should keep the allocation form scoped to the current user", () => {
    cy.userSignIn();
    cy.visitPage("/allocations/1");
    cy.get("form[role='search']")
      .should("have.attr", "action", "/allocations/1");
  });

  it("Should redirect the user with the selected threshold", () => {
    const threshold = 2;
    cy.userSignIn();
    cy.visitPage("/allocations/1");

    cy.get("input[name='threshold']")
      .clear()
      .type(threshold);

    cy.get("button[type='submit']")
      .click();

    cy.location().should((loc) => {
      expect(loc.search).to.eq(`?threshold=${threshold}`);
      expect(loc.pathname).to.eq("/allocations/1");
    });
  });

  it("Should keep the allocation form scoped to the current user after filtering", () => {
    const threshold = 25;
    cy.userSignIn();
    cy.visitPage("/allocations/1");

    cy.get("input[name='threshold']")
      .clear()
      .type(threshold);

    cy.get("button[type='submit']")
      .click();

    cy.get("form[role='search']")
      .should("have.attr", "action", "/allocations/1");
  });
});
