const bcrypt = require('bcryptjs');

const { query } = require('../config/db');
const { USER_ROLES } = require('../utils/constants');

const USER_SELECT_FIELDS = `
  id,
  google_id,
  username,
  email,
  name,
  avatar_url,
  auth_provider,
  role,
  created_at,
  updated_at
`;

const USER_SELECT_FIELDS_WITH_PASSWORD = `
  ${USER_SELECT_FIELDS},
  password_hash
`;

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,50}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const BCRYPT_SALT_ROUNDS = 10;

const firstRowOrNull = (result) => {
  return result.rows.length > 0 ? result.rows[0] : null;
};

const createAuthError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeUsername = (username) => {
  return String(username || '').trim().toLowerCase();
};

const normalizeEmail = (email) => {
  return String(email || '').trim().toLowerCase();
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    google_id: user.google_id,
    username: user.username,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    role: user.role,
    auth_provider: user.auth_provider,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
};

const findUserById = async (id) => {
  const result = await query(
    `
      SELECT ${USER_SELECT_FIELDS}
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return firstRowOrNull(result);
};

const findUserByGoogleId = async (googleId) => {
  const result = await query(
    `
      SELECT ${USER_SELECT_FIELDS}
      FROM users
      WHERE google_id = $1
      LIMIT 1
    `,
    [googleId]
  );

  return firstRowOrNull(result);
};

const findUserByEmail = async (email) => {
  const result = await query(
    `
      SELECT ${USER_SELECT_FIELDS}
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [normalizeEmail(email)]
  );

  return firstRowOrNull(result);
};

const findUserByUsername = async (username) => {
  const result = await query(
    `
      SELECT ${USER_SELECT_FIELDS}
      FROM users
      WHERE LOWER(username) = LOWER($1)
      LIMIT 1
    `,
    [normalizeUsername(username)]
  );

  return firstRowOrNull(result);
};

