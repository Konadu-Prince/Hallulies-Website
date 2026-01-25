/**
 * Document Management System Component
 * Senior UI/UX Developer Implementation
 * Handles invoices, receipts, and financial documents
 */

class DocumentManagementSystem {
    constructor(options = {}) {
        this.config = {
            apiUrl: '/api/documents',
            uploadUrl: '/api/upload-document',
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
            ...options
        };
        
        this.state = {
            documents: [],
            currentView: 'invoices',
            isLoading: false,
            searchTerm: '',
            filters: {
                status: 'all',
                dateRange: 'all',
                type: 'all'
            }
        };
        
        this.elements = {};
        this.init();
    }
    
    async init() {
        await this.loadDocuments();
        this.createDOMElements();
        this.bindEvents();
    }
    
    async loadDocuments() {
        try {
            this.state.isLoading = true;
            const response = await fetch(`${this.config.apiUrl}?view=${this.state.currentView}`);
            const data = await response.json();
            this.state.documents = data.documents || [];
        } catch (error) {
            console.error('Failed to load documents:', error);
            this.showNotification('Failed to load documents', 'error');
        } finally {
            this.state.isLoading = false;
        }
    }
    
    createDOMElements() {
        this.elements.container = document.createElement('div');
        this.elements.container.className = 'document-management';
        
        this.elements.container.innerHTML = `
            <div class="documents-header">
                <h2>Financial Documents</h2>
                <div class="header-actions">
                    <button class="upload-btn" id="upload-document">
                        <span>📤</span> Upload Document
                    </button>
                    <button class="refresh-btn" id="refresh-documents">
                        <span>🔄</span> Refresh
                    </button>
                </div>
            </div>
            
            <div class="documents-navigation">
                <div class="nav-tabs">
                    <button class="nav-tab active" data-view="invoices">Invoices</button>
                    <button class="nav-tab" data-view="receipts">Receipts</button>
                    <button class="nav-tab" data-view="statements">Statements</button>
                    <button class="nav-tab" data-view="all">All Documents</button>
                </div>
            </div>
            
            <div class="documents-toolbar">
                <div class="search-box">
                    <input type="text" id="document-search" placeholder="Search documents...">
                    <span class="search-icon">🔍</span>
                </div>
                
                <div class="filter-controls">
                    <select id="status-filter">
                        <option value="all">All Statuses</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                    </select>
                    
                    <select id="date-filter">
                        <option value="all">All Dates</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
            </div>
            
            <div class="documents-grid" id="documents-grid">
                ${this.renderLoadingState()}
            </div>
            
            <div class="documents-footer">
                <div class="pagination">
                    <button class="pagination-btn prev" disabled>Previous</button>
                    <span class="pagination-info">Page 1 of 1</span>
                    <button class="pagination-btn next" disabled>Next</button>
                </div>
                
                <div class="documents-stats">
                    <span>Total: <strong id="total-count">0</strong></span>
                    <span>Paid: <strong id="paid-count">0</strong></span>
                    <span>Pending: <strong id="pending-count">0</strong></span>
                </div>
            </div>
        `;
        
        // Insert into admin or user dashboard
        const dashboard = document.querySelector('#dashboard-content') || document.body;
        dashboard.appendChild(this.elements.container);
    }
    
    renderLoadingState() {
        return `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading documents...</p>
            </div>
        `;
    }
    
