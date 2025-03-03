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

// SQL to create the waitlist table
const createWaitlistTable = `
CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

// SQL to create the frameworks table for storing multiple framework selections
const createFrameworksTable = `
CREATE TABLE IF NOT EXISTS frameworks (
  id SERIAL PRIMARY KEY,
  waitlist_id INTEGER REFERENCES waitlist(id) ON DELETE CASCADE,
  framework VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

// Create an index on the email column for faster lookups
const createEmailIndex = `
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
`;

// Create an index on the waitlist_id column for faster lookups
const createWaitlistIdIndex = `
CREATE INDEX IF NOT EXISTS idx_frameworks_waitlist_id ON frameworks(waitlist_id);
`;

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Setting up database...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Create tables
    console.log('Creating waitlist table...');
    await client.query(createWaitlistTable);
    
    console.log('Creating frameworks table...');
    await client.query(createFrameworksTable);
    
    // Create indexes
    console.log('Creating indexes...');
    await client.query(createEmailIndex);
    await client.query(createWaitlistIdIndex);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Database setup complete!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    // Release client back to the pool
    client.release();
    // Close the pool
    await pool.end();
  }
}

// Run the setup
setupDatabase().catch(console.error); 