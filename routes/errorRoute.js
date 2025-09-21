const express = require("express");
const router = new express.Router();
const { cause500 } = require("../controllers/errorController");
const utilities = require("../utilities");

router.get("/error-test", utilities.handleErrors(cause500));

module.exports = router;
