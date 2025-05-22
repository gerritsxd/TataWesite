import { initThreeScene, getThreeJSComponents } from './three-main.js';
import { initLandingPage, onEnvironmentLoaded } from './landing.js';
import { initLeftNav, initRightInfoNav } from './ui-nav.js';
import { initLanguageToggle, updateAllTextsForLanguage, addLanguageChangeListener } from './ui-language.js';
import { initSections } from './ui-sections.js';
import { initControlsInfo } from './ui-controls-info.js';
import { initAnimationHandler } from './animation-handler.js';
import { initControlsPopup } from './ui-controls-popup.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing application.');

    // Initialize UI components first
    initLeftNav();
    initRightInfoNav();
    initLanguageToggle(); 
    addLanguageChangeListener(updateAllTextsForLanguage); 
    initControlsPopup(); 
    initControlsInfo(); // Initializes the brief display of controls info

    // Initialize Three.js scene and pass callback for when models are loaded
    const modelLoadCallback = () => {
        const { waypoints, pathCurve, carModel, scene, camera, renderer, clock, mixers, mainScene } = getThreeJSComponents();
        
        onEnvironmentLoaded(); // Notify landing page

        // Initialize sections display, depends on Three.js elements being ready
        initSections(waypoints, pathCurve, carModel);
        
        // Initialize animation handler (if GLTF animations exist)
        // This is a placeholder as actual GLTF objects are not directly passed here
        // three-main.js should call registerAnimations from animation-handler.js internally
        initAnimationHandler(); // Basic init, registration happens in three-main
    };

    initThreeScene(modelLoadCallback);

    // Initialize landing page logic (handles "Enter" button)
    initLandingPage();

    // Initial text update based on default language
    updateAllTextsForLanguage(); 
});