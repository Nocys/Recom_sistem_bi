BEGIN;

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_material_check;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_material_variant_check;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_room_category_check;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_style_theme_check;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_by_category_check;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS material_variant VARCHAR(50);

UPDATE products
SET material_variant = CASE
  WHEN LOWER(COALESCE(material, '')) LIKE '%woodgrain%'
    OR LOWER(COALESCE(material, '')) LIKE '%wood grain%'
    OR LOWER(COALESCE(material, '')) LIKE '%motif kayu%'
    OR LOWER(COALESCE(material, '')) LIKE '%serat kayu%'
    OR LOWER(COALESCE(material, '')) LIKE '%oak%'
    OR LOWER(COALESCE(material, '')) LIKE '%walnut%'
    OR LOWER(COALESCE(material, '')) LIKE '%pine%'
    THEN 'Woodgrain'
  WHEN LOWER(COALESCE(material, '')) LIKE '%solid%' THEN 'Solid'
  WHEN LOWER(COALESCE(material, '')) LIKE '%marble%'
    OR LOWER(COALESCE(material, '')) LIKE '%marmer%'
    THEN 'Marble'
  WHEN LOWER(COALESCE(material, '')) LIKE '%glossy%'
    OR LOWER(COALESCE(material, '')) LIKE '%gloss%'
    THEN 'Glossy'
  ELSE 'Tidak Ada'
END
WHERE material_variant IS NULL OR TRIM(material_variant) = '';

UPDATE products
SET category = 'Bedset'
WHERE category = 'Kamar Tidur';

UPDATE products
SET category = 'Living Set'
WHERE category = 'Ruang Tamu';

UPDATE products
SET category = 'Minibar'
WHERE category = 'Mini Bar';

UPDATE products
SET category = 'Nakas'
WHERE name ILIKE '%nakas%';

UPDATE products
SET category = 'Meja Rias'
WHERE name ILIKE '%meja rias%';

UPDATE products
SET material = CASE
  WHEN LOWER(COALESCE(material, '')) LIKE '%hpl%'
    AND LOWER(COALESCE(material, '')) LIKE '%kaca%'
    THEN 'HPL + Kaca'
  WHEN (
      LOWER(COALESCE(material, '')) LIKE '%kayu%'
      OR LOWER(COALESCE(material, '')) LIKE '%oak%'
      OR LOWER(COALESCE(material, '')) LIKE '%walnut%'
      OR LOWER(COALESCE(material, '')) LIKE '%pine%'
    )
    AND (
      LOWER(COALESCE(material, '')) LIKE '%logam%'
      OR LOWER(COALESCE(material, '')) LIKE '%besi%'
      OR LOWER(COALESCE(material, '')) LIKE '%metal%'
    )
    THEN 'Kayu + Logam'
  WHEN (
      LOWER(COALESCE(material, '')) LIKE '%logam%'
      OR LOWER(COALESCE(material, '')) LIKE '%besi%'
      OR LOWER(COALESCE(material, '')) LIKE '%metal%'
    )
    AND (
      LOWER(COALESCE(material, '')) LIKE '%linen%'
      OR LOWER(COALESCE(material, '')) LIKE '%busa%'
      OR LOWER(COALESCE(material, '')) LIKE '%fabric%'
    )
    THEN 'Logam + Linen'
  WHEN (
      LOWER(COALESCE(material, '')) LIKE '%kayu%'
      OR LOWER(COALESCE(material, '')) LIKE '%oak%'
      OR LOWER(COALESCE(material, '')) LIKE '%walnut%'
      OR LOWER(COALESCE(material, '')) LIKE '%pine%'
    )
    AND (
      LOWER(COALESCE(material, '')) LIKE '%linen%'
      OR LOWER(COALESCE(material, '')) LIKE '%busa%'
      OR LOWER(COALESCE(material, '')) LIKE '%fabric%'
    )
    THEN 'Kayu + Linen'
  WHEN LOWER(COALESCE(material, '')) LIKE '%hpl%'
    OR LOWER(COALESCE(material, '')) LIKE '%mdf%'
    OR LOWER(COALESCE(material, '')) LIKE '%plywood%'
    OR LOWER(COALESCE(material, '')) LIKE '%multipleks%'
    THEN 'HPL'
  WHEN LOWER(COALESCE(material, '')) LIKE '%kayu%'
    OR LOWER(COALESCE(material, '')) LIKE '%oak%'
    OR LOWER(COALESCE(material, '')) LIKE '%walnut%'
    OR LOWER(COALESCE(material, '')) LIKE '%pine%'
    THEN 'Kayu'
  WHEN LOWER(COALESCE(material, '')) LIKE '%logam%'
    OR LOWER(COALESCE(material, '')) LIKE '%besi%'
    OR LOWER(COALESCE(material, '')) LIKE '%metal%'
    THEN 'Logam'
  WHEN LOWER(COALESCE(material, '')) LIKE '%kaca%' THEN 'Kaca'
  WHEN LOWER(COALESCE(material, '')) LIKE '%linen%'
    OR LOWER(COALESCE(material, '')) LIKE '%busa%'
    OR LOWER(COALESCE(material, '')) LIKE '%fabric%'
    THEN 'Linen'
  ELSE 'HPL'
