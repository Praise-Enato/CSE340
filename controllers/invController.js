const invModel = require("../models/inventory-model")
const wishlistModel = require("../models/wishlist-model")
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

  let isSaved = false
  if (vehicle && res.locals.loggedin && res.locals.accountData) {
    const accountId = Number(res.locals.accountData.account_id)
    const existing = await wishlistModel.findWishlistEntry(accountId, vehicle.inv_id)
    isSaved = Boolean(existing)
  }

  res.render("./inventory/detail", {
    title: pageTitle,
    nav,
    detail,
    vehicle,
    errors: null,
    isSaved,
    pageScripts: ["/js/wishlist.js"],
  })
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

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id, 10)
  const nav = await utilities.getNav()

  const itemData = await invModel.getVehicleById(inv_id)
  if (!itemData) {
    req.flash("notice", "Vehicle not found.")
    return res.redirect("/inv")
  }

  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`.trim()
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    parseInt(inv_id, 10),
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    Number(inv_price),
    Number(inv_year),
    Number(inv_miles),
    inv_color,
    Number(classification_id)
  )

  if (updateResult) {
    const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`.trim()
    req.flash("notice", `The ${itemName} was successfully updated.`)
    return res.redirect("/inv/")
  }

  const classificationSelect = await utilities.buildClassificationList(classification_id)
  const itemName = `${inv_make || ""} ${inv_model || ""}`.trim()
  req.flash("notice", "Sorry, the update failed.")
  return res.status(501).render("./inventory/edit-inventory", {
    title: itemName ? "Edit " + itemName : "Edit Vehicle",
    nav,
    classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  })
}

/* ***************************
 *  Build delete inventory confirmation view
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id, 10)
  if (Number.isNaN(inv_id)) {
    req.flash("notice", "Invalid vehicle identifier.")
    return res.redirect("/inv")
  }
  const nav = await utilities.getNav()

  const itemData = await invModel.getVehicleById(inv_id)
  if (!itemData) {
    req.flash("notice", "Vehicle not found.")
    return res.redirect("/inv")
  }

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`.trim()
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ***************************
 *  Delete inventory item
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id, 10)
  if (Number.isNaN(inv_id)) {
    req.flash("notice", "Invalid vehicle identifier.")
    return res.redirect("/inv")
  }
  const itemName = `${req.body.inv_make || ""} ${req.body.inv_model || ""}`.trim()
  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult && deleteResult.rowCount) {
    const displayName = itemName || "vehicle"
    req.flash("notice", `The ${displayName} was successfully deleted.`)
    return res.redirect("/inv/")
  }

  req.flash("notice", "Sorry, the delete failed.")
  return res.redirect(`/inv/delete/${inv_id}`)
}

module.exports = invCont
