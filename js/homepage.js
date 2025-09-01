/**
 * Homepage Controller
 * Handles the homepage functionality including featured projects
 */

class HomepageController {
    constructor() {
        this.projectsManager = new ProjectsManager();
    }

    /**
     * Initialize the homepage
     */
    async init() {
        try {
            await this.projectsManager.loadData();
            this.renderFeaturedProjects();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to load projects for homepage:', error);
            // Fallback: hide the projects section or show error
            this.handleProjectsLoadError();
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close mobile menu when clicking on a link
            document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }));
        }

        // Smooth scrolling for navigation links
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

        // Add active class to navigation based on scroll position
        window.addEventListener('scroll', () => {
            let current = '';
            const sections = document.querySelectorAll('section');
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    /**
     * Render featured projects on homepage
     */
    renderFeaturedProjects() {
        const projectsGrid = document.querySelector('#projects .projects-grid');
        if (!projectsGrid) return;

        const featuredProjects = this.projectsManager.getFeaturedProjects();
        
        projectsGrid.innerHTML = featuredProjects.map(project => this.createProjectCard(project)).join('');
    }

    /**
     * Create a project card HTML for homepage
     */
    createProjectCard(project) {
        const techTags = project.technologies.map(tech => 
            `<span class="tech-tag">${tech}</span>`
        ).join('');

        const featureTags = project.features.map((feature, index) => {
            const icons = [
                'fas fa-chart-line',
                'fas fa-layer-group', 
                'fas fa-globe-europe',
                'fas fa-mouse-pointer',
                'fas fa-cube',
                'fas fa-users',
                'fas fa-filter'
            ];
            const icon = icons[index] || 'fas fa-check';
            
            return `
                <div class="feature-tag">
                    <i class="${icon}"></i>
                    <span>${feature}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="project-card">
                <a href="${project.link}" class="project-link">
                    <div class="project-image">
                        <img src="${project.image}" alt="${project.title}">
                        <div class="project-overlay">
                            <i class="fas fa-external-link-alt"></i>
                        </div>
                    </div>
                    <div class="project-content">
                        <h3>${project.title}</h3>
                        <p class="project-period">${project.period}</p>
                        <p class="project-description">${project.description}</p>
                        
                        <div class="project-features">
                            ${featureTags}
                        </div>

                        <div class="tech-stack">
                            ${techTags}
                        </div>
                    </div>
                </a>
            </div>
        `;
    }

    /**
     * Handle projects load error
     */
    handleProjectsLoadError() {
        const projectsGrid = document.querySelector('#projects .projects-grid');
        if (projectsGrid) {
            projectsGrid.innerHTML = `
                <div class="error">
                    <p>Impossible de charger les projets pour le moment.</p>
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const controller = new HomepageController();
    controller.init();
});
