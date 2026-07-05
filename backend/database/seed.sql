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
  ('google-admin-001', NULL, 'google-admin@example.com', 'Admin Interior Google', NULL, NULL, 'google', 'admin'),
  ('google-user-001', NULL, 'user1@example.com', 'User Satu', NULL, NULL, 'google', 'user'),
  ('google-user-002', NULL, 'user2@example.com', 'User Dua', NULL, NULL, 'google', 'user'),
  ('google-user-003', NULL, 'user3@example.com', 'User Tiga', NULL, NULL, 'google', 'user'),
  (NULL, 'admin', 'admin@example.com', 'Admin Demo', NULL, '$2b$10$/luF04I3TgZ9zJEth49R3.X.sGH1J4GBtlO1ReZaeCwq7d5FzrjrK', 'local', 'admin'),
  (NULL, 'userdemo', 'userdemo@example.com', 'User Demo', NULL, '$2b$10$10fzaOutd7on/QcAqXDLDuu6ysRW4X9eppEEOQlAOFD/fCkwzft/i', 'local', 'user');

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
VALUES
  ('Kitchen Set Modern Putih', 'https://placehold.co/600x400?text=Kitchen+Set+Modern+Putih', 'Kitchen Set', 'HPL', 'Solid', 'Modern', 'Putih', 'Dapur', 'Kitchen set putih dengan finishing HPL solid yang mudah dibersihkan untuk dapur modern.', 11800000, NULL, 'active'),
  ('Kitchen Set Minimalis Oak', 'https://placehold.co/600x400?text=Kitchen+Set+Minimalis+Oak', 'Kitchen Set', 'HPL', 'Woodgrain', 'Minimalis', 'Natural Oak', 'Dapur', 'Kitchen set HPL woodgrain oak dengan penyimpanan modular untuk dapur minimalis.', 12500000, NULL, 'active'),
  ('Kitchen Set Japandi Walnut', 'https://placehold.co/600x400?text=Kitchen+Set+Japandi+Walnut', 'Kitchen Set', 'HPL', 'Woodgrain', 'Japandi', 'Cokelat Tua', 'Dapur', 'Kitchen set walnut dengan garis bersih dan nuansa Japandi.', 14500000, NULL, 'active'),
  ('Kitchen Set Modern Hitam Matte', 'https://placehold.co/600x400?text=Kitchen+Set+Modern+Hitam', 'Kitchen Set', 'HPL', 'Solid', 'Modern', 'Hitam Matte', 'Dapur', 'Kitchen set hitam matte dengan kabinet tinggi untuk dapur modern.', 15200000, NULL, 'active'),

  ('Sofa Modern Abu Modular', 'https://placehold.co/600x400?text=Sofa+Modern+Abu+Modular', 'Living Set', 'Linen', 'Tidak Ada', 'Modern', 'Abu-abu', 'Ruang Tamu', 'Living set modular linen abu-abu untuk ruang tamu keluarga.', 9800000, NULL, 'active'),
  ('Rak TV Minimalis Walnut', 'https://placehold.co/600x400?text=Rak+TV+Minimalis+Walnut', 'Living Set', 'Kayu', 'Woodgrain', 'Minimalis', 'Cokelat Tua', 'Ruang Tamu', 'Living set dengan rak TV rendah finishing walnut dan penyimpanan tertutup.', 4200000, NULL, 'active'),
  ('Coffee Table Japandi Natural', 'https://placehold.co/600x400?text=Coffee+Table+Japandi+Natural', 'Living Set', 'Kayu + Linen', 'Tidak Ada', 'Japandi', 'Natural Oak', 'Ruang Tamu', 'Living set natural dengan coffee table dan aksen linen untuk ruang tamu Japandi.', 3600000, NULL, 'active'),
  ('Armchair Lounge Modern Hitam', 'https://placehold.co/600x400?text=Armchair+Lounge+Modern+Hitam', 'Living Set', 'Logam + Linen', 'Tidak Ada', 'Modern', 'Hitam', 'Ruang Tamu', 'Living set armchair lounge hitam dengan kaki logam untuk ruang tamu modern.', 4500000, NULL, 'active'),

  ('Tempat Tidur Minimalis Putih', 'https://placehold.co/600x400?text=Tempat+Tidur+Minimalis+Putih', 'Bedset', 'HPL', 'Solid', 'Minimalis', 'Putih', 'Kamar Tidur', 'Bedset minimalis dengan panel HPL putih dan laci penyimpanan.', 5900000, NULL, 'active'),
  ('Tempat Tidur Japandi Pine', 'https://placehold.co/600x400?text=Tempat+Tidur+Japandi+Pine', 'Bedset', 'Kayu', 'Woodgrain', 'Japandi', 'Cokelat Muda', 'Kamar Tidur', 'Bedset kayu pine dengan bentuk rendah dan aksen Japandi.', 6500000, NULL, 'active'),
  ('Headboard Minimalis Beige', 'https://placehold.co/600x400?text=Headboard+Minimalis+Beige', 'Bedset', 'Linen', 'Tidak Ada', 'Minimalis', 'Beige', 'Kamar Tidur', 'Bedset headboard linen beige untuk kamar tidur minimalis yang hangat.', 2800000, NULL, 'active'),
  ('Bedset Modern Abu Storage', 'https://placehold.co/600x400?text=Bedset+Modern+Abu+Storage', 'Bedset', 'HPL', 'Solid', 'Modern', 'Abu-abu', 'Kamar Tidur', 'Bedset modern abu dengan storage bawah dan finishing HPL solid.', 7200000, NULL, 'active'),

  ('Mini Bar Kayu Oak Compact', 'https://placehold.co/600x400?text=Mini+Bar+Kayu+Oak+Compact', 'Minibar', 'Kayu', 'Woodgrain', 'Minimalis', 'Natural Oak', 'Mini Bar', 'Minibar compact berbahan kayu oak untuk area bar kecil.', 7200000, NULL, 'active'),
  ('Mini Bar Japandi Natural', 'https://placehold.co/600x400?text=Mini+Bar+Japandi+Natural', 'Minibar', 'Kayu', 'Woodgrain', 'Japandi', 'Beige', 'Mini Bar', 'Minibar natural dengan aksen kayu untuk suasana Japandi.', 8100000, NULL, 'active'),
  ('Mini Bar Modern Putih Marble', 'https://placehold.co/600x400?text=Mini+Bar+Modern+Putih+Marble', 'Minibar', 'HPL', 'Marble', 'Modern', 'Putih', 'Mini Bar', 'Minibar modern dengan top table motif marble putih.', 8900000, NULL, 'active'),
  ('Mini Bar Minimalis Hitam', 'https://placehold.co/600x400?text=Mini+Bar+Minimalis+Hitam', 'Minibar', 'HPL', 'Solid', 'Minimalis', 'Hitam', 'Mini Bar', 'Minibar hitam minimalis dengan kabinet bawah tertutup.', 7600000, NULL, 'active'),

  ('Meja Makan Marmer Putih', 'https://placehold.co/600x400?text=Meja+Makan+Marmer+Putih', 'Meja', 'HPL', 'Marble', 'Modern', 'Putih', 'Ruang Makan', 'Meja makan HPL marble putih dengan kaki logam untuk interior modern.', 10500000, 5, 'active'),
  ('Meja Kerja Minimalis Oak', 'https://placehold.co/600x400?text=Meja+Kerja+Minimalis+Oak', 'Meja', 'Kayu', 'Woodgrain', 'Minimalis', 'Natural Oak', 'Ruang Tamu', 'Meja kerja kayu oak dengan bentuk ringkas dan penyimpanan sederhana.', 3200000, 15, 'active'),
  ('Meja Konsol Modern Kaca', 'https://placehold.co/600x400?text=Meja+Konsol+Modern+Kaca', 'Meja', 'Kaca', 'Glossy', 'Modern', 'Transparan', 'Ruang Tamu', 'Meja konsol kaca glossy dengan rangka logam untuk dekorasi ruang tamu.', 3900000, 9, 'active'),
  ('Meja Kopi Japandi Hitam', 'https://placehold.co/600x400?text=Meja+Kopi+Japandi+Hitam', 'Meja', 'Kayu + Logam', 'Woodgrain', 'Japandi', 'Hitam', 'Ruang Tamu', 'Meja kopi hitam dengan top kayu untuk ruang tamu Japandi.', 2500000, 14, 'active'),

  ('Kursi Makan Japandi Linen', 'https://placehold.co/600x400?text=Kursi+Makan+Japandi+Linen', 'Kursi', 'Kayu + Linen', 'Tidak Ada', 'Japandi', 'Beige', 'Ruang Makan', 'Kursi makan bergaya Japandi dengan dudukan linen dan rangka kayu.', 1250000, 20, 'active'),
  ('Kursi Kerja Modern Abu', 'https://placehold.co/600x400?text=Kursi+Kerja+Modern+Abu', 'Kursi', 'Logam + Linen', 'Tidak Ada', 'Modern', 'Abu-abu', 'Ruang Tamu', 'Kursi kerja modern dengan sandaran ergonomis dan kaki logam.', 1850000, 12, 'active'),
  ('Kursi Bar Minimalis Hitam', 'https://placehold.co/600x400?text=Kursi+Bar+Minimalis+Hitam', 'Kursi', 'Logam + Linen', 'Tidak Ada', 'Minimalis', 'Hitam', 'Mini Bar', 'Kursi bar minimalis dengan dudukan hitam dan rangka logam ramping.', 1450000, 16, 'active'),
  ('Kursi Santai Japandi Rotan', 'https://placehold.co/600x400?text=Kursi+Santai+Japandi+Rotan', 'Kursi', 'Kayu + Linen', 'Tidak Ada', 'Japandi', 'Natural', 'Ruang Tamu', 'Kursi santai natural untuk sudut ruang tamu bergaya Japandi.', 2350000, 10, 'active'),

  ('Lemari Pakaian Japandi Oak', 'https://placehold.co/600x400?text=Lemari+Pakaian+Japandi+Oak', 'Lemari', 'Kayu', 'Woodgrain', 'Japandi', 'Natural Oak', 'Kamar Tidur', 'Lemari pakaian kayu oak dengan desain Japandi yang ringan.', 7800000, 8, 'active'),
  ('Lemari Sliding Minimalis Putih', 'https://placehold.co/600x400?text=Lemari+Sliding+Minimalis+Putih', 'Lemari', 'HPL', 'Solid', 'Minimalis', 'Putih', 'Kamar Tidur', 'Lemari sliding putih dengan penyimpanan besar untuk kamar modern.', 8400000, 7, 'active'),
  ('Lemari Display Modern Kaca', 'https://placehold.co/600x400?text=Lemari+Display+Modern+Kaca', 'Lemari', 'HPL + Kaca', 'Glossy', 'Modern', 'Hitam', 'Ruang Tamu', 'Lemari display kaca hitam untuk koleksi dekorasi ruang tamu.', 6200000, 6, 'active'),
  ('Lemari Dapur Modern Walnut', 'https://placehold.co/600x400?text=Lemari+Dapur+Modern+Walnut', 'Lemari', 'Kayu', 'Woodgrain', 'Modern', 'Cokelat Tua', 'Dapur', 'Lemari dapur modular walnut untuk penyimpanan perlengkapan dapur.', 9100000, 5, 'active'),

  ('Nakas Modern Abu', 'https://placehold.co/600x400?text=Nakas+Modern+Abu', 'Nakas', 'HPL', 'Solid', 'Modern', 'Abu-abu', 'Kamar Tidur', 'Nakas modern dengan laci tertutup untuk penyimpanan sisi tempat tidur.', 1850000, 11, 'active'),
  ('Nakas HPL Woodgrain', 'https://placehold.co/600x400?text=Nakas+HPL+Woodgrain', 'Nakas', 'HPL', 'Woodgrain', 'Japandi', 'Beige', 'Kamar Tidur', 'Nakas minimalis dengan finishing HPL woodgrain.', 1250000, 12, 'active'),
  ('Nakas Marble Putih', 'https://placehold.co/600x400?text=Nakas+Marble+Putih', 'Nakas', 'HPL', 'Marble', 'Modern', 'Putih', 'Kamar Tidur', 'Nakas putih dengan motif marble untuk kamar tidur modern.', 1450000, 9, 'active'),
  ('Nakas Japandi Kayu', 'https://placehold.co/600x400?text=Nakas+Japandi+Kayu', 'Nakas', 'Kayu', 'Woodgrain', 'Japandi', 'Natural Oak', 'Kamar Tidur', 'Nakas kayu natural untuk kamar tidur Japandi.', 1650000, 10, 'active'),

  ('Meja Rias Glossy Modern', 'https://placehold.co/600x400?text=Meja+Rias+Glossy+Modern', 'Meja Rias', 'HPL', 'Glossy', 'Modern', 'Putih', 'Kamar Tidur', 'Meja rias modern dengan finishing glossy dan cermin besar.', 3850000, 6, 'active'),
  ('Meja Rias Japandi Woodgrain', 'https://placehold.co/600x400?text=Meja+Rias+Japandi+Woodgrain', 'Meja Rias', 'HPL', 'Woodgrain', 'Japandi', 'Beige', 'Kamar Tidur', 'Meja rias Japandi dengan motif woodgrain dan drawer compact.', 3600000, 7, 'active'),
  ('Meja Rias Minimalis Solid', 'https://placehold.co/600x400?text=Meja+Rias+Minimalis+Solid', 'Meja Rias', 'HPL', 'Solid', 'Minimalis', 'Putih', 'Kamar Tidur', 'Meja rias minimalis solid untuk kamar tidur kecil.', 3300000, 8, 'active'),
  ('Meja Rias Kaca Modern', 'https://placehold.co/600x400?text=Meja+Rias+Kaca+Modern', 'Meja Rias', 'HPL + Kaca', 'Glossy', 'Modern', 'Hitam', 'Kamar Tidur', 'Meja rias modern dengan panel kaca glossy dan rak samping.', 4100000, 5, 'active');

