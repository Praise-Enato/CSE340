document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("[data-wishlist-form]")

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      const invInput = form.querySelector("input[name='inv_id']")
      const errorContainer = form.querySelector("[data-error]")
      let errorMessage = ""

      if (!invInput || invInput.value.trim() === "") {
        errorMessage = "Vehicle information is required."
      } else {
        const numericValue = Number(invInput.value)
        if (!Number.isInteger(numericValue) || numericValue <= 0) {
          errorMessage = "Vehicle information is invalid."
        }
      }

      if (errorMessage) {
        event.preventDefault()
        if (errorContainer) {
          errorContainer.textContent = errorMessage
          errorContainer.hidden = false
        }
      } else if (errorContainer) {
        errorContainer.textContent = ""
        errorContainer.hidden = true
      }
    })
  })
})
