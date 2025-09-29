/* ********************************
 * Account Controller
 * unit 4 deliver login activity
 * ******************************** */
 
// Needed Resources
const utilities = require("../utilities");
const accountModel = require("../models/account-model");

 /* ********************************
  * Deliver login view
  * unit 4 deliver login activity
  * ******************************** */
 
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ********************************
 * Deliver registration view
 * ******************************** */

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ********************************
 * Process Registration
 * ******************************** */

async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  );

  if (regResult && regResult.rowCount) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    return res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }

  req.flash("notice", "Sorry, the registration failed.");
  return res.status(501).render("account/register", {
    title: "Registration",
    nav,
    errors: null,
    account_firstname,
    account_lastname,
    account_email,
  });
}

module.exports = { buildLogin, buildRegister, registerAccount };
