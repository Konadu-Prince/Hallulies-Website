/**
 * Advanced Search System Component
 * Senior UI/UX Developer Implementation
 */

class SearchSystem {
    constructor(options = {}) {
        this.config = {
            apiUrl: '/api/search',
            debounceDelay: 300,
            minQueryLength: 2,
            maxResults: 10,
            enableFilters: true,
            ...options
        };
        
        this.state = {
            query: '',
            results: [],
            isLoading: false,
            selectedIndex: -1,
            filters: {
                category: 'all',
                dateRange: 'any',
                priceRange: 'any'
            }
        };
        
        this.elements = {};
        this.init();
    }
    
    init() {
        this.createDOMElements();
        this.bindEvents();
        this.setupAccessibility();
    }
    
    createDOMElements() {
        // Search container
        this.elements.container = document.createElement('div');
        this.elements.container.className = 'search-system';
        this.elements.container.setAttribute('role', 'search');
        
        // Search input
        this.elements.input = document.createElement('input');
        this.elements.input.type = 'search';
        this.elements.input.placeholder = 'Search rooms, services, events...';
        this.elements.input.className = 'search-input';
        this.elements.input.setAttribute('aria-autocomplete', 'list');
        this.elements.input.setAttribute('aria-expanded', 'false');
        this.elements.input.setAttribute('aria-owns', 'search-results');
        
        // Search button
        this.elements.button = document.createElement('button');
        this.elements.button.type = 'button';
        this.elements.button.className = 'search-button';
        this.elements.button.setAttribute('aria-label', 'Search');
        this.elements.button.innerHTML = '🔍';
        
        // Results container
        this.elements.resultsContainer = document.createElement('div');
        this.elements.resultsContainer.id = 'search-results';
        this.elements.resultsContainer.className = 'search-results';
        this.elements.resultsContainer.setAttribute('role', 'listbox');
        this.elements.resultsContainer.hidden = true;
        
        // Filter controls
        if (this.config.enableFilters) {
            this.elements.filters = this.createFilterControls();
        }
        
        // Assemble DOM
        this.elements.container.appendChild(this.elements.input);
        this.elements.container.appendChild(this.elements.button);
        if (this.elements.filters) {
            this.elements.container.appendChild(this.elements.filters);
        }
        this.elements.container.appendChild(this.elements.resultsContainer);
        
        // Insert into page
        document.querySelector('.hero-content')?.appendChild(this.elements.container);
    }
    
    createFilterControls() {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'search-filters';
        
        // Category filter
        const categorySelect = document.createElement('select');
        categorySelect.className = 'filter-select';
        categorySelect.innerHTML = `
            <option value="all">All Categories</option>
            <option value="rooms">Rooms</option>
            <option value="services">Services</option>
            <option value="events">Events</option>
            <option value="dining">Dining</option>
        `;
        
        // Date range filter
        const dateSelect = document.createElement('select');
        dateSelect.className = 'filter-select';
        dateSelect.innerHTML = `
            <option value="any">Any Date</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
        `;
        
        filterContainer.appendChild(categorySelect);
        filterContainer.appendChild(dateSelect);
        
        return filterContainer;
    }
    
    bindEvents() {
        // Input events
        this.elements.input.addEventListener('input', this.debounce(this.handleInput.bind(this), this.config.debounceDelay));
        this.elements.input.addEventListener('keydown', this.handleKeydown.bind(this));
        this.elements.input.addEventListener('focus', this.handleFocus.bind(this));
        this.elements.input.addEventListener('blur', this.handleBlur.bind(this));
        
        // Button events
        this.elements.button.addEventListener('click', this.performSearch.bind(this));
        
        // Filter events
        if (this.elements.filters) {
            this.elements.filters.querySelectorAll('select').forEach(select => {
                select.addEventListener('change', this.updateFilters.bind(this));
            });
        }
        
        // Click outside to close
        document.addEventListener('click', this.handleClickOutside.bind(this));
    }
    
