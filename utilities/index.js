const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

module.exports = Util


/* ************************
 * Constructs a classification select element
 ************************** */
Util.buildClassificationList = async function (classification_id = null) {
  const data = await invModel.getClassifications()
  let list = '<select name="classification_id" id="classificationList" required>'
  list += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    list += `<option value="${row.classification_id}"${
      classification_id && Number(classification_id) === row.classification_id
        ? " selected"
        : ""
    }>${row.classification_name}</option>`
  })
  list += "</select>"
  return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid = ''
  if (data && data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + ' details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


/* **************************************
 * Build the vehicle detail HTML (mobile-first)
 * ************************************ */
Util.buildVehicleDetail = function(vehicle) {
  if (!vehicle) {
    return '<p class="notice">Vehicle not found.</p>';
  }

  // price: USD currency; miles: comma separated
  const priceUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                    .format(vehicle.inv_price);
  const milesFmt = new Intl.NumberFormat('en-US').format(vehicle.inv_miles);

  return `
  <article class="vehicle-detail">
    <div class="vehicle-media">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
    </div>

    <div class="vehicle-info">
      <h2 class="vehicle-title">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
      <p class="vehicle-price"><strong>Price:</strong> ${priceUSD}</p>
      <ul class="vehicle-meta">
        <li><strong>Make:</strong> ${vehicle.inv_make}</li>
        <li><strong>Model:</strong> ${vehicle.inv_model}</li>
        <li><strong>Year:</strong> ${vehicle.inv_year}</li>
        <li><strong>Mileage:</strong> ${milesFmt} miles</li>
        <li><strong>Color:</strong> ${vehicle.inv_color}</li>
        <li><strong>Category:</strong> ${vehicle.classification_name}</li>
      </ul>
      <div class="vehicle-desc">
        <h3>Description</h3>
        <p>${vehicle.inv_description}</p>
      </div>
    </div>
  </article>`;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
