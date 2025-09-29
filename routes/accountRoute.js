/* ********************************
 * Account Routes
 * unit 4 deliver login activity
 * ******************************** */


const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation");

/* ********************************
 * Deliver login view
 * unit 4 deliver login activity
 * ******************************** */

router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
);

router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

/* ********************************
 * Process registration
 * ******************************** */

router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

/* ********************************
 * Process the login attempt
 * ******************************** */

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  (req, res) => {
    res.status(200).send("login process")
  }
);


module.exports = router;
