// OceanPhenix - Main JavaScript



// ==========================================

// Welcome Popup 2026 Animation

// ==========================================

(function() {

    // Wait for DOM to be fully loaded

    document.addEventListener('DOMContentLoaded', function() {

        const popup = document.getElementById('welcome-popup');

        const closeBtn = document.getElementById('popup-close');

        const relaunchBtn = document.getElementById('popup-relaunch');

        

        // Check if popup has already been shown in this session

        const popupShown = sessionStorage.getItem('welcomePopupShown');

        

        // Show popup function

        function showPopup() {

            if (popup) {

                popup.classList.add('active');

                document.body.style.overflow = 'hidden'; // Prevent scrolling

                if (relaunchBtn) {

                    relaunchBtn.classList.remove('visible');

                }

            }

        }

        

        // Close popup function

        function closePopup() {

            if (popup) {

                popup.classList.remove('active');

                document.body.style.overflow = 'auto'; // Re-enable scrolling

                // Show relaunch button after closing

                if (relaunchBtn) {

                    setTimeout(function() {

                        relaunchBtn.classList.add('visible');

                    }, 500);

                }

            }

        }

        

        // Show popup on first load

        if (!popupShown && popup) {

            setTimeout(function() {

                showPopup();

            }, 500); // Delay of 500ms for smooth appearance

            

            // Mark popup as shown in session storage

            sessionStorage.setItem('welcomePopupShown', 'true');

        } else if (relaunchBtn) {

            // If already shown, display relaunch button

            setTimeout(function() {

                relaunchBtn.classList.add('visible');

            }, 1000);

        }

        

        // Close on button click

        if (closeBtn) {

            closeBtn.addEventListener('click', closePopup);

        }

        

        // Relaunch popup on button click

        if (relaunchBtn) {

            relaunchBtn.addEventListener('click', function() {

                showPopup();

            });

        }

        

        // Close on overlay click (outside popup)

        if (popup) {

            popup.addEventListener('click', function(e) {

                if (e.target === popup) {

                    closePopup();

                }

            });

        }

        

        // Close on Escape key

        document.addEventListener('keydown', function(e) {

            if (e.key === 'Escape' && popup?.classList?.contains('active')) {

                closePopup();

            }

        });

    });

})();



// Smooth scroll for all anchor links

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener('click', function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));

        if (target) {

            target.scrollIntoView({

                behavior: 'smooth',

                block: 'start'

            });

        }

    });

});



// Intersection Observer for fade-in animations

const observerOptions = {

    threshold: 0.1,

    rootMargin: '0px 0px -50px 0px'

};



const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.style.opacity = '1';

            entry.target.style.transform = 'translateY(0)';

        }

    });

}, observerOptions);



// Observe all cards

document.querySelectorAll('.platform-card').forEach(card => {

    card.style.opacity = '0';

    card.style.transform = 'translateY(30px)';

    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

    observer.observe(card);

});



// Add parallax effect to background waves

window.addEventListener('scroll', () => {

    const scrolled = window.pageYOffset;

    const waves = document.querySelectorAll('.wave');

    waves.forEach((wave, index) => {

        const speed = (index + 1) * 0.05;

        wave.style.transform = `translateY(${scrolled * speed}px)`;

    });

});



// Ensure external links open properly (O2switch compatible)

document.querySelectorAll('.platform-card[href]').forEach(card => {

    // Ensure all cards have proper target and rel attributes

    if (!card.classList.contains('platform-card-featured')) {

        card.setAttribute('target', '_blank');

        card.setAttribute('rel', 'noopener noreferrer');

    }

});



// ==========================================

// CGU Modal Functionality

// ==========================================

(function() {

    document.addEventListener('DOMContentLoaded', function() {

        const cguModal = document.getElementById('cgu-modal');

        const cguLink = document.getElementById('cgu-link');

        const cguClose = document.getElementById('cgu-close');



        if (!cguModal || !cguLink || !cguClose) return;



        // Open modal

        cguLink.addEventListener('click', (e) => {

            e.preventDefault();

            cguModal.classList.add('active');

            document.body.style.overflow = 'hidden';

        });



        // Close modal

        cguClose.addEventListener('click', () => {

            cguModal.classList.remove('active');

            document.body.style.overflow = 'auto';

        });



        // Close on outside click

        cguModal.addEventListener('click', (e) => {

            if (e.target === cguModal) {

                cguModal.classList.remove('active');

                document.body.style.overflow = 'auto';

            }

        });



        // Close on Escape key

        document.addEventListener('keydown', (e) => {

            if (e.key === 'Escape' && cguModal?.classList?.contains('active')) {

                cguModal.classList.remove('active');

                document.body.style.overflow = 'auto';

            }

        });

    });

})();



// ==========================================

// Simplification des liens - Compatible O2Switch

// Tous les liens externes s'ouvrent maintenant directement avec target="_blank"

// Plus besoin de JavaScript complexe pour gérer les popups

// ==========================================



// ==========================================

// Last Modified Date Display

// ==========================================

(function() {

    document.addEventListener('DOMContentLoaded', function() {

        const lastModifiedElement = document.getElementById('last-modified-date');

        

        if (lastModifiedElement) {

            // Priorité : lire la meta "last-modified" définie manuellement dans le HTML

            const metaLastModified = document.querySelector('meta[name="last-modified"]');

            if (metaLastModified && metaLastModified.getAttribute('content')) {

                // Utilise la date définie dans la meta (à mettre à jour à chaque déploiement)

                lastModifiedElement.textContent = metaLastModified.getAttribute('content');

            } else {

                // Fallback : document.lastModified (dépend du serveur HTTP)

                const lastModified = new Date(document.lastModified);

                const day = String(lastModified.getDate()).padStart(2, '0');

                const month = String(lastModified.getMonth() + 1).padStart(2, '0');

                const year = lastModified.getFullYear();

                const hours = String(lastModified.getHours()).padStart(2, '0');

                const minutes = String(lastModified.getMinutes()).padStart(2, '0');

                lastModifiedElement.textContent = `${day}/${month}/${year} ${hours}:${minutes}`;

            }

        }

        

        // Display load time

        const loadTimeElement = document.getElementById('load-time');

        if (loadTimeElement) {

            const now = new Date();

            const h = String(now.getHours()).padStart(2, '0');

            const m = String(now.getMinutes()).padStart(2, '0');

            const s = String(now.getSeconds()).padStart(2, '0');

            loadTimeElement.textContent = `${h}:${m}:${s}`;

        }

    });

})();

// ==========================================
// Menu hamburger — navigation mobile
// ==========================================
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var hamburger = document.getElementById('nav-hamburger');
        var navLinks  = document.getElementById('nav-links');
        var overlay   = document.getElementById('nav-overlay');

        if (!hamburger || !navLinks || !overlay) return;

        function openMenu() {
            hamburger.setAttribute('aria-expanded', 'true');
            hamburger.classList.add('is-open');
            navLinks.classList.add('is-open');
            overlay.classList.add('is-open');
        }

        function closeMenu() {
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.classList.remove('is-open');
            navLinks.classList.remove('is-open');
            overlay.classList.remove('is-open');
        }

        hamburger.addEventListener('click', function () {
            if (hamburger.getAttribute('aria-expanded') === 'true') {
                closeMenu();
            } else {
                openMenu();
            }
        });

        overlay.addEventListener('click', closeMenu);

        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });
    });
})();


