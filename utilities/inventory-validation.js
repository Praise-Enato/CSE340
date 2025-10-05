const utilities = require(".")
const { body, validationResult } = require("express-validator")

const invValidate = {}

/* **********************************
 *  Classification Data Validation Rules
 * ********************************* */
invValidate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name must not contain spaces or special characters."),
  ]
}

/* ******************************
 *  Check classification data
 * ***************************** */
invValidate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
    })
  }
  next()
}

/* **********************************
 *  Inventory Data Validation Rules
 * ********************************* */
invValidate.inventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Please select a classification.")
      .isInt({ min: 1 })
      .withMessage("Classification selection is invalid."),
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide the vehicle make."),
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide the vehicle model."),
    body("inv_year")
      .trim()
      .notEmpty()
      .withMessage("Please provide the vehicle year.")
      .isInt({ min: 1900, max: 9999 })
      .withMessage("Please provide a valid year."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Please provide a description."),
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an image path."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a thumbnail path."),
    body("inv_price")
      .trim()
      .notEmpty()
      .withMessage("Please provide a price.")
      .isFloat({ min: 0 })
      .withMessage("Please provide a positive price."),
    body("inv_miles")
      .trim()
      .notEmpty()
      .withMessage("Please provide mileage.")
      .isInt({ min: 0 })
      .withMessage("Please provide valid mileage."),
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a color."),
  ]
}

invValidate.newInventoryRules = invValidate.inventoryRules

/* ******************************
 *  Check inventory data
 * ***************************** */
invValidate.checkInventoryData = async (req, res, next) => {
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    return res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors,
      ...req.body,
    })
  }
  next()
}

/* ******************************
 *  Check update inventory data (edit view)
 * ***************************** */
invValidate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  const {
    inv_id,
    classification_id,
    inv_make,
    inv_model,
  } = req.body

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make || ""} ${inv_model || ""}`.trim()
    return res.render("./inventory/edit-inventory", {
      title: itemName ? `Edit ${itemName}` : "Edit Vehicle",
      nav,
      classificationSelect,
      errors,
      ...req.body,
      inv_id,
    })
  }
  next()
}

module.exports = invValidate
