# Database Guide

## 1. Overview

Folder ini berisi schema dan seed data PostgreSQL untuk aplikasi e-commerce interior dengan sistem rekomendasi hybrid.

## 2. Files

- `schema.sql`: membuat tabel, constraint, index, trigger, dan view
- `seed.sql`: mengisi data awal untuk user, produk, dan interaksi
- `seed_18a_products_interactions.sql`: seed dataset demo final 54 produk, 12 user persona, dan interaksi preferensi aktif
- `migrations/014a_create_user_product_preference_scores.sql`: membuat view skor preferensi implisit untuk User-Based CF
- `migrations/017a_product_taxonomy_material_stock_rules.sql`: menormalisasi taxonomy produk, material, material variant, dan stock rules

## 3. How to Run

Pastikan database PostgreSQL sudah dibuat:

```bash
createdb interior_recommendation_db
```

Jalankan schema:

```bash
psql -d interior_recommendation_db -f backend/database/schema.sql
```

Jalankan seed:

```bash
psql -d interior_recommendation_db -f backend/database/seed.sql
```

Jalankan seed demo Bagian 18A:

```bash
psql -U postgres -d interior_recommendation_db -f backend/database/seed_18a_products_interactions.sql
```

Jika memakai PostgreSQL Windows dengan path instalasi manual:

```bash
"D:\Download D\Program\PostgreSQL\18\bin\psql.exe" -U postgres -d interior_recommendation_db -f backend/database/seed_18a_products_interactions.sql
```

## 4. Main Tables

### users

Menyimpan data user dari Google OAuth.

### products

Menyimpan data produk interior beserta metadata yang digunakan untuk Content-Based Filtering.

### interactions

Menyimpan log interaksi user terhadap produk.

### sessions

Menyimpan session login dari express-session.

## 5. Product Metadata Rules

### Product Category

Category yang didukung:

- Kitchen Set
- Living Set
- Bedset
- Minibar
- Meja
- Kursi
- Lemari
- Nakas
- Meja Rias

### Product Material

Material utama dibatasi menjadi:

- HPL
- Kayu
- Logam
- Kaca
- Linen
- Kayu + Logam
- Logam + Linen
- Kayu + Linen
- HPL + Kaca

Material variant dibatasi menjadi:

- Tidak Ada
- Woodgrain
- Solid
- Marble
- Glossy

### Room Category

Room category dibatasi menjadi:

- Ruang Tamu
- Ruang Makan
- Dapur
- Kamar Tidur
- Mini Bar

### Style Theme

Style theme dibatasi menjadi:

- Modern
- Minimalis
- Japandi

### Stock Rules

Tidak semua produk interior menggunakan stock.

Produk yang menggunakan stock:

- Meja
- Kursi
- Lemari
- Nakas
- Meja Rias

Produk yang tidak menggunakan stock:

- Kitchen Set
- Living Set
- Bedset
- Minibar

Untuk produk non-stock, nilai `stock` disimpan sebagai NULL.

## 6. Recommendation Support

Database menyediakan tiga view penting:

### user_product_preference_scores

Digunakan sebagai sumber utama User-Based Collaborative Filtering. View ini menghitung skor preferensi implisit dari state dan sinyal berikut:

- Like aktif dari `product_likes` = 1.0
- Wishlist aktif dari `product_wishlists` = 1.5
- Pernah tanya admin dari `interactions.interaction_type = 'whatsapp_inquiry'` = 2.5

Rumus:

```text
implicit_score(u, i)
= (1.0 x active_like)
+ (1.5 x active_wishlist)
+ (2.5 x has_whatsapp_inquiry)
```

Nilai maksimal adalah 5.0 dan `normalized_score` dihitung dari `implicit_score / 5.0`.

`page_view`, log historis `like`, dan log historis `favorite` tidak digunakan untuk view ini.

### user_product_ratings

Legacy view untuk menghitung implicit rating historis per user-product pair. View ini tetap dipertahankan untuk endpoint seperti `/interactions/my-ratings`.

### popular_products

Digunakan sebagai fallback cold-start berdasarkan popularitas produk.

## 7. Implicit Rating Rule Legacy

Bobot interaksi:

- `page_view` = 1.0
- `like` = 1.0
- `favorite` = 1.5
- `whatsapp_inquiry` = 1.5

Total implicit rating maksimal 5.0 per user-product pair.

## 8. Run Bagian 14A Migration

Untuk database existing, jalankan:

```bash
psql -U postgres -d interior_recommendation_db -f backend/database/migrations/014a_create_user_product_preference_scores.sql
```

Cek hasil view:

```sql
SELECT
  user_id,
  product_id,
  active_like,
  active_wishlist,
  has_whatsapp_inquiry,
  implicit_score,
  normalized_score
FROM user_product_preference_scores
ORDER BY implicit_score DESC;
```

## 9. Run Bagian 17A Migration

Untuk database existing, jalankan:

```bash
psql -U postgres -d interior_recommendation_db -f backend/database/migrations/017a_product_taxonomy_material_stock_rules.sql
```

Cek hasil taxonomy:

```sql
SELECT
  name,
  category,
  room_category,
  material,
  material_variant,
  style_theme,
  stock
FROM products
ORDER BY category, name;
```

## 10. Run Bagian 18A Demo Seed

Seed 18A membuat dataset demo rekomendasi yang terarah:

- 54 produk aktif.
- 6 produk untuk setiap category final.
- 12 user demo dengan persona preferensi jelas.
- Interaksi aktif pada `product_likes`, `product_wishlists`, dan `interactions.whatsapp_inquiry`.

Seed ini tidak memakai sinyal page view, click, atau view sebagai data preferensi rekomendasi.

Saat dijalankan pada database yang sudah memiliki produk lama, seed 18A menandai produk lama yang tidak masuk daftar 18A sebagai `inactive`. Data lama tidak dihapus, tetapi katalog aktif demo menjadi fokus pada 54 produk final.

Jalankan:

```bash
psql -U postgres -d interior_recommendation_db -f backend/database/seed_18a_products_interactions.sql
```

Validasi distribusi category:

```sql
SELECT category, COUNT(*) AS total
FROM products
WHERE status = 'active'
GROUP BY category
ORDER BY category;
```

Pada database bersih, setiap category seed 18A berjumlah 6 produk.

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

Expected:

```text
0 rows
```

Validasi interaksi user demo:

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
