// TwistQR Main Logic
// This script handles global UI interactions and the system clock.
// AR features are handled separately in ar.html for maximum performance.

function updateClock() {
    const clock = document.getElementById('system-clock');
    if (!clock) return;
    const now = new Date();
    clock.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

// Fade in elements on scroll
function revealOnScroll() {
    const elements = document.querySelectorAll('.feature-card');
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Set initial state for feature cards
    const elements = document.querySelectorAll('.feature-card');
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    });

    setInterval(updateClock, 1000);
    updateClock();
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Run once in case elements are already visible
});
