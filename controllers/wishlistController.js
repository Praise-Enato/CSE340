const utilities = require("../utilities")
const wishlistModel = require("../models/wishlist-model")
const invModel = require("../models/inventory-model")

/**
 * Helper to render the vehicle detail page with common data.
 */
async function renderVehicleDetail(res, vehicle, { errors = null, isSaved = false, status = 200 } = {}) {
  const nav = await utilities.getNav()
  const detail = utilities.buildVehicleDetail(vehicle)
  const title = vehicle
    ? `${vehicle.inv_make} ${vehicle.inv_model} Details`
    : "Vehicle Not Found"

  return res.status(status).render("./inventory/detail", {
    title,
    nav,
    detail,
    vehicle,
    errors,
    isSaved,
    pageScripts: ["/js/wishlist.js"],
  })
}

const wishlistController = {}

wishlistController.buildWishlist = async function (req, res) {
  const nav = await utilities.getNav()
  const accountData = res.locals.accountData
  const wishlistItems = await wishlistModel.getWishlistByAccount(accountData.account_id)

  res.render("account/wishlist", {
    title: "My Wishlist",
    nav,
    errors: null,
    wishlistItems,
    pageScripts: ["/js/wishlist.js"],
  })
}

wishlistController.addToWishlist = async function (req, res) {
  const accountData = res.locals.accountData
  const accountId = Number(accountData.account_id)
  const invId = Number.parseInt(req.body.inv_id, 10)
  const redirectToDetail = req.body.redirectTo === "detail"

  const vehicle = await invModel.getVehicleById(invId)
  if (!vehicle) {
    req.flash("notice", "We couldn't find that vehicle.")
    return renderVehicleDetail(res, null, { status: 404 })
  }

  const existing = await wishlistModel.findWishlistEntry(accountId, invId)
  if (existing) {
    req.flash("notice", "This vehicle is already saved to your wishlist.")
    const destination = redirectToDetail ? `/inv/detail/${invId}` : "/wishlist"
    return res.redirect(destination)
  }

  const inserted = await wishlistModel.addWishlistItem(accountId, invId)

  if (inserted) {
    req.flash(
      "notice",
      `${vehicle.inv_make} ${vehicle.inv_model} was added to your wishlist.`
    )
    const destination = redirectToDetail ? `/inv/detail/${invId}` : "/wishlist"
    return res.redirect(destination)
  }

  req.flash("notice", "Sorry, we couldn't add this vehicle right now.")
  return renderVehicleDetail(res, vehicle, { status: 500, isSaved: false })
}

wishlistController.removeFromWishlist = async function (req, res) {
  const accountData = res.locals.accountData
  const accountId = Number(accountData.account_id)
  const invId = Number.parseInt(req.body.inv_id, 10)
  const redirectToDetail = req.body.redirectTo === "detail"

  const vehicle = await invModel.getVehicleById(invId)
  if (!vehicle) {
    req.flash("notice", "We couldn't find that vehicle.")
    return redirectToDetail ? res.redirect(`/inv/detail/${invId}`) : res.redirect("/wishlist")
  }

  const existing = await wishlistModel.findWishlistEntry(accountId, invId)
  if (!existing) {
    req.flash("notice", "This vehicle is not currently in your wishlist.")
    const destination = redirectToDetail ? `/inv/detail/${invId}` : "/wishlist"
    return res.redirect(destination)
  }

  const deleted = await wishlistModel.removeWishlistItem(accountId, invId)
  if (deleted) {
    req.flash(
      "notice",
      `${vehicle.inv_make} ${vehicle.inv_model} was removed from your wishlist.`
    )
    const destination = redirectToDetail ? `/inv/detail/${invId}` : "/wishlist"
    return res.redirect(destination)
  }

  req.flash("notice", "Sorry, we couldn't remove that vehicle right now.")
  if (redirectToDetail) {
    const isSaved = Boolean(existing)
    return renderVehicleDetail(res, vehicle, { status: 500, isSaved })
  }
  return res.redirect("/wishlist")
}

module.exports = wishlistController
