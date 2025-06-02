// marketplace.js - Handles marketplace functionality for skill browsing and matching

class SkillMarketplace {
    constructor() {
        this.currentUser = null;
        this.allUsers = [];
        this.filteredUsers = [];
        this.init();
    }

    async init() {
        await this.checkAuthentication();
        await this.loadCurrentUser();
        await this.loadAllUsers();
        this.setupEventListeners();
        this.renderUserCards();
    }

    // Check if user is authenticated
    async checkAuthentication() {
        try {
            const response = await fetch('/api/auth/check', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                window.location.href = '/login.html';
                return;
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = '/login.html';
        }
    }

    // Load current user data
    async loadCurrentUser() {
        try {
            const response = await fetch('/api/user/profile', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                this.currentUser = await response.json();
                this.updateUserInfo();
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
        }
    }

    // Load all users for marketplace
    async loadAllUsers() {
        try {
            const response = await fetch('/api/users/marketplace', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                this.allUsers = await response.json();
                this.filteredUsers = [...this.allUsers];
            }
        } catch (error) {
            console.error('Failed to load marketplace users:', error);
            this.showError('Failed to load marketplace data');
        }
    }

    // Update user info in the header
    updateUserInfo() {
        const userNameEl = document.getElementById('user-name');
        const userSkillsEl = document.getElementById('user-skills');
        
        if (userNameEl && this.currentUser) {
            userNameEl.textContent = this.currentUser.name;
        }
        
        if (userSkillsEl && this.currentUser) {
            userSkillsEl.textContent = `Skills: ${this.currentUser.skillsOffering?.join(', ') || 'None'}`;
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Search functionality
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }

        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilter(e.target.dataset.filter);
            });
        });

        // Clear filters
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        // Logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Navigation
        const dashboardBtn = document.getElementById('dashboard-btn');
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => {
                window.location.href = '/dashboard.html';
            });
        }
    }

    // Handle search functionality
    handleSearch() {
        const searchInput = document.getElementById('search-input');
        const searchTerm = searchInput?.value.toLowerCase().trim();

        if (!searchTerm) {
            this.filteredUsers = [...this.allUsers];
        } else {
            this.filteredUsers = this.allUsers.filter(user => {
                return (
                    user.name.toLowerCase().includes(searchTerm) ||
                    user.skillsOffering?.some(skill => 
                        skill.toLowerCase().includes(searchTerm)
                    ) ||
                    user.skillsSeeking?.some(skill => 
                        skill.toLowerCase().includes(searchTerm)
                    ) ||
                    user.location?.toLowerCase().includes(searchTerm)
                );
            });
        }

        this.renderUserCards();
        this.updateResultsCount();
    }

    // Handle filter functionality
    handleFilter(filterType) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        // Update active filter button
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${filterType}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Apply filter
        switch (filterType) {
            case 'all':
                this.filteredUsers = [...this.allUsers];
                break;
            case 'matched':
                this.filteredUsers = this.getMatchedUsers();
                break;
            case 'nearby':
                this.filteredUsers = this.getNearbyUsers();
                break;
            case 'online':
                this.filteredUsers = this.getOnlineUsers();
                break;
            default:
                this.filteredUsers = [...this.allUsers];
        }

        this.renderUserCards();
        this.updateResultsCount();
    }

    // Get users with matching skills
    getMatchedUsers() {
        if (!this.currentUser?.skillsSeeking) return [];

        return this.allUsers.filter(user => {
            return user.skillsOffering?.some(skill => 
                this.currentUser.skillsSeeking.includes(skill)
            );
        });
    }

    // Get nearby users (placeholder logic)
    getNearbyUsers() {
        if (!this.currentUser?.location) return [];

        return this.allUsers.filter(user => 
            user.location === this.currentUser.location
        );
    }

    // Get online users (placeholder logic)
    getOnlineUsers() {
        return this.allUsers.filter(user => user.isOnline);
    }

    // Clear all filters
    clearFilters() {
        this.filteredUsers = [...this.allUsers];
        
        // Reset filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        const allBtn = document.querySelector('[data-filter="all"]');
        if (allBtn) {
            allBtn.classList.add('active');
        }

        // Reset search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        this.renderUserCards();
        this.updateResultsCount();
    }

    // Render user cards in the marketplace
    renderUserCards() {
        const container = document.getElementById('users-container');
        if (!container) return;

        if (this.filteredUsers.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>No users found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredUsers.map(user => 
            this.createUserCard(user)
        ).join('');

        // Add event listeners to new buttons
        this.addCardEventListeners();
    }

    // Create individual user card HTML
    createUserCard(user) {
        const isMatched = this.isUserMatched(user);
        const matchBadge = isMatched ? '<span class="match-badge">✨ Match</span>' : '';
        
        return `
            <div class="user-card" data-user-id="${user._id}">
                <div class="user-header">
                    <div class="user-avatar">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="user-info">
                        <h3>${user.name}</h3>
                        <p class="location">${user.location || 'Location not specified'}</p>
                        ${matchBadge}
                    </div>
                    <div class="user-status ${user.isOnline ? 'online' : 'offline'}">
                        ${user.isOnline ? '🟢' : '⚫'}
                    </div>
                </div>
                
                <div class="skills-section">
                    <div class="skills-offering">
                        <h4>Offers</h4>
                        <div class="skills-tags">
                            ${(user.skillsOffering || []).map(skill => 
                                `<span class="skill-tag offering">${skill}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="skills-seeking">
                        <h4>Seeks</h4>
                        <div class="skills-tags">
                            ${(user.skillsSeeking || []).map(skill => 
                                `<span class="skill-tag seeking">${skill}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="user-actions">
                    <button class="btn-primary connect-btn" data-user-id="${user._id}">
                        Connect
                    </button>
                    <button class="btn-secondary view-profile-btn" data-user-id="${user._id}">
                        View Profile
                    </button>
                </div>
            </div>
        `;
    }

    // Check if user has matching skills
    isUserMatched(user) {
        if (!this.currentUser?.skillsSeeking || !user.skillsOffering) return false;
        
        return user.skillsOffering.some(skill => 
            this.currentUser.skillsSeeking.includes(skill)
        );
    }

    // Add event listeners to card buttons
    addCardEventListeners() {
        // Connect buttons
        const connectBtns = document.querySelectorAll('.connect-btn');
        connectBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.dataset.userId;
                this.handleConnect(userId);
            });
        });

        // View profile buttons
        const viewProfileBtns = document.querySelectorAll('.view-profile-btn');
        viewProfileBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.dataset.userId;
                this.handleViewProfile(userId);
            });
        });
    }

    // Handle connect request
    async handleConnect(userId) {
        try {
            const response = await fetch('/api/sessions/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ recipientId: userId })
            });

            if (response.ok) {
                this.showSuccess('Connection request sent!');
                
                // Update button state
                const connectBtn = document.querySelector(`[data-user-id="${userId}"].connect-btn`);
                if (connectBtn) {
                    connectBtn.textContent = 'Request Sent';
                    connectBtn.disabled = true;
                    connectBtn.classList.add('disabled');
                }
            } else {
                const error = await response.json();
                this.showError(error.message || 'Failed to send connection request');
            }
        } catch (error) {
            console.error('Connect request failed:', error);
            this.showError('Failed to send connection request');
        }
    }

    // Handle view profile
    handleViewProfile(userId) {
        // This could open a modal or navigate to a profile page
        // For now, we'll implement a simple modal approach
        this.openProfileModal(userId);
    }

    // Open profile modal
    openProfileModal(userId) {
        const user = this.allUsers.find(u => u._id === userId);
        if (!user) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${user.name}'s Profile</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="profile-section">
                        <h3>Location</h3>
                        <p>${user.location || 'Not specified'}</p>
                    </div>
                    <div class="profile-section">
                        <h3>Skills Offering</h3>
                        <div class="skills-tags">
                            ${(user.skillsOffering || []).map(skill => 
                                `<span class="skill-tag offering">${skill}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="profile-section">
                        <h3>Skills Seeking</h3>
                        <div class="skills-tags">
                            ${(user.skillsSeeking || []).map(skill => 
                                `<span class="skill-tag seeking">${skill}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="profile-section">
                        <h3>Bio</h3>
                        <p>${user.bio || 'No bio available'}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="marketplace.handleConnect('${userId}')">
                        Connect
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal event listeners
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Update results count
    updateResultsCount() {
        const countEl = document.getElementById('results-count');
        if (countEl) {
            countEl.textContent = `${this.filteredUsers.length} users found`;
        }
    }

    // Handle logout
    async handleLogout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    // Utility methods for showing messages
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMsg = document.querySelector('.message');
        if (existingMsg) {
            existingMsg.remove();
        }

        // Create new message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;

        // Insert at top of page
        document.body.insertBefore(messageEl, document.body.firstChild);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 3000);
    }
}

// Initialize marketplace when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.marketplace = new SkillMarketplace();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillMarketplace;
}