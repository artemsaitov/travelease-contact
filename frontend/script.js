const API_ENDPOINT = "https://fbtxzrrrn4.execute-api.us-east-1.amazonaws.com/submit";

const form = document.getElementById("contactForm");
const submitButton = document.getElementById("submitButton");
const formMessage = document.getElementById("formMessage");

function showMessage(type, message) {
  formMessage.className = `form-message ${type}`;
  formMessage.textContent = message;
}

function clearMessage() {
  formMessage.className = "form-message";
  formMessage.textContent = "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  clearMessage();

  const formData = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    destination: document.getElementById("destination").value.trim(),
    message: document.getElementById("message").value.trim()
  };

  if (!formData.name || !formData.email || !formData.message) {
    showMessage("error", "Please complete all required fields.");
    return;
  }

  if (!isValidEmail(formData.email)) {
    showMessage("error", "Please enter a valid email address.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Something went wrong. Please try again.");
    }

    showMessage(
      "success",
      `Thank you, ${formData.name}. Your inquiry was submitted successfully. Reference ID: ${result.referenceId}`
    );

    form.reset();
  } catch (error) {
    console.error("Form submission error:", error);
    showMessage(
      "error",
      "We could not submit your inquiry at this time. Please try again later."
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit Inquiry";
  }
});