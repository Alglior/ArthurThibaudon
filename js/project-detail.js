/**
 * Project Detail Page Controller
 * Handles displaying individual project details
 */

class ProjectDetailController {
    constructor() {
        this.projectsManager = new ProjectsManager();
        this.projectId = this.getURLParameter('id');
        this.project = null;
    }

    /**
     * Get URL parameter
     */
    getURLParameter(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    /**
     * Initialize the detail page
     */
    async init() {
        this.setupMobileMenu();
        
        try {
            await this.projectsManager.loadData();
            this.project = this.projectsManager.getProjectById(this.projectId);
            
            if (this.project) {
                this.renderProjectDetail();
            } else {
                this.showNotFound();
            }
        } catch (error) {
            console.error('Error loading project detail:', error);
            this.showNotFound();
        }
    }

    /**
     * Setup mobile menu toggle
     */
    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    /**
     * Render project detail content
     */
    renderProjectDetail() {
        const loading = document.getElementById('project-loading');
        const content = document.getElementById('project-detail-content');
        const notFound = document.getElementById('project-not-found');

        if (loading) loading.style.display = 'none';
        if (content) content.style.display = 'block';
        if (notFound) notFound.style.display = 'none';

        document.getElementById('page-title').textContent = `${this.project.title} — Arthur Thibaudon`;
        document.getElementById('og-title').setAttribute('content', `${this.project.title} — Arthur Thibaudon`);
        document.getElementById('og-description').setAttribute('content', this.project.description);

        document.getElementById('project-image').src = this.project.image;
        document.getElementById('project-image').alt = this.project.title;
        document.getElementById('project-title').textContent = this.project.title;
        
        const periodEl = document.getElementById('project-period');
        if (periodEl && this.project.period) {
            periodEl.textContent = `Période : ${this.project.period}`;
        }

        const categoryBadge = document.getElementById('project-category-badge');
        if (categoryBadge) {
            categoryBadge.innerHTML = `<span class="badge-label">${this.getCategoryName(this.project.category)}</span>`;
        }

        document.getElementById('project-description').textContent = this.project.description;

        const featuresEl = document.getElementById('project-features');
        if (featuresEl && this.project.features) {
            featuresEl.innerHTML = this.project.features.map(feature => `
                <div class="feature-item">
                    <i class="fas fa-check-circle"></i>
                    <span>${feature}</span>
                </div>
            `).join('');
        }

        const techEl = document.getElementById('project-technologies');
        if (techEl && this.project.technologies) {
            techEl.innerHTML = this.project.technologies.map(tech => 
                `<span class="tech-tag-detail">${tech}</span>`
            ).join('');
        }

        const contributorsEl = document.getElementById('project-contributors');
        if (contributorsEl && this.project.contributors && this.project.contributors.length > 0) {
            contributorsEl.style.display = 'block';
            contributorsEl.querySelector('.contributors-list').innerHTML = 
                this.project.contributors.map(name => `<span class="contributor-name">${name}</span>`).join(
                    '<span class="contributor-separator">,</span>'
                );
        }

        const launchBtn = document.getElementById('project-launch-btn');
        if (launchBtn && this.project.link) {
            launchBtn.href = this.project.link;
        }

        this.renderNavigation();
    }

    /**
     * Get category display name
     */
    getCategoryName(categoryId) {
        const categories = this.projectsManager.categories;
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }

    /**
     * Render navigation between projects
     */
    renderNavigation() {
        if (!this.project || !this.project.id) return;

        const projectIndex = this.projectsManager.projects.findIndex(p => p.id === this.project.id);
        if (projectIndex === -1) return;

        const prevProject = this.projectsManager.projects[projectIndex - 1];
        const nextProject = this.projectsManager.projects[projectIndex + 1];

        let navHTML = '<div class="project-navigation">';

        if (prevProject) {
            navHTML += `
                <a href="project-detail.html?id=${encodeURIComponent(prevProject.id)}" class="nav-btn prev-project">
                    <i class="fas fa-arrow-left"></i>
                    <span class="nav-label">Projet précédent</span>
                    <span class="nav-title">${prevProject.title}</span>
                </a>
            `;
        }

        if (nextProject) {
            navHTML += `
                <a href="project-detail.html?id=${encodeURIComponent(nextProject.id)}" class="nav-btn next-project">
                    <span class="nav-label">Projet suivant</span>
                    <span class="nav-title">${nextProject.title}</span>
                    <i class="fas fa-arrow-right"></i>
                </a>
            `;
        }

        navHTML += '</div>';

        const detailBody = document.querySelector('.detail-body');
        if (detailBody && (prevProject || nextProject)) {
            detailBody.insertAdjacentHTML('beforeend', navHTML);
        }
    }

    /**
     * Show not found message
     */
    showNotFound() {
        const loading = document.getElementById('project-loading');
        const content = document.getElementById('project-detail-content');
        const notFound = document.getElementById('project-not-found');

        if (loading) loading.style.display = 'none';
        if (content) content.style.display = 'none';
        if (notFound) notFound.style.display = 'block';

        document.title = 'Projet introuvable — Arthur Thibaudon';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const controller = new ProjectDetailController();
    controller.init();
});