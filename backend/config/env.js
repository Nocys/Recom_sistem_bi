const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, '..', '.env')
});

const DEFAULT_PORT = 5000;
const DEFAULT_DATABASE_URL =
  'postgresql://postgres:admin00700@localhost:5432/interior_recommendation_db';
const DEFAULT_FRONTEND_URL = 'http://localhost:3000';
const GOOGLE_CLIENT_ID_PLACEHOLDER = 'your_google_client_id';
const GOOGLE_CLIENT_SECRET_PLACEHOLDER = 'your_google_client_secret';

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || DEFAULT_PORT,
  DATABASE_URL: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET || 'development_session_secret',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    'http://localhost:5000/auth/google/callback',
  FRONTEND_URL: process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL,
  WHATSAPP_ADMIN_NUMBER: process.env.WHATSAPP_ADMIN_NUMBER || ''
};

env.GOOGLE_OAUTH_CONFIGURED =
  Boolean(env.GOOGLE_CLIENT_ID) &&
  Boolean(env.GOOGLE_CLIENT_SECRET) &&
  env.GOOGLE_CLIENT_ID !== GOOGLE_CLIENT_ID_PLACEHOLDER &&
  env.GOOGLE_CLIENT_SECRET !== GOOGLE_CLIENT_SECRET_PLACEHOLDER;

const requiredVariables = [
  'PORT',
  'DATABASE_URL',
  'SESSION_SECRET',
  'FRONTEND_URL'
];

const missingRequiredVariables = requiredVariables.filter((key) => !process.env[key]);

if (missingRequiredVariables.length > 0) {
  console.warn(
    `Missing environment variables, using development defaults where available: ${missingRequiredVariables.join(', ')}`
  );
}

if (process.env.PORT && Number.isNaN(Number(process.env.PORT))) {
  console.warn(`Invalid PORT value "${process.env.PORT}". Using default port ${DEFAULT_PORT}.`);
}

if (!env.GOOGLE_OAUTH_CONFIGURED) {
  console.warn(
    'Google OAuth credentials are not configured. /auth/google will return a clear setup error.'
  );
}

module.exports = env;
