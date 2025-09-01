/**
 * Projects Page Controller
 * Handles the projects page functionality
 */

class ProjectsPageController {
    constructor() {
        this.projectsManager = new ProjectsManager();
        this.isLoading = false;
        this.currentSearchQuery = '';
    }

    /**
     * Initialize the projects page
     */
    async init() {
        try {
            this.showLoading();
            await this.projectsManager.loadData();
            this.setupEventListeners();
            this.renderFilters();
            this.renderPage();
            this.hideLoading();
        } catch (error) {
            this.showError('Erreur lors du chargement des projets. Veuillez réessayer plus tard.');
            console.error('Failed to initialize projects page:', error);
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
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }

        // Enhanced search functionality
        this.setupSearchBar();
    }

    /**
     * Setup enhanced search bar functionality
     */
    setupSearchBar() {
        const searchInput = document.getElementById('search-input');
        const searchClear = document.querySelector('.search-clear');
        const searchSuggestions = document.getElementById('search-suggestions');
        
        if (!searchInput) return;

        let searchTimeout;

        // Input event with debouncing
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            // Show/hide clear button
            if (query) {
                searchClear.classList.add('visible');
            } else {
                searchClear.classList.remove('visible');
                this.hideSuggestions();
            }

            // Debounced search
            searchTimeout = setTimeout(() => {
                this.handleSearch(query);
                if (query.length > 1) {
                    this.showSearchSuggestions(query);
                } else {
                    this.hideSuggestions();
                }
            }, 300);
        });

        // Clear button functionality
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchClear.classList.remove('visible');
                this.hideSuggestions();
                this.currentSearchQuery = '';
                this.renderPage();
                searchInput.focus();
            });
        }

        // Focus and blur events for suggestions
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length > 1) {
                this.showSearchSuggestions(searchInput.value.trim());
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-bar')) {
                this.hideSuggestions();
            }
        });

        // Keyboard navigation for suggestions
        searchInput.addEventListener('keydown', (e) => {
            this.handleSearchKeyboard(e);
        });
    }

    /**
     * Show search suggestions
     */
    showSearchSuggestions(query) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        if (!suggestionsContainer || query.length < 2) return;

        const suggestions = this.generateSearchSuggestions(query);
        
        if (suggestions.length === 0) {
            suggestionsContainer.innerHTML = '<div class="search-no-results">Aucune suggestion trouvée</div>';
        } else {
            suggestionsContainer.innerHTML = suggestions.map((suggestion, index) => `
                <div class="search-suggestion" data-index="${index}" data-query="${suggestion.query}">
                    <i class="fas ${suggestion.icon} search-suggestion-icon"></i>
                    <div class="search-suggestion-text">
                        <div class="search-suggestion-title">${suggestion.title}</div>
                        <div class="search-suggestion-category">${suggestion.category}</div>
                    </div>
                </div>
            `).join('');

            // Add click listeners to suggestions
            suggestionsContainer.querySelectorAll('.search-suggestion').forEach(suggestion => {
                suggestion.addEventListener('click', () => {
                    const query = suggestion.dataset.query;
                    document.getElementById('search-input').value = query;
                    this.handleSearch(query);
                    this.hideSuggestions();
                });
            });
        }

        suggestionsContainer.classList.add('visible');
    }

    /**
     * Generate search suggestions based on query
     */
    generateSearchSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();

        // Project title suggestions
        this.projectsManager.projects.forEach(project => {
            if (project.title.toLowerCase().includes(queryLower)) {
                suggestions.push({
                    title: project.title,
                    category: 'Projet',
                    icon: 'fa-folder',
                    query: project.title
                });
            }
        });

        // Technology suggestions
        const allTechs = this.projectsManager.getAllTechnologies();
        allTechs.forEach(tech => {
            if (tech.toLowerCase().includes(queryLower) && 
                !suggestions.some(s => s.title === tech)) {
                suggestions.push({
                    title: tech,
                    category: 'Technologie',
                    icon: 'fa-code',
                    query: tech
                });
            }
        });

        // Category suggestions
        this.projectsManager.categories.forEach(category => {
            if (category.name.toLowerCase().includes(queryLower)) {
                suggestions.push({
                    title: category.name,
                    category: 'Catégorie',
                    icon: 'fa-tag',
                    query: category.name
                });
            }
        });

        return suggestions.slice(0, 5); // Limit to 5 suggestions
    }

    /**
     * Hide search suggestions
     */
    hideSuggestions() {
        const suggestionsContainer = document.getElementById('search-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.classList.remove('visible');
        }
    }

    /**
     * Handle keyboard navigation in search
     */
    handleSearchKeyboard(e) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        if (!suggestionsContainer.classList.contains('visible')) return;

        const suggestions = suggestionsContainer.querySelectorAll('.search-suggestion');
        let currentHighlight = suggestionsContainer.querySelector('.search-suggestion.highlighted');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!currentHighlight) {
                    suggestions[0]?.classList.add('highlighted');
                } else {
                    currentHighlight.classList.remove('highlighted');
                    const nextIndex = Array.from(suggestions).indexOf(currentHighlight) + 1;
                    if (nextIndex < suggestions.length) {
                        suggestions[nextIndex].classList.add('highlighted');
                    } else {
                        suggestions[0]?.classList.add('highlighted');
                    }
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (!currentHighlight) {
                    suggestions[suggestions.length - 1]?.classList.add('highlighted');
                } else {
                    currentHighlight.classList.remove('highlighted');
                    const prevIndex = Array.from(suggestions).indexOf(currentHighlight) - 1;
                    if (prevIndex >= 0) {
                        suggestions[prevIndex].classList.add('highlighted');
                    } else {
                        suggestions[suggestions.length - 1]?.classList.add('highlighted');
                    }
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                if (currentHighlight) {
                    currentHighlight.click();
                }
                break;
                
            case 'Escape':
                this.hideSuggestions();
                break;
        }
    }

    /**
     * Render filter buttons
     */
    renderFilters() {
        const filtersContainer = document.getElementById('filters');
        if (!filtersContainer) return;

        const filters = [
            { id: 'all', name: 'Tous les projets' },
            ...this.projectsManager.categories
        ];

        filtersContainer.innerHTML = filters.map(filter => `
            <button class="filter-button ${filter.id === 'all' ? 'active' : ''}" 
                    data-filter="${filter.id}">
                ${filter.name}
            </button>
        `).join('');

        // Add filter event listeners
        filtersContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-button')) {
                this.handleFilterChange(e.target.dataset.filter);
                
                // Update active state
                filtersContainer.querySelectorAll('.filter-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            }
        });
    }

    /**
     * Handle filter change
     */
    handleFilterChange(filter) {
        this.projectsManager.setFilter(filter);
        this.renderPage();
        this.scrollToTop();
    }

    /**
     * Handle search
     */
    handleSearch(query) {
        this.currentSearchQuery = query.trim();
        this.renderPage();
    }

    /**
     * Render the current page
     */
    renderPage() {
        let projects;
        
        if (this.currentSearchQuery) {
            projects = this.projectsManager.searchProjects(this.currentSearchQuery);
            this.renderProjects(projects);
            this.renderPagination(1, 1); // Single page for search results
        } else {
            projects = this.projectsManager.getPaginatedProjects();
            this.renderProjects(projects);
            this.renderPagination(this.projectsManager.getTotalPages(), this.projectsManager.currentPage);
        }

        // Update results count
        this.updateResultsCount();
    }

    /**
     * Render projects grid
     */
    renderProjects(projects) {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;

        if (projects.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <h3>Aucun projet trouvé</h3>
                    <p>Essayez de modifier vos critères de recherche.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = projects.map(project => this.createProjectCard(project)).join('');
    }

    /**
     * Create a project card HTML
     */
    createProjectCard(project) {
        const techTags = project.technologies.map(tech => 
            `<span class="tech-tag">${tech}</span>`
        ).join('');

        const featureTags = project.features.map(feature => 
            `<div class="feature-tag">
                <i class="fas fa-check"></i>
                <span>${feature}</span>
            </div>`
        ).join('');

        return `
            <div class="project-card">
                <a href="${project.link}" class="project-link">
                    <div class="card-image">
                        <img src="${project.image}" alt="${project.title}" loading="lazy">
                    </div>
                    <div class="card-body">
                        <h3>${project.title}</h3>
                        <p class="project-period">${project.period}</p>
                        <p>${project.description}</p>
                        ${project.features ? `
                            <div class="project-features">
                                ${featureTags}
                            </div>
                        ` : ''}
                        <div class="tech-stack">
                            ${techTags}
                        </div>
                    </div>
                    <div class="card-footer">
                        <span class="btn">
                            <i class="fas fa-external-link-alt"></i> Voir le projet
                        </span>
                    </div>
                </a>
            </div>
        `;
    }

    /**
     * Render pagination
     */
    renderPagination(totalPages, currentPage) {
        const container = document.getElementById('pagination');
        if (!container || totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
                <i class="fas fa-chevron-left"></i> Précédent
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHTML += `
                    <button class="${i === currentPage ? 'active' : ''}" data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHTML += '<span class="pagination-ellipsis">...</span>';
            }
        }

        // Next button
        paginationHTML += `
            <button ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
                Suivant <i class="fas fa-chevron-right"></i>
            </button>
        `;

        container.innerHTML = paginationHTML;

        // Add pagination event listeners
        container.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && !e.target.disabled) {
                const page = parseInt(e.target.dataset.page);
                if (this.projectsManager.setPage(page)) {
                    this.renderPage();
                    this.scrollToTop();
                }
            }
        });
    }

    /**
     * Update results count display
     */
    updateResultsCount() {
        const countElement = document.getElementById('results-count');
        if (!countElement) return;

        const filtered = this.currentSearchQuery 
            ? this.projectsManager.searchProjects(this.currentSearchQuery)
            : this.projectsManager.getFilteredProjects();

        countElement.textContent = `${filtered.length} projet${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''}`;
    }

    /**
     * Show loading state
     */
    showLoading() {
        const grid = document.getElementById('projects-grid');
        if (grid) {
            grid.innerHTML = '<div class="loading">Chargement des projets...</div>';
        }
        this.isLoading = true;
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        this.isLoading = false;
    }

    /**
     * Show error message
     */
    showError(message) {
        const grid = document.getElementById('projects-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="error">
                    <h3>Erreur</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        Réessayer
                    </button>
                </div>
            `;
        }
    }

    /**
     * Scroll to top of page
     */
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const controller = new ProjectsPageController();
    controller.init();
});
