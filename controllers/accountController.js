/* ********************************
 * Account Controller
 * unit 4 deliver login activity
 * ******************************** */

// Needed Resources
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()

 /* ********************************
  * Deliver login view
  * unit 4 deliver login activity
  * ******************************** */
 
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ********************************
 * Deliver registration view
 * ******************************** */

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ********************************
 * Process Registration
 * ******************************** */

async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult && regResult.rowCount) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      )
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("registerAccount error:", error)
  }

  req.flash("notice", "Sorry, the registration failed.")
  return res.status(501).render("account/register", {
    title: "Registration",
    nav,
    errors: null,
    account_firstname,
    account_lastname,
    account_email,
  })
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      )
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error("Access Forbidden")
  }
}

/* ***************************************
 *  Deliver account management view
 * ************************************* */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    accountData: res.locals.accountData,
  })
}

/* ***************************************
 *  Deliver account update view
 * ************************************* */
async function buildAccountUpdate(req, res) {
  const accountId = parseInt(req.params.accountId, 10)
  const loggedAccount = res.locals.accountData

  if (!loggedAccount || Number(loggedAccount.account_id) !== accountId) {
    req.flash("notice", "You do not have permission to update that account.")
    return res.redirect("/account/")
  }

  const accountData = await accountModel.getAccountById(accountId)

  if (!accountData) {
    req.flash("notice", "Account not found.")
    return res.redirect("/account/")
  }

  const nav = await utilities.getNav()
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    passwordErrors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id,
  })
}

/* ***************************************
 *  Process account update
 * ************************************* */
async function updateAccount(req, res) {
  const accountId = parseInt(req.body.account_id, 10)
  const loggedAccount = res.locals.accountData

  if (!loggedAccount || Number(loggedAccount.account_id) !== accountId) {
    req.flash("notice", "You do not have permission to update that account.")
    return res.redirect("/account/login")
  }

  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email } = req.body

  const updateResult = await accountModel.updateAccount({
    account_firstname,
    account_lastname,
    account_email,
    account_id: accountId,
  })

  if (updateResult && updateResult.account_id) {
    const tokenAccountData = {
      account_id: updateResult.account_id,
      account_firstname: updateResult.account_firstname,
      account_lastname: updateResult.account_lastname,
      account_email: updateResult.account_email,
      account_type: updateResult.account_type,
    }

    const accessToken = jwt.sign(
      tokenAccountData,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 3600 * 1000 }
    )

    const cookieOptions =
      process.env.NODE_ENV === "development"
        ? { httpOnly: true, maxAge: 3600 * 1000 }
        : { httpOnly: true, secure: true, maxAge: 3600 * 1000 }

    res.cookie("jwt", accessToken, cookieOptions)
    res.locals.accountData = tokenAccountData

    req.flash("notice", "Account information updated successfully.")
    return res.redirect("/account/")
  }

  req.flash("notice", "Sorry, the account update failed.")
  return res.status(500).render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    passwordErrors: null,
    account_firstname,
    account_lastname,
    account_email,
    account_id: accountId,
  })
}

/* ***************************************
 *  Process password update
 * ************************************* */
async function updatePassword(req, res) {
  const accountId = parseInt(req.body.account_id, 10)
  const loggedAccount = res.locals.accountData

  if (!loggedAccount || Number(loggedAccount.account_id) !== accountId) {
    req.flash("notice", "You do not have permission to update that account.")
    return res.redirect("/account/login")
  }

  const nav = await utilities.getNav()
  const { account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const updateResult = await accountModel.updateAccountPassword(accountId, hashedPassword)

    if (updateResult && updateResult > 0) {
      req.flash("notice", "Password updated successfully.")
      return res.redirect("/account/")
    }

    req.flash("notice", "Sorry, the password update failed.")
  } catch (error) {
    console.error("Password update error:", error)
    req.flash("notice", "Sorry, the password update failed.")
  }

  const accountData = await accountModel.getAccountById(accountId)

  return res.status(500).render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    passwordErrors: null,
    account_firstname: accountData ? accountData.account_firstname : "",
    account_lastname: accountData ? accountData.account_lastname : "",
    account_email: accountData ? accountData.account_email : "",
    account_id: accountId,
  })
}

/* ***************************************
 *  Process logout
 * ************************************* */
async function logoutAccount(req, res) {
  res.clearCookie("jwt")
  res.locals.accountData = null
  res.locals.loggedin = 0
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildAccountUpdate,
  updateAccount,
  updatePassword,
  logoutAccount,
}
