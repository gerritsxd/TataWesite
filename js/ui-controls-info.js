const controlsInfo = document.getElementById('controls-info');

export function initControlsInfo() {
    // The main logic to show/hide is in startExperience (landing.js)
    // This function is here if any other initialization for controls-info is needed.
    if (controlsInfo) {
        // Example: Add listeners to specific control elements if they become interactive
    }
}

export function showControlsBriefly() {
    if (controlsInfo) {
        controlsInfo.style.opacity = '1';
        setTimeout(() => {
            controlsInfo.style.opacity = '0';
            // Optionally set display to none after transition to remove from layout
            // setTimeout(() => controlsInfo.style.display = 'none', 1000); // Match opacity transition
        }, 7000); // Hide after 7 seconds
    }
}