import './style.css';
import './script.js';
import { db } from './firebase-init.js';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Firebase Form Handling (Refactored from index.html)
const setupContactForm = () => {
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-contact-status]");
  const submitButton = document.querySelector("[data-contact-submit]");

  const setStatus = (message, tone = "idle") => {
    if (!status) return;
    status.textContent = message;
    if (tone === "idle") {
      delete status.dataset.status;
    } else {
      status.dataset.status = tone;
    }
  };

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.reportValidity()) {
        setStatus("Please complete the required fields before sending.", "error");
        return;
      }

      const formData = new FormData(form);

      // Honeypot check
      if (String(formData.get("website") || "").trim()) {
        setStatus("Transmission blocked.", "error");
        return;
      }

      const originalLabel = submitButton?.textContent || "Send message";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Transmitting...";
      }

      try {
        await addDoc(collection(db, "contactSubmissions"), {
          name: String(formData.get("name") || "").trim(),
          email: String(formData.get("email") || "").trim(),
          organization: String(formData.get("organization") || "").trim(),
          projectType: String(formData.get("projectType") || "").trim(),
          message: String(formData.get("message") || "").trim(),
          source: window.location.href,
          submittedAt: serverTimestamp(),
        });

        form.reset();
        setStatus("Transmission received. I'll get back to you soon.", "success");

        if (submitButton) {
          submitButton.textContent = "Transmission Sent!";
        }

        window.setTimeout(() => {
          if (submitButton) {
            submitButton.textContent = originalLabel;
            submitButton.disabled = false;
          }
        }, 2200);
      } catch (error) {
        console.error("Submission error:", error);
        setStatus("Transmission failed. Please try again later.", "error");
        if (submitButton) {
          submitButton.textContent = originalLabel;
          submitButton.disabled = false;
        }
      }
    });
  }
};

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  setupContactForm();
});
