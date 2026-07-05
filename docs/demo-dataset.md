# Demo Dataset

## Tujuan

Dataset demo 18A dibuat untuk mendukung pengujian Content-Based Filtering, User-Based Collaborative Filtering, Hybrid Recommendation, For You, Inspirasi Produk Lainnya, dan rekomendasi pelengkap ruangan.

Data tidak dibuat random. Produk dan interaksi disusun berdasarkan persona user agar pola rekomendasi dapat dijelaskan saat demo.

Saat seed dijalankan pada database yang masih memiliki produk lama, produk lama yang tidak masuk daftar 18A ditandai `inactive`. Tujuannya agar katalog aktif demo fokus pada 54 produk final dan hasil rekomendasi tidak tercampur data lama.

## Produk

Total produk seed 18A:

```text
54 produk
```

Distribusi category:

| Category | Total |
| --- | ---: |
| Kitchen Set | 6 |
| Living Set | 6 |
| Bedset | 6 |
| Minibar | 6 |
| Meja | 6 |
| Kursi | 6 |
| Lemari | 6 |
| Nakas | 6 |
| Meja Rias | 6 |

Distribusi room_category:

| Room Category | Total |
| --- | ---: |
| Dapur | 8 |
| Ruang Tamu | 11 |
| Kamar Tidur | 22 |
| Mini Bar | 9 |
| Ruang Makan | 4 |

## Metadata

Material utama yang dipakai:

- HPL
- Kayu
- Logam
- Kaca
- Linen
- Kayu + Logam
- Logam + Linen
- Kayu + Linen
- HPL + Kaca

Material variant yang dipakai:

- Tidak Ada
- Woodgrain
- Solid
- Marble
- Glossy

Style theme yang dipakai:

- Modern
- Minimalis
- Japandi

Harga tetap disimpan sebagai data produk, tetapi tidak digunakan sebagai metadata rekomendasi.

## Stock Rules

Category yang memakai stock:

- Meja
- Kursi
- Lemari
- Nakas
- Meja Rias

Category yang tidak memakai stock dan menyimpan `stock = NULL`:

- Kitchen Set
- Living Set
- Bedset
- Minibar

## User Persona

Seed 18A menambahkan 12 user demo local dengan password demo yang sama:

```text
user12345
```

| Username | Persona |
| --- | --- |
| user_japandi_kamar | Kamar Tidur Japandi, Beige, Woodgrain |
| user_modern_kamar | Kamar Tidur Modern, Putih/Hitam, Solid/Glossy |
| user_minimalis_kamar | Kamar Tidur Minimalis, Marble, Abu-abu |
| user_ruang_tamu_japandi | Ruang Tamu Japandi, Natural, Kayu Linen |
| user_ruang_tamu_modern | Ruang Tamu Modern, Hitam/Abu, Glossy |
| user_dapur_modern | Dapur Modern, Putih, HPL Solid |
| user_dapur_japandi | Dapur Japandi, Woodgrain, Natural |
| user_minibar_modern | Mini Bar Modern, Hitam, Logam/Glossy |
| user_minibar_japandi | Mini Bar Japandi, Natural, Woodgrain |
| user_ruang_makan_japandi | Ruang Makan Japandi, Kayu, Beige/Natural |
| user_ruang_makan_modern | Ruang Makan Modern, Hitam, Kayu Logam |
| user_mixed_minimalis | Minimalis lintas ruangan, Putih/Abu, Marble/Solid |

## Pola Interaksi

Interaksi demo memakai sinyal preferensi aktif:

- Like aktif di `product_likes` = 1.0
- Wishlist aktif di `product_wishlists` = 1.5
- Tanya admin di `interactions.whatsapp_inquiry` = 2.5 pada view preferensi

Total sinyal:

| Sinyal | Total |
| --- | ---: |
| product_likes | 69 |
| product_wishlists | 35 |
| whatsapp_inquiry | 17 |

User tidak diberi pola acak. Setiap user memiliki minat yang konsisten, lalu diberi overlap dengan user lain agar Collaborative Filtering dapat menemukan kemiripan.

Contoh overlap:

- User kamar Japandi beririsan dengan user ruang tamu Japandi dan user ruang makan Japandi pada material natural, beige, dan style Japandi.
- User modern beririsan lintas kamar, ruang tamu, dapur, mini bar, dan ruang makan pada warna hitam/putih serta material solid/glossy.
- User minimalis memiliki pola lintas ruangan agar Hybrid Recommendation punya kandidat dari CBF dan CF.

## Contoh Alur Rekomendasi

Bedset Japandi HPL Woodgrain Beige:

- Room-Based Complementary dapat mengarah ke Lemari, Nakas, dan Meja Rias kamar tidur.
- CBF cenderung dekat dengan produk Japandi kamar tidur dengan HPL Woodgrain, Beige, atau Natural.
- CF dapat memakai overlap user Japandi kamar dengan user Japandi lain.

Minibar Modern HPL Solid Hitam:

- Room-Based Complementary dapat mengarah ke Kursi Mini Bar Modern Logam Linen Hitam dan Meja Bar Modern Kayu Logam Glossy Hitam.
- Kursi makan modern tidak masuk sebagai pelengkap minibar karena room_category berbeda.
- CF/Hybrid dapat memakai pola user_minibar_modern dan user_ruang_makan_modern yang sama-sama menyukai hitam, modern, dan kayu/logam.

