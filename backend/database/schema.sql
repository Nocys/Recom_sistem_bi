DROP VIEW IF EXISTS popular_products;
DROP VIEW IF EXISTS user_product_preference_scores;
DROP VIEW IF EXISTS user_product_ratings;
DROP TABLE IF EXISTS interactions CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_id VARCHAR(255) UNIQUE,
  username VARCHAR(50),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  password_hash TEXT,
  auth_provider VARCHAR(20) NOT NULL DEFAULT 'google' CHECK (auth_provider IN ('google', 'local')),
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  material VARCHAR(100) NOT NULL,
  material_variant VARCHAR(50) NOT NULL DEFAULT 'Tidak Ada',
  style_theme VARCHAR(100) NOT NULL,
  dominant_color VARCHAR(100) NOT NULL,
  room_category VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT products_category_check CHECK (
    category IN (
      'Kitchen Set',
      'Living Set',
      'Bedset',
      'Minibar',
      'Meja',
      'Kursi',
      'Lemari',
      'Nakas',
      'Meja Rias'
    )
  ),
  CONSTRAINT products_material_check CHECK (
    material IN (
      'HPL',
      'Kayu',
      'Logam',
      'Kaca',
      'Linen',
      'Kayu + Logam',
      'Logam + Linen',
      'Kayu + Linen',
      'HPL + Kaca'
    )
  ),
  CONSTRAINT products_material_variant_check CHECK (
    material_variant IN (
      'Tidak Ada',
      'Woodgrain',
      'Solid',
      'Marble',
      'Glossy'
    )
  ),
  CONSTRAINT products_room_category_check CHECK (
    room_category IN (
      'Ruang Tamu',
      'Ruang Makan',
      'Dapur',
      'Kamar Tidur',
      'Mini Bar'
    )
  ),
  CONSTRAINT products_style_theme_check CHECK (
    style_theme IN (
      'Modern',
      'Minimalis',
      'Japandi'
    )
  ),
  CONSTRAINT products_stock_by_category_check CHECK (
    (
      category IN ('Meja', 'Kursi', 'Lemari', 'Nakas', 'Meja Rias')
      AND stock IS NOT NULL
      AND stock >= 0
    )
    OR
    (
      category IN ('Kitchen Set', 'Living Set', 'Bedset', 'Minibar')
      AND stock IS NULL
    )
  )
);

CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL CHECK (
    interaction_type IN (
      'page_view',
      'like',
      'favorite',
      'whatsapp_inquiry'
    )
  ),
  weight NUMERIC(3, 1) NOT NULL CHECK (weight > 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT product_likes_user_product_unique UNIQUE (user_id, product_id)
);

CREATE TABLE product_wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT product_wishlists_user_product_unique UNIQUE (user_id, product_id)
);

CREATE TABLE sessions (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  CONSTRAINT sessions_pkey PRIMARY KEY (sid)
);

CREATE INDEX IDX_sessions_expire ON sessions (expire);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username_unique ON users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_material_variant ON products(material_variant);
CREATE INDEX idx_products_metadata ON products(category, material, material_variant, style_theme, dominant_color, room_category);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_product_id ON interactions(product_id);
CREATE INDEX idx_interactions_user_product ON interactions(user_id, product_id);
CREATE INDEX idx_interactions_type ON interactions(interaction_type);
CREATE INDEX idx_interactions_created_at ON interactions(created_at);
CREATE INDEX idx_product_likes_user_id ON product_likes(user_id);
CREATE INDEX idx_product_likes_product_id ON product_likes(product_id);
CREATE INDEX idx_product_likes_user_product ON product_likes(user_id, product_id);
CREATE INDEX idx_product_wishlists_user_id ON product_wishlists(user_id);
CREATE INDEX idx_product_wishlists_product_id ON product_wishlists(product_id);
CREATE INDEX idx_product_wishlists_user_product ON product_wishlists(user_id, product_id);

CREATE OR REPLACE VIEW user_product_preference_scores AS
WITH user_product_pairs AS (
  SELECT user_id, product_id
  FROM product_likes
  UNION
  SELECT user_id, product_id
  FROM product_wishlists
  UNION
  SELECT user_id, product_id
  FROM interactions
  WHERE interaction_type = 'whatsapp_inquiry'
),
whatsapp_pairs AS (
  SELECT DISTINCT user_id, product_id
  FROM interactions
  WHERE interaction_type = 'whatsapp_inquiry'
)
SELECT
  upp.user_id,
  upp.product_id,
  CASE WHEN pl.user_id IS NOT NULL THEN 1 ELSE 0 END AS active_like,
  CASE WHEN pw.user_id IS NOT NULL THEN 1 ELSE 0 END AS active_wishlist,
  CASE WHEN wp.user_id IS NOT NULL THEN 1 ELSE 0 END AS has_whatsapp_inquiry,
  (
    (CASE WHEN pl.user_id IS NOT NULL THEN 1.0 ELSE 0 END)
    + (CASE WHEN pw.user_id IS NOT NULL THEN 1.5 ELSE 0 END)
    + (CASE WHEN wp.user_id IS NOT NULL THEN 2.5 ELSE 0 END)
  ) AS implicit_score,
  (
    (
      (CASE WHEN pl.user_id IS NOT NULL THEN 1.0 ELSE 0 END)
      + (CASE WHEN pw.user_id IS NOT NULL THEN 1.5 ELSE 0 END)
      + (CASE WHEN wp.user_id IS NOT NULL THEN 2.5 ELSE 0 END)
    ) / 5.0
  ) AS normalized_score
FROM user_product_pairs upp
LEFT JOIN product_likes pl
  ON pl.user_id = upp.user_id
 AND pl.product_id = upp.product_id
LEFT JOIN product_wishlists pw
  ON pw.user_id = upp.user_id
 AND pw.product_id = upp.product_id
LEFT JOIN whatsapp_pairs wp
  ON wp.user_id = upp.user_id
 AND wp.product_id = upp.product_id
WHERE (
  (CASE WHEN pl.user_id IS NOT NULL THEN 1.0 ELSE 0 END)
  + (CASE WHEN pw.user_id IS NOT NULL THEN 1.5 ELSE 0 END)
  + (CASE WHEN wp.user_id IS NOT NULL THEN 2.5 ELSE 0 END)
) > 0;

CREATE OR REPLACE VIEW user_product_ratings AS
SELECT
  user_id,
  product_id,
  LEAST(SUM(weight), 5.0) AS implicit_rating,
  COUNT(*) AS interaction_count,
  MAX(created_at) AS last_interaction_at
FROM interactions
GROUP BY user_id, product_id;

CREATE OR REPLACE VIEW popular_products AS
SELECT
  p.id,
  p.name,
  p.image_url,
  p.category,
  p.material,
  p.material_variant,
  p.style_theme,
  p.dominant_color,
  p.room_category,
  p.description,
  p.price,
  p.stock,
  p.status,
  COUNT(i.id) AS total_interactions,
  COALESCE(SUM(i.weight), 0) AS popularity_score
FROM products p
LEFT JOIN interactions i ON p.id = i.product_id
WHERE p.status = 'active'
GROUP BY
  p.id,
  p.name,
  p.image_url,
  p.category,
  p.material,
  p.material_variant,
  p.style_theme,
  p.dominant_color,
  p.room_category,
  p.description,
  p.price,
  p.stock,
  p.status
ORDER BY popularity_score DESC, total_interactions DESC, p.name ASC;
