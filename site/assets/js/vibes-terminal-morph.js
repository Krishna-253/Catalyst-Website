// Terminal morphing animation for Vibes logo
document.addEventListener('DOMContentLoaded', function() {
    const logo = document.querySelector('.vibes-logo-text');
    if (!logo) return;

    const targetChars = ['V', 'i', 'b', 'e', 'S'];
    const charIds = ['char-v', 'char-i', 'char-b', 'char-e', 'char-s'];
    const morphChars = ['█', '▓', '▒', '░', '■', '□', '#', '%', '@', '&', '$', '0', '1'];
    
    // Random characters for morphing effect
    function getRandomChar() {
        return morphChars[Math.floor(Math.random() * morphChars.length)];
    }

    function animateChar(charId, targetChar, callback) {
        const charElement = document.getElementById(charId);
        if (!charElement) {
            if (callback) callback();
            return;
        }

        let morphCount = 0;
        const maxMorphs = 10; // Number of random character changes
        
        // Start morphing animation
        charElement.classList.add('morph');
        
        // Character morphing interval
        const morphInterval = setInterval(() => {
            // Change to random character
            charElement.textContent = getRandomChar();
            
            morphCount++;
            
            // Stop morphing and settle to final character
            if (morphCount >= maxMorphs) {
                clearInterval(morphInterval);
                
                // Final character
                charElement.textContent = targetChar;
                charElement.classList.remove('morph');
                charElement.classList.add('animate-in');
                
                // Call the callback to start the next character
                if (callback) callback();
            }
        }, 50); // Change character every 30ms
    }

    // Start the animation sequence
    function startTerminalMorph() {
        // Reset all characters first
        charIds.forEach((charId, index) => {
            const charElement = document.getElementById(charId);
            if (charElement) {
                charElement.classList.remove('animate-in', 'morph');
                charElement.textContent = '█'; // Start with solid block
            }
        });

        // Start morphing characters sequentially
        function animateNext(index) {
            if (index >= charIds.length) return; // All done
            
            animateChar(charIds[index], targetChars[index], () => {
                animateNext(index + 1); // Start next character immediately
            });
        }
        
        // Start with the first character
        animateNext(0);
    }

    // Function to animate a single character
    function animateSingleChar(charId, targetChar) {
        const charElement = document.getElementById(charId);
        if (!charElement) return;
        
        // Reset and animate just this character
        charElement.classList.remove('animate-in', 'morph');
        charElement.textContent = '█';
        
        let morphCount = 0;
        const maxMorphs = 5; // Faster hover animation
        
        charElement.classList.add('morph');
        
        const morphInterval = setInterval(() => {
            charElement.textContent = getRandomChar();
            morphCount++;
            
            if (morphCount >= maxMorphs) {
                clearInterval(morphInterval);
                charElement.textContent = targetChar;
                charElement.classList.remove('morph');
                charElement.classList.add('animate-in');
            }
        }, 120);
    }

    // Initialize animation on page load
    setTimeout(startTerminalMorph, 1000); // Start after 1 second

    // Add individual hover listeners for each character
    charIds.forEach((charId, index) => {
        const charElement = document.getElementById(charId);
        if (charElement) {
            charElement.addEventListener('mouseenter', () => {
                animateSingleChar(charId, targetChars[index]);
            });
        }
    });
}); 