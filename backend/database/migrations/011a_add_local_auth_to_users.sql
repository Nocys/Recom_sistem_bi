ALTER TABLE users
ALTER COLUMN google_id DROP NOT NULL;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(50);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) NOT NULL DEFAULT 'google';

UPDATE users
SET auth_provider = 'google'
WHERE auth_provider IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_auth_provider_check'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_auth_provider_check
    CHECK (auth_provider IN ('google', 'local'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique
ON users(username)
WHERE username IS NOT NULL;

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
VALUES
  (
    NULL,
    'admin',
    'admin@example.com',
    'Admin Demo',
    NULL,
    '$2b$10$/luF04I3TgZ9zJEth49R3.X.sGH1J4GBtlO1ReZaeCwq7d5FzrjrK',
    'local',
    'admin'
  ),
  (
    NULL,
    'userdemo',
    'userdemo@example.com',
    'User Demo',
    NULL,
    '$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i',
    'local',
    'user'
  )
ON CONFLICT (email) DO UPDATE
SET
  google_id = NULL,
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  avatar_url = NULL,
  password_hash = EXCLUDED.password_hash,
  auth_provider = 'local',
  role = EXCLUDED.role,
  updated_at = CURRENT_TIMESTAMP;
