const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const wishlistController = require("../controllers/wishlistController")
const wishlistValidate = require("../utilities/wishlist-validation")

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(wishlistController.buildWishlist)
)

router.post(
  "/add",
  utilities.checkLogin,
  wishlistValidate.itemRules(),
  wishlistValidate.checkAddData,
  utilities.handleErrors(wishlistController.addToWishlist)
)

router.post(
  "/remove",
  utilities.checkLogin,
  wishlistValidate.itemRules(),
  wishlistValidate.checkRemoveData,
  utilities.handleErrors(wishlistController.removeFromWishlist)
)

module.exports = router
