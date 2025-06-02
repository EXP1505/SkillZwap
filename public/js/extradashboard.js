document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const userNameElement = document.getElementById('userName');
    const teachSkillsElement = document.getElementById('teachSkills');
    const learnSkillsElement = document.getElementById('learnSkills');
    const matchesElement = document.getElementById('matches');
    const receivedRequestsElement = document.getElementById('receivedRequests');
    const sentRequestsElement = document.getElementById('sentRequests');
    const logoutBtn = document.getElementById('logoutBtn');
    const requestModal = document.getElementById('requestModal');
    const requestForm = document.getElementById('requestForm');
    const closeModal = document.getElementsByClassName('close')[0];

    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(tabName + 'Requests').classList.add('active');
        });
    });

    // Load dashboard data
    loadUserProfile();
    loadMatches();
    loadSessionRequests();

    // Logout functionality
    logoutBtn.addEventListener('click', async function() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST'
            });
            
            if (response.ok) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    });

    // Modal functionality
    closeModal.addEventListener('click', function() {
        requestModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == requestModal) {
            requestModal.style.display = 'none';
        }
    });

    // Request form submission
    requestForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(requestForm);
        const requestData = {
            recipientId: document.getElementById('recipientId').value,
            skill: formData.get('skill'),
            message: formData.get('message')
        };

        try {
            const response = await fetch('/api/session-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Session request sent successfully!');
                requestModal.style.display = 'none';
                loadSessionRequests(); // Refresh requests
            } else {
                alert(data.error || 'Failed to send request');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    });

    // Load user profile
    async function loadUserProfile() {
        try {
            const response = await fetch('/api/user');
            const user = await response.json();

            if (response.ok) {
                userNameElement.textContent = user.name;
                
                // Display skills to teach
                teachSkillsElement.innerHTML = '';
                user.skillsToTeach.forEach(skill => {
                    const skillTag = document.createElement('span');
                    skillTag.className = 'skill-tag';
                    skillTag.textContent = skill;
                    teachSkillsElement.appendChild(skillTag);
                });

                // Display skills to learn
                learnSkillsElement.innerHTML = '';
                user.skillsToLearn.forEach(skill => {
                    const skillTag = document.createElement('span');
                    skillTag.className = 'skill-tag';
                    skillTag.textContent = skill;
                    learnSkillsElement.appendChild(skillTag);
                });
            } else {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            window.location.href = '/';
        }
    }

    Load matching users
    async function loadMatches() {
        try {
            const response = await fetch('/api/matches');
            const matches = await response.json();

            if (response.ok) {
                matchesElement.innerHTML = '';
                
                if (matches.length === 0) {
                    matchesElement.innerHTML = '<p>No matches found. Try updating your skills!</p>';
                    return;
                }

                matches.forEach(match => {
                    const matchDiv = document.createElement('div');
                    matchDiv.className = 'match-item';
                    
                    matchDiv.innerHTML = `
                        <h4>${match.name}</h4>
                        <p>📧 ${match.email}</p>
                        <div class="match-skills">
                            <strong>Can teach:</strong>
                            ${match.skillsToTeach.map(skill => 
                                `<span class="match-skill">${skill}</span>`
                            ).join('')}
                        </div>
                        <button class="btn btn-primary btn-small" onclick="openRequestModal('${match._id}', '${match.name}', '${JSON.stringify(match.skillsToTeach).replace(/"/g, '&quot;')}')">
                            Send Request
                        </button>
                    `;
                    
                    matchesElement.appendChild(matchDiv);
                });
            }
        } catch (error) {
            console.error('Error loading matches:', error);
        }
    }

    // Load session requests
    async function loadSessionRequests() {
        try {
            // Load received requests
            const receivedResponse = await fetch('/api/session-requests/received');
            const receivedRequests = await receivedResponse.json();

            if (receivedResponse.ok) {
                displayReceivedRequests(receivedRequests);
            }

            // Load sent requests
            const sentResponse = await fetch('/api/session-requests/sent');
            const sentRequests = await sentResponse.json();

            if (sentResponse.ok) {
                displaySentRequests(sentRequests);
            }
        } catch (error) {
            console.error('Error loading session requests:', error);
        }
    }

    function displayReceivedRequests(requests) {
        receivedRequestsElement.innerHTML = '';
        
        if (requests.length === 0) {
            receivedRequestsElement.innerHTML = '<p>No requests received yet.</p>';
            return;
        }

        requests.forEach(request => {
            const requestDiv = document.createElement('div');
            requestDiv.className = 'request-item';
            
            requestDiv.innerHTML = `
                <div class="request-header">
                    <div class="request-info">
                        <h4>${request.requester.name}</h4>
                        <p>📧 ${request.requester.email}</p>
                    </div>
                    <span class="status-badge status-${request.status}">${request.status}</span>
                </div>
                <div class="request-skill">${request.skill}</div>
                ${request.message ? `<div class="request-message">"${request.message}"</div>` : ''}
                <div class="request-actions">
                    ${request.status === 'pending' ? `
                        <button class="btn btn-success btn-small" onclick="respondToRequest('${request._id}', 'accepted')">
                            Accept
                        </button>
                        <button class="btn btn-danger btn-small" onclick="respondToRequest('${request._id}', 'rejected')">
                            Reject
                        </button>
                    ` : ''}
                </div>
                <small>Received: ${new Date(request.createdAt).toLocaleDateString()}</small>
            `;
            
            receivedRequestsElement.appendChild(requestDiv);
        });
    }

    function displaySentRequests(requests) {
        sentRequestsElement.innerHTML = '';
        
        if (requests.length === 0) {
            sentRequestsElement.innerHTML = '<p>No requests sent yet.</p>';
            return;
        }

        requests.forEach(request => {
            const requestDiv = document.createElement('div');
            requestDiv.className = 'request-item';
            
            requestDiv.innerHTML = `
                <div class="request-header">
                    <div class="request-info">
                        <h4>To: ${request.recipient.name}</h4>
                        <p>📧 ${request.recipient.email}</p>
                    </div>
                    <span class="status-badge status-${request.status}">${request.status}</span>
                </div>
                <div class="request-skill">${request.skill}</div>
                ${request.message ? `<div class="request-message">"${request.message}"</div>` : ''}
                <small>Sent: ${new Date(request.createdAt).toLocaleDateString()}</small>
            `;
            
            sentRequestsElement.appendChild(requestDiv);
        });
    }

    // Global functions for onclick handlers
    window.openRequestModal = function(recipientId, recipientName, skillsArray) {
        document.getElementById('recipientId').value = recipientId;
        
        // Populate skills dropdown
        const skillSelect = document.getElementById('skillSelect');
        skillSelect.innerHTML = '<option value="">Choose a skill</option>';
        
        const skills = JSON.parse(skillsArray.replace(/&quot;/g, '"'));
        skills.forEach(skill => {
            const option = document.createElement('option');
            option.value = skill;
            option.textContent = skill;
            skillSelect.appendChild(option);
        });
        
        requestModal.style.display = 'block';
    };

    window.respondToRequest = async function(requestId, status) {
        try {
            const response = await fetch(`/api/session-request/${requestId}/respond`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Request ${status} successfully!`);
                loadSessionRequests(); // Refresh requests
            } else {
                alert(data.error || 'Failed to respond to request');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        }
    };
});