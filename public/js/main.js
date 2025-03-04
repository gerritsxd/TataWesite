document.addEventListener('DOMContentLoaded', function() {
    // Handle contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            alert(`Thank you for your message, ${name}!\nWe'll respond to ${email} soon.`);
            contactForm.reset();
        });
    }

    // Add a simple animation to the main heading
    const mainHeading = document.querySelector('main h1');
    if (mainHeading) {
        mainHeading.style.opacity = '0';
        mainHeading.style.transition = 'opacity 1s ease-in-out';
        
        setTimeout(() => {
            mainHeading.style.opacity = '1';
        }, 300);
    }
});