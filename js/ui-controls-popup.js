import { getCurrentLanguage, addLanguageChangeListener } from './ui-language.js';

const controlsPopup = document.getElementById('controls-instruction-popup');
const pcInstructions = document.getElementById('pc-instructions');
const mobileInstructions = document.getElementById('mobile-instructions');
const closeButton = controlsPopup ? controlsPopup.querySelector('.popup-close-button') : null;

let pcInstructionsTitle, pcInstruction1, pcInstruction2;
let mobileInstructionsTitle, mobileInstruction1, mobileInstruction2;

function isMobileDevice() {
    // More robust check for mobile devices
    return (
        (typeof window.orientation !== "undefined") || 
        (navigator.userAgent.indexOf('IEMobile') !== -1) || 
        (navigator.userAgent.toLowerCase().includes('android')) ||
        (navigator.userAgent.toLowerCase().includes('iphone')) ||
        (navigator.userAgent.toLowerCase().includes('ipad')) ||
        (navigator.userAgent.toLowerCase().includes('mac') && "ontouchend" in document)
    );
}

function updatePopupTexts() {
    if (!controlsPopup) return;
    const lang = getCurrentLanguage();

    if (pcInstructionsTitle) pcInstructionsTitle.textContent = pcInstructionsTitle.dataset[lang] || pcInstructionsTitle.dataset['en'];
    if (pcInstruction1) pcInstruction1.textContent = pcInstruction1.dataset[lang] || pcInstruction1.dataset['en'];
    if (pcInstruction2) pcInstruction2.textContent = pcInstruction2.dataset[lang] || pcInstruction2.dataset['en'];

    if (mobileInstructionsTitle) mobileInstructionsTitle.textContent = mobileInstructionsTitle.dataset[lang] || mobileInstructionsTitle.dataset['en'];
    if (mobileInstruction1) mobileInstruction1.textContent = mobileInstruction1.dataset[lang] || mobileInstruction1.dataset['en'];
    if (mobileInstruction2) mobileInstruction2.textContent = mobileInstruction2.dataset[lang] || mobileInstruction2.dataset['en'];
}

export function initControlsPopup() {
    if (!controlsPopup || !pcInstructions || !mobileInstructions || !closeButton) {
        console.warn('Controls instruction popup elements not found.');
        return;
    }

    pcInstructionsTitle = pcInstructions.querySelector('h3');
    const pcParas = pcInstructions.querySelectorAll('p');
    if (pcParas.length >= 2) {
        pcInstruction1 = pcParas[0];
        pcInstruction2 = pcParas[1];
    }

    mobileInstructionsTitle = mobileInstructions.querySelector('h3');
    const mobileParas = mobileInstructions.querySelectorAll('p');
    if (mobileParas.length >= 2) {
        mobileInstruction1 = mobileParas[0];
        mobileInstruction2 = mobileParas[1];
    }

    closeButton.addEventListener('click', () => {
        controlsPopup.classList.remove('show');
        // Optionally, set a flag in localStorage so it doesn't show again this session
        // sessionStorage.setItem('controlsPopupDismissed', 'true');
    });

    addLanguageChangeListener(updatePopupTexts);
    updatePopupTexts(); // Initial text setup
}

export function showControlsPopup() {
    // if (sessionStorage.getItem('controlsPopupDismissed')) {
    //     return; // Don't show if already dismissed this session
    // }

    if (!controlsPopup || !pcInstructions || !mobileInstructions) return;

    if (isMobileDevice()) {
        pcInstructions.style.display = 'none';
        mobileInstructions.style.display = 'block';
    } else {
        pcInstructions.style.display = 'block';
        mobileInstructions.style.display = 'none';
    }
    updatePopupTexts(); // Ensure texts are correct before showing
    controlsPopup.classList.add('show');
}
