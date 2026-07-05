# Backend Guide

## 1. Overview

Backend menggunakan Node.js, Express.js, PostgreSQL, Passport.js, Google OAuth 2.0, local auth, bcryptjs, dan session berbasis PostgreSQL. Backend menyediakan authentication, role management, produk publik, CRUD produk admin, interaction logging, skor preferensi implisit, Content-Based Filtering, User-Based Collaborative Filtering, dan Hybrid Recommendation.

## 2. Install Dependency

```bash
cd backend
npm install
```

## 3. Environment

Buat `.env` dari `.env.example`.

```bash
copy .env.example .env
```

Nilai database lokal:

```env
DATABASE_URL=postgresql://postgres:admin00700@localhost:5432/interior_recommendation_db
PORT=5000
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=change_this_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
WHATSAPP_ADMIN_NUMBER=
```

## 4. Database

```bash
psql -U postgres -d interior_recommendation_db -f database/schema.sql
psql -U postgres -d interior_recommendation_db -f database/seed.sql
```

Untuk database lama dari Bagian 1-10, jalankan migration local auth:

```bash
psql -U postgres -d interior_recommendation_db -f database/migrations/011a_add_local_auth_to_users.sql
```

Untuk database lama dari Bagian 1-11C, jalankan migration metadata produk:

```bash
psql -U postgres -d interior_recommendation_db -f database/migrations/012a_update_product_metadata_rules.sql
```

Untuk database lama dari Bagian 1-13B, jalankan migration skor preferensi implisit CF:

```bash
psql -U postgres -d interior_recommendation_db -f database/migrations/014a_create_user_product_preference_scores.sql
```

File database ada di:

- `database/schema.sql`
- `database/seed.sql`
- `database/migrations/011a_add_local_auth_to_users.sql`
- `database/migrations/012a_update_product_metadata_rules.sql`
- `database/migrations/014a_create_user_product_preference_scores.sql`
- `database/README.md`

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

## 6. Run Backend

```bash
npm run dev
```

Server berjalan di:

```text
http://localhost:5000
```

Health check:

```http
GET /health
```

## 7. Google OAuth Setup

1. Buat OAuth Client ID di Google Cloud Console.
2. Pilih Web Application.
3. Tambahkan Authorized Redirect URI:

```text
http://localhost:5000/auth/google/callback
```

4. Isi `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, dan `GOOGLE_CALLBACK_URL` di `.env`.
5. Jalankan backend dan buka `http://localhost:5000/auth/google`.

Jika credential masih placeholder, endpoint login akan mengembalikan pesan bahwa Google OAuth belum dikonfigurasi.

## 8. Role Admin

Role disimpan di tabel `users` dengan nilai `user` atau `admin`. Untuk testing admin:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'email_google_anda@gmail.com';
```

Admin endpoint dilindungi oleh `requireAuth` dan `requireAdmin`.

## 9. Endpoints

Authentication:

- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /auth/me`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/failure`

Products:

- `GET /products`
- `GET /products/:id`
- `GET /admin/products`
- `GET /admin/products/:id`
- `POST /admin/products`
- `PUT /admin/products/:id`
- `DELETE /admin/products/:id`
- `DELETE /admin/products/:id/permanent`

Interactions:

- `POST /interactions/view`
- `POST /interactions/like`
- `DELETE /interactions/like/:productId`
- `POST /interactions/wishlist`
- `DELETE /interactions/wishlist/:productId`
- `POST /interactions/favorite`
- `POST /interactions/whatsapp`
- `GET /interactions/my-liked-products?page=1&limit=12`
- `GET /interactions/my-wishlist-products?page=1&limit=12`
- `GET /interactions/my-history`
- `GET /interactions/my-ratings`
- `GET /interactions/my-summary`

Recommendations:

- `GET /recommendations/content-based`
- `GET /recommendations/user-based`
- `GET /recommendations/hybrid`
- `GET /recommendations/personal`
- `GET /recommendations/cold-start`
- `GET /recommendations/room-complementary/:productId`

## 10. Admin Product Delete and Input Rules

### Delete vs Deactivate

Sistem menyediakan dua jenis penghapusan produk.

#### Deactivate

Deactivate hanya mengubah status produk menjadi inactive. Data produk dan aktivitas user tetap tersimpan.

Gunakan deactivate jika admin ingin menyembunyikan produk tanpa menghapus histori data.

#### Delete Permanen

Delete permanen menghapus produk dari database. Semua aktivitas user terkait produk tersebut, seperti like, wishlist, dan interaction, ikut dihapus.

Gunakan delete permanen jika admin benar-benar ingin menghapus produk dari sistem.

Endpoint:

```http
DELETE /admin/products/:id
DELETE /admin/products/:id/permanent
```

### Image Input

Admin memasukkan gambar menggunakan field `image_url`.

Format yang didukung:

- `http://`
- `https://`
- `data:image/`

