import './style.css';
import './script.js';
import { db } from './firebase-init.js';
import { collection, addDoc, serverTimestamp, getDocs, limit, query } from "firebase/firestore";

console.log("[Firebase] Mission Control initialized.");

/**
 * Diagnostic "Ping": Verifies if the Firestore database is reachable
 * by attempting a very small read from any collection.
 */
const runDatabasePing = async () => {
  console.log("[Firebase-Ping] Attempting database handshake...");
  try {
    const q = query(collection(db, "contactSubmissions"), limit(1));
    await getDocs(q);
    console.log("[Firebase-Ping] Handshake SUCCESSFUL. Database is reachable.");
  } catch (error) {
    console.warn("[Firebase-Ping] Handshake STALLED or FAILED. This usually means the database isn't initialized or network is blocked.", error);
  }
};

runDatabasePing();

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
    console.clear();
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

    // Diagnostic Timeout (increased to 25s for deep diagnosis)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Transmission timeout after 25s")), 25000)
    );

    try {
      // STRICT DATA VERIFICATION: 
      // Firestore rules are sensitive. We ensure every field is a string and limited in length.
      const submissionData = {
        name: String(formData.get("name") || "Unknown").substring(0, 80).trim(),
        email: String(formData.get("email") || "no-reply@error.com").substring(0, 120).trim(),
        organization: String(formData.get("organization") || "N/A").substring(0, 120).trim(),
        projectType: String(formData.get("projectType") || "Other").substring(0, 40).trim(),
        message: String(formData.get("message") || "No message provided").substring(0, 1500).trim(),
        source: String(window.location.href).substring(0, 300),
        submittedAt: serverTimestamp(),
      };

      console.log("[Firebase] Preparing payload for 'contactSubmissions'...", submissionData);

      // Race the submission against our custom timeout
      const docRef = await Promise.race([
        addDoc(collection(db, "contactSubmissions"), submissionData),
        timeoutPromise
      ]);

      console.log("[Firebase] Transmission SUCCESSFUL. Doc ID:", docRef.id);
      form.reset();
      setStatus("Transmission received. Document logged in Firestore.", "success");

      if (submitButton) {
        submitButton.textContent = "Transmission Sent!";
      }

      window.setTimeout(() => {
        if (submitButton) {
          submitButton.textContent = originalLabel;
          submitButton.disabled = false;
        }
      }, 4000);
    } catch (error) {
      console.error("[Firebase] CRITICAL ERROR during submission:", error);
      
      let errorMessage = "Transmission failed. ";
      if (error.message && error.message.includes("timeout")) {
        errorMessage += "The connection timed out. Check your internet or ad-blocker.";
      } else if (error.code === "permission-denied") {
        errorMessage += "Permission Denied. Verify collection name and security rules schema.";
      } else if (error.code === "not-found") {
        errorMessage += "Database not found. Check your Project ID in config.";
      } else {
        errorMessage += error.message || "Please check the console for logs.";
      }

      setStatus(errorMessage, "error");
      
      if (submitButton) {
        submitButton.textContent = originalLabel;
        submitButton.disabled = false;
      }
    }
  });
};

// Initialize immediately
setupContactForm();