END;

UPDATE products
SET material_variant = CASE
  WHEN material_variant IN ('Tidak Ada', 'Woodgrain', 'Solid', 'Marble', 'Glossy') THEN material_variant
  WHEN LOWER(COALESCE(material_variant, '')) LIKE '%woodgrain%'
    OR LOWER(COALESCE(material_variant, '')) LIKE '%wood grain%'
    OR LOWER(COALESCE(material_variant, '')) LIKE '%motif kayu%'
    OR LOWER(COALESCE(material_variant, '')) LIKE '%serat kayu%'
    THEN 'Woodgrain'
  WHEN LOWER(COALESCE(material_variant, '')) LIKE '%solid%' THEN 'Solid'
  WHEN LOWER(COALESCE(material_variant, '')) LIKE '%marble%'
    OR LOWER(COALESCE(material_variant, '')) LIKE '%marmer%'
    THEN 'Marble'
  WHEN LOWER(COALESCE(material_variant, '')) LIKE '%glossy%'
    OR LOWER(COALESCE(material_variant, '')) LIKE '%gloss%'
    THEN 'Glossy'
  ELSE 'Tidak Ada'
END;

UPDATE products
SET room_category = CASE
  WHEN room_category IN ('Ruang Tamu', 'Ruang Makan', 'Dapur', 'Kamar Tidur', 'Mini Bar') THEN room_category
  WHEN category = 'Kitchen Set' THEN 'Dapur'
  WHEN category IN ('Bedset', 'Nakas', 'Meja Rias', 'Lemari') THEN 'Kamar Tidur'
  WHEN category = 'Living Set' THEN 'Ruang Tamu'
  WHEN category = 'Minibar' THEN 'Mini Bar'
  WHEN category IN ('Meja', 'Kursi') THEN 'Ruang Makan'
  ELSE 'Ruang Tamu'
END;

UPDATE products
SET style_theme = CASE
  WHEN style_theme IN ('Modern', 'Minimalis', 'Japandi') THEN style_theme
  ELSE 'Minimalis'
END;

UPDATE products
SET stock = NULL
WHERE category IN ('Kitchen Set', 'Living Set', 'Bedset', 'Minibar');

UPDATE products
SET stock = 0
WHERE category IN ('Meja', 'Kursi', 'Lemari', 'Nakas', 'Meja Rias')
  AND stock IS NULL;

UPDATE products
SET material_variant = 'Tidak Ada'
WHERE material_variant IS NULL OR TRIM(material_variant) = '';

ALTER TABLE products
ALTER COLUMN material_variant SET DEFAULT 'Tidak Ada';

ALTER TABLE products
ALTER COLUMN material_variant SET NOT NULL;

ALTER TABLE products
ADD CONSTRAINT products_category_check
CHECK (
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
);

ALTER TABLE products
ADD CONSTRAINT products_material_check
CHECK (
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
);

ALTER TABLE products
ADD CONSTRAINT products_material_variant_check
CHECK (
  material_variant IN (
    'Tidak Ada',
    'Woodgrain',
    'Solid',
    'Marble',
    'Glossy'
  )
);

ALTER TABLE products
ADD CONSTRAINT products_room_category_check
CHECK (
  room_category IN (
    'Ruang Tamu',
    'Ruang Makan',
    'Dapur',
    'Kamar Tidur',
    'Mini Bar'
  )
);

ALTER TABLE products
ADD CONSTRAINT products_style_theme_check
CHECK (
  style_theme IN (
    'Modern',
    'Minimalis',
    'Japandi'
  )
);

ALTER TABLE products
ADD CONSTRAINT products_stock_by_category_check
CHECK (
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
);

DROP INDEX IF EXISTS idx_products_metadata;
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_material_variant ON products(material_variant);
CREATE INDEX idx_products_metadata
ON products(category, material, material_variant, style_theme, dominant_color, room_category);

COMMIT;
