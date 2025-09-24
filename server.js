const path = require("path")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
require("dotenv").config()

const utilities = require("./utilities")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const errorRoute = require("./routes/errorRoute")

const app = express()
const port = process.env.PORT || 3000
const host = process.env.HOST || "http://localhost"

// Views & layouts
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

// Static
app.use(express.static(path.join(__dirname, "public")))

// Routes
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)     // /inv/type/:classificationId + /inv/detail/:invId
app.use("/test", errorRoute)        // /test/error-test → intentional 500

// 404 (must be last non-error middleware)
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

// Global error handler (must be before listen)
app.use(async (err, req, res, next) => {
  try {
    const nav = await utilities.getNav()
    const status = err.status || 500
    const message = status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?"
    console.error(`Error at "${req.originalUrl}":`, err.stack || err)
    res.status(status).render("errors/error", { title: status, message, nav })
  } catch (e) {
    console.error("Error while rendering error page:", e)
    res.status(500).send("A fatal error occurred while handling another error.")
  }
})

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
