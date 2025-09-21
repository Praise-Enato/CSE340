// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");

// Inventory by classification
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Vehicle detail by id
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInvId)
);

module.exports = router;
