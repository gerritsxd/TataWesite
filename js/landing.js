import { getCurrentLanguage } from './ui-language.js';
import { showControlsBriefly } from './ui-controls-info.js';
import { toggleVideoZoom, setControlsInfoDiv } from './three-main.js';

const landingPage = document.getElementById('landing-page');
const enterButton = document.getElementById('enter-button');
const loadingStatus = document.getElementById('loading-status');
const sceneContainer = document.getElementById('scene-container');
const sectionTextContainer = document.getElementById('section-text-container');

export function initLandingPage() {
    const controlsInfoDiv = document.getElementById('controls-info');
    console.log('In initLandingPage: controlsInfoDiv found?', controlsInfoDiv);

    if (enterButton) {
        enterButton.addEventListener('click', function() {
            if (this.classList.contains('ready')) {
                startExperience();
            }
        });
    }

    // Add the click listener for the controls-info div
    if (controlsInfoDiv) {
        controlsInfoDiv.addEventListener('click', () => {
            console.log("Controls info div clicked, toggling video zoom.");
            if (typeof toggleVideoZoom === 'function') {
                toggleVideoZoom();
            } else {
                console.error("toggleVideoZoom is not available or not a function.");
            }
        });
        console.log('In initLandingPage: Event listener ATTACHED to controlsInfoDiv.');
    } else {
        console.warn("'controls-info' div not found in landing.js when trying to attach listener.");
    }

    updateLandingTexts(); // Initial text update
}

export function updateLoadingProgress(progress) {
    if (enterButton && loadingStatus) {
        enterButton.style.setProperty('--loading-width', `${progress}%`); // For CSS :before fill
        
        const lang = getCurrentLanguage();
        const loadingText = lang === 'nl' ? 'Laden...' : 'Loading...';
        const statusText = lang === 'nl' ? `Middelen laden... ${Math.round(progress)}%` : `Loading assets... ${Math.round(progress)}%`;

        const enterButtonSpan = enterButton.querySelector('span');
        if (enterButtonSpan && !enterButton.classList.contains('ready')) {
            enterButtonSpan.textContent = loadingText;
        }
        loadingStatus.textContent = statusText;

        if (progress >= 100 && !enterButton.classList.contains('ready')) {
             // onEnvironmentLoaded will handle 'ready' state
        }
    }
}

export function onEnvironmentLoaded() {
    console.log('Environment fully loaded, enabling enter button.');
    if (enterButton && loadingStatus) {
        enterButton.classList.add('ready');
        const lang = getCurrentLanguage();
        const enterText = lang === 'nl' ? 'Start Ervaring' : 'Enter Experience';
        const readyText = lang === 'nl' ? 'Klaar om te verkennen' : 'Ready to explore';
        
        const enterButtonSpan = enterButton.querySelector('span');
        if (enterButtonSpan) {
            enterButtonSpan.textContent = enterText;
        }
        loadingStatus.textContent = readyText;
    }
    
    const controlsInfoDiv = document.getElementById('controls-info');
    if (controlsInfoDiv) {
        setControlsInfoDiv(controlsInfoDiv);
        console.log("controlsInfoDiv passed to three-main.js");
    }
}

function startExperience() {
    if (landingPage) {
        landingPage.style.opacity = '0';
        setTimeout(() => {
            landingPage.style.display = 'none';
        }, 1000); // Match CSS transition
    }

    if (sceneContainer) sceneContainer.style.opacity = '1';
    if (sectionTextContainer) {
        // Delay section text appearing slightly after scene
        setTimeout(() => {
            sectionTextContainer.style.opacity = '1';
        }, 500);
    }
    
    showControlsBriefly(); // Show controls guide
    console.log("Experience started.");
}

export function updateLandingTexts() {
    const lang = getCurrentLanguage();

    const subtitle = document.querySelector('.landing-subtitle');
    if (subtitle && subtitle.dataset[lang]) {
        subtitle.textContent = subtitle.dataset[lang];
    }

    const enterButtonSpan = enterButton ? enterButton.querySelector('span') : null;
    if (enterButtonSpan) {
        if (enterButton.classList.contains('ready')) {
             if(enterButtonSpan.dataset[lang] && enterButtonSpan.dataset[lang].toLowerCase().includes("experience")){ // Heuristic
                enterButtonSpan.textContent = enterButtonSpan.dataset[lang] || (lang === 'nl' ? 'Start Ervaring' : 'Enter Experience');
             } else {
                enterButtonSpan.textContent = (lang === 'nl' ? 'Start Ervaring' : 'Enter Experience');
             }
        } else {
            if(enterButtonSpan.dataset[lang] && enterButtonSpan.dataset[lang].toLowerCase().includes("loading")){ // Heuristic
                enterButtonSpan.textContent = enterButtonSpan.dataset[lang] || (lang === 'nl' ? 'Laden...' : 'Loading...');
            } else {
                 enterButtonSpan.textContent = (lang === 'nl' ? 'Laden...' : 'Loading...');
            }
        }
    }
    
    if (loadingStatus) {
        // Only update if not showing progress
        if (enterButton && enterButton.classList.contains('ready')) {
            loadingStatus.textContent = loadingStatus.dataset[lang] || (lang === 'nl' ? 'Klaar om te verkennen' : 'Ready to explore');
        } else if (!loadingStatus.textContent.includes('%')) { // Avoid overwriting "Loading... X%"
            loadingStatus.textContent = loadingStatus.dataset[lang] || (lang === 'nl' ? 'Middelen laden...' : 'Loading assets...');
        }
    }
}