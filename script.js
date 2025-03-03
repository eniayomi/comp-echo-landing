document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
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

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (hamburger && hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Waitlist form
    const waitlistForm = document.getElementById('waitlist-form');
    const formSuccess = document.getElementById('form-success');
    const formError = document.getElementById('form-error');
    
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm(this)) {
                // Shake invalid inputs
                document.querySelectorAll('.invalid').forEach(input => {
                    input.classList.add('shake');
                    setTimeout(() => {
                        input.classList.remove('shake');
                    }, 500);
                });
                
                // Scroll to first invalid input
                const firstInvalid = document.querySelector('.invalid');
                if (firstInvalid) {
                    const headerOffset = 100;
                    const elementPosition = firstInvalid.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
                
                return;
            }
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Submitting...';
            submitButton.disabled = true;
            
            // Collect form data
            const formData = new FormData(this);
            const data = {};
            
            formData.forEach((value, key) => {
                if (key === 'frameworks') {
                    if (!data[key]) {
                        data[key] = [];
                    }
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            });
            
            // Simulate API call (replace with actual API call)
            setTimeout(() => {
                try {
                    // Simulate successful submission
                    console.log('Form data:', data);
                    
                    // Hide form and show success message
                    waitlistForm.classList.add('hidden');
                    formSuccess.classList.remove('hidden');
                    
                    // Scroll to success message
                    const headerOffset = 100;
                    const elementPosition = formSuccess.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                } catch (error) {
                    console.error('Error submitting form:', error);
                    formError.classList.remove('hidden');
                    
                    // Reset button
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                }
            }, 1500);
        });
        
        // Input validation on blur
        waitlistForm.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(this);
            });
            
            input.addEventListener('focus', function() {
                this.classList.remove('invalid');
            });
        });
    }
    
    function validateForm(form) {
        let isValid = true;
        
        // Validate required inputs
        form.querySelectorAll('input[required], select[required]').forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        // Validate checkbox group (at least one must be selected)
        const checkboxes = form.querySelectorAll('input[name="frameworks"]');
        if (checkboxes.length > 0) {
            const checked = Array.from(checkboxes).some(checkbox => checkbox.checked);
            
            if (!checked) {
                isValid = false;
                const checkboxGroup = form.querySelector('.checkbox-group');
                if (checkboxGroup) {
                    checkboxGroup.classList.add('invalid');
                }
            } else {
                const checkboxGroup = form.querySelector('.checkbox-group');
                if (checkboxGroup) {
                    checkboxGroup.classList.remove('invalid');
                }
            }
        }
        
        return isValid;
    }
    
    function validateInput(input) {
        if (input.required && !input.value.trim()) {
            input.classList.add('invalid');
            return false;
        } else if (input.type === 'email' && input.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value.trim())) {
                input.classList.add('invalid');
                return false;
            }
        }
        
        input.classList.remove('invalid');
        return true;
    }
    
    // Feature card animations
    const featureCards = document.querySelectorAll('.feature-card');
    
    if (featureCards.length > 0) {
        // Initial check
        handleScroll();
        
        // Check on scroll
        window.addEventListener('scroll', handleScroll);
    }
    
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    function handleScroll() {
        featureCards.forEach(card => {
            if (isInViewport(card)) {
                card.classList.add('visible');
            }
        });
    }
    
    // Update copyright year
    const currentYear = new Date().getFullYear();
    const copyrightYear = document.querySelector('.footer-bottom p');
    
    if (copyrightYear) {
        copyrightYear.textContent = copyrightYear.textContent.replace(/\d{4}/, currentYear);
    }
});

// Add CSS for animations and validation
const style = document.createElement('style');
style.textContent = `
    .shake {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
    
    @keyframes shake {
        10%, 90% {
            transform: translate3d(-1px, 0, 0);
        }
        20%, 80% {
            transform: translate3d(2px, 0, 0);
        }
        30%, 50%, 70% {
            transform: translate3d(-3px, 0, 0);
        }
        40%, 60% {
            transform: translate3d(3px, 0, 0);
        }
    }
    
    .form-group input.invalid,
    .form-group select.invalid,
    .checkbox-group.invalid {
        border-color: var(--error-color);
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
    }
    
    .feature-card {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .feature-card.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style); 