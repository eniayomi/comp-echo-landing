document.addEventListener('DOMContentLoaded', function() {
    // Get the current page path
    const currentPath = window.location.pathname;
    
    // Create the footer HTML
    const footerHTML = `
    <div class="container">
        <div class="footer-content">
            <div class="footer-logo">
                <h2>CompEcho</h2>
                <p>Modern Compliance Automation Platform</p>
            </div>
            <div class="footer-links">
                <div class="footer-links-column">
                    <h3>Product</h3>
                    <ul>
                        <li><a href="${currentPath === '/' ? '#features' : '/#features'}">Features</a></li>
                        <li><a href="${currentPath === '/' ? '#how-it-works' : '/#how-it-works'}">How It Works</a></li>
                        <li><a href="${currentPath === '/' ? '#waitlist' : '/#waitlist'}">Waitlist</a></li>
                    </ul>
                </div>
                <div class="footer-links-column">
                    <h3>Company</h3>
                    <ul>
                        <li><a href="/pricing">Pricing</a></li>
                        <li><a href="mailto:hello@compecho.com">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-links-column">
                    <h3>Legal</h3>
                    <ul>
                        <li><a href="/privacy-policy">Privacy Policy</a></li>
                        <li><a href="/terms-of-service">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 CompEcho. All rights reserved.</p>
            <div class="social-links">
                <a href="#"><i class="fab fa-twitter"></i></a>
                <a href="#"><i class="fab fa-linkedin"></i></a>
                <a href="#"><i class="fab fa-github"></i></a>
            </div>
        </div>
    </div>
    `;
    
    // Find the footer element and inject the HTML
    const footerElement = document.querySelector('footer');
    if (footerElement) {
        footerElement.innerHTML = footerHTML;
    }
}); 