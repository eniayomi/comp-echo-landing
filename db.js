require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  host: process.env.POSTGRES_SERVER,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: process.env.POSTGRES_PORT,
});

// Log connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Add a new waitlist entry
 * @param {Object} data - The waitlist data
 * @param {string} data.name - Full name
 * @param {string} data.email - Email address
 * @param {string} data.company - Company name
 * @param {string} data.role - Role/position
 * @param {Array<string>} data.frameworks - Selected compliance frameworks
 * @returns {Promise<Object>} The created waitlist entry
 */
async function addWaitlistEntry(data) {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // Insert into waitlist table
    const waitlistResult = await client.query(
      `INSERT INTO waitlist (name, email, company, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, company, role, created_at`,
      [data.name, data.email, data.company, data.role]
    );
    
    const waitlistEntry = waitlistResult.rows[0];
    
    // Insert frameworks if provided
    if (data.frameworks && data.frameworks.length > 0) {
      const frameworkValues = data.frameworks.map((framework, index) => {
        return `($1, $${index + 2})`;
      }).join(', ');
      
      const frameworkParams = [waitlistEntry.id, ...data.frameworks];
      
      await client.query(
        `INSERT INTO frameworks (waitlist_id, framework) 
         VALUES ${frameworkValues}`,
        frameworkParams
      );
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Return the created waitlist entry
    return {
      ...waitlistEntry,
      frameworks: data.frameworks || []
    };
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    
    // Handle duplicate email error
    if (error.code === '23505' && error.constraint === 'waitlist_email_key') {
      throw new Error('Email already exists in waitlist');
    }
    
    throw error;
  } finally {
    // Release client back to the pool
    client.release();
  }
}

/**
 * Get all waitlist entries
 * @returns {Promise<Array<Object>>} Array of waitlist entries with frameworks
 */
async function getAllWaitlistEntries() {
  const client = await pool.connect();
  
  try {
    // Query waitlist entries
    const waitlistResult = await client.query(
      `SELECT id, name, email, company, role, created_at 
       FROM waitlist 
       ORDER BY created_at DESC`
    );
    
    const waitlistEntries = waitlistResult.rows;
    
    // If no entries, return empty array
    if (waitlistEntries.length === 0) {
      return [];
    }
    
    // Get all waitlist IDs
    const waitlistIds = waitlistEntries.map(entry => entry.id);
    
    // Query frameworks for all waitlist entries
    const frameworksResult = await client.query(
      `SELECT waitlist_id, framework 
       FROM frameworks 
       WHERE waitlist_id = ANY($1)`,
      [waitlistIds]
    );
    
    // Group frameworks by waitlist_id
    const frameworksByWaitlistId = frameworksResult.rows.reduce((acc, row) => {
      if (!acc[row.waitlist_id]) {
        acc[row.waitlist_id] = [];
      }
      acc[row.waitlist_id].push(row.framework);
      return acc;
    }, {});
    
    // Add frameworks to waitlist entries
    return waitlistEntries.map(entry => ({
      ...entry,
      frameworks: frameworksByWaitlistId[entry.id] || []
    }));
  } finally {
    // Release client back to the pool
    client.release();
  }
}

module.exports = {
  pool,
  addWaitlistEntry,
  getAllWaitlistEntries
}; 