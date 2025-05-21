import { getCurrentLanguage, updateTextsForNodeAndChildren } from './ui-language.js';

// Left Navigation (Page Links)
const leftNavToggle = document.getElementById('left-nav-toggle');
const leftSideNav = document.getElementById('left-side-nav');

// Right Information Panel (About/Contact)
const rightNavToggle = document.getElementById('right-nav-toggle');
const rightSideNavbar = document.getElementById('right-side-navbar');

export function initLeftNav() {
    if (leftNavToggle && leftSideNav) {
        leftNavToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            leftNavToggle.classList.toggle('open');
            leftSideNav.classList.toggle('open');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (leftSideNav.classList.contains('open') &&
                !leftSideNav.contains(e.target) &&
                !leftNavToggle.contains(e.target)) {
                leftNavToggle.classList.remove('open');
                leftSideNav.classList.remove('open');
            }
        });
    }
}

export function initRightInfoNav() {
    if (rightNavToggle && rightSideNavbar) {
        rightNavToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            rightNavToggle.classList.toggle('active'); // .active for its specific X animation
            rightSideNavbar.classList.toggle('open');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (rightSideNavbar.classList.contains('open') &&
                !rightSideNavbar.contains(e.target) &&
                !rightNavToggle.contains(e.target)) {
                rightNavToggle.classList.remove('active');
                rightSideNavbar.classList.remove('open');
            }
        });
    }
}

export function updateNavTexts() {
    // Update left navigation links
    if (leftSideNav) {
        updateTextsForNodeAndChildren(leftSideNav, getCurrentLanguage());
    }

    // Update right info panel texts
    if (rightSideNavbar) {
       updateTextsForNodeAndChildren(rightSideNavbar, getCurrentLanguage());
    }
}