// Elegant fade-in animations for Vibes content
// Apply fade-in classes immediately to prevent FOUC
(function() {
    // Apply fade classes to elements that should be hidden initially
    const elementsToHide = [
        '.vibes-grid-post',
        '.vibes-featured-card',
        '.vibes-hero-heading',
        '.vibes-hero-description',
        '.vibes-left-column',
        '.vibes-right-column',
        '.vibes-hero-post',
        '.vibes-hero-post-title',
        '.vibes-hero-image',
        '.vibes-secondary-post',
        '.vibes-text-post',
        '.vibes-featured-post'
    ];
    
    elementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.classList.add('fade-in');
        });
    });
})();

document.addEventListener('DOMContentLoaded', function() {
    
    let initialContentHandled = false;
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const isHeroElement = entry.target.matches('.vibes-hero-heading, .vibes-hero-description, .vibes-left-column, .vibes-right-column, .vibes-hero-post, .vibes-hero-post-title, .vibes-hero-image, .vibes-secondary-post, .vibes-text-post, .vibes-featured-post');
            
            if (entry.isIntersecting) {
                // For hero elements, only add visible if initial content has been handled
                if (isHeroElement && !initialContentHandled) {
                    return; // Don't trigger hero elements until timer does it
                }
                entry.target.classList.add('visible');
            } else {
                // Remove visible class when element leaves viewport to reset animation
                entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    // Add delay classes for staggered animations
    function addDelayClasses() {
        // Hero content sections - will fade in when logo is halfway through
        const heroHeading = document.querySelector('.vibes-hero-heading');
        const heroDescription = document.querySelector('.vibes-hero-description');
        
        if (heroHeading) {
            heroHeading.classList.add('fade-in-delay-1');
        }
        if (heroDescription) {
            heroDescription.classList.add('fade-in-delay-2');
        }

        // Main layout sections - these will fade in after logo is halfway through
        const leftColumn = document.querySelector('.vibes-left-column');
        const rightColumn = document.querySelector('.vibes-right-column');
        
        if (leftColumn) {
            leftColumn.classList.add('fade-in-delay-3');
        }
        if (rightColumn) {
            rightColumn.classList.add('fade-in-delay-4');
        }

        // Hero posts content
        const heroPost = document.querySelector('.vibes-hero-post');
        const heroPostTitle = document.querySelector('.vibes-hero-post-title');
        const heroImage = document.querySelector('.vibes-hero-image');
        
        if (heroPost) {
            heroPost.classList.add('fade-in-delay-3');
        }
        if (heroPostTitle) {
            heroPostTitle.classList.add('fade-in-delay-3');
        }
        if (heroImage) {
            heroImage.classList.add('fade-in-delay-3');
        }

        // Secondary posts in hero section
        const secondaryPosts = document.querySelectorAll('.vibes-secondary-post');
        secondaryPosts.forEach((post, index) => {
            post.classList.add(`fade-in-delay-${index + 4}`);
        });

        // Text posts in hero section
        const textPosts = document.querySelectorAll('.vibes-text-post');
        textPosts.forEach((post, index) => {
            post.classList.add(`fade-in-delay-${index + 5}`);
        });

        // Featured post in right column
        const featuredPost = document.querySelector('.vibes-featured-post');
        if (featuredPost) {
            featuredPost.classList.add('fade-in-delay-4');
        }

        // Lower sections - these will fade in on scroll
        const sectionsToObserve = [
            '.vibes-featured',
            '.vibes-cta', 
            '.vibes-post-section'
        ];

        sectionsToObserve.forEach(selector => {
            const section = document.querySelector(selector);
            if (section) {
                section.classList.add('fade-in');
            }
        });

        // Individual post cards with staggered animation
        const postCards = document.querySelectorAll('.vibes-grid-post');
        postCards.forEach((card, index) => {
            if (index < 5) {
                card.classList.add(`fade-in-delay-${index + 1}`);
            }
        });

        // Featured cards with staggered animation  
        const featuredCards = document.querySelectorAll('.vibes-featured-card');
        featuredCards.forEach((card, index) => {
            if (index < 5) {
                card.classList.add(`fade-in-delay-${index + 1}`);
            }
        });
    }

    // Initialize delay classes immediately
    addDelayClasses();

    // Observe ALL fade-in elements
    const allFadeElements = document.querySelectorAll('.fade-in');
    allFadeElements.forEach(element => {
        observer.observe(element);
    });

    // Handle above-the-fold content that's already in view
    function handleInitialContent() {
        console.log('Triggering initial content fade-in...');
        const heroElements = document.querySelectorAll('.vibes-hero-heading, .vibes-hero-description, .vibes-left-column, .vibes-right-column, .vibes-hero-post, .vibes-hero-post-title, .vibes-hero-image, .vibes-secondary-post, .vibes-text-post, .vibes-featured-post');
        
        console.log('Found hero elements:', heroElements.length);
        
        heroElements.forEach((element, index) => {
            console.log(`Element ${index}:`, element.className);
            if (element.classList.contains('fade-in')) {
                console.log(`Adding visible to element ${index}`);
                // First remove any existing visible class, then add it to trigger animation
                element.classList.remove('visible');
                // Force a reflow to ensure the removal takes effect
                element.offsetHeight;
                element.classList.add('visible');
            }
        });
        
        // Also make featured cards visible immediately so all are shown
        const featuredCards = document.querySelectorAll('.vibes-featured-card');
        console.log('Found featured cards:', featuredCards.length);
        featuredCards.forEach((card, index) => {
            console.log(`Featured card ${index}:`, card.className);
            if (card.classList.contains('fade-in')) {
                console.log(`Adding visible to featured card ${index}`);
                card.classList.add('visible');
            }
        });
        
        // Mark that initial content has been handled
        initialContentHandled = true;
    }

    // Trigger hero content after logo animation is halfway through
    // Logo starts at 1s, takes ~1.5s total, so halfway = 1.75s
    setTimeout(handleInitialContent, 1750);
}); 