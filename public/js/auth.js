// Auth functionality for login and register pages

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');

    // Login form handler
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const loginData = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginData)
                });

                const data = await response.json();

                if (response.ok) {
                    // Login successful, redirect to dashboard
                    window.location.href = '/dashboard';
                } else {
                    // Show error message
                    showError(data.error || 'Login failed');
                }
            } catch (error) {
                showError('Network error. Please try again.');
            }
        });
    }

    // Register form handler
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const registerData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                skillsToTeach: formData.get('skillsToTeach'),
                skillsToLearn: formData.get('skillsToLearn')
            };

            // Basic validation
            if (registerData.password.length < 6) {
                showError('Password must be at least 6 characters long');
                return;
            }

            if (!registerData.skillsToTeach.trim() || !registerData.skillsToLearn.trim()) {
                showError('Please provide at least one skill to teach and one to learn');
                return;
            }

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registerData)
                });

                const data = await response.json();

                if (response.ok) {
                    // Registration successful, redirect to dashboard
                    window.location.href = '/dashboard';
                } else {
                    // Show error message
                    showError(data.error || 'Registration failed');
                }
            } catch (error) {
                showError('Network error. Please try again.');
            }
        });
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            
            // Hide error after 5 seconds
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 5000);
        }
    }
});