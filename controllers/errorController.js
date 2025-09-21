/* Intentionally cause a 500 so middleware handles it */
async function cause500(req, res) {
  // Throwing here triggers the global error middleware
  throw new Error("Intentional 500 test error");
}

module.exports = { cause500 };
