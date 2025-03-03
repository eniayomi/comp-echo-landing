document.addEventListener('DOMContentLoaded', function() {
    // Get the current page path
    const currentPath = window.location.pathname;
    
    // Create the header HTML
    const headerHTML = `
    <div class="container">
        <nav>
            <div class="logo">
                <a href="/" class="logo-link">
                    <img src="images/logo.svg" alt="CompEcho Logo" width="40" height="40" class="logo-svg">
                    <h1>CompEcho</h1>
                </a>
            </div>
            <ul class="nav-links">
                <li><a href="${currentPath === '/' ? '#features' : '/#features'}" ${currentPath === '/features' ? 'class="active"' : ''}>Features</a></li>
                <li><a href="${currentPath === '/' ? '#how-it-works' : '/#how-it-works'}" ${currentPath === '/how-it-works' ? 'class="active"' : ''}>How It Works</a></li>
                <li><a href="/pricing" ${currentPath === '/pricing' ? 'class="active"' : ''}>Pricing</a></li>
                <li><a href="mailto:hello@compecho.com">Contact</a></li>
                <li><a href="${currentPath === '/' ? '#waitlist' : '/#waitlist'}" class="btn btn-primary" style="color: white;">Join Waitlist</a></li>
            </ul>
            <div class="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    </div>
    `;
    
    // Find the header element and inject the HTML
    const headerElement = document.querySelector('header:not(.admin-header)');
    if (headerElement) {
        headerElement.innerHTML = headerHTML;
    }
    
    // Add styles for header and mobile menu
    const style = document.createElement('style');
    style.textContent = `
        /* Header styles */
        header {
            background-color: var(--background-color);
            box-shadow: var(--box-shadow);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
        }

        .logo {
            display: flex;
            align-items: center;
        }

        .logo-link {
            display: flex;
            align-items: center;
            text-decoration: none;
        }

        .logo-svg {
            margin-right: 0.75rem;
        }

        .logo h1 {
            font-size: 1.75rem;
            margin: 0;
            color: var(--primary-color);
            line-height: 1;
        }

        .nav-links {
            display: flex;
            list-style: none;
            align-items: center;
            margin: 0;
            padding: 0;
            gap: 2rem;
        }

        .nav-links a {
            color: var(--text-color);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .nav-links a:hover, .nav-links a.active {
            color: var(--primary-color);
        }

        .hamburger {
            display: none;
            flex-direction: column;
            cursor: pointer;
            margin-left: 1rem;
        }

        .hamburger span {
            width: 25px;
            height: 3px;
            background-color: var(--text-color);
            margin: 2px 0;
            border-radius: 2px;
            transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }
            
            .hamburger {
                display: flex;
            }
            
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
        }
    `;
    document.head.appendChild(style);
    
    // Add event listener for hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}); 