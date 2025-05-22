import { updateLandingTexts } from './landing.js';
import { updateNavTexts } from './ui-nav.js';
import { updateCurrentSectionTextDisplay } from './ui-sections.js';


let currentLanguage = 'en'; // Default language
const languageChangeListeners = []; // Changed from onLanguageChangeCallback = null

const langButton = document.getElementById('lang-button');

// Exported function to allow other modules to register listeners
export function addLanguageChangeListener(callback) {
    if (typeof callback === 'function') {
        languageChangeListeners.push(callback);
    }
}

export function initLanguageToggle() { // Removed changeCallback parameter
    if (langButton) {
        langButton.addEventListener('click', () => {
            currentLanguage = (currentLanguage === 'en') ? 'nl' : 'en';
            langButton.textContent = currentLanguage === 'en' ? 'EN / NL' : 'NL / EN';
            console.log(`Language switched to: ${currentLanguage}`);
            languageChangeListeners.forEach(listener => {
                try {
                    listener();
                } catch (error) {
                    console.error('Error in language change listener:', error);
                }
            });
        });
    }
}

export function getCurrentLanguage() {
    return currentLanguage;
}

// Generic function to update texts based on data-en/data-nl attributes
export function updateTextsForNodeAndChildren(parentElement, lang) {
    if (!parentElement) return;

    // Update parent itself if it has data attributes
    if (parentElement.dataset[lang] && parentElement.tagName !== 'P') { // Avoid changing P content if it's complex
         if (parentElement.matches('h1, h2, h3, h4, h5, span, div.section-title, div.section-subtitle, button > span, a.nav-link')) {
            parentElement.textContent = parentElement.dataset[lang];
        }
    } else if (parentElement.dataset[lang] && parentElement.tagName === 'P' && !parentElement.querySelector('*')) {
        // Only update P if it doesn't have child elements, to preserve structure
        parentElement.textContent = parentElement.dataset[lang];
    }


    // Update all descendants with data attributes
    const elements = parentElement.querySelectorAll('[data-en], [data-nl]');
    elements.forEach(el => {
        if (el.dataset[lang]) {
            // Prioritize direct text content for simple elements
            if (el.matches('h1, h2, h3, h4, h5, span, p, div.section-title, div.section-subtitle, button > span, a.nav-link')) {
                 // If it's a span inside a button, target the span
                if (el.tagName === 'SPAN' && el.parentElement.tagName === 'BUTTON') {
                    el.textContent = el.dataset[lang];
                } else if (el.tagName === 'P' && !el.querySelector('*')) { 
                    // Only update P if it's simple text
                    el.textContent = el.dataset[lang];
                } else if (el.tagName !== 'P') { // Avoid complex P again
                    el.textContent = el.dataset[lang];
                }
            }
        }
    });
}


// Central callback to update all relevant texts when language changes
export function updateAllTextsForLanguage() {
    const lang = getCurrentLanguage();
    console.log(`Updating all texts for language: ${lang}`);
    
    updateLandingTexts(); // Updates landing page specific texts
    updateNavTexts();     // Updates navigation panel texts
    updateCurrentSectionTextDisplay(); // Updates the currently displayed section text
    
    // Example for updating any other general elements if needed:
    // const generalElementsContainer = document.getElementById('some-container');
    // if (generalElementsContainer) {
    //     updateTextsForNodeAndChildren(generalElementsContainer, lang);
    // }
}