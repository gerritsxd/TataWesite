// js/orientation-handler.js

function checkOrientationAndPrompt() {
    const promptElement = document.getElementById('orientation-prompt');
    if (!promptElement) {
        console.warn('Orientation prompt element not found.');
        return;
    }

    // Simple mobile check. Consider more robust detection if needed.
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check if the current page is index.html (where the 3D scene is)
    const isIndexPage = window.location.pathname.endsWith('/') || 
                        window.location.pathname.endsWith('index.html') || 
                        !window.location.pathname.includes('.'); // Handles root path for dev servers

    if (isMobile && isIndexPage) {
        if (window.innerHeight > window.innerWidth) { // Portrait mode
            promptElement.classList.add('visible');
            // Optional: Pause 3D rendering or other intensive tasks
            if (typeof window.pauseThreeJS === 'function') {
                window.pauseThreeJS(); 
            }
        } else { // Landscape mode
            promptElement.classList.remove('visible');
            // Optional: Resume 3D rendering
            if (typeof window.resumeThreeJS === 'function') {
                window.resumeThreeJS();
            }
        }
    } else {
        promptElement.classList.remove('visible'); // Not mobile or not on index page, ensure it's hidden
    }
}

// Initial check once the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    checkOrientationAndPrompt();
});

// Re-check on resize (this often covers orientation changes)
window.addEventListener('resize', checkOrientationAndPrompt);

// Some devices might fire orientationchange more reliably or in addition to resize
window.addEventListener('orientationchange', checkOrientationAndPrompt);

// Note: You might need to expose pauseThreeJS/resumeThreeJS functions globally from three-main.js
// if you want to pause/resume the Three.js animation loop when the prompt is shown/hidden.
// Example (in three-main.js):
// window.pauseThreeJS = () => { cancelAnimationFrame(animationFrameId); };
// window.resumeThreeJS = () => { animate(); }; (ensure 'animate' is the main loop function)