    renderDocuments(documents) {
        if (documents.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <h3>No documents found</h3>
                    <p>Upload your first document to get started</p>
                    <button class="upload-btn primary" id="upload-first">
                        Upload Document
                    </button>
                </div>
            `;
        }
        
        return documents.map(doc => this.renderDocumentCard(doc)).join('');
    }
    
    renderDocumentCard(doc) {
        const statusClass = this.getStatusClass(doc.status);
        const fileTypeIcon = this.getFileTypeIcon(doc.file_type);
        
        return `
            <div class="document-card" data-id="${doc.id}" data-status="${doc.status}">
                <div class="document-header">
                    <div class="document-icon">${fileTypeIcon}</div>
                    <div class="document-status ${statusClass}">
                        ${doc.status}
                    </div>
                </div>
                
                <div class="document-content">
                    <h3 class="document-title">${doc.title}</h3>
                    <p class="document-description">${doc.description || 'No description'}</p>
                    
                    <div class="document-meta">
                        <span class="document-date">📅 ${this.formatDate(doc.created_at)}</span>
                        <span class="document-amount">💰 ${doc.currency} ${doc.amount}</span>
                        <span class="document-size">💾 ${this.formatFileSize(doc.file_size)}</span>
                    </div>
                </div>
                
                <div class="document-actions">
                    <button class="action-btn view" data-action="view" title="View Document">
                        👁️
                    </button>
                    <button class="action-btn download" data-action="download" title="Download">
                        ⬇️
                    </button>
                    <button class="action-btn share" data-action="share" title="Share">
                        📤
                    </button>
                    <button class="action-btn delete" data-action="delete" title="Delete">
                        🗑️
                    </button>
                </div>
                
                ${doc.status === 'pending' ? `
                    <div class="document-overlay pending-overlay">
                        <button class="pay-now-btn" data-doc-id="${doc.id}">
                            Pay Now
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    bindEvents() {
        // Navigation tabs
        this.elements.container.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });
        
        // Search functionality
        const searchInput = this.elements.container.querySelector('#document-search');
        searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        
        // Filter changes
        this.elements.container.querySelector('#status-filter').addEventListener('change', this.handleFilterChange.bind(this));
        this.elements.container.querySelector('#date-filter').addEventListener('change', this.handleFilterChange.bind(this));
        
        // Action buttons
        this.elements.container.addEventListener('click', this.handleAction.bind(this));
        
        // Upload button
        this.elements.container.querySelector('#upload-document').addEventListener('click', this.openUploadModal.bind(this));
        
        // Refresh button
        this.elements.container.querySelector('#refresh-documents').addEventListener('click', this.refreshDocuments.bind(this));
    }
    
    switchView(view) {
        // Update active tab
        this.elements.container.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        this.elements.container.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        this.state.currentView = view;
        this.loadDocuments();
    }
    
    handleSearch(e) {
        this.state.searchTerm = e.target.value.toLowerCase();
        this.filterAndRenderDocuments();
    }
    
    handleFilterChange() {
        this.state.filters.status = this.elements.container.querySelector('#status-filter').value;
        this.state.filters.dateRange = this.elements.container.querySelector('#date-filter').value;
        this.filterAndRenderDocuments();
    }
    
    filterAndRenderDocuments() {
        let filteredDocs = [...this.state.documents];
        
        // Apply search filter
        if (this.state.searchTerm) {
            filteredDocs = filteredDocs.filter(doc => 
                doc.title.toLowerCase().includes(this.state.searchTerm) ||
                doc.description?.toLowerCase().includes(this.state.searchTerm)
            );
        }
        
        // Apply status filter
        if (this.state.filters.status !== 'all') {
            filteredDocs = filteredDocs.filter(doc => doc.status === this.state.filters.status);
        }
        
        // Apply date filter
        if (this.state.filters.dateRange !== 'all') {
            const cutoffDate = this.getDateCutoff(this.state.filters.dateRange);
            filteredDocs = filteredDocs.filter(doc => new Date(doc.created_at) >= cutoffDate);
        }
        
        this.renderDocumentGrid(filteredDocs);
        this.updateStats(filteredDocs);
    }
    
    async handleAction(e) {
        const actionBtn = e.target.closest('.action-btn');
        if (!actionBtn) return;
        
        const action = actionBtn.dataset.action;
        const docCard = actionBtn.closest('.document-card');
        const docId = docCard.dataset.id;
        
        switch (action) {
            case 'view':
                this.viewDocument(docId);
                break;
            case 'download':
                this.downloadDocument(docId);
                break;
            case 'share':
                this.shareDocument(docId);
                break;
            case 'delete':
                this.deleteDocument(docId);
                break;
        }
    }
    
    async viewDocument(docId) {
        try {
            const response = await fetch(`${this.config.apiUrl}/${docId}/view`);
            const data = await response.json();
            
            // Open document in modal or new tab
            this.openDocumentViewer(data);
        } catch (error) {
            this.showNotification('Failed to load document', 'error');
        }
    }
    
    async downloadDocument(docId) {
        try {
            const response = await fetch(`${this.config.apiUrl}/${docId}/download`);
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `document-${docId}.${this.getDocumentExtension(docId)}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            this.showNotification('Document downloaded successfully', 'success');
        } catch (error) {
            this.showNotification('Failed to download document', 'error');
        }
    }
    
    async shareDocument(docId) {
        try {
            const response = await fetch(`${this.config.apiUrl}/${docId}/share-link`);
            const data = await response.json();
            
            // Copy share link to clipboard
            await navigator.clipboard.writeText(data.share_link);
            this.showNotification('Share link copied to clipboard', 'success');
        } catch (error) {
            this.showNotification('Failed to generate share link', 'error');
        }
    }
    
    async deleteDocument(docId) {
        if (!confirm('Are you sure you want to delete this document?')) return;
        
        try {
            await fetch(`${this.config.apiUrl}/${docId}`, { method: 'DELETE' });
            this.showNotification('Document deleted successfully', 'success');
            this.loadDocuments(); // Reload documents
        } catch (error) {
            this.showNotification('Failed to delete document', 'error');
        }
    }
    
    openUploadModal() {
        const modal = document.createElement('div');
        modal.className = 'upload-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Upload Document</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="upload-form">
                        <div class="form-group">
                            <label for="document-title">Document Title</label>
                            <input type="text" id="document-title" name="title" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="document-type">Document Type</label>
                            <select id="document-type" name="type" required>
                                <option value="">Select Type</option>
                                <option value="invoice">Invoice</option>
                                <option value="receipt">Receipt</option>
                                <option value="statement">Statement</option>
                                <option value="contract">Contract</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="document-file">Choose File</label>
                            <input type="file" id="document-file" name="file" 
                                   accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" required>
                            <div class="file-info">
                                <small>Maximum file size: 10MB</small>
                                <small>Supported formats: PDF, JPG, PNG, DOC, DOCX</small>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="document-amount">Amount (if applicable)</label>
                            <input type="number" id="document-amount" name="amount" step="0.01">
                        </div>
                        
                        <div class="form-group">
                            <label for="document-description">Description</label>
                            <textarea id="document-description" name="description" rows="3"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="cancel-btn">Cancel</button>
                            <button type="submit" class="submit-btn">Upload</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(modal);
        
        // Bind events
        modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('#upload-form').addEventListener('submit', this.handleUpload.bind(this));
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    async handleUpload(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const file = formData.get('file');
        
        // Validate file
        if (file.size > this.config.maxFileSize) {
            this.showNotification('File size exceeds 10MB limit', 'error');
            return;
        }
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!this.config.allowedTypes.includes(fileExtension)) {
            this.showNotification('File type not supported', 'error');
            return;
        }
        
        try {
            const response = await fetch(this.config.uploadUrl, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Document uploaded successfully', 'success');
                document.querySelector('.upload-modal').remove();
                this.loadDocuments(); // Reload documents
            } else {
                this.showNotification(result.message || 'Upload failed', 'error');
            }
        } catch (error) {
            this.showNotification('Upload failed', 'error');
        }
    }
    
    // Utility methods
    getStatusClass(status) {
        const classes = {
            paid: 'status-paid',
            pending: 'status-pending',
            overdue: 'status-overdue',
            draft: 'status-draft'
        };
        return classes[status] || 'status-default';
    }
    
    getFileTypeIcon(type) {
        const icons = {
            pdf: '📄',
            jpg: '🖼️',
            jpeg: '🖼️',
            png: '🖼️',
            doc: '📝',
            docx: '📝'
        };
        return icons[type] || '📁';
    }
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    getDateCutoff(range) {
        const now = new Date();
        switch (range) {
            case 'today':
                return new Date(now.setHours(0, 0, 0, 0));
            case 'week':
                return new Date(now.setDate(now.getDate() - 7));
            case 'month':
                return new Date(now.setMonth(now.getMonth() - 1));
            case 'year':
                return new Date(now.setFullYear(now.getFullYear() - 1));
            default:
                return new Date(0);
        }
    }
    
    getDocumentExtension(docId) {
        const doc = this.state.documents.find(d => d.id === docId);
        return doc ? doc.file_type : 'pdf';
    }
    
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
    
    showNotification(message, type) {
        // Implementation similar to payment system notification
        const notification = document.createElement('div');
        notification.className = `document-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            ${type === 'success' ? 'background: #4CAF50;' : 'background: #f44336;'}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    renderDocumentGrid(documents) {
        const grid = this.elements.container.querySelector('#documents-grid');
        grid.innerHTML = this.renderDocuments(documents);
    }
    
    updateStats(documents) {
        const totalCount = documents.length;
        const paidCount = documents.filter(d => d.status === 'paid').length;
        const pendingCount = documents.filter(d => d.status === 'pending').length;
        
        this.elements.container.querySelector('#total-count').textContent = totalCount;
        this.elements.container.querySelector('#paid-count').textContent = paidCount;
        this.elements.container.querySelector('#pending-count').textContent = pendingCount;
    }
    
    refreshDocuments() {
        this.loadDocuments();
    }
}

// Initialize document management system
document.addEventListener('DOMContentLoaded', () => {
    new DocumentManagementSystem({
        apiUrl: '/api/documents',
        uploadUrl: '/api/upload-document'
    });
});