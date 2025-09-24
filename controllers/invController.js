const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = parseInt(req.params.classificationId, 10)
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data || [])
  const nav = await utilities.getNav()
  const className = (data && data[0]) ? data[0].classification_name : "Vehicles"
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build a single vehicle detail view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const invId = parseInt(req.params.invId, 10)
  const vehicle = await invModel.getVehicleById(invId)
  const nav = await utilities.getNav()
  const detail = utilities.buildVehicleDetail(vehicle)
  const pageTitle = vehicle
    ? `${vehicle.inv_make} ${vehicle.inv_model} Details`
    : "Vehicle Not Found"
  res.render("./inventory/detail", { title: pageTitle, nav, detail })
}

module.exports = invCont
