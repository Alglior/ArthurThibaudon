document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init();

    // Enhanced map creation with animations
    function createMap(mapId, lat, lon, zoom) {
        const mapElement = document.getElementById(mapId);
        if (!mapElement) {
            console.warn(`Map container ${mapId} not found`);
            return null;
        }

        var map = L.map(mapId, {
            zoomControl: false,
            scrollWheelZoom: false
        }).setView([lat, lon], zoom);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '©OpenStreetMap, ©CartoDB'
        }).addTo(map);

        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);

        return map;
    }

    // Initialize maps only if elements exist
    const maps = {};
    ['map1', 'map2', 'map3'].forEach(mapId => {
        if (document.getElementById(mapId)) {
            maps[mapId] = createMap(mapId, 
                mapId === 'map1' ? 51.505 : mapId === 'map2' ? 48.8566 : 40.7128,
                mapId === 'map1' ? -0.09 : mapId === 'map2' ? 2.3522 : -74.0060,
                13
            );
        }
    });

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    });

    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

    // Get all sections that should be tracked
    const sections = document.querySelectorAll('.section, .conclusion-section, .documentation-section');

    // Enhanced scroll spy functionality with improved section detection
    function updateNavigation() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - windowHeight / 3;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.id;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                // Remove active class from all nav items
                document.querySelectorAll('.floating-nav a').forEach(dot => {
                    dot.classList.remove('active');
                });
                
                // Add active class to current section's nav item
                const currentNav = document.querySelector(`.floating-nav a[href="#${sectionId}"]`);
                if (currentNav) {
                    currentNav.classList.add('active');
                }
            }
        });

        // Special handling for last section when reaching bottom of page
        if (scrollPosition + windowHeight >= documentHeight - 50) {
            document.querySelectorAll('.floating-nav a').forEach(dot => {
                dot.classList.remove('active');
            });
            const lastNav = document.querySelector('.floating-nav a:last-child');
            if (lastNav) {
                lastNav.classList.add('active');
            }
        }
    }

    // Use debounced scroll event for better performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Add scroll event listener with debouncing
    window.addEventListener('scroll', debounce(updateNavigation, 10));
    window.addEventListener('resize', debounce(updateNavigation, 10));
    
    // Initial call with slight delay to ensure proper calculation
    setTimeout(updateNavigation, 100);

    // Initial call to set correct active state
    updateNavigation();

    // Add date formatting
    document.getElementById('publish-date').textContent = new Date().toLocaleDateString('fr', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});