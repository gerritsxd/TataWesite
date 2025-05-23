// js/user-logger.js

const SERVER_LOG_ENDPOINT = 'http://localhost:3000/log'; // The endpoint on your server

/**
 * Generates or retrieves a unique session ID.
 * Stores it in sessionStorage to persist across page loads within the same session.
 * @returns {string} The session ID.
 */
function getSessionId() {
    let sessionId = sessionStorage.getItem('userSessionId');
    if (!sessionId) {
        sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        sessionStorage.setItem('userSessionId', sessionId);
    }
    return sessionId;
}

/**
 * Logs an event by sending it to the server.
 * @param {string} eventType - A descriptive name for the event (e.g., "pageLoad", "buttonClick").
 * @param {object} eventDetails - An object containing specific details about the event.
 */
async function logEvent(eventType, eventDetails = {}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        sessionId: getSessionId(),
        eventType: eventType,
        url: window.location.href,
        userAgent: navigator.userAgent,
        details: eventDetails,
    };

    console.log('Logging event:', logEntry); // For client-side debugging

    try {
        const response = await fetch(SERVER_LOG_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logEntry),
        });

        if (!response.ok) {
            console.error('Failed to send log to server:', response.status, await response.text());
        }
    } catch (error) {
        console.error('Error sending log to server:', error);
    }
}

/**
 * Initializes the logger and logs the initial page load/session start.
 * Also attaches event listeners for specific UI interactions.
 */
function initLogger() {
    logEvent('sessionStart', { pageTitle: document.title, pagePath: window.location.pathname });

    // Listener for Language Toggle Button
    const langButton = document.getElementById('lang-button');
    if (langButton) {
        langButton.addEventListener('click', () => {
            // It's good to log the state *after* the change, but that might be complex
            // For now, just log the click event. We can get current lang from html tag.
            const currentLang = document.documentElement.lang || 'en'; // Assuming 'en' default
            logEvent('buttonClick', { buttonId: 'lang-button', action: 'toggleLanguage', currentLang: currentLang });
        });
    }

    // Listener for Enter Experience Button (only on index.html)
    const enterButton = document.getElementById('enter-button');
    if (enterButton) {
        enterButton.addEventListener('click', () => {
            logEvent('buttonClick', { buttonId: 'enter-button', action: 'enterExperience' });
        });
    }

    // Listener for Navigation Links in the side navigation
    const leftNav = document.getElementById('left-side-nav');
    if (leftNav) {
        const navLinks = leftNav.querySelectorAll('a.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Log before navigation occurs
                logEvent('navigationClick', { 
                    linkText: link.textContent.trim(), 
                    linkHref: link.getAttribute('href'),
                    targetPage: link.getAttribute('href') // or derive from text
                });
                // We don't preventDefault, as we want the navigation to happen.
            });
        });
    }
    
    // Add more listeners here as needed, for example:
    // - Clicks on section headers in ui-sections
    // - Opening/closing the details overlay
    // - Interactions with 3D scene elements (if feasible and desired)
}

// Initialize the logger when the script is loaded
initLogger();

// Export functions if you plan to call them from other modules
// export { logEvent, getSessionId }; // If using ES6 modules elsewhere
