const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  ssl:
    env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false
        }
      : false
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

const query = (text, params) => {
  return pool.query(text, params);
};

const testConnection = async () => {
  const result = await pool.query('SELECT NOW() AS current_time');
  return result.rows[0];
};

module.exports = {
  pool,
  query,
  testConnection
};
