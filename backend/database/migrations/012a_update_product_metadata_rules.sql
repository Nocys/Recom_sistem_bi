BEGIN;

DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  FOR constraint_record IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'products'::regclass
      AND contype = 'c'
      AND (
        pg_get_constraintdef(oid) ILIKE '%category%'
        OR pg_get_constraintdef(oid) ILIKE '%style_theme%'
        OR pg_get_constraintdef(oid) ILIKE '%room_category%'
        OR pg_get_constraintdef(oid) ILIKE '%stock%'
      )
  LOOP
    EXECUTE format(
      'ALTER TABLE products DROP CONSTRAINT IF EXISTS %I',
      constraint_record.conname
    );
  END LOOP;
END $$;

ALTER TABLE products
ALTER COLUMN stock DROP NOT NULL;

UPDATE products
SET style_theme = CASE
  WHEN style_theme IN ('Modern', 'Minimalis', 'Japandi') THEN style_theme
  WHEN style_theme IN ('Luxury', 'Modern Luxury', 'Industrial', 'Classic') THEN 'Modern'
  WHEN style_theme IN ('Scandinavian', 'Natural') THEN 'Japandi'
  WHEN style_theme = 'Minimalist' THEN 'Minimalis'
  ELSE 'Modern'
END;

UPDATE products
SET category = CASE
  WHEN category IN (
    'Kitchen Set',
    'Kamar Tidur',
    'Ruang Tamu',
    'Mini Bar',
    'Meja',
    'Kursi',
    'Lemari'
  ) THEN category
  ELSE 'Ruang Tamu'
END;

UPDATE products
SET room_category = CASE
  WHEN room_category IN (
    'Ruang Tamu',
    'Ruang Makan',
    'Dapur',
    'Kamar Tidur',
    'Mini Bar'
  ) THEN room_category
  WHEN category = 'Kitchen Set' THEN 'Dapur'
  WHEN category = 'Kamar Tidur' THEN 'Kamar Tidur'
  WHEN category = 'Ruang Tamu' THEN 'Ruang Tamu'
  WHEN category = 'Mini Bar' THEN 'Mini Bar'
  WHEN category IN ('Meja', 'Kursi') THEN 'Ruang Makan'
  WHEN category = 'Lemari' THEN 'Kamar Tidur'
  ELSE 'Ruang Tamu'
END;

UPDATE products
SET stock = NULL
WHERE category IN ('Kitchen Set', 'Kamar Tidur', 'Ruang Tamu', 'Mini Bar');

UPDATE products
SET stock = 0
WHERE category IN ('Meja', 'Kursi', 'Lemari')
  AND stock IS NULL;

ALTER TABLE products
ADD CONSTRAINT products_category_check
CHECK (
  category IN (
    'Kitchen Set',
    'Kamar Tidur',
    'Ruang Tamu',
    'Mini Bar',
    'Meja',
    'Kursi',
    'Lemari'
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
    category IN ('Meja', 'Kursi', 'Lemari')
    AND stock IS NOT NULL
    AND stock >= 0
  )
  OR
  (
    category IN ('Kitchen Set', 'Kamar Tidur', 'Ruang Tamu', 'Mini Bar')
    AND stock IS NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_metadata
ON products(category, material, style_theme, dominant_color, room_category);

COMMIT;