Upload file fisik tidak digunakan agar arsitektur tetap sederhana untuk kebutuhan skripsi.

### Stock Rules in Admin Form

Stock hanya digunakan oleh category:

- Meja
- Kursi
- Lemari
- Nakas
- Meja Rias

Category `Kitchen Set`, `Living Set`, `Bedset`, dan `Minibar` tidak menggunakan stock dan menyimpan nilai stock sebagai NULL.

## 11. Session and CORS

Backend memakai `express-session` dengan `connect-pg-simple`. Session disimpan pada tabel `sessions`.

CORS dikonfigurasi untuk `FRONTEND_URL` dan `credentials: true`. Frontend harus berjalan dari origin yang sama dengan `FRONTEND_URL`, default:

```text
http://localhost:3000
```

## 12. Recommendation Notes

Hybrid score:

```text
Final Score = (0.7 x CBF Score) + (0.3 x CF Score)
```

Content-Based Filtering menggunakan metadata produk, TF-IDF, dan Cosine Similarity. Mulai Bagian 14A, User-Based Collaborative Filtering menggunakan skor preferensi implisit dari view `user_product_preference_scores`, user-product matrix, dan Cosine Similarity antar user.

Skor preferensi implisit:

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

Nilai maksimal 5.0, lalu CF score dinormalisasi ke rentang 0 sampai 1 untuk Hybrid Recommendation. `page_view`, log historis `like`, dan log historis `favorite` tidak dipakai sebagai sumber nilai CF.

View `user_product_ratings` tetap ada sebagai legacy view untuk histori/profile seperti `/interactions/my-ratings`.

Room-Based Complementary Recommendation tersedia melalui:

```http
GET /recommendations/room-complementary/:productId?limit=6
```

Endpoint ini public dan mengambil produk aktif lain dengan `room_category` yang sama, lalu memprioritaskan category pelengkap ruangan. Harga tidak dipakai dalam perhitungan skor.

## 13. Private Profile Lists

Profile user memiliki dua endpoint private:

```http
GET /interactions/my-liked-products?page=1&limit=12
GET /interactions/my-wishlist-products?page=1&limit=12
```

Kedua endpoint wajib login, memakai user dari session backend, dan tidak menerima `user_id` dari query maupun body. Liked products diambil dari `product_likes`, sedangkan wishlist products diambil dari `product_wishlists`. Response berisi `products` dan `pagination`; default `limit` adalah 12 dengan maksimum 24.

## 14. Unit Testing

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
npm test
```

Menjalankan test coverage:

```bash
npm run test:coverage
```

## 15. Demo Accounts

### Admin Local

```text
username: admin
email: admin@example.com
password: admin12345
role: admin
```

### User Local

```text
username: userdemo
email: userdemo@example.com
password: user12345
role: user
```

### Google User

User juga dapat login menggunakan Google OAuth. Role default untuk user baru dari Google adalah `user`.

Untuk menjadikan Google user sebagai admin saat demo:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'email_google_anda@gmail.com';
```

## 16. Authentication and Role Security

- Password local disimpan dalam bentuk hash menggunakan bcryptjs.
- Password tidak pernah dikirim ulang ke frontend.
- Register manual selalu menghasilkan role `user`.
- Role `admin` hanya berasal dari seed database atau update database oleh administrator.
- Google OAuth tetap didukung.
- Admin route tetap dilindungi `requireAuth` dan `requireAdmin`.
- Navbar menampilkan role badge agar status user jelas saat demo.
