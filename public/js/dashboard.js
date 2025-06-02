// Dashboard functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Load user data when page loads
            loadUserData();
            loadMatches();
            loadSessionRequests();
            
            // Setup event listeners
            setupEventListeners();
        });

        // Load current user data
        async function loadUserData() {
            try {
                const response = await fetch('/api/dashboard/user');
                
                if (!response.ok) {
                    if (response.status === 401) {
                        // User not authenticated, redirect to login
                        window.location.href = '/login.html';
                        return;
                    }
                    throw new Error('Failed to fetch user data');
                }
                
                const user = await response.json();
                
                // Update user name in multiple places
                const userNameElement = document.getElementById('userName');
                const userName2Element = document.getElementById('userName2');
                if (userNameElement) {
                    userNameElement.textContent = user.name || user.username || 'User';
                }
                if (userName2Element) {
                    userName2Element.textContent = user.name || user.username || 'User';
                }
                
                // Update skills to teach
                const teachSkillsContainer = document.getElementById('teachSkills');
                if (teachSkillsContainer) {
                    teachSkillsContainer.innerHTML = '';
                    if (user.skillsToTeach && user.skillsToTeach.length > 0) {
                        user.skillsToTeach.forEach(skill => {
                            const skillTag = document.createElement('span');
                            skillTag.className = 'skill-tag';
                            skillTag.textContent = skill;
                            skillTag.style.cssText = 'display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 5px 12px; margin: 3px; border-radius: 20px; font-size: 0.85em; font-weight: 500;';
                            teachSkillsContainer.appendChild(skillTag);
                        });
                    } else {
                        teachSkillsContainer.innerHTML = '<p style="color: #888; font-style: italic; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 2px dashed #ddd;">No skills added yet</p>';
                    }
                }
                
                // Update skills to learn
                const learnSkillsContainer = document.getElementById('learnSkills');
                if (learnSkillsContainer) {
                    learnSkillsContainer.innerHTML = '';
                    if (user.skillsToLearn && user.skillsToLearn.length > 0) {
                        user.skillsToLearn.forEach(skill => {
                            const skillTag = document.createElement('span');
                            skillTag.className = 'skill-tag';
                            skillTag.textContent = skill;
                            skillTag.style.cssText = 'display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 5px 12px; margin: 3px; border-radius: 20px; font-size: 0.85em; font-weight: 500;';
                            learnSkillsContainer.appendChild(skillTag);
                        });
                    } else {
                        learnSkillsContainer.innerHTML = '<p style="color: #888; font-style: italic; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 2px dashed #ddd;">No skills added yet</p>';
                    }
                }
                
            } catch (error) {
                console.error('Error loading user data:', error);
                // Show error message to user
                const userNameElement = document.getElementById('userName');
                const userName2Element = document.getElementById('userName2');
                if (userNameElement) {
                    userNameElement.textContent = 'Error loading data';
                }
                if (userName2Element) {
                    userName2Element.textContent = 'Error loading data';
                }
            }
        }

        // Load matching users
        async function loadMatches() {
            try {
                const response = await fetch('/api/dashboard/matches');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch matches');
                }
                
                const matches = await response.json();
                
                // Note: Your HTML already has hardcoded matches, so we'll keep those
                // In a real app, you'd replace the hardcoded content with dynamic data
                console.log('Matches loaded:', matches);
                
            } catch (error) {
                console.error('Error loading matches:', error);
            }
        }

        // Load session requests
        async function loadSessionRequests() {
            try {
                // This would require additional backend endpoints
                // For now, we'll just log that this feature needs implementation
                console.log('Session requests loading - requires additional backend endpoints');
                
                // Hide loading messages
                const loadingElements = document.querySelectorAll('.loading');
                loadingElements.forEach(element => {
                    element.style.display = 'none';
                });
                
            } catch (error) {
                console.error('Error loading session requests:', error);
            }
        }

        // Setup event listeners
        function setupEventListeners() {
            // Logout button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
            
            // Tab switching for session requests
            const tabButtons = document.querySelectorAll('.tab-btn');
            tabButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const tabName = this.getAttribute('data-tab');
                    switchTab(tabName);
                });
            });
            
            // Modal functionality
            setupModalListeners();
        }

        // Handle logout
        async function handleLogout() {
            try {
                const response = await fetch('/api/auth/logout', {
                    method: 'POST'
                });
                
                if (response.ok) {
                    window.location.href = '/login.html';
                } else {
                    console.error('Logout failed');
                }
            } catch (error) {
                console.error('Error during logout:', error);
                // Force redirect even if logout fails
                window.location.href = '/login.html';
            }
        }

        // Switch tabs for session requests
        function switchTab(tabName) {
            // Remove active class from all tabs and content
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to selected tab and content
            document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
            document.getElementById(`${tabName}Requests`).classList.add('active');
        }

        // Modal functionality
        function setupModalListeners() {
            const modal = document.getElementById('requestModal');
            const closeBtn = document.querySelector('.close');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    modal.style.display = 'none';
                });
            }
            
            // Close modal when clicking outside
            window.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }