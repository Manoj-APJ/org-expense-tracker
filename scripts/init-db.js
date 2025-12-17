require('dotenv').config();
const pool = require('../config/database');

const initDatabase = async () => {
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        balance DECIMAL(15, 2) DEFAULT 0.00,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS organization_members (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        UNIQUE(organization_id, user_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
        amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
        description VARCHAR(500) NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        approved_by INTEGER REFERENCES users(id)
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_org_id ON transactions(organization_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)
    `);

    console.log('Database initialized successfully!');
    
    // Create default admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    
    const adminCheck = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@example.com']);
    if (adminCheck.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)',
        ['admin@example.com', adminPasswordHash, 'Admin User', 'admin']
      );
      console.log('Default admin user created: admin@example.com / admin123');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();

