require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const { addWaitlistEntry, getAllWaitlistEntries } = require('./db');
const { notifySlackNewWaitlistEntry } = require('./slack');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Helper function to get client IP address
function getClientIp(req) {
  // Check for X-Forwarded-For header (when behind a proxy/load balancer)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, the first one is the client
    return forwardedFor.split(',')[0].trim();
  }
  
  // Otherwise, use the remote address from the connection
  return req.socket.remoteAddress;
}

// Basic authentication middleware
function isAuthenticated(req) {
  // Skip auth check if credentials are not configured
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    console.warn('Admin credentials not configured. Skipping authentication.');
    return true;
  }
  
  // Get authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return false;
  }
  
  // Check if it's Basic auth
  if (!authHeader.startsWith('Basic ')) {
    return false;
  }
  
  // Decode credentials
  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');
    
    // Check if credentials match
    return username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD;
  } catch (error) {
    console.error('Error parsing auth header:', error);
    return false;
  }
}

// Function to send authentication challenge
function sendAuthChallenge(res) {
  res.writeHead(401, {
    'WWW-Authenticate': 'Basic realm="Admin Access"',
    'Content-Type': 'text/plain'
  });
  res.end('Authentication required');
}

// Function to serve the 404 page
function serve404Page(res) {
  fs.readFile('./404.html', (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('404 - Page Not Found');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(content, 'utf-8');
    }
  });
}

// Function to handle static file serving
function serveStaticFile(filePath, res) {
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        serve404Page(res);
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}

const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Handle contact link (mailto:)
  if (req.url === '/contact') {
    res.writeHead(302, { 'Location': 'mailto:hello@compecho.com' });
    res.end();
    return;
  }

  // Check if this is a request for the admin page or admin API
  if (req.url === '/admin' || req.url === '/api/waitlist' && req.method === 'GET') {
    // Check authentication
    if (!isAuthenticated(req)) {
      sendAuthChallenge(res);
      return;
    }
  }

  // Handle the waitlist form submission
  if (req.method === 'POST' && req.url === '/api/waitlist') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        console.log('Waitlist submission:', data);
        
        // Validate required fields
        if (!data.name || !data.email || !data.company || !data.role) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            message: 'Missing required fields' 
          }));
          return;
        }
        
        // Add IP address to the data
        data.ip_address = getClientIp(req);
        
        // Add to database
        try {
          const result = await addWaitlistEntry(data);
          console.log('Waitlist entry added:', result);
          
          // Send Slack notification (don't await to avoid delaying the response)
          notifySlackNewWaitlistEntry(result).catch(error => {
            console.error('Error sending Slack notification:', error);
          });
          
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Thank you for joining our waitlist!',
            data: result
          }));
        } catch (dbError) {
          console.error('Database error:', dbError);
          
          // Handle duplicate email
          if (dbError.message === 'Email already exists in waitlist') {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: false, 
              message: 'This email is already on our waitlist.' 
            }));
            return;
          }
          
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            message: 'An error occurred while processing your request.' 
          }));
        }
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          message: 'Invalid request format' 
        }));
      }
    });
    
    return;
  }

  // Admin endpoint to get all waitlist entries
  if (req.method === 'GET' && req.url === '/api/waitlist') {
    try {
      const entries = await getAllWaitlistEntries();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        data: entries 
      }));
    } catch (error) {
      console.error('Error fetching waitlist entries:', error);
      
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: 'An error occurred while fetching waitlist entries.' 
      }));
    }
    
    return;
  }

  // Clean up the URL and handle pages without .html extension
  let filePath = '.';
  if (req.url === '/') {
    filePath += '/index.html';
  } else {
    // Remove query parameters
    const urlPath = req.url.split('?')[0];
    
    // Check if the URL already has an extension
    if (path.extname(urlPath) === '') {
      // First try with .html extension
      if (fs.existsSync(`.${urlPath}.html`)) {
        filePath += `${urlPath}.html`;
      } else if (fs.existsSync(`.${urlPath}/index.html`)) {
        // Then try as a directory with index.html
        filePath += `${urlPath}/index.html`;
      } else {
        // If neither exists, serve 404 page
        serve404Page(res);
        return;
      }
    } else {
      // URL has an extension, use it as is
      filePath += urlPath;
    }
  }

  // Serve the file
  serveStaticFile(filePath, res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server');
}); 