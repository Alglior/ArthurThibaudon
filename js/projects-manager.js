/**
 * Projects Data Manager
 * Handles loading and managing project data from JSON
 */

class ProjectsManager {
    constructor() {
        this.projects = [];
        this.categories = [];
        this.currentFilter = 'all';
        this.itemsPerPage = 6;
        this.currentPage = 1;
    }

    /**
     * Load projects data from JSON file
     */
    async loadData() {
        try {
            const response = await fetch('data/projects.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.projects = data.projects;
            this.categories = data.categories;
            return data;
        } catch (error) {
            console.error('Error loading projects data:', error);
            throw error;
        }
    }

    /**
     * Get filtered projects based on current filter
     */
    getFilteredProjects() {
        if (this.currentFilter === 'all') {
            return this.projects;
        }
        return this.projects.filter(project => project.category === this.currentFilter);
    }

    /**
     * Get projects for current page
     */
    getPaginatedProjects() {
        const filtered = this.getFilteredProjects();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return filtered.slice(start, end);
    }

    /**
     * Get total pages for current filter
     */
    getTotalPages() {
        const filtered = this.getFilteredProjects();
        return Math.ceil(filtered.length / this.itemsPerPage);
    }

    /**
     * Set current filter
     */
    setFilter(filter) {
        this.currentFilter = filter;
        this.currentPage = 1; // Reset to first page when filtering
    }

    /**
     * Set current page
     */
    setPage(page) {
        const totalPages = this.getTotalPages();
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            return true;
        }
        return false;
    }

    /**
     * Get featured projects (for homepage)
     * Limited to 3 projects maximum
     */
    getFeaturedProjects() {
        return this.projects
            .filter(project => project.featured)
            .slice(0, 3); // Limit to 3 projects maximum
    }

    /**
     * Search projects by title or description
     */
    searchProjects(query) {
        const searchTerm = query.toLowerCase();
        return this.projects.filter(project => 
            project.title.toLowerCase().includes(searchTerm) ||
            project.description.toLowerCase().includes(searchTerm) ||
            project.technologies.some(tech => tech.toLowerCase().includes(searchTerm))
        );
    }

    /**
     * Get project by ID
     */
    getProjectById(id) {
        return this.projects.find(project => project.id === id);
    }

    /**
     * Get projects by category
     */
    getProjectsByCategory(categoryId) {
        return this.projects.filter(project => project.category === categoryId);
    }

    /**
     * Get all unique technologies used across projects
     */
    getAllTechnologies() {
        const allTechs = this.projects.flatMap(project => project.technologies);
        return [...new Set(allTechs)].sort();
    }

    /**
     * Get projects statistics
     */
    getStats() {
        return {
            totalProjects: this.projects.length,
            totalCategories: this.categories.length,
            featuredProjects: this.projects.filter(p => p.featured).length,
            technologies: this.getAllTechnologies().length
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectsManager;
} else {
    window.ProjectsManager = ProjectsManager;
}
