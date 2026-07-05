BEGIN;

DROP TABLE IF EXISTS seed_18a_products;
DROP TABLE IF EXISTS seed_18a_users;
DROP TABLE IF EXISTS seed_18a_likes;
DROP TABLE IF EXISTS seed_18a_wishlists;
DROP TABLE IF EXISTS seed_18a_inquiries;

CREATE TEMP TABLE seed_18a_products (
  name TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  material TEXT NOT NULL,
  material_variant TEXT NOT NULL,
  style_theme TEXT NOT NULL,
  dominant_color TEXT NOT NULL,
  room_category TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  stock INTEGER,
  status TEXT NOT NULL DEFAULT 'active'
) ON COMMIT DROP;

INSERT INTO seed_18a_products (
  name,
  image_url,
  category,
  material,
  material_variant,
  style_theme,
  dominant_color,
  room_category,
  description,
  price,
  stock,
  status
) VALUES
  -- Keyword gambar: kitchen set modern hpl solid putih
  ('Kitchen Set Modern HPL Solid Putih', 'https://placehold.co/600x400?text=Kitchen+Set+Modern+HPL+Solid+Putih', 'Kitchen Set', 'HPL', 'Solid', 'Modern', 'Putih', 'Dapur', 'Produk bergaya Modern dengan material HPL Solid dan warna Putih, cocok untuk melengkapi interior Dapur yang bersih dan fungsional.', 11800000, NULL, 'active'),
  -- Keyword gambar: kitchen set japandi hpl woodgrain beige
  ('Kitchen Set Japandi HPL Woodgrain Beige', 'https://placehold.co/600x400?text=Kitchen+Set+Japandi+HPL+Woodgrain+Beige', 'Kitchen Set', 'HPL', 'Woodgrain', 'Japandi', 'Beige', 'Dapur', 'Produk bergaya Japandi dengan material HPL Woodgrain dan warna Beige, cocok untuk melengkapi interior Dapur yang hangat dan natural.', 12600000, NULL, 'active'),
  -- Keyword gambar: kitchen set minimalis hpl marble putih
  ('Kitchen Set Minimalis HPL Marble Putih', 'https://placehold.co/600x400?text=Kitchen+Set+Minimalis+HPL+Marble+Putih', 'Kitchen Set', 'HPL', 'Marble', 'Minimalis', 'Putih', 'Dapur', 'Produk bergaya Minimalis dengan material HPL Marble dan warna Putih, cocok untuk dapur yang rapi dan terang.', 13200000, NULL, 'active'),
  -- Keyword gambar: kitchen set modern hpl kaca glossy hitam
  ('Kitchen Set Modern HPL Kaca Glossy Hitam', 'https://placehold.co/600x400?text=Kitchen+Set+Modern+HPL+Kaca+Glossy+Hitam', 'Kitchen Set', 'HPL + Kaca', 'Glossy', 'Modern', 'Hitam', 'Dapur', 'Produk bergaya Modern dengan material HPL + Kaca Glossy dan warna Hitam, cocok untuk dapur modern yang tegas.', 14800000, NULL, 'active'),
  -- Keyword gambar: kitchen set japandi hpl woodgrain natural
  ('Kitchen Set Japandi HPL Woodgrain Natural', 'https://placehold.co/600x400?text=Kitchen+Set+Japandi+HPL+Woodgrain+Natural', 'Kitchen Set', 'HPL', 'Woodgrain', 'Japandi', 'Natural', 'Dapur', 'Produk bergaya Japandi dengan material HPL Woodgrain dan warna Natural, cocok untuk dapur bernuansa kayu.', 12900000, NULL, 'active'),
  -- Keyword gambar: kitchen set minimalis hpl solid abu
  ('Kitchen Set Minimalis HPL Solid Abu', 'https://placehold.co/600x400?text=Kitchen+Set+Minimalis+HPL+Solid+Abu', 'Kitchen Set', 'HPL', 'Solid', 'Minimalis', 'Abu-abu', 'Dapur', 'Produk bergaya Minimalis dengan material HPL Solid dan warna Abu-abu, cocok untuk dapur modern yang netral.', 11900000, NULL, 'active'),

  -- Keyword gambar: living set japandi linen beige
  ('Living Set Japandi Linen Beige', 'https://placehold.co/600x400?text=Living+Set+Japandi+Linen+Beige', 'Living Set', 'Linen', 'Tidak Ada', 'Japandi', 'Beige', 'Ruang Tamu', 'Produk bergaya Japandi dengan material Linen dan warna Beige, cocok untuk ruang tamu yang hangat dan nyaman.', 9800000, NULL, 'active'),
  -- Keyword gambar: living set modern kayu linen abu
  ('Living Set Modern Kayu Linen Abu', 'https://placehold.co/600x400?text=Living+Set+Modern+Kayu+Linen+Abu', 'Living Set', 'Kayu + Linen', 'Tidak Ada', 'Modern', 'Abu-abu', 'Ruang Tamu', 'Produk bergaya Modern dengan material Kayu + Linen dan warna Abu-abu, cocok untuk ruang tamu keluarga.', 10400000, NULL, 'active'),
  -- Keyword gambar: living set minimalis hpl solid putih
  ('Living Set Minimalis HPL Solid Putih', 'https://placehold.co/600x400?text=Living+Set+Minimalis+HPL+Solid+Putih', 'Living Set', 'HPL', 'Solid', 'Minimalis', 'Putih', 'Ruang Tamu', 'Produk bergaya Minimalis dengan material HPL Solid dan warna Putih, cocok untuk ruang tamu yang bersih.', 8600000, NULL, 'active'),
  -- Keyword gambar: living set modern logam linen hitam
  ('Living Set Modern Logam Linen Hitam', 'https://placehold.co/600x400?text=Living+Set+Modern+Logam+Linen+Hitam', 'Living Set', 'Logam + Linen', 'Tidak Ada', 'Modern', 'Hitam', 'Ruang Tamu', 'Produk bergaya Modern dengan material Logam + Linen dan warna Hitam, cocok untuk ruang tamu urban.', 11200000, NULL, 'active'),
  -- Keyword gambar: living set japandi kayu linen natural
  ('Living Set Japandi Kayu Linen Natural', 'https://placehold.co/600x400?text=Living+Set+Japandi+Kayu+Linen+Natural', 'Living Set', 'Kayu + Linen', 'Tidak Ada', 'Japandi', 'Natural', 'Ruang Tamu', 'Produk bergaya Japandi dengan material Kayu + Linen dan warna Natural, cocok untuk ruang tamu natural.', 10900000, NULL, 'active'),
  -- Keyword gambar: living set minimalis hpl kaca glossy coklat
  ('Living Set Minimalis HPL Kaca Glossy Coklat', 'https://placehold.co/600x400?text=Living+Set+Minimalis+HPL+Kaca+Glossy+Coklat', 'Living Set', 'HPL + Kaca', 'Glossy', 'Minimalis', 'Coklat', 'Ruang Tamu', 'Produk bergaya Minimalis dengan material HPL + Kaca Glossy dan warna Coklat, cocok untuk ruang tamu elegan.', 10100000, NULL, 'active'),

  -- Keyword gambar: bedset japandi hpl woodgrain beige
  ('Bedset Japandi HPL Woodgrain Beige', 'https://placehold.co/600x400?text=Bedset+Japandi+HPL+Woodgrain+Beige', 'Bedset', 'HPL', 'Woodgrain', 'Japandi', 'Beige', 'Kamar Tidur', 'Produk bergaya Japandi dengan material HPL Woodgrain dan warna Beige, cocok untuk kamar tidur yang hangat.', 7600000, NULL, 'active'),
  -- Keyword gambar: bedset modern hpl solid putih
  ('Bedset Modern HPL Solid Putih', 'https://placehold.co/600x400?text=Bedset+Modern+HPL+Solid+Putih', 'Bedset', 'HPL', 'Solid', 'Modern', 'Putih', 'Kamar Tidur', 'Produk bergaya Modern dengan material HPL Solid dan warna Putih, cocok untuk kamar tidur modern.', 7900000, NULL, 'active'),
  -- Keyword gambar: bedset minimalis hpl marble abu
  ('Bedset Minimalis HPL Marble Abu', 'https://placehold.co/600x400?text=Bedset+Minimalis+HPL+Marble+Abu', 'Bedset', 'HPL', 'Marble', 'Minimalis', 'Abu-abu', 'Kamar Tidur', 'Produk bergaya Minimalis dengan material HPL Marble dan warna Abu-abu, cocok untuk kamar tidur netral.', 7350000, NULL, 'active'),
  -- Keyword gambar: bedset japandi kayu linen natural
  ('Bedset Japandi Kayu Linen Natural', 'https://placehold.co/600x400?text=Bedset+Japandi+Kayu+Linen+Natural', 'Bedset', 'Kayu + Linen', 'Tidak Ada', 'Japandi', 'Natural', 'Kamar Tidur', 'Produk bergaya Japandi dengan material Kayu + Linen dan warna Natural, cocok untuk kamar tidur natural.', 8200000, NULL, 'active'),
  -- Keyword gambar: bedset modern hpl kaca glossy hitam
  ('Bedset Modern HPL Kaca Glossy Hitam', 'https://placehold.co/600x400?text=Bedset+Modern+HPL+Kaca+Glossy+Hitam', 'Bedset', 'HPL + Kaca', 'Glossy', 'Modern', 'Hitam', 'Kamar Tidur', 'Produk bergaya Modern dengan material HPL + Kaca Glossy dan warna Hitam, cocok untuk kamar tidur tegas.', 8700000, NULL, 'active'),
  -- Keyword gambar: bedset minimalis kayu beige
  ('Bedset Minimalis Kayu Beige', 'https://placehold.co/600x400?text=Bedset+Minimalis+Kayu+Beige', 'Bedset', 'Kayu', 'Tidak Ada', 'Minimalis', 'Beige', 'Kamar Tidur', 'Produk bergaya Minimalis dengan material Kayu dan warna Beige, cocok untuk kamar tidur sederhana.', 6900000, NULL, 'active'),

  -- Keyword gambar: minibar modern hpl solid hitam
  ('Minibar Modern HPL Solid Hitam', 'https://placehold.co/600x400?text=Minibar+Modern+HPL+Solid+Hitam', 'Minibar', 'HPL', 'Solid', 'Modern', 'Hitam', 'Mini Bar', 'Produk bergaya Modern dengan material HPL Solid dan warna Hitam, cocok untuk area mini bar yang tegas.', 8900000, NULL, 'active'),
  -- Keyword gambar: minibar japandi hpl woodgrain natural
  ('Minibar Japandi HPL Woodgrain Natural', 'https://placehold.co/600x400?text=Minibar+Japandi+HPL+Woodgrain+Natural', 'Minibar', 'HPL', 'Woodgrain', 'Japandi', 'Natural', 'Mini Bar', 'Produk bergaya Japandi dengan material HPL Woodgrain dan warna Natural, cocok untuk mini bar natural.', 9200000, NULL, 'active'),
  -- Keyword gambar: minibar minimalis hpl marble putih
  ('Minibar Minimalis HPL Marble Putih', 'https://placehold.co/600x400?text=Minibar+Minimalis+HPL+Marble+Putih', 'Minibar', 'HPL', 'Marble', 'Minimalis', 'Putih', 'Mini Bar', 'Produk bergaya Minimalis dengan material HPL Marble dan warna Putih, cocok untuk mini bar bersih.', 9400000, NULL, 'active'),
  -- Keyword gambar: minibar modern hpl kaca glossy abu
  ('Minibar Modern HPL Kaca Glossy Abu', 'https://placehold.co/600x400?text=Minibar+Modern+HPL+Kaca+Glossy+Abu', 'Minibar', 'HPL + Kaca', 'Glossy', 'Modern', 'Abu-abu', 'Mini Bar', 'Produk bergaya Modern dengan material HPL + Kaca Glossy dan warna Abu-abu, cocok untuk mini bar modern.', 9800000, NULL, 'active'),
  -- Keyword gambar: minibar japandi kayu logam coklat
  ('Minibar Japandi Kayu Logam Coklat', 'https://placehold.co/600x400?text=Minibar+Japandi+Kayu+Logam+Coklat', 'Minibar', 'Kayu + Logam', 'Tidak Ada', 'Japandi', 'Coklat', 'Mini Bar', 'Produk bergaya Japandi dengan material Kayu + Logam dan warna Coklat, cocok untuk mini bar hangat.', 9100000, NULL, 'active'),
  -- Keyword gambar: minibar minimalis kaca glossy hitam
  ('Minibar Minimalis Kaca Glossy Hitam', 'https://placehold.co/600x400?text=Minibar+Minimalis+Kaca+Glossy+Hitam', 'Minibar', 'Kaca', 'Glossy', 'Minimalis', 'Hitam', 'Mini Bar', 'Produk bergaya Minimalis dengan material Kaca Glossy dan warna Hitam, cocok untuk mini bar compact.', 8700000, NULL, 'active'),

  -- Keyword gambar: meja makan japandi kayu natural
  ('Meja Makan Japandi Kayu Natural', 'https://placehold.co/600x400?text=Meja+Makan+Japandi+Kayu+Natural', 'Meja', 'Kayu', 'Tidak Ada', 'Japandi', 'Natural', 'Ruang Makan', 'Produk bergaya Japandi dengan material Kayu dan warna Natural, cocok untuk ruang makan hangat.', 4200000, 14, 'active'),
  -- Keyword gambar: meja makan modern kayu logam hitam
  ('Meja Makan Modern Kayu Logam Hitam', 'https://placehold.co/600x400?text=Meja+Makan+Modern+Kayu+Logam+Hitam', 'Meja', 'Kayu + Logam', 'Glossy', 'Modern', 'Hitam', 'Ruang Makan', 'Produk bergaya Modern dengan material Kayu + Logam Glossy dan warna Hitam, cocok untuk ruang makan modern.', 4800000, 12, 'active'),
  -- Keyword gambar: meja tamu minimalis hpl marble putih
  ('Meja Tamu Minimalis HPL Marble Putih', 'https://placehold.co/600x400?text=Meja+Tamu+Minimalis+HPL+Marble+Putih', 'Meja', 'HPL', 'Marble', 'Minimalis', 'Putih', 'Ruang Tamu', 'Produk bergaya Minimalis dengan material HPL Marble dan warna Putih, cocok untuk ruang tamu terang.', 2600000, 10, 'active'),
  -- Keyword gambar: meja tamu japandi kayu beige
  ('Meja Tamu Japandi Kayu Beige', 'https://placehold.co/600x400?text=Meja+Tamu+Japandi+Kayu+Beige', 'Meja', 'Kayu', 'Tidak Ada', 'Japandi', 'Beige', 'Ruang Tamu', 'Produk bergaya Japandi dengan material Kayu dan warna Beige, cocok untuk ruang tamu natural.', 2450000, 11, 'active'),
  -- Keyword gambar: meja dapur modern hpl solid putih
  ('Meja Dapur Modern HPL Solid Putih', 'https://placehold.co/600x400?text=Meja+Dapur+Modern+HPL+Solid+Putih', 'Meja', 'HPL', 'Solid', 'Modern', 'Putih', 'Dapur', 'Produk bergaya Modern dengan material HPL Solid dan warna Putih, cocok untuk area kerja dapur.', 3100000, 9, 'active'),
  -- Keyword gambar: meja bar modern kayu logam glossy hitam
  ('Meja Bar Modern Kayu Logam Glossy Hitam', 'https://placehold.co/600x400?text=Meja+Bar+Modern+Kayu+Logam+Glossy+Hitam', 'Meja', 'Kayu + Logam', 'Glossy', 'Modern', 'Hitam', 'Mini Bar', 'Produk bergaya Modern dengan material Kayu + Logam Glossy dan warna Hitam, cocok untuk mini bar.', 3600000, 8, 'active'),

  -- Keyword gambar: kursi makan japandi kayu linen beige
  ('Kursi Makan Japandi Kayu Linen Beige', 'https://placehold.co/600x400?text=Kursi+Makan+Japandi+Kayu+Linen+Beige', 'Kursi', 'Kayu + Linen', 'Tidak Ada', 'Japandi', 'Beige', 'Ruang Makan', 'Produk bergaya Japandi dengan material Kayu + Linen dan warna Beige, cocok untuk ruang makan hangat.', 1250000, 18, 'active'),
  -- Keyword gambar: kursi makan modern logam linen hitam
  ('Kursi Makan Modern Logam Linen Hitam', 'https://placehold.co/600x400?text=Kursi+Makan+Modern+Logam+Linen+Hitam', 'Kursi', 'Logam + Linen', 'Tidak Ada', 'Modern', 'Hitam', 'Ruang Makan', 'Produk bergaya Modern dengan material Logam + Linen dan warna Hitam, cocok untuk ruang makan modern.', 1350000, 16, 'active'),
  -- Keyword gambar: kursi mini bar modern logam linen hitam
  ('Kursi Mini Bar Modern Logam Linen Hitam', 'https://placehold.co/600x400?text=Kursi+Mini+Bar+Modern+Logam+Linen+Hitam', 'Kursi', 'Logam + Linen', 'Tidak Ada', 'Modern', 'Hitam', 'Mini Bar', 'Produk bergaya Modern dengan material Logam + Linen dan warna Hitam, cocok untuk mini bar.', 1450000, 15, 'active'),
  -- Keyword gambar: kursi mini bar japandi kayu linen natural
  ('Kursi Mini Bar Japandi Kayu Linen Natural', 'https://placehold.co/600x400?text=Kursi+Mini+Bar+Japandi+Kayu+Linen+Natural', 'Kursi', 'Kayu + Linen', 'Tidak Ada', 'Japandi', 'Natural', 'Mini Bar', 'Produk bergaya Japandi dengan material Kayu + Linen dan warna Natural, cocok untuk mini bar natural.', 1420000, 14, 'active'),
  -- Keyword gambar: kursi santai ruang tamu minimalis abu
  ('Kursi Santai Ruang Tamu Minimalis Abu', 'https://placehold.co/600x400?text=Kursi+Santai+Ruang+Tamu+Minimalis+Abu', 'Kursi', 'Kayu + Linen', 'Tidak Ada', 'Minimalis', 'Abu-abu', 'Ruang Tamu', 'Produk bergaya Minimalis dengan material Kayu + Linen dan warna Abu-abu, cocok untuk ruang tamu santai.', 1750000, 12, 'active'),
  -- Keyword gambar: kursi dapur minimalis kayu linen putih
  ('Kursi Dapur Minimalis Kayu Linen Putih', 'https://placehold.co/600x400?text=Kursi+Dapur+Minimalis+Kayu+Linen+Putih', 'Kursi', 'Kayu + Linen', 'Tidak Ada', 'Minimalis', 'Putih', 'Dapur', 'Produk bergaya Minimalis dengan material Kayu + Linen dan warna Putih, cocok untuk dapur compact.', 1180000, 10, 'active'),

  -- Keyword gambar: lemari pakaian japandi hpl woodgrain beige
  ('Lemari Pakaian Japandi HPL Woodgrain Beige', 'https://placehold.co/600x400?text=Lemari+Pakaian+Japandi+HPL+Woodgrain+Beige', 'Lemari', 'HPL', 'Woodgrain', 'Japandi', 'Beige', 'Kamar Tidur', 'Produk bergaya Japandi dengan material HPL Woodgrain dan warna Beige, cocok untuk kamar tidur hangat.', 6800000, 9, 'active'),
  -- Keyword gambar: lemari pakaian modern hpl solid putih
  ('Lemari Pakaian Modern HPL Solid Putih', 'https://placehold.co/600x400?text=Lemari+Pakaian+Modern+HPL+Solid+Putih', 'Lemari', 'HPL', 'Solid', 'Modern', 'Putih', 'Kamar Tidur', 'Produk bergaya Modern dengan material HPL Solid dan warna Putih, cocok untuk kamar tidur modern.', 7100000, 8, 'active'),
  -- Keyword gambar: lemari pakaian minimalis hpl marble abu
  ('Lemari Pakaian Minimalis HPL Marble Abu', 'https://placehold.co/600x400?text=Lemari+Pakaian+Minimalis+HPL+Marble+Abu', 'Lemari', 'HPL', 'Marble', 'Minimalis', 'Abu-abu', 'Kamar Tidur', 'Produk bergaya Minimalis dengan material HPL Marble dan warna Abu-abu, cocok untuk kamar tidur netral.', 6900000, 7, 'active'),
  -- Keyword gambar: lemari display ruang tamu hpl kaca glossy hitam
  ('Lemari Display Ruang Tamu HPL Kaca Glossy Hitam', 'https://placehold.co/600x400?text=Lemari+Display+Ruang+Tamu+HPL+Kaca+Glossy+Hitam', 'Lemari', 'HPL + Kaca', 'Glossy', 'Modern', 'Hitam', 'Ruang Tamu', 'Produk bergaya Modern dengan material HPL + Kaca Glossy dan warna Hitam, cocok untuk display ruang tamu.', 6300000, 6, 'active'),
  -- Keyword gambar: lemari tv minimalis hpl solid putih
  ('Lemari TV Minimalis HPL Solid Putih', 'https://placehold.co/600x400?text=Lemari+TV+Minimalis+HPL+Solid+Putih', 'Lemari', 'HPL', 'Solid', 'Minimalis', 'Putih', 'Ruang Tamu', 'Produk bergaya Minimalis dengan material HPL Solid dan warna Putih, cocok untuk area TV ruang tamu.', 5200000, 7, 'active'),
  -- Keyword gambar: lemari pakaian japandi kayu natural
  ('Lemari Pakaian Japandi Kayu Natural', 'https://placehold.co/600x400?text=Lemari+Pakaian+Japandi+Kayu+Natural', 'Lemari', 'Kayu', 'Tidak Ada', 'Japandi', 'Natural', 'Kamar Tidur', 'Produk bergaya Japandi dengan material Kayu dan warna Natural, cocok untuk kamar tidur natural.', 7200000, 8, 'active'),

  -- Keyword gambar: nakas japandi hpl woodgrain beige
  ('Nakas Japandi HPL Woodgrain Beige', 'https://placehold.co/600x400?text=Nakas+Japandi+HPL+Woodgrain+Beige', 'Nakas', 'HPL', 'Woodgrain', 'Japandi', 'Beige', 'Kamar Tidur', 'Produk bergaya Japandi dengan material HPL Woodgrain dan warna Beige, cocok untuk sisi tempat tidur.', 1450000, 16, 'active'),
  -- Keyword gambar: nakas modern hpl solid putih
  ('Nakas Modern HPL Solid Putih', 'https://placehold.co/600x400?text=Nakas+Modern+HPL+Solid+Putih', 'Nakas', 'HPL', 'Solid', 'Modern', 'Putih', 'Kamar Tidur', 'Produk bergaya Modern dengan material HPL Solid dan warna Putih, cocok untuk kamar tidur modern.', 1500000, 15, 'active'),
  -- Keyword gambar: nakas minimalis hpl marble abu
  ('Nakas Minimalis HPL Marble Abu', 'https://placehold.co/600x400?text=Nakas+Minimalis+HPL+Marble+Abu', 'Nakas', 'HPL', 'Marble', 'Minimalis', 'Abu-abu', 'Kamar Tidur', 'Produk bergaya Minimalis dengan material HPL Marble dan warna Abu-abu, cocok untuk kamar tidur netral.', 1420000, 13, 'active'),
  -- Keyword gambar: nakas japandi kayu natural
  ('Nakas Japandi Kayu Natural', 'https://placehold.co/600x400?text=Nakas+Japandi+Kayu+Natural', 'Nakas', 'Kayu', 'Tidak Ada', 'Japandi', 'Natural', 'Kamar Tidur', 'Produk bergaya Japandi dengan material Kayu dan warna Natural, cocok untuk kamar tidur natural.', 1550000, 14, 'active'),
  -- Keyword gambar: nakas modern hpl kaca glossy hitam
  ('Nakas Modern HPL Kaca Glossy Hitam', 'https://placehold.co/600x400?text=Nakas+Modern+HPL+Kaca+Glossy+Hitam', 'Nakas', 'HPL + Kaca', 'Glossy', 'Modern', 'Hitam', 'Kamar Tidur', 'Produk bergaya Modern dengan material HPL + Kaca Glossy dan warna Hitam, cocok untuk kamar tidur tegas.', 1680000, 10, 'active'),
  -- Keyword gambar: nakas minimalis hpl solid coklat
  ('Nakas Minimalis HPL Solid Coklat', 'https://placehold.co/600x400?text=Nakas+Minimalis+HPL+Solid+Coklat', 'Nakas', 'HPL', 'Solid', 'Minimalis', 'Coklat', 'Kamar Tidur', 'Produk bergaya Minimalis dengan material HPL Solid dan warna Coklat, cocok untuk kamar tidur hangat.', 1380000, 12, 'active'),

  -- Keyword gambar: meja rias japandi hpl woodgrain beige
  ('Meja Rias Japandi HPL Woodgrain Beige', 'https://placehold.co/600x400?text=Meja+Rias+Japandi+HPL+Woodgrain+Beige', 'Meja Rias', 'HPL', 'Woodgrain', 'Japandi', 'Beige', 'Kamar Tidur', 'Produk bergaya Japandi dengan material HPL Woodgrain dan warna Beige, cocok untuk kamar tidur hangat.', 3600000, 10, 'active'),
  -- Keyword gambar: meja rias modern hpl solid putih
  ('Meja Rias Modern HPL Solid Putih', 'https://placehold.co/600x400?text=Meja+Rias+Modern+HPL+Solid+Putih', 'Meja Rias', 'HPL', 'Solid', 'Modern', 'Putih', 'Kamar Tidur', 'Produk bergaya Modern dengan material HPL Solid dan warna Putih, cocok untuk kamar tidur modern.', 3800000, 9, 'active'),
  -- Keyword gambar: meja rias minimalis hpl marble abu
  ('Meja Rias Minimalis HPL Marble Abu', 'https://placehold.co/600x400?text=Meja+Rias+Minimalis+HPL+Marble+Abu', 'Meja Rias', 'HPL', 'Marble', 'Minimalis', 'Abu-abu', 'Kamar Tidur', 'Produk bergaya Minimalis dengan material HPL Marble dan warna Abu-abu, cocok untuk kamar tidur netral.', 3500000, 8, 'active'),
  -- Keyword gambar: meja rias modern hpl kaca glossy hitam
  ('Meja Rias Modern HPL Kaca Glossy Hitam', 'https://placehold.co/600x400?text=Meja+Rias+Modern+HPL+Kaca+Glossy+Hitam', 'Meja Rias', 'HPL + Kaca', 'Glossy', 'Modern', 'Hitam', 'Kamar Tidur', 'Produk bergaya Modern dengan material HPL + Kaca Glossy dan warna Hitam, cocok untuk kamar tidur tegas.', 4100000, 7, 'active'),
  -- Keyword gambar: meja rias japandi kayu natural
  ('Meja Rias Japandi Kayu Natural', 'https://placehold.co/600x400?text=Meja+Rias+Japandi+Kayu+Natural', 'Meja Rias', 'Kayu', 'Tidak Ada', 'Japandi', 'Natural', 'Kamar Tidur', 'Produk bergaya Japandi dengan material Kayu dan warna Natural, cocok untuk kamar tidur natural.', 3700000, 8, 'active'),
  -- Keyword gambar: meja rias minimalis hpl solid coklat
  ('Meja Rias Minimalis HPL Solid Coklat', 'https://placehold.co/600x400?text=Meja+Rias+Minimalis+HPL+Solid+Coklat', 'Meja Rias', 'HPL', 'Solid', 'Minimalis', 'Coklat', 'Kamar Tidur', 'Produk bergaya Minimalis dengan material HPL Solid dan warna Coklat, cocok untuk kamar tidur hangat.', 3400000, 9, 'active');

