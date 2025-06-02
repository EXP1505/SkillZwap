// edit-profile.js
document.addEventListener('DOMContentLoaded', function() {
    // Load current user data
    loadUserProfile();
    
    // File input handling
    const fileInput = document.getElementById('profilePicture');
    const fileLabel = document.querySelector('.file-input-label');
    const previewSection = document.getElementById('picturePreview');
    const previewImage = document.getElementById('previewImage');
    
    // Skills arrays
    let teachSkills = [];
    let learnSkills = [];
    let skillToDelete = null;
    
    // File input change handler
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Update label
            fileLabel.innerHTML = `<span>📁 ${file.name}</span>`;
            
            // Show preview
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewSection.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Add skill buttons
    document.getElementById('addTeachSkillBtn').addEventListener('click', function() {
        const input = document.getElementById('newTeachSkill');
        const skillName = input.value.trim();
        
        if (skillName && !teachSkills.includes(skillName)) {
            teachSkills.push(skillName);
            input.value = '';
            renderSkills('teach');
        }
    });
    
    document.getElementById('addLearnSkillBtn').addEventListener('click', function() {
        const input = document.getElementById('newLearnSkill');
        const skillName = input.value.trim();
        
        if (skillName && !learnSkills.includes(skillName)) {
            learnSkills.push(skillName);
            input.value = '';
            renderSkills('learn');
        }
    });
    
    // Enter key handling for skill inputs
    document.getElementById('newTeachSkill').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('addTeachSkillBtn').click();
        }
    });
    
    document.getElementById('newLearnSkill').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('addLearnSkillBtn').click();
        }
    });
    
    // Form submission
    document.getElementById('editProfileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfile();
    });
    
    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
            window.location.href = 'dashboard.html';
        }
    });
    
    // Modal handling
    const modal = document.getElementById('deleteSkillModal');
    document.querySelector('.close').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        if (skillToDelete) {
            removeSkill(skillToDelete.type, skillToDelete.skill);
            modal.style.display = 'none';
            skillToDelete = null;
        }
    });
    
    document.getElementById('cancelDeleteBtn').addEventListener('click', function() {
        modal.style.display = 'none';
        skillToDelete = null;
    });
    
    // Functions
    async function loadUserProfile() {
        try {
            const response = await fetch('/api/dashboard/user');
            
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error('Failed to fetch user data');
            }
            
            const user = await response.json();
            
            // Populate form fields
            document.getElementById('fullName').value = user.name || user.username || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('bio').value = user.bio || '';
            
            // Set profile picture if available
            if (user.profilePicture) {
                document.getElementById('currentProfilePic').src = user.profilePicture;
            }
            
            // Load skills
            teachSkills = user.skillsToTeach || [];
            learnSkills = user.skillsToLearn || [];
            
            renderSkills('teach');
            renderSkills('learn');
            
        } catch (error) {
            console.error('Error loading user profile:', error);
            showMessage('error', 'Error loading profile data. Please refresh the page.');
        }
    }
    
    function renderSkills(type) {
        const container = type === 'teach' ? 
            document.getElementById('teachSkillsList') : 
            document.getElementById('learnSkillsList');
        
        const skills = type === 'teach' ? teachSkills : learnSkills;
        
        container.innerHTML = '';
        
        if (skills.length === 0) {
            container.innerHTML = '<p style="color: #888; font-style: italic; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 2px dashed #ddd;">No skills added yet</p>';
            return;
        }
        
        skills.forEach(skill => {
            const skillElement = document.createElement('div');
            skillElement.className = 'skill-item';
            skillElement.innerHTML = `
                <span class="skill-name">${skill}</span>
                <button type="button" class="remove-skill-btn" data-skill="${skill}" data-type="${type}">
                    ✕
                </button>
            `;
            container.appendChild(skillElement);
        });
        
        // Add event listeners for remove buttons
        container.querySelectorAll('.remove-skill-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const skill = this.dataset.skill;
                const type = this.dataset.type;
                
                skillToDelete = { skill, type };
                document.getElementById('deleteSkillModal').style.display = 'block';
            });
        });
    }
    
    function removeSkill(type, skill) {
        if (type === 'teach') {
            teachSkills = teachSkills.filter(s => s !== skill);
            renderSkills('teach');
        } else {
            learnSkills = learnSkills.filter(s => s !== skill);
            renderSkills('learn');
        }
    }
    
    async function saveProfile() {
        // Show loading state
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '💾 Saving...';
        submitBtn.disabled = true;
        
        try {
            // Try multiple endpoints and methods that might work
            let response;
            let requestData;
            
            // Option 1: Try JSON first (most common)
            requestData = {
                name: document.getElementById('fullName').value,
                bio: document.getElementById('bio').value,
                skillsToTeach: teachSkills,
                skillsToLearn: learnSkills
            };
            
            console.log('Attempting to save profile:', requestData);
            
            // Try different possible endpoints
            const endpoints = [
                { url: '/api/user', method: 'PUT' },
                { url: '/api/user', method: 'PATCH' },
                { url: '/api/dashboard/user', method: 'PUT' },
                { url: '/api/dashboard/user', method: 'PATCH' },
                { url: '/api/profile', method: 'PUT' },
                { url: '/api/profile', method: 'POST' },
                { url: '/api/update-profile', method: 'POST' }
            ];
            
            let lastError = null;
            
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying ${endpoint.method} ${endpoint.url}`);
                    
                    response = await fetch(endpoint.url, {
                        method: endpoint.method,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestData)
                    });
                    
                    console.log(`Response status: ${response.status}`);
                    
                    if (response.ok) {
                        console.log(`Success with ${endpoint.method} ${endpoint.url}`);
                        break;
                    } else if (response.status !== 404 && response.status !== 405) {
                        // If it's not a "not found" or "method not allowed", this might be the right endpoint
                        const errorText = await response.text();
                        console.log(`Error response:`, errorText);
                        lastError = new Error(`${endpoint.method} ${endpoint.url}: ${response.status} - ${errorText}`);
                        break;
                    }
                } catch (fetchError) {
                    console.log(`Failed ${endpoint.method} ${endpoint.url}:`, fetchError.message);
                    lastError = fetchError;
                }
            }
            
            if (!response || !response.ok) {
                throw lastError || new Error('All endpoints failed');
            }
            
            const result = await response.json();
            console.log('Profile updated successfully:', result);
            
            showMessage('success', 'Profile updated successfully!');
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error updating profile:', error);
            
            // Show more detailed error message
            let errorMessage = 'Error updating profile. ';
            if (error.message.includes('fetch')) {
                errorMessage += 'Network error - check your connection.';
            } else if (error.message.includes('404')) {
                errorMessage += 'Update endpoint not found. Please check your backend.';
            } else if (error.message.includes('401')) {
                errorMessage += 'Please log in again.';
                setTimeout(() => window.location.href = '/login.html', 2000);
            } else {
                errorMessage += error.message || 'Please try again.';
            }
            
            showMessage('error', errorMessage);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    function showMessage(type, message) {
        const successMsg = document.getElementById('successMessage');
        const errorMsg = document.getElementById('errorMessage');
        
        // Hide both messages first
        successMsg.style.display = 'none';
        errorMsg.style.display = 'none';
        
        if (type === 'success') {
            successMsg.textContent = message;
            successMsg.style.display = 'block';
        } else {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
        }
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            successMsg.style.display = 'none';
            errorMsg.style.display = 'none';
        }, 5000);
    }
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', async function() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
            } catch (error) {
                console.error('Logout error:', error);
            }
            window.location.href = '/login.html';
        }
    });
});