// Sticky navigation scroll effects for Vibes
document.addEventListener('DOMContentLoaded', function() {
    const navigation = document.querySelector('.gh-navigation');
    
    if (!navigation) return;
    
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateNavigation() {
        const scrollY = window.scrollY;
        
        // Add scrolled class when scrolled down
        if (scrollY > 50) {
            navigation.classList.add('scrolled');
        } else {
            navigation.classList.remove('scrolled');
        }
        
        lastScrollY = scrollY;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateNavigation);
            ticking = true;
        }
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', requestTick);
    
    // Initial check
    updateNavigation();
}); 