/* ********************************
 * Account Routes
 * unit 4 deliver login activity
 * ******************************** */


const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require("../utilities/account-validation")

/* ********************************
 * Deliver login view
 * unit 4 deliver login activity
 * ******************************** */

router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

/* ********************************
 * Default account management route
 * ******************************** */

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)

router.get(
  "/update/:accountId",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountUpdate)
)

/* ********************************
 * Process registration
 * ******************************** */

router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

/* ********************************
 * Process the login attempt
 * ******************************** */

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

/* ********************************
 * Process account update
 * ******************************** */

router.post(
  "/update",
  utilities.checkLogin,
  regValidate.accountUpdateRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

/* ********************************
 * Process password change
 * ******************************** */

router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

router.get(
  "/logout",
  utilities.checkLogin,
  utilities.handleErrors(accountController.logoutAccount)
)


module.exports = router
