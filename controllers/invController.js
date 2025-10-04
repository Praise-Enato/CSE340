const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invCont = {}

/* ***************************
 *  Inventory management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classificationList,
    errors: null,
  })
}

/* ***************************
 *  Deliver add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Deliver add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null,
  })
}

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

/* ***************************
 *  Create new classification
 * ************************** */
invCont.createClassification = async function (req, res) {
  const { classification_name } = req.body
  const nav = await utilities.getNav()

  const result = await invModel.addClassification(classification_name)

  if (result && result.rowCount) {
    req.flash("notice", `${classification_name} classification was added.`)
    const updatedNav = await utilities.getNav()
    return res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav: updatedNav,
      errors: null,
    })
  }

  req.flash("notice", "Sorry, the classification could not be added.")
  return res.status(500).render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    classification_name,
  })
}

/* ***************************
 *  Create new inventory item
 * ************************** */
invCont.createInventory = async function (req, res) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)
  const vehicleData = {
    ...req.body,
    inv_year: Number(req.body.inv_year),
    inv_price: Number(req.body.inv_price),
    inv_miles: Number(req.body.inv_miles),
    classification_id: Number(req.body.classification_id),
  }

  const result = await invModel.addInventory(vehicleData)

  if (result && result.rowCount) {
    req.flash("notice", `${vehicleData.inv_make} ${vehicleData.inv_model} was added.`)
    const updatedNav = await utilities.getNav()
    return res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav: updatedNav,
      errors: null,
    })
  }

  req.flash("notice", "Sorry, the vehicle could not be added.")
  return res.status(500).render("./inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null,
    ...req.body,
  })
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id, 10)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData && invData[0] && invData[0].inv_id) {
    return res.json(invData)
  }
  next(new Error("No data returned"))
}

module.exports = invCont
