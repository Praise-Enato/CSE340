const { body, validationResult } = require("express-validator")
const utilities = require(".")
const invModel = require("../models/inventory-model")
const wishlistModel = require("../models/wishlist-model")

const wishlistValidate = {}

wishlistValidate.itemRules = () => {
  return [
    body("inv_id")
      .trim()
      .notEmpty()
      .withMessage("Vehicle information is required.")
      .bail()
      .isInt({ min: 1 })
      .withMessage("Vehicle information is invalid."),
    body("redirectTo")
      .optional()
      .trim()
      .isIn(["detail", "wishlist"])
      .withMessage("Invalid redirect option."),
  ]
}

wishlistValidate.checkAddData = async (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }

  try {
    const invId = Number.parseInt(req.body.inv_id, 10)
    const vehicle = Number.isInteger(invId) ? await invModel.getVehicleById(invId) : null
    const nav = await utilities.getNav()
    const detail = utilities.buildVehicleDetail(vehicle)
    const title = vehicle
      ? `${vehicle.inv_make} ${vehicle.inv_model} Details`
      : "Vehicle Not Found"
    const isSaved =
      vehicle && res.locals.accountData
        ? Boolean(
            await wishlistModel.findWishlistEntry(
              res.locals.accountData.account_id,
              vehicle.inv_id
            )
          )
        : false

    return res.status(400).render("./inventory/detail", {
      title,
      nav,
      detail,
      vehicle,
      errors,
      isSaved,
      pageScripts: ["/js/wishlist.js"],
    })
  } catch (error) {
    return next(error)
  }
}

wishlistValidate.checkRemoveData = async (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }

  try {
    const redirectToDetail = req.body.redirectTo === "detail"
    const invId = Number.parseInt(req.body.inv_id, 10)

    if (redirectToDetail) {
      const vehicle = Number.isInteger(invId) ? await invModel.getVehicleById(invId) : null
      const nav = await utilities.getNav()
      const detail = utilities.buildVehicleDetail(vehicle)
      const title = vehicle
        ? `${vehicle.inv_make} ${vehicle.inv_model} Details`
        : "Vehicle Not Found"
      const isSaved =
        vehicle && res.locals.accountData
          ? Boolean(
              await wishlistModel.findWishlistEntry(
                res.locals.accountData.account_id,
                vehicle.inv_id
              )
            )
          : false

      return res.status(400).render("./inventory/detail", {
        title,
        nav,
        detail,
        vehicle,
        errors,
        isSaved,
        pageScripts: ["/js/wishlist.js"],
      })
    }

    req.flash("notice", "We couldn't process that request.")
    return res.redirect("/wishlist")
  } catch (error) {
    return next(error)
  }
}

module.exports = wishlistValidate
