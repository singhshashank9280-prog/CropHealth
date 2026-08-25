// language.js

// 1. Dictionary for the ENTIRE website
const translations = {
  "en": {
    "nav_home": "Home",
    "nav_disease": "Disease Detection",
    "nav_camera": "Image Capture",
    "welcome_title": "Welcome to CropHealth 🌱",
    "welcome_desc": "A platform to identify crop diseases, understand crop health and help farmers through digital assistance.",
    "start_btn": "Start Detection"
  },
  "hi": {
    "nav_home": "होम",
    "nav_disease": "रोग पहचान",
    "nav_camera": "फोटो खींचें",
    "welcome_title": "CropHealth में आपका स्वागत है 🌱",
    "welcome_desc": "फसल रोगों की पहचान करने, स्वास्थ्य को समझने और किसानों की मदद करने के लिए एक डिजिटल मंच।",
    "start_btn": "जांच शुरू करें"
  },
  "as": {
    "nav_home": "মুখ্য পৃষ্ঠা",
    "nav_disease": "ৰোগ নিৰ্ণয়",
    "nav_camera": "ফটো তোলক",
    "welcome_title": "CropHealth লৈ স্বাগতম 🌱",
    "welcome_desc": "শস্যৰ ৰোগ চিনাক্ত কৰা আৰু কৃষকসকলক সহায় কৰাৰ বাবে এটা ডিজিটেল মঞ্চ।",
    "start_btn": "নিৰ্ণয় আৰম্ভ কৰক"
  }
};

// 2. Function triggered by your icons
function changeLanguage(lang) {
  // Save the choice to the browser so it remembers on the next page
  localStorage.setItem('cropHealthLang', lang); 
  applyLanguage();
}

// 3. Function to update the page text
function applyLanguage() {
  // Get the saved language, default to English if none exists
  const currentLang = localStorage.getItem('cropHealthLang') || 'en';

  // Find EVERY element on the page with a data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    
    // If the translation exists, update the text
    if (translations[currentLang] && translations[currentLang][key]) {
      element.innerText = translations[currentLang][key];
    }
  });

  // Update the visual state of the icons
  document.querySelectorAll('.lang-icon').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`lang-btn-${currentLang}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

// 4. Run this automatically whenever ANY page loads
document.addEventListener("DOMContentLoaded", applyLanguage);