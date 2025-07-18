/**
 * TECH FOR GIRLS REGISTRATION FORM
 * 
 * This script handles:
 * 1. Form validation
 * 2. WhatsApp sharing functionality
 * 3. Google Sheets integration
 * 4. UI feedback and state management
 */

// ====================== CONSTANTS & CONFIGURATION ======================

const CONFIG = {
  maxSharesRequired: 5,
  whatsappMessage: "Join Tech For Girls! 🚀 A community for women in tech. Register now: [YOUR_REGISTRATION_URL]",
  googleScriptUrl: "https://script.google.com/macros/s/AKfycbxcff4F1yeqm3JzXWKFkeSLI78IIY1S1bEMuaAPrv_PuTKtF-o-uPWkRWGwAEKPacyqKg/exec",
  localStorageKey: "techForGirlsSubmission",
  sheetHeaders: ["Timestamp", "Name", "Phone", "Email", "Department", "Shares Completed", "Screenshot URL"]
};
// ====================== DOM ELEMENTS ======================
const dom = {
  form: document.getElementById("registrationForm"),
  nameInput: document.getElementById("name"),
  phoneInput: document.getElementById("phone"),
  emailInput: document.getElementById("email"),
  departmentSelect: document.getElementById("department"),
  whatsappBtn: document.getElementById("whatsappShareBtn"),
  shareCounter: document.getElementById("shareCounter"),
  shareMessage: document.getElementById("shareMessage"),
  fileInput: document.getElementById("screenshot"),
  submitBtn: document.getElementById("submitBtn"),
  successMessage: document.getElementById("successMessage"),
  fileWrapper: document.createElement("div") // Will be added dynamically
};

// ====================== STATE MANAGEMENT ======================
let state = {
  shareCount: 0,
  isSubmitted: false,
  formData: null
};

// ====================== INITIALIZATION ======================
document.addEventListener("DOMContentLoaded", init);

function init() {
  // Check if already submitted
  checkPreviousSubmission();
  
  // Setup file input UI
  setupFileInput();
  
  // Event listeners
  setupEventListeners();
  
  // Initialize share counter display
  updateShareCounter();
}

// ====================== EVENT LISTENERS ======================
function setupEventListeners() {
  // WhatsApp share button
  dom.whatsappBtn.addEventListener("click", handleWhatsappShare);
  
  // Form submission
  dom.form.addEventListener("submit", handleFormSubmit);
  
  // Input validation on blur
  dom.phoneInput.addEventListener("blur", validatePhone);
  dom.emailInput.addEventListener("blur", validateEmail);
}

// ====================== WHATSAPP SHARING LOGIC ======================

function handleWhatsappShare() {
  if (state.shareCount >= CONFIG.maxSharesRequired) return;

  try {
    // Improved message template with URL encoding
    const message = `${CONFIG.whatsappMessage}\n\nJoin me at ${window.location.href}`;
    const encodedMessage = encodeURIComponent(message);
    
    // Different URLs for mobile vs desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const whatsappUrl = isMobile 
      ? `whatsapp://send?text=${encodedMessage}`
      : `https://web.whatsapp.com/send?text=${encodedMessage}`;
    
    // Fallback URL if first attempt fails
    const fallbackUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;

    // First try to open in the same tab (works better on mobile)
    const openInSameTab = () => {
      window.location.href = whatsappUrl;
      setTimeout(() => {
        // If still on our page after 1 second, try fallback
        if (window.location.href.indexOf('whatsapp') === -1) {
          window.open(fallbackUrl, '_blank');
        }
      }, 1000);
    };

    // Try different methods based on device
    if (isMobile) {
      openInSameTab();
    } else {
      // On desktop, try new window first
      const newWindow = window.open(whatsappUrl, '_blank');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // If popup blocked, try same tab approach
        openInSameTab();
      }
    }

    // Only increment counter if we successfully initiated the share
    state.shareCount++;
    updateShareCounter();
    
    if (state.shareCount === CONFIG.maxSharesRequired) {
      enableFormSubmission();
    }
    
    localStorage.setItem(`${CONFIG.localStorageKey}_shares`, state.shareCount);
    
  } catch (error) {
    console.error("WhatsApp share error:", error);
    showToast("Couldn't open WhatsApp. Please try again or share manually.");
  }
}





function updateShareCounter() {
  dom.shareCounter.textContent = `Progress: ${state.shareCount} of ${CONFIG.maxSharesRequired} shares`;
  
  // Update button state if max reached
  if (state.shareCount >= CONFIG.maxSharesRequired) {
    dom.whatsappBtn.disabled = true;
    dom.whatsappBtn.innerHTML = '<span class="btn-icon">✓</span> Shares Completed';
    dom.shareMessage.classList.remove("hidden");
  }
}

// ====================== FORM VALIDATION ======================
function validateForm() {
  // Check all required fields
  if (!dom.nameInput.value.trim() || 
      !dom.phoneInput.value.trim() || 
      !dom.emailInput.value.trim() || 
      !dom.departmentSelect.value || 
      !dom.fileInput.files[0]) {
    showToast("Please fill all required fields");
    return false;
  }
  
  // Validate phone format
  if (!validatePhone()) return false;
  
  // Validate email format
  if (!validateEmail()) return false;
  
  // Check shares completed
  if (state.shareCount < CONFIG.maxSharesRequired) {
    showToast(`Please complete ${CONFIG.maxSharesRequired} shares before submitting`);
    return false;
  }
  
  // Check file size (max 5MB)
  const file = dom.fileInput.files[0];
  if (file.size > 5 * 1024 * 1024) {
    showToast("File size should be less than 5MB");
    return false;
  }
  
  return true;
}