CREATE TEMP TABLE seed_18a_users (
  username TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  persona TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO seed_18a_users (username, email, name, persona) VALUES
  ('user_japandi_kamar', 'user_japandi_kamar@example.com', 'User Japandi Kamar', 'Kamar Tidur Japandi, Beige, Woodgrain'),
  ('user_modern_kamar', 'user_modern_kamar@example.com', 'User Modern Kamar', 'Kamar Tidur Modern, Putih/Hitam, Solid/Glossy'),
  ('user_minimalis_kamar', 'user_minimalis_kamar@example.com', 'User Minimalis Kamar', 'Kamar Tidur Minimalis, Marble, Abu-abu'),
  ('user_ruang_tamu_japandi', 'user_ruang_tamu_japandi@example.com', 'User Ruang Tamu Japandi', 'Ruang Tamu Japandi, Natural, Kayu Linen'),
  ('user_ruang_tamu_modern', 'user_ruang_tamu_modern@example.com', 'User Ruang Tamu Modern', 'Ruang Tamu Modern, Hitam/Abu, Glossy'),
  ('user_dapur_modern', 'user_dapur_modern@example.com', 'User Dapur Modern', 'Dapur Modern, Putih, HPL Solid'),
  ('user_dapur_japandi', 'user_dapur_japandi@example.com', 'User Dapur Japandi', 'Dapur Japandi, Woodgrain, Natural'),
  ('user_minibar_modern', 'user_minibar_modern@example.com', 'User Minibar Modern', 'Mini Bar Modern, Hitam, Logam/Glossy'),
  ('user_minibar_japandi', 'user_minibar_japandi@example.com', 'User Minibar Japandi', 'Mini Bar Japandi, Natural, Woodgrain'),
  ('user_ruang_makan_japandi', 'user_ruang_makan_japandi@example.com', 'User Ruang Makan Japandi', 'Ruang Makan Japandi, Kayu, Beige/Natural'),
  ('user_ruang_makan_modern', 'user_ruang_makan_modern@example.com', 'User Ruang Makan Modern', 'Ruang Makan Modern, Hitam, Kayu Logam'),
  ('user_mixed_minimalis', 'user_mixed_minimalis@example.com', 'User Mixed Minimalis', 'Minimalis lintas ruangan, Putih/Abu, Marble/Solid');

UPDATE products
SET
  status = 'inactive',
  updated_at = CURRENT_TIMESTAMP
WHERE status = 'active'
  AND name NOT IN (SELECT name FROM seed_18a_products);

DELETE FROM products
WHERE name IN (SELECT name FROM seed_18a_products);

INSERT INTO products (
  name,
  image_url,
  category,
  material,
  material_variant,
  style_theme,
  dominant_color,
  room_category,
  description,
  price,
  stock,
  status
)
SELECT
  name,
  image_url,
  category,
  material,
  material_variant,
  style_theme,
  dominant_color,
  room_category,
  description,
  price,
  stock,
  status
FROM seed_18a_products;

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
SELECT
  NULL,
  username,
  email,
  name,
  NULL,
  '$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i',
  'local',
  'user'
FROM seed_18a_users
ON CONFLICT (email) DO UPDATE
SET
  username = EXCLUDED.username,
  name = EXCLUDED.name,
  avatar_url = EXCLUDED.avatar_url,
  password_hash = EXCLUDED.password_hash,
  auth_provider = EXCLUDED.auth_provider,
  role = 'user',
  updated_at = CURRENT_TIMESTAMP;

DELETE FROM product_likes pl
USING users u
WHERE pl.user_id = u.id
  AND u.username IN (SELECT username FROM seed_18a_users);

DELETE FROM product_wishlists pw
USING users u
WHERE pw.user_id = u.id
  AND u.username IN (SELECT username FROM seed_18a_users);

DELETE FROM interactions i
USING users u
WHERE i.user_id = u.id
  AND u.username IN (SELECT username FROM seed_18a_users);

CREATE TEMP TABLE seed_18a_likes (
  username TEXT NOT NULL,
  product_name TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO seed_18a_likes (username, product_name) VALUES
  ('user_japandi_kamar', 'Bedset Japandi HPL Woodgrain Beige'),
  ('user_japandi_kamar', 'Bedset Japandi Kayu Linen Natural'),
  ('user_japandi_kamar', 'Lemari Pakaian Japandi HPL Woodgrain Beige'),
  ('user_japandi_kamar', 'Lemari Pakaian Japandi Kayu Natural'),
  ('user_japandi_kamar', 'Nakas Japandi HPL Woodgrain Beige'),
  ('user_japandi_kamar', 'Nakas Japandi Kayu Natural'),
  ('user_japandi_kamar', 'Meja Rias Japandi HPL Woodgrain Beige'),
  ('user_japandi_kamar', 'Meja Rias Japandi Kayu Natural'),
  ('user_modern_kamar', 'Bedset Modern HPL Solid Putih'),
  ('user_modern_kamar', 'Bedset Modern HPL Kaca Glossy Hitam'),
  ('user_modern_kamar', 'Lemari Pakaian Modern HPL Solid Putih'),
  ('user_modern_kamar', 'Nakas Modern HPL Solid Putih'),
  ('user_modern_kamar', 'Nakas Modern HPL Kaca Glossy Hitam'),
  ('user_modern_kamar', 'Meja Rias Modern HPL Solid Putih'),
  ('user_modern_kamar', 'Meja Rias Modern HPL Kaca Glossy Hitam'),
  ('user_minimalis_kamar', 'Bedset Minimalis HPL Marble Abu'),
  ('user_minimalis_kamar', 'Bedset Minimalis Kayu Beige'),
  ('user_minimalis_kamar', 'Lemari Pakaian Minimalis HPL Marble Abu'),
  ('user_minimalis_kamar', 'Nakas Minimalis HPL Marble Abu'),
  ('user_minimalis_kamar', 'Nakas Minimalis HPL Solid Coklat'),
  ('user_minimalis_kamar', 'Meja Rias Minimalis HPL Marble Abu'),
  ('user_minimalis_kamar', 'Meja Rias Minimalis HPL Solid Coklat'),
  ('user_ruang_tamu_japandi', 'Living Set Japandi Linen Beige'),
  ('user_ruang_tamu_japandi', 'Living Set Japandi Kayu Linen Natural'),
  ('user_ruang_tamu_japandi', 'Meja Tamu Japandi Kayu Beige'),
  ('user_ruang_tamu_japandi', 'Kursi Santai Ruang Tamu Minimalis Abu'),
  ('user_ruang_tamu_japandi', 'Lemari TV Minimalis HPL Solid Putih'),
  ('user_ruang_tamu_japandi', 'Nakas Japandi Kayu Natural'),
  ('user_ruang_tamu_japandi', 'Lemari Pakaian Japandi Kayu Natural'),
  ('user_ruang_tamu_modern', 'Living Set Modern Kayu Linen Abu'),
  ('user_ruang_tamu_modern', 'Living Set Modern Logam Linen Hitam'),
  ('user_ruang_tamu_modern', 'Lemari Display Ruang Tamu HPL Kaca Glossy Hitam'),
  ('user_ruang_tamu_modern', 'Meja Tamu Minimalis HPL Marble Putih'),
  ('user_ruang_tamu_modern', 'Kursi Santai Ruang Tamu Minimalis Abu'),
  ('user_dapur_modern', 'Kitchen Set Modern HPL Solid Putih'),
  ('user_dapur_modern', 'Kitchen Set Modern HPL Kaca Glossy Hitam'),
  ('user_dapur_modern', 'Meja Dapur Modern HPL Solid Putih'),
  ('user_dapur_modern', 'Kursi Dapur Minimalis Kayu Linen Putih'),
  ('user_dapur_modern', 'Kitchen Set Minimalis HPL Solid Abu'),
  ('user_dapur_japandi', 'Kitchen Set Japandi HPL Woodgrain Beige'),
  ('user_dapur_japandi', 'Kitchen Set Japandi HPL Woodgrain Natural'),
  ('user_dapur_japandi', 'Meja Dapur Modern HPL Solid Putih'),
  ('user_dapur_japandi', 'Kursi Dapur Minimalis Kayu Linen Putih'),
  ('user_minibar_modern', 'Minibar Modern HPL Solid Hitam'),
  ('user_minibar_modern', 'Minibar Modern HPL Kaca Glossy Abu'),
  ('user_minibar_modern', 'Minibar Minimalis Kaca Glossy Hitam'),
  ('user_minibar_modern', 'Kursi Mini Bar Modern Logam Linen Hitam'),
  ('user_minibar_modern', 'Meja Bar Modern Kayu Logam Glossy Hitam'),
  ('user_minibar_japandi', 'Minibar Japandi HPL Woodgrain Natural'),
  ('user_minibar_japandi', 'Minibar Japandi Kayu Logam Coklat'),
  ('user_minibar_japandi', 'Kursi Mini Bar Japandi Kayu Linen Natural'),
  ('user_minibar_japandi', 'Meja Bar Modern Kayu Logam Glossy Hitam'),
  ('user_ruang_makan_japandi', 'Meja Makan Japandi Kayu Natural'),
  ('user_ruang_makan_japandi', 'Kursi Makan Japandi Kayu Linen Beige'),
  ('user_ruang_makan_japandi', 'Living Set Japandi Linen Beige'),
  ('user_ruang_makan_japandi', 'Meja Tamu Japandi Kayu Beige'),
  ('user_ruang_makan_modern', 'Meja Makan Modern Kayu Logam Hitam'),
  ('user_ruang_makan_modern', 'Kursi Makan Modern Logam Linen Hitam'),
  ('user_ruang_makan_modern', 'Living Set Modern Logam Linen Hitam'),
  ('user_ruang_makan_modern', 'Meja Bar Modern Kayu Logam Glossy Hitam'),
  ('user_mixed_minimalis', 'Kitchen Set Minimalis HPL Marble Putih'),
  ('user_mixed_minimalis', 'Kitchen Set Minimalis HPL Solid Abu'),
  ('user_mixed_minimalis', 'Living Set Minimalis HPL Solid Putih'),
  ('user_mixed_minimalis', 'Living Set Minimalis HPL Kaca Glossy Coklat'),
  ('user_mixed_minimalis', 'Bedset Minimalis HPL Marble Abu'),
  ('user_mixed_minimalis', 'Lemari Pakaian Minimalis HPL Marble Abu'),
  ('user_mixed_minimalis', 'Nakas Minimalis HPL Marble Abu'),
  ('user_mixed_minimalis', 'Meja Rias Minimalis HPL Marble Abu'),
  ('user_mixed_minimalis', 'Meja Tamu Minimalis HPL Marble Putih');

CREATE TEMP TABLE seed_18a_wishlists (
  username TEXT NOT NULL,
  product_name TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO seed_18a_wishlists (username, product_name) VALUES
  ('user_japandi_kamar', 'Bedset Japandi HPL Woodgrain Beige'),
  ('user_japandi_kamar', 'Nakas Japandi HPL Woodgrain Beige'),
  ('user_japandi_kamar', 'Meja Rias Japandi HPL Woodgrain Beige'),
  ('user_japandi_kamar', 'Lemari Pakaian Japandi HPL Woodgrain Beige'),
  ('user_modern_kamar', 'Bedset Modern HPL Solid Putih'),
  ('user_modern_kamar', 'Lemari Pakaian Modern HPL Solid Putih'),
  ('user_modern_kamar', 'Nakas Modern HPL Solid Putih'),
  ('user_modern_kamar', 'Meja Rias Modern HPL Solid Putih'),
  ('user_minimalis_kamar', 'Bedset Minimalis HPL Marble Abu'),
  ('user_minimalis_kamar', 'Lemari Pakaian Minimalis HPL Marble Abu'),
  ('user_minimalis_kamar', 'Nakas Minimalis HPL Marble Abu'),
  ('user_minimalis_kamar', 'Meja Rias Minimalis HPL Marble Abu'),
  ('user_ruang_tamu_japandi', 'Living Set Japandi Linen Beige'),
  ('user_ruang_tamu_japandi', 'Living Set Japandi Kayu Linen Natural'),
  ('user_ruang_tamu_japandi', 'Meja Tamu Japandi Kayu Beige'),
  ('user_ruang_tamu_japandi', 'Nakas Japandi Kayu Natural'),
  ('user_ruang_tamu_modern', 'Living Set Modern Logam Linen Hitam'),
  ('user_ruang_tamu_modern', 'Lemari Display Ruang Tamu HPL Kaca Glossy Hitam'),
  ('user_dapur_modern', 'Kitchen Set Modern HPL Solid Putih'),
  ('user_dapur_modern', 'Meja Dapur Modern HPL Solid Putih'),
  ('user_dapur_japandi', 'Kitchen Set Japandi HPL Woodgrain Natural'),
  ('user_dapur_japandi', 'Kitchen Set Japandi HPL Woodgrain Beige'),
  ('user_minibar_modern', 'Minibar Modern HPL Solid Hitam'),
  ('user_minibar_modern', 'Kursi Mini Bar Modern Logam Linen Hitam'),
  ('user_minibar_modern', 'Meja Bar Modern Kayu Logam Glossy Hitam'),
  ('user_minibar_japandi', 'Minibar Japandi HPL Woodgrain Natural'),
  ('user_minibar_japandi', 'Kursi Mini Bar Japandi Kayu Linen Natural'),
  ('user_ruang_makan_japandi', 'Meja Makan Japandi Kayu Natural'),
  ('user_ruang_makan_japandi', 'Kursi Makan Japandi Kayu Linen Beige'),
  ('user_ruang_makan_modern', 'Meja Makan Modern Kayu Logam Hitam'),
  ('user_ruang_makan_modern', 'Kursi Makan Modern Logam Linen Hitam'),
  ('user_mixed_minimalis', 'Bedset Minimalis HPL Marble Abu'),
  ('user_mixed_minimalis', 'Nakas Minimalis HPL Marble Abu'),
  ('user_mixed_minimalis', 'Meja Tamu Minimalis HPL Marble Putih'),
  ('user_mixed_minimalis', 'Kitchen Set Minimalis HPL Marble Putih');

CREATE TEMP TABLE seed_18a_inquiries (
  username TEXT NOT NULL,
  product_name TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO seed_18a_inquiries (username, product_name) VALUES
  ('user_japandi_kamar', 'Bedset Japandi HPL Woodgrain Beige'),
  ('user_japandi_kamar', 'Meja Rias Japandi HPL Woodgrain Beige'),
  ('user_modern_kamar', 'Bedset Modern HPL Solid Putih'),
  ('user_modern_kamar', 'Nakas Modern HPL Kaca Glossy Hitam'),
  ('user_minimalis_kamar', 'Bedset Minimalis HPL Marble Abu'),
  ('user_minimalis_kamar', 'Meja Rias Minimalis HPL Marble Abu'),
  ('user_ruang_tamu_japandi', 'Living Set Japandi Kayu Linen Natural'),
  ('user_ruang_tamu_modern', 'Lemari Display Ruang Tamu HPL Kaca Glossy Hitam'),
  ('user_dapur_modern', 'Kitchen Set Modern HPL Solid Putih'),
  ('user_dapur_japandi', 'Kitchen Set Japandi HPL Woodgrain Natural'),
  ('user_minibar_modern', 'Minibar Modern HPL Solid Hitam'),
  ('user_minibar_modern', 'Meja Bar Modern Kayu Logam Glossy Hitam'),
  ('user_minibar_japandi', 'Minibar Japandi HPL Woodgrain Natural'),
  ('user_ruang_makan_japandi', 'Meja Makan Japandi Kayu Natural'),
  ('user_ruang_makan_modern', 'Meja Makan Modern Kayu Logam Hitam'),
  ('user_mixed_minimalis', 'Bedset Minimalis HPL Marble Abu'),
  ('user_mixed_minimalis', 'Kitchen Set Minimalis HPL Marble Putih');

INSERT INTO product_likes (user_id, product_id)
SELECT u.id, p.id
FROM seed_18a_likes l
JOIN users u ON u.username = l.username
JOIN products p ON p.name = l.product_name
ON CONFLICT (user_id, product_id) DO NOTHING;

INSERT INTO product_wishlists (user_id, product_id)
SELECT u.id, p.id
FROM seed_18a_wishlists w
JOIN users u ON u.username = w.username
JOIN products p ON p.name = w.product_name
ON CONFLICT (user_id, product_id) DO NOTHING;

INSERT INTO interactions (user_id, product_id, interaction_type, weight)
SELECT u.id, p.id, 'whatsapp_inquiry', 2.5
FROM seed_18a_inquiries i
JOIN users u ON u.username = i.username
JOIN products p ON p.name = i.product_name;

COMMIT;
