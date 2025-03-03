document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Add active class styles for mobile menu
    const style = document.createElement('style');
    style.textContent = `
        .nav-links.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: white;
            padding: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 50;
        }
        
        .nav-links.active li {
            margin: 0.75rem 0;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: translateY(7px) rotate(45deg);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: translateY(-7px) rotate(-45deg);
        }
        
        .hamburger span {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Waitlist form submission
    const waitlistForm = document.getElementById('waitlist-form');
    const formSuccess = document.getElementById('form-success');
    
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(waitlistForm);
            const formDataObj = {};
            
            formData.forEach((value, key) => {
                // Handle checkboxes (multiple values)
                if (key === 'frameworks') {
                    if (!formDataObj[key]) {
                        formDataObj[key] = [];
                    }
                    formDataObj[key].push(value);
                } else {
                    formDataObj[key] = value;
                }
            });
            
            // Show loading state
            const submitButton = waitlistForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
            
            // Send data to server
            fetch('/api/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formDataObj),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    waitlistForm.style.display = 'none';
                    formSuccess.classList.remove('hidden');
                    
                    // Log success
                    console.log('Waitlist submission successful:', data);
                } else {
                    // Show error message
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                    
                    // Create or update error message
                    let errorMessage = waitlistForm.querySelector('.form-error');
                    if (!errorMessage) {
                        errorMessage = document.createElement('div');
                        errorMessage.className = 'form-error';
                        errorMessage.style.backgroundColor = '#fee2e2';
                        errorMessage.style.color = '#b91c1c';
                        errorMessage.style.padding = '0.75rem';
                        errorMessage.style.borderRadius = '0.375rem';
                        errorMessage.style.marginBottom = '1rem';
                        waitlistForm.prepend(errorMessage);
                    }
                    
                    errorMessage.textContent = data.message || 'An error occurred. Please try again.';
                    
                    // Log error
                    console.error('Waitlist submission error:', data);
                }
            })
            .catch(error => {
                // Reset button
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                
                // Create or update error message
                let errorMessage = waitlistForm.querySelector('.form-error');
                if (!errorMessage) {
                    errorMessage = document.createElement('div');
                    errorMessage.className = 'form-error';
                    errorMessage.style.backgroundColor = '#fee2e2';
                    errorMessage.style.color = '#b91c1c';
                    errorMessage.style.padding = '0.75rem';
                    errorMessage.style.borderRadius = '0.375rem';
                    errorMessage.style.marginBottom = '1rem';
                    waitlistForm.prepend(errorMessage);
                }
                
                errorMessage.textContent = 'Network error. Please try again later.';
                
                // Log error
                console.error('Waitlist submission network error:', error);
            });
        });
    }

    // Add animation for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    
    if (featureCards.length > 0) {
        // Add animation delay to stagger the animations
        featureCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.transitionDelay = `${index * 0.1}s`;
        });
        
        // Function to check if element is in viewport
        function isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom >= 0
            );
        }
        
        // Function to handle scroll animation
        function handleScroll() {
            featureCards.forEach(card => {
                if (isInViewport(card)) {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }
            });
        }
        
        // Initial check
        handleScroll();
        
        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);
    }

    // Update copyright year
    const copyrightYear = document.querySelector('.footer-bottom p');
    if (copyrightYear) {
        const currentYear = new Date().getFullYear();
        copyrightYear.textContent = copyrightYear.textContent.replace('2025', currentYear);
    }
}); 