    setupAccessibility() {
        // Keyboard navigation
        this.elements.input.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateResults(1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateResults(-1);
                    break;
                case 'Enter':
                    if (this.state.selectedIndex >= 0) {
                        e.preventDefault();
                        this.selectResult(this.state.selectedIndex);
                    } else {
                        this.performSearch();
                    }
                    break;
                case 'Escape':
                    this.clearResults();
                    break;
            }
        });
    }
    
    async handleInput(e) {
        this.state.query = e.target.value.trim();
        
        if (this.state.query.length < this.config.minQueryLength) {
            this.clearResults();
            return;
        }
        
        await this.performSearch();
    }
    
    async performSearch() {
        if (!this.state.query) return;
        
        this.state.isLoading = true;
        this.showLoadingState();
        
        try {
            const params = new URLSearchParams({
                q: this.state.query,
                category: this.state.filters.category,
                limit: this.config.maxResults
            });
            
            const response = await fetch(`${this.config.apiUrl}?${params}`);
            const data = await response.json();
            
            this.state.results = data.results || [];
            this.renderResults();
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Failed to perform search. Please try again.');
        } finally {
            this.state.isLoading = false;
            this.hideLoadingState();
        }
    }
    
    renderResults() {
        if (this.state.results.length === 0) {
            this.showNoResults();
            return;
        }
        
        const resultsHTML = this.state.results.map((result, index) => `
            <div class="search-result-item" 
                 role="option" 
                 aria-selected="${index === this.state.selectedIndex}"
                 data-index="${index}"
                 tabindex="-1">
                <div class="result-title">${this.highlightMatch(result.title)}</div>
                <div class="result-category">${result.category}</div>
                <div class="result-preview">${this.truncateText(result.description, 100)}</div>
            </div>
        `).join('');
        
        this.elements.resultsContainer.innerHTML = resultsHTML;
        this.elements.resultsContainer.hidden = false;
        this.elements.input.setAttribute('aria-expanded', 'true');
        
        // Bind result events
        this.elements.resultsContainer.querySelectorAll('.search-result-item').forEach((item, index) => {
            item.addEventListener('click', () => this.selectResult(index));
            item.addEventListener('mouseenter', () => this.highlightResult(index));
        });
    }
    
    highlightMatch(text) {
        if (!this.state.query) return text;
        const regex = new RegExp(`(${this.escapeRegex(this.state.query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    selectResult(index) {
        const result = this.state.results[index];
        if (result) {
            // Handle result selection based on type
            switch(result.type) {
                case 'room':
                    window.location.href = `/booking.html?room=${result.id}`;
                    break;
                case 'service':
                    window.location.href = `#${result.slug}`;
                    break;
                case 'event':
                    window.location.href = `/events.html?id=${result.id}`;
                    break;
                default:
                    window.location.href = result.url;
            }
        }
    }
    
    navigateResults(direction) {
        const newIndex = this.state.selectedIndex + direction;
        if (newIndex >= 0 && newIndex < this.state.results.length) {
            this.highlightResult(newIndex);
        }
    }
    
    highlightResult(index) {
        // Remove previous highlighting
        this.elements.resultsContainer.querySelectorAll('[aria-selected="true"]')
            .forEach(el => el.setAttribute('aria-selected', 'false'));
        
        // Highlight new selection
        const selectedItem = this.elements.resultsContainer.querySelector(`[data-index="${index}"]`);
        if (selectedItem) {
            selectedItem.setAttribute('aria-selected', 'true');
            selectedItem.focus();
            this.state.selectedIndex = index;
        }
    }
    
    // Utility methods
    debounce(func, wait) {
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
    
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    showLoadingState() {
        this.elements.button.innerHTML = '⏳';
        this.elements.button.disabled = true;
    }
    
    hideLoadingState() {
        this.elements.button.innerHTML = '🔍';
        this.elements.button.disabled = false;
    }
    
    showNoResults() {
        this.elements.resultsContainer.innerHTML = `
            <div class="no-results">
                <p>No results found for "${this.state.query}"</p>
                <p>Try different keywords or browse our categories</p>
            </div>
        `;
        this.elements.resultsContainer.hidden = false;
    }
    
    showError(message) {
        this.elements.resultsContainer.innerHTML = `
            <div class="search-error">
                <p>⚠️ ${message}</p>
            </div>
        `;
        this.elements.resultsContainer.hidden = false;
    }
    
    clearResults() {
        this.elements.resultsContainer.hidden = true;
        this.elements.input.setAttribute('aria-expanded', 'false');
        this.state.selectedIndex = -1;
    }
    
    handleKeydown(e) {
        // Prevent form submission on Enter
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }
    
    handleFocus() {
        if (this.state.results.length > 0) {
            this.elements.resultsContainer.hidden = false;
        }
    }
    
    handleBlur(e) {
        // Delay hiding to allow click events on results
        setTimeout(() => {
            if (!this.elements.container.contains(document.activeElement)) {
                this.clearResults();
            }
        }, 150);
    }
    
    handleClickOutside(e) {
        if (!this.elements.container.contains(e.target)) {
            this.clearResults();
        }
    }
    
    updateFilters() {
        if (this.elements.filters) {
            this.state.filters.category = this.elements.filters.querySelector('select:first-child').value;
            this.state.filters.dateRange = this.elements.filters.querySelector('select:last-child').value;
        }
        if (this.state.query.length >= this.config.minQueryLength) {
            this.performSearch();
        }
    }
}

// Initialize search system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SearchSystem({
        apiUrl: '/api/search',
        enableFilters: true
    });
});