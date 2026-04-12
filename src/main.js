import './style.css';
import './script.js';
import { db } from './firebase-init.js';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

console.log("[Firebase] Mission Control initialized.");

// Firebase Form Handling
const setupContactForm = () => {
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-contact-status]");
  const submitButton = document.querySelector("[data-contact-submit]");

  if (!form) {
    console.error("[Firebase] Contact form element NOT found in DOM.");
    return;
  }

  const setStatus = (message, tone = "idle") => {
    if (!status) return;
    status.textContent = message;
    if (tone === "idle") {
      delete status.dataset.status;
    } else {
      status.dataset.status = tone;
    }
    console.log(`[Firebase Status] ${message} (${tone})`);
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("[Firebase] Submission sequence initiated.");

    if (!form.reportValidity()) {
      setStatus("Please complete the required fields.", "error");
      return;
    }

    const formData = new FormData(form);

    // Honeypot check
    if (String(formData.get("website") || "").trim()) {
      setStatus("Transmission blocked (Honeypot).", "error");
      return;
    }

    const originalLabel = submitButton?.textContent || "Send message";
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Transmitting...";
    }

    // Diagnostic Timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Transmission timeout after 15s")), 15000)
    );

    try {
      const submissionData = {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        organization: String(formData.get("organization") || "").trim(),
        projectType: String(formData.get("projectType") || "").trim(),
        message: String(formData.get("message") || "").trim(),
        source: window.location.href.substring(0, 300), // Enforce 300 char limit from rules
        submittedAt: serverTimestamp(),
      };

      console.log("[Firebase] Sending data payload:", submissionData);

      // Race the submission against our custom timeout
      await Promise.race([
        addDoc(collection(db, "contactSubmissions"), submissionData),
        timeoutPromise
      ]);

      console.log("[Firebase] Transmission successful. Document created.");
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
      }, 3000);
    } catch (error) {
      console.error("[Firebase] Submission ERROR:", error);
      
      let errorMessage = "Transmission failed. ";
      if (error.message.includes("timeout")) {
        errorMessage += "The server took too long to respond. Please check your internet connection.";
      } else if (error.code === "permission-denied") {
        errorMessage += "Permission denied. Check Firestore security rules.";
      } else {
        errorMessage += "Please try again later.";
      }

      setStatus(errorMessage, "error");
      
      if (submitButton) {
        submitButton.textContent = originalLabel;
        submitButton.disabled = false;
      }
    }
  });
};

// Initialize immediately in Vite module
setupContactForm();