## Query Validasi

Distribusi category seed 18A:

```sql
WITH seed_names(name) AS (
  VALUES
    ('Kitchen Set Modern HPL Solid Putih'),
    ('Kitchen Set Japandi HPL Woodgrain Beige'),
    ('Kitchen Set Minimalis HPL Marble Putih'),
    ('Kitchen Set Modern HPL Kaca Glossy Hitam'),
    ('Kitchen Set Japandi HPL Woodgrain Natural'),
    ('Kitchen Set Minimalis HPL Solid Abu'),
    ('Living Set Japandi Linen Beige'),
    ('Living Set Modern Kayu Linen Abu'),
    ('Living Set Minimalis HPL Solid Putih'),
    ('Living Set Modern Logam Linen Hitam'),
    ('Living Set Japandi Kayu Linen Natural'),
    ('Living Set Minimalis HPL Kaca Glossy Coklat'),
    ('Bedset Japandi HPL Woodgrain Beige'),
    ('Bedset Modern HPL Solid Putih'),
    ('Bedset Minimalis HPL Marble Abu'),
    ('Bedset Japandi Kayu Linen Natural'),
    ('Bedset Modern HPL Kaca Glossy Hitam'),
    ('Bedset Minimalis Kayu Beige'),
    ('Minibar Modern HPL Solid Hitam'),
    ('Minibar Japandi HPL Woodgrain Natural'),
    ('Minibar Minimalis HPL Marble Putih'),
    ('Minibar Modern HPL Kaca Glossy Abu'),
    ('Minibar Japandi Kayu Logam Coklat'),
    ('Minibar Minimalis Kaca Glossy Hitam'),
    ('Meja Makan Japandi Kayu Natural'),
    ('Meja Makan Modern Kayu Logam Hitam'),
    ('Meja Tamu Minimalis HPL Marble Putih'),
    ('Meja Tamu Japandi Kayu Beige'),
    ('Meja Dapur Modern HPL Solid Putih'),
    ('Meja Bar Modern Kayu Logam Glossy Hitam'),
    ('Kursi Makan Japandi Kayu Linen Beige'),
    ('Kursi Makan Modern Logam Linen Hitam'),
    ('Kursi Mini Bar Modern Logam Linen Hitam'),
    ('Kursi Mini Bar Japandi Kayu Linen Natural'),
    ('Kursi Santai Ruang Tamu Minimalis Abu'),
    ('Kursi Dapur Minimalis Kayu Linen Putih'),
    ('Lemari Pakaian Japandi HPL Woodgrain Beige'),
    ('Lemari Pakaian Modern HPL Solid Putih'),
    ('Lemari Pakaian Minimalis HPL Marble Abu'),
    ('Lemari Display Ruang Tamu HPL Kaca Glossy Hitam'),
    ('Lemari TV Minimalis HPL Solid Putih'),
    ('Lemari Pakaian Japandi Kayu Natural'),
    ('Nakas Japandi HPL Woodgrain Beige'),
    ('Nakas Modern HPL Solid Putih'),
    ('Nakas Minimalis HPL Marble Abu'),
    ('Nakas Japandi Kayu Natural'),
    ('Nakas Modern HPL Kaca Glossy Hitam'),
    ('Nakas Minimalis HPL Solid Coklat'),
    ('Meja Rias Japandi HPL Woodgrain Beige'),
    ('Meja Rias Modern HPL Solid Putih'),
    ('Meja Rias Minimalis HPL Marble Abu'),
    ('Meja Rias Modern HPL Kaca Glossy Hitam'),
    ('Meja Rias Japandi Kayu Natural'),
    ('Meja Rias Minimalis HPL Solid Coklat')
)
SELECT p.category, COUNT(*) AS total
FROM products p
JOIN seed_names s ON s.name = p.name
WHERE p.status = 'active'
GROUP BY p.category
ORDER BY p.category;
```

Validasi stock:

```sql
SELECT category, COUNT(*) AS invalid_stock
FROM products
WHERE
  (
    category IN ('Kitchen Set', 'Living Set', 'Bedset', 'Minibar')
    AND stock IS NOT NULL
  )
  OR
  (
    category IN ('Meja', 'Kursi', 'Lemari', 'Nakas', 'Meja Rias')
    AND (stock IS NULL OR stock < 0)
  )
GROUP BY category;
```

Validasi interaksi:

```sql
SELECT u.username, COUNT(*) AS total_likes
FROM product_likes pl
JOIN users u ON u.id = pl.user_id
WHERE u.username LIKE 'user\_%' ESCAPE '\'
GROUP BY u.username
ORDER BY u.username;

SELECT u.username, COUNT(*) AS total_wishlists
FROM product_wishlists pw
JOIN users u ON u.id = pw.user_id
WHERE u.username LIKE 'user\_%' ESCAPE '\'
GROUP BY u.username
ORDER BY u.username;

SELECT u.username, COUNT(*) AS total_inquiries
FROM interactions i
JOIN users u ON u.id = i.user_id
WHERE u.username LIKE 'user\_%' ESCAPE '\'
  AND i.interaction_type = 'whatsapp_inquiry'
GROUP BY u.username
ORDER BY u.username;
```