const findUserByUsernameOrEmail = async (identifier) => {
  const normalizedIdentifier = String(identifier || '').trim();

  const result = await query(
    `
      SELECT ${USER_SELECT_FIELDS_WITH_PASSWORD}
      FROM users
      WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [normalizedIdentifier]
  );

  return firstRowOrNull(result);
};

const validateLocalUserPayload = ({ username, email, name, password }) => {
  const normalizedUsername = normalizeUsername(username);
  const normalizedEmail = normalizeEmail(email);
  const normalizedName = String(name || '').trim();
  const normalizedPassword = String(password || '');

  if (!normalizedUsername) {
    throw createAuthError('Username is required.', 400);
  }

  if (!USERNAME_REGEX.test(normalizedUsername)) {
    throw createAuthError(
      'Username must be 3-50 characters and use letters, numbers, or underscore only.',
      400
    );
  }

  if (!normalizedEmail) {
    throw createAuthError('Email is required.', 400);
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw createAuthError('Email format is invalid.', 400);
  }

  if (!normalizedName) {
    throw createAuthError('Name is required.', 400);
  }

  if (!normalizedPassword) {
    throw createAuthError('Password is required.', 400);
  }

  if (normalizedPassword.length < PASSWORD_MIN_LENGTH) {
    throw createAuthError('Password must be at least 8 characters.', 400);
  }

  return {
    username: normalizedUsername,
    email: normalizedEmail,
    name: normalizedName,
    password: normalizedPassword
  };
};

const createGoogleUser = async (googleUser) => {
  if (!googleUser.google_id) {
    throw createAuthError('Google user id is required.', 400);
  }

  if (!googleUser.email) {
    throw createAuthError('Google account email is required.', 400);
  }

  if (!googleUser.name) {
    throw createAuthError('Google account name is required.', 400);
  }

  const result = await query(
    `
      INSERT INTO users (
        google_id,
        username,
        email,
        name,
        avatar_url,
        password_hash,
        auth_provider,
        role
      )
      VALUES ($1, NULL, $2, $3, $4, NULL, 'google', $5)
      RETURNING ${USER_SELECT_FIELDS}
    `,
    [
      googleUser.google_id,
      normalizeEmail(googleUser.email),
      googleUser.name,
      googleUser.avatar_url || null,
      USER_ROLES.USER
    ]
  );

  return firstRowOrNull(result);
};

const updateGoogleIdentityForUser = async (userId, googleUser) => {
  const result = await query(
    `
      UPDATE users
      SET
        google_id = $1,
        username = NULL,
        name = $2,
        avatar_url = $3,
        password_hash = NULL,
        auth_provider = 'google'
      WHERE id = $4
      RETURNING ${USER_SELECT_FIELDS}
    `,
    [
      googleUser.google_id,
      googleUser.name,
      googleUser.avatar_url || null,
      userId
    ]
  );

  return firstRowOrNull(result);
};

const findOrCreateGoogleUser = async (googleUser) => {
  if (!googleUser.google_id) {
    throw createAuthError('Google user id is required.', 400);
  }

  if (!googleUser.email) {
    throw createAuthError('Google account email is required.', 400);
  }

  if (!googleUser.name) {
    throw createAuthError('Google account name is required.', 400);
  }

  const existingByGoogleId = await findUserByGoogleId(googleUser.google_id);

  if (existingByGoogleId) {
    return existingByGoogleId;
  }

  const existingByEmail = await findUserByEmail(googleUser.email);

  if (existingByEmail) {
    if (existingByEmail.auth_provider === 'local') {
      throw createAuthError(
        'Email is already registered as a local account. Please login with username/email and password.',
        409
      );
    }

    return updateGoogleIdentityForUser(existingByEmail.id, googleUser);
  }

  return createGoogleUser(googleUser);
};

const createLocalUser = async (userData) => {
  const payload = validateLocalUserPayload(userData);
  const existingUsername = await findUserByUsername(payload.username);

  if (existingUsername) {
    throw createAuthError('Username is already registered.', 409);
  }

  const existingEmail = await findUserByEmail(payload.email);

  if (existingEmail) {
    throw createAuthError('Email is already registered.', 409);
  }

  const passwordHash = await bcrypt.hash(payload.password, BCRYPT_SALT_ROUNDS);
  const result = await query(
    `
      INSERT INTO users (
        google_id,
        username,
        email,
        name,
        avatar_url,
        password_hash,
        auth_provider,
        role
      )
      VALUES (NULL, $1, $2, $3, NULL, $4, 'local', $5)
      RETURNING ${USER_SELECT_FIELDS}
    `,
    [
      payload.username,
      payload.email,
      payload.name,
      passwordHash,
      USER_ROLES.USER
    ]
  );

  return sanitizeUser(firstRowOrNull(result));
};

const validateLocalLogin = async (identifier, password) => {
  const normalizedIdentifier = String(identifier || '').trim();
  const normalizedPassword = String(password || '');

  if (!normalizedIdentifier) {
    throw createAuthError('Username or email is required.', 400);
  }

  if (!normalizedPassword) {
    throw createAuthError('Password is required.', 400);
  }

  const user = await findUserByUsernameOrEmail(normalizedIdentifier);

  if (!user) {
    throw createAuthError('Invalid username/email or password.', 401);
  }

  if (user.auth_provider !== 'local') {
    throw createAuthError('This account uses Google login.', 400);
  }

  if (!user.password_hash) {
    throw createAuthError('Local password is not configured for this account.', 400);
  }

  const passwordMatches = await bcrypt.compare(normalizedPassword, user.password_hash);

  if (!passwordMatches) {
    throw createAuthError('Invalid username/email or password.', 401);
  }

  return sanitizeUser(user);
};

module.exports = {
  findUserById,
  findUserByGoogleId,
  findUserByEmail,
  findUserByUsername,
  findUserByUsernameOrEmail,
  createGoogleUser,
  findOrCreateGoogleUser,
  createLocalUser,
  validateLocalLogin,
  sanitizeUser
};