INSERT INTO interactions (user_id, product_id, interaction_type, weight)
SELECT
  u.id,
  p.id,
  v.interaction_type,
  v.weight
FROM (
  VALUES
    ('user1@example.com', 'Kitchen Set Modern Putih', 'page_view', 1.0),
    ('user1@example.com', 'Kitchen Set Modern Putih', 'like', 1.0),
    ('user1@example.com', 'Kitchen Set Modern Putih', 'favorite', 1.5),
    ('user1@example.com', 'Kitchen Set Modern Putih', 'whatsapp_inquiry', 1.5),
    ('user1@example.com', 'Kitchen Set Minimalis Oak', 'page_view', 1.0),
    ('user1@example.com', 'Kitchen Set Minimalis Oak', 'like', 1.0),
    ('user1@example.com', 'Kitchen Set Japandi Walnut', 'page_view', 1.0),
    ('user1@example.com', 'Kitchen Set Japandi Walnut', 'favorite', 1.5),
    ('user1@example.com', 'Mini Bar Kayu Oak Compact', 'page_view', 1.0),
    ('user1@example.com', 'Mini Bar Kayu Oak Compact', 'like', 1.0),
    ('user1@example.com', 'Mini Bar Japandi Natural', 'page_view', 1.0),
    ('user1@example.com', 'Mini Bar Japandi Natural', 'favorite', 1.5),
    ('user1@example.com', 'Meja Kerja Minimalis Oak', 'page_view', 1.0),
    ('user1@example.com', 'Meja Kerja Minimalis Oak', 'like', 1.0),
    ('user1@example.com', 'Kursi Makan Japandi Linen', 'page_view', 1.0),
    ('user1@example.com', 'Kursi Makan Japandi Linen', 'favorite', 1.5),
    ('user1@example.com', 'Rak TV Minimalis Walnut', 'page_view', 1.0),
    ('user1@example.com', 'Coffee Table Japandi Natural', 'page_view', 1.0),
    ('user1@example.com', 'Lemari Dapur Modern Walnut', 'page_view', 1.0),
    ('user1@example.com', 'Lemari Dapur Modern Walnut', 'like', 1.0),

    ('user2@example.com', 'Tempat Tidur Japandi Pine', 'page_view', 1.0),
    ('user2@example.com', 'Tempat Tidur Japandi Pine', 'like', 1.0),
    ('user2@example.com', 'Tempat Tidur Japandi Pine', 'favorite', 1.5),
    ('user2@example.com', 'Tempat Tidur Minimalis Putih', 'page_view', 1.0),
    ('user2@example.com', 'Tempat Tidur Minimalis Putih', 'favorite', 1.5),
    ('user2@example.com', 'Headboard Minimalis Beige', 'page_view', 1.0),
    ('user2@example.com', 'Nakas Modern Abu', 'page_view', 1.0),
    ('user2@example.com', 'Lemari Pakaian Japandi Oak', 'page_view', 1.0),
    ('user2@example.com', 'Lemari Pakaian Japandi Oak', 'like', 1.0),
    ('user2@example.com', 'Lemari Pakaian Japandi Oak', 'favorite', 1.5),
    ('user2@example.com', 'Lemari Pakaian Japandi Oak', 'whatsapp_inquiry', 1.5),
    ('user2@example.com', 'Lemari Sliding Minimalis Putih', 'page_view', 1.0),
    ('user2@example.com', 'Lemari Sliding Minimalis Putih', 'like', 1.0),
    ('user2@example.com', 'Kursi Santai Japandi Rotan', 'page_view', 1.0),
    ('user2@example.com', 'Kursi Santai Japandi Rotan', 'favorite', 1.5),
    ('user2@example.com', 'Mini Bar Japandi Natural', 'page_view', 1.0),
    ('user2@example.com', 'Kitchen Set Japandi Walnut', 'page_view', 1.0),

    ('user3@example.com', 'Sofa Modern Abu Modular', 'page_view', 1.0),
    ('user3@example.com', 'Sofa Modern Abu Modular', 'like', 1.0),
    ('user3@example.com', 'Armchair Lounge Modern Hitam', 'page_view', 1.0),
    ('user3@example.com', 'Coffee Table Japandi Natural', 'page_view', 1.0),
    ('user3@example.com', 'Coffee Table Japandi Natural', 'like', 1.0),
    ('user3@example.com', 'Coffee Table Japandi Natural', 'favorite', 1.5),
    ('user3@example.com', 'Meja Makan Marmer Putih', 'page_view', 1.0),
    ('user3@example.com', 'Meja Makan Marmer Putih', 'like', 1.0),
    ('user3@example.com', 'Meja Makan Marmer Putih', 'favorite', 1.5),
    ('user3@example.com', 'Meja Konsol Modern Kaca', 'page_view', 1.0),
    ('user3@example.com', 'Meja Konsol Modern Kaca', 'like', 1.0),
    ('user3@example.com', 'Kursi Kerja Modern Abu', 'page_view', 1.0),
    ('user3@example.com', 'Kursi Kerja Modern Abu', 'like', 1.0),
    ('user3@example.com', 'Kursi Bar Minimalis Hitam', 'page_view', 1.0),
    ('user3@example.com', 'Kursi Bar Minimalis Hitam', 'whatsapp_inquiry', 1.5),
    ('user3@example.com', 'Lemari Display Modern Kaca', 'page_view', 1.0),
    ('user3@example.com', 'Lemari Display Modern Kaca', 'like', 1.0),
    ('user3@example.com', 'Mini Bar Modern Putih Marble', 'page_view', 1.0),
    ('user3@example.com', 'Meja Kopi Japandi Hitam', 'page_view', 1.0),
    ('user3@example.com', 'Meja Kopi Japandi Hitam', 'like', 1.0)
) AS v(email, product_name, interaction_type, weight)
JOIN users u ON u.email = v.email
JOIN products p ON p.name = v.product_name;