function validatePhone() {
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(dom.phoneInput.value)) {
    dom.phoneInput.classList.add("error");
    showToast("Please enter a valid 10-digit phone number");
    return false;
  }
  dom.phoneInput.classList.remove("error");
  return true;
}

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(dom.emailInput.value)) {
    dom.emailInput.classList.add("error");
    showToast("Please enter a valid email address");
    return false;
  }
  dom.emailInput.classList.remove("error");
  return true;
}

// ====================== FORM SUBMISSION ======================
function handleFormSubmit(e) {
  e.preventDefault();
  
  // Validate form before submission
  if (!validateForm()) return;
  
  // Prepare form data
  prepareFormData();
  
  // Disable form during submission
  setFormState(false);
  
  // Submit to Google Sheets
  submitToGoogleSheets();
}

function prepareFormData() {
  const file = dom.fileInput.files[0];
  const fileName = file ? file.name : "No file uploaded";
  
  state.formData = {
    timestamp: new Date().toISOString(),
    name: dom.nameInput.value.trim(),
    phone: dom.phoneInput.value.trim(),
    email: dom.emailInput.value.trim(),
    department: dom.departmentSelect.value,
    screenshot: fileName,
    sharesCompleted: state.shareCount,
    // Add metadata that might be useful
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`
  };
}

   // ====================== GOOGLE SHEETS SUBMISSION ======================
async function submitToGoogleSheets() {
  try {
    const formData = {
      timestamp: new Date().toISOString(),
      name: dom.nameInput.value.trim(),
      phone: dom.phoneInput.value.trim(),
      email: dom.emailInput.value.trim(),
      department: dom.departmentSelect.value,
      sharesCompleted: state.shareCount,
      screenshot: dom.fileInput.files[0]?.name || "No file"
    };

    // Convert to URL parameters
    const params = new URLSearchParams();
    for (const key in formData) {
      params.append(key, formData[key]);
    }

    const url = `${CONFIG.googleScriptUrl}?${params.toString()}`;
    
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.status !== "success") {
      throw new Error(result.message || "Submission failed");
    }
    
    return true;
  } catch (error) {
    console.error("Full submission error:", {
      error: error,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}
function handleSubmissionSuccess() {
  // Update UI
  dom.successMessage.style.display = "block";
  dom.submitBtn.innerHTML = '<span class="btn-text">Submitted ✓</span>';
  
  // Disable all form elements
  setFormState(false);
  
  // Mark as submitted in localStorage
  state.isSubmitted = true;
  localStorage.setItem(CONFIG.localStorageKey, "true");
  
  // Show confetti celebration
  showConfetti();
}

// ====================== UI HELPERS ======================
function setupFileInput() {
  // Create file input UI
  dom.fileWrapper.className = "file-input-ui";
  dom.fileWrapper.style.display = "none";
  dom.fileInput.parentNode.appendChild(dom.fileWrapper);
  
  // Add change listener
  dom.fileInput.addEventListener("change", function() {
    if (this.files[0]) {
      dom.fileWrapper.style.display = "flex";
      dom.fileWrapper.innerHTML = `
        <span class="file-name">${this.files[0].name}</span>
        <button type="button" class="clear-file-btn">×</button>
      `;
      
      // Add clear button event
      dom.fileWrapper.querySelector(".clear-file-btn").addEventListener("click", () => {
        dom.fileInput.value = "";
        dom.fileWrapper.style.display = "none";
      });
    }
  });
}

function setFormState(enabled) {
  const elements = dom.form.querySelectorAll("input, select, button");
  elements.forEach(el => {
    if (el !== dom.submitBtn) { // Don't disable submit button during submission
      el.disabled = !enabled;
    }
  });
}

function showToast(message) {
  // Create toast element if it doesn't exist
  let toast = document.getElementById("form-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "form-toast";
    toast.className = "toast-message";
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.classList.add("show");
  
  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function showConfetti() {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  });
}

// ====================== PERSISTENCE HELPERS ======================
function checkPreviousSubmission() {
  // Check if form was previously submitted
  const submitted = localStorage.getItem(CONFIG.localStorageKey);
  const shares = localStorage.getItem(`${CONFIG.localStorageKey}_shares`);
  
  if (submitted === "true") {
    state.isSubmitted = true;
    showAlreadySubmitted();
  }
  
  // Restore share count if exists
  if (shares) {
    state.shareCount = parseInt(shares);
    updateShareCounter();
    
    if (state.shareCount >= CONFIG.maxSharesRequired) {
      enableFormSubmission();
    }
  }
}

function showAlreadySubmitted() {
  // Disable all form elements
  setFormState(false);
  
  // Show success message
  dom.successMessage.style.display = "block";
  dom.submitBtn.innerHTML = '<span class="btn-text">Submitted ✓</span>';
  
  // Update share button if applicable
  if (state.shareCount >= CONFIG.maxSharesRequired) {
    dom.whatsappBtn.disabled = true;
    dom.whatsappBtn.innerHTML = '<span class="btn-icon">✓</span> Shares Completed';
    dom.shareMessage.classList.remove("hidden");
  }
}

function enableFormSubmission() {
  dom.shareMessage.classList.remove("hidden");
  dom.whatsappBtn.disabled = true;
  dom.whatsappBtn.innerHTML = '<span class="btn-icon">✓</span> Shares Completed';
}