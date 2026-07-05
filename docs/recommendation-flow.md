# Recommendation Flow

## 1. Overview

Sistem rekomendasi menggunakan pendekatan hybrid yang menggabungkan Content-Based Filtering dan User-Based Collaborative Filtering. Semua algoritma dibuat dari nol di service backend tanpa library AI/ML eksternal.

## 2. Interaction Logging

Interaksi yang dicatat:

- `page_view`
- `like`
- `favorite`
- `whatsapp_inquiry`

Endpoint:

```http
POST /interactions/view
POST /interactions/like
POST /interactions/favorite
POST /interactions/whatsapp
```

Setiap interaksi menyimpan `user_id`, `product_id`, `interaction_type`, `weight`, dan `created_at`.

## 3. Historical Implicit Rating

Bobot interaksi:

- `page_view` = 1.0
- `like` = 1.0
- `favorite` = 1.5
- `whatsapp_inquiry` = 1.5

View `user_product_ratings` menghitung rating:

```sql
LEAST(SUM(weight), 5.0)
```

Batas 5.0 mencegah satu produk mendominasi karena interaksi berulang.

## 3.1 Like and Wishlist State

The system separates historical interaction logs from current UI state.

- `interactions` stores historical positive feedback and profile activity.
- `product_likes` stores active like state.
- `product_wishlists` stores active wishlist state.

When a user likes or adds a product to wishlist, the system records both the active state and a positive interaction log for history.

When a user unlikes or removes a product from wishlist, only the active state changes. The system does not add negative feedback because the recommendation model uses positive implicit feedback.

## 3.2 Implicit Preference Score for User-Based CF

Mulai Bagian 14A, User-Based Collaborative Filtering memakai skor preferensi implisit pengguna dari view `user_product_preference_scores`, bukan akumulasi histori dari `user_product_ratings`.

Skor preferensi implisit diperoleh dari tindakan pengguna terhadap produk, yaitu like, wishlist, dan tanya admin. Skor ini tidak merepresentasikan penilaian kualitas produk setelah digunakan, melainkan tingkat ketertarikan pengguna terhadap produk berdasarkan informasi yang tersedia pada sistem.

Bobot skor:

- Like aktif dari `product_likes` = 1.0
- Wishlist aktif dari `product_wishlists` = 1.5
- Pernah tanya admin dari `interactions.whatsapp_inquiry` = 2.5

Rumus:

```text
implicit_score(u, i)
= (1.0 x active_like)
+ (1.5 x active_wishlist)
+ (2.5 x has_whatsapp_inquiry)
```

Nilai maksimal adalah 5.0.

Page view hanya menunjukkan bahwa user melihat halaman produk, tetapi belum tentu menunjukkan ketertarikan yang kuat. Oleh karena itu, page view tetap dicatat sebagai histori aktivitas, tetapi tidak digunakan sebagai sumber nilai Collaborative Filtering.

Like dan wishlist dihitung berdasarkan state aktif, bukan histori klik. Jika user melakukan unlike atau unwishlist, skor dari sinyal tersebut tidak lagi digunakan oleh CF. Tanya admin dihitung sebagai binary signal, sehingga beberapa kali klik WhatsApp pada produk yang sama tetap bernilai 1 sinyal.

## 4. Content-Based Filtering

Metadata produk yang digunakan:

- `category`
- `material`
- `material_variant`
- `style_theme`
- `dominant_color`
- `room_category`

Tahapan:

1. Metadata produk digabung menjadi metadata soup.
2. Teks dinormalisasi.
3. Teks dipecah menjadi token.
4. Term Frequency dihitung per produk.
5. Inverse Document Frequency dihitung dari semua produk aktif.
6. TF-IDF vector dibentuk untuk tiap produk.
7. Cosine Similarity menghitung kemiripan kandidat terhadap produk basis user.
8. Produk yang pernah diinteraksi user dikeluarkan dari kandidat.
9. Produk dengan similarity tertinggi dikembalikan.

Rumus TF:

```text
TF(term) = jumlah kemunculan term / total token dokumen
```

Rumus IDF:

```text
IDF(term) = log((N + 1) / (DF(term) + 1)) + 1
```

Rumus TF-IDF:

```text
TF-IDF(term) = TF(term) x IDF(term)
```

Rumus Cosine Similarity:

```text
cosine_similarity(A, B) = dot(A, B) / (||A|| x ||B||)
```

Endpoint:

```http
GET /recommendations/content-based
```

## 4.1 Controlled Metadata for Content-Based Filtering

Sistem menggunakan metadata terkontrol untuk meningkatkan konsistensi Content-Based Filtering.

Metadata yang digunakan:

- `category`
- `material`
- `material_variant`
- `style_theme`
- `dominant_color`
- `room_category`

Category, material, material_variant, style_theme, dan room_category dibatasi dengan pilihan tetap agar token metadata lebih konsisten dan tidak dipengaruhi typo input admin.

## 4.2 Product Metadata for CBF

Content-Based Filtering menggunakan metadata produk berikut:

- category
- material
- material_variant
- style_theme
- dominant_color
- room_category

Harga tidak digunakan dalam CBF karena sistem fokus pada kemiripan item, bukan transaksi atau kemampuan beli pengguna. Stock dan interaksi user juga tidak masuk metadata soup CBF.

## 5. User-Based Collaborative Filtering

Sumber data User-Based CF adalah skor preferensi implisit dari view `user_product_preference_scores`.

Tahapan:

1. Ambil semua skor preferensi user-product.
2. Bentuk product vocabulary sebagai urutan dimensi vector.
3. Bentuk user-product matrix.
4. Ubah setiap user menjadi user vector.
5. Hitung Cosine Similarity antara active user dan user lain.
6. Ambil user yang paling mirip.
7. Kumpulkan produk yang disukai user mirip.
8. Hilangkan produk yang sudah memiliki preference score pada active user.
9. Hitung candidate score.
10. Urutkan produk berdasarkan skor.

Rumus candidate score:

```text
score(product) = Sum(similarity x implicit_score) / Sum(similarity)
```

Skor prediksi CF dinormalisasi ke rentang 0-1 dengan membagi skor terhadap nilai maksimum 5.0. Nilai CF yang sudah dinormalisasi digunakan dalam Hybrid Recommendation.

Endpoint:

```http
GET /recommendations/user-based
```

## 6. Hybrid Recommendation

Hybrid menggabungkan skor CBF dan CF berdasarkan `product_id`.

Jika produk hanya muncul dari salah satu algoritma, skor algoritma lain dianggap 0.

Formula:

```text
Final Score = (0.7 x CBF Score) + (0.3 x CF Score)
```

Bobot:

- Content-Based Filtering = 70%
- User-Based Collaborative Filtering = 30%

Endpoint:

```http
GET /recommendations/hybrid
GET /recommendations/personal
```

`/recommendations/personal` memakai hasil hybrid sebagai rekomendasi utama untuk homepage user login.

## 7. Cold-Start Strategy

Cold-start dipakai ketika user belum login atau data personal belum cukup.

Sumber fallback:

1. View `popular_products`.
2. Produk aktif random jika belum ada data popularitas.

Endpoint:

```http
GET /recommendations/cold-start
```

## 8. Room-Based Complementary Recommendation

Room-Based Complementary Recommendation digunakan untuk menampilkan produk pelengkap berdasarkan konteks ruangan.

Berbeda dengan Content-Based Filtering yang mencari kemiripan antarproduk, pendekatan ini mencari produk yang dapat melengkapi tampilan ruangan.

Rumus:

```text
Complementary Score
= (0.45 x room_match)
+ (0.35 x complementary_category_match)
+ (0.15 x style_match)
+ (0.05 x color_match)
```

Harga tidak digunakan dalam perhitungan karena sistem fokus pada kelengkapan item dalam ruangan.

Endpoint:

```http
GET /recommendations/room-complementary/:productId
```

## 9. Inspirasi Produk Lainnya

Section "Inspirasi Produk Lainnya" pada halaman detail produk menggunakan kombinasi rekomendasi dari Content-Based Filtering dan Hybrid Recommendation.

Komposisi utama:

- 3 produk dari Content-Based Filtering
- 2 produk dari Hybrid Recommendation

Jika hasil kurang, sistem dapat menggunakan fallback/cold-start agar tampilan tetap terisi.

Pada tampilan user, istilah teknis seperti CBF, Hybrid, TF-IDF, cosine similarity, dan score tidak ditampilkan.

## 10. Frontend Display

Mapping frontend:

- `index.html`: memakai `/recommendations/personal` jika login, atau `/recommendations/cold-start` jika belum login.
- `recommendations.html`: menampilkan `/recommendations/user-based`, `/recommendations/content-based`, dan `/recommendations/hybrid` dalam satu halaman.
- `product-detail.html`: menampilkan produk pelengkap ruangan dari `/recommendations/room-complementary/:productId` dan section "Inspirasi Produk Lainnya" dari gabungan content-based, hybrid, serta cold-start fallback.
- `profile.html`: menampilkan `/interactions/my-summary`, `/interactions/my-history`, dan `/interactions/my-ratings`.

## 11. Unit Testing

Backend menggunakan Jest untuk unit testing logic rekomendasi.

Test utama mencakup:

- Perhitungan implicit preference score
- Pembentukan user-product matrix
- Product vocabulary
- User vector
- Cosine similarity
- Similar user ranking
- Candidate product selection
- Candidate score
- Normalisasi CF score
- Hybrid score

Menjalankan test:

```bash
cd backend
npm test
```

Menjalankan test coverage:

```bash
cd backend
npm run test:coverage
```

## 12. Demo Dataset

Dataset demo dibuat secara terarah berdasarkan persona user. Setiap user memiliki pola interaksi yang konsisten, misalnya user dengan preferensi Kamar Tidur Japandi, Mini Bar Modern, atau Ruang Makan Japandi.

Data ini digunakan agar User-Based Collaborative Filtering dan Hybrid Recommendation dapat menghasilkan rekomendasi yang logis selama pengujian sistem.

Seed demo berada di:

```text
backend/database/seed_18a_products_interactions.sql
```

Sinyal preferensi demo hanya memakai:

- `product_likes`
- `product_wishlists`
- `interactions.whatsapp_inquiry`

Page view, click, dan view tidak dipakai sebagai sinyal dataset rekomendasi demo.
