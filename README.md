# Interior Recommendation App

Aplikasi e-commerce produk interior dengan sistem rekomendasi hybrid untuk kebutuhan skripsi. Sistem memakai interaksi user sebagai implicit feedback, lalu menghasilkan rekomendasi dari Content-Based Filtering, User-Based Collaborative Filtering, dan gabungan hybrid.

## Fitur Utama

- Login Google OAuth dan local auth dengan session PostgreSQL.
- Register manual dengan username/email dan password.
- Role `user` dan `admin`.
- Produk publik aktif dengan filter kategori dan pencarian.
- CRUD produk admin dengan soft delete.
- Logging interaksi: page view, like, favorite, WhatsApp inquiry.
- Skor preferensi implisit untuk User-Based Collaborative Filtering.
- Content-Based Filtering dari metadata produk.
- User-Based Collaborative Filtering dari user-product matrix.
- Hybrid Recommendation dengan bobot 70:30.
- Rekomendasi pelengkap ruangan pada halaman detail produk.
- Frontend HTML5, Tailwind CDN, Vanilla JavaScript.

## Stack Teknologi

- Backend: Node.js, Express.js, Passport.js.
- Database: PostgreSQL.
- Session store: `connect-pg-simple`.
- Frontend: HTML5, Tailwind CSS CDN, Vanilla JavaScript.
- Recommendation engine: JavaScript dari nol tanpa library AI/ML eksternal.
- Password hashing: bcryptjs.

## Struktur Folder

```text
backend/
  config/
  controllers/
  database/
  middleware/
  routes/
  services/
  utils/
frontend/
  assets/css/
  assets/js/
  public/
docs/
```

## Setup Database

Buat database:

```bash
createdb -U postgres interior_recommendation_db
```

Jalankan schema dan seed:

```bash
cd backend
psql -U postgres -d interior_recommendation_db -f database/schema.sql
psql -U postgres -d interior_recommendation_db -f database/seed.sql
```

Untuk database existing dari Bagian 1-11C, jalankan migration metadata:

```bash
cd backend
psql -U postgres -d interior_recommendation_db -f database/migrations/012a_update_product_metadata_rules.sql
```

Untuk database existing dari Bagian 1-13B, jalankan migration skor preferensi implisit CF:

```bash
cd backend
psql -U postgres -d interior_recommendation_db -f database/migrations/014a_create_user_product_preference_scores.sql
```

## Product Metadata Rules

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

## Setup Backend

```bash
cd backend
npm install
copy .env.example .env
```

Pastikan `.env` berisi:

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

Jalankan backend:

```bash
npm run dev
```

Health check:

```text
http://localhost:5000/health
```

## Setup Google OAuth

1. Buat OAuth Client ID di Google Cloud Console.
2. Tambahkan redirect URI:

```text
http://localhost:5000/auth/google/callback
```

3. Isi `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` di `backend/.env`.
4. Login frontend akan diarahkan ke `http://localhost:5000/auth/google`.

## Menjalankan Frontend

```bash
cd frontend
node server.js
```

Buka:

```text
http://localhost:3000
```

## Endpoint Utama

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

## Alur Recommendation Engine

1. User login dan berinteraksi dengan produk.
2. Backend menyimpan log interaksi dan state aktif like/wishlist.
3. View `user_product_preference_scores` menghitung skor preferensi implisit untuk User-Based CF.
4. CBF membentuk metadata soup, token, TF-IDF, lalu Cosine Similarity antarproduk.
5. User-Based CF membentuk user-product matrix dan Cosine Similarity antar user.
6. Hybrid menggabungkan skor CBF dan CF.

Rumus skor preferensi implisit:

```text
implicit_score(u, i)
= (1.0 x active_like)
+ (1.5 x active_wishlist)
+ (2.5 x has_whatsapp_inquiry)
```

Sumber skor CF:

- Like aktif dari `product_likes` = 1.0.
- Wishlist aktif dari `product_wishlists` = 1.5.
- Pernah tanya admin dari `interactions.whatsapp_inquiry` = 2.5.

`page_view`, log historis `like`, dan log historis `favorite` tidak dipakai untuk User-Based CF. `page_view` tetap dicatat sebagai histori aktivitas.

Skor maksimal 5.0 dinormalisasi ke 0 sampai 1 sebelum dipakai sebagai CF score pada hybrid.

Formula hybrid:

```text
Final Score = (0.7 x CBF Score) + (0.3 x CF Score)
```

Bobot CBF lebih besar karena produk interior sangat dipengaruhi kategori, material, style, warna, dan ruangan.

Room-Based Complementary Recommendation pada halaman detail produk memakai `room_category` produk aktif dan category pelengkap ruangan. Harga tidak digunakan dalam perhitungan skor pelengkap.

## Catatan Skripsi

- Sistem memakai implicit feedback karena user e-commerce sering tidak memberi rating eksplisit.
- `recommendations.html` menampilkan tiga algoritma dalam satu halaman untuk pembanding hasil.
- Cold-start memakai produk populer dari view `popular_products`, lalu produk aktif random jika data belum ada.
- Semua algoritma rekomendasi dibuat dari nol di JavaScript backend.
- Local auth mendukung demo tanpa Google OAuth, tetapi Google OAuth tetap tersedia.

## Admin Product Management

### Delete vs Deactivate

Sistem menyediakan dua jenis penghapusan produk.

#### Deactivate

Deactivate hanya mengubah status produk menjadi inactive. Data produk dan aktivitas user tetap tersimpan.

Gunakan deactivate jika admin ingin menyembunyikan produk tanpa menghapus histori data.

#### Delete Permanen

Delete permanen menghapus produk dari database. Semua aktivitas user terkait produk tersebut, seperti like, wishlist, dan interaction, ikut dihapus.

Gunakan delete permanen jika admin benar-benar ingin menghapus produk dari sistem.

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

## UI Features

Aplikasi menyediakan beberapa fitur UI untuk demo:

- Dark mode
- Role badge di navbar
- Role-based navbar untuk guest, user, dan admin
- Auto-scroll ke daftar produk setelah filter kategori
- Toast notification
- Like/unlike toggle
- Wishlist/unwishlist toggle
- Private profile lists untuk Produk yang Disukai dan Wishlist Saya
- Section pelengkap ruangan pada product detail
- Admin product management
- Product image preview
- Recommendation comparison page

## UI Theme Audit

Aplikasi menggunakan palet warna berbasis Tailwind `stone` agar tampilan light mode dan dark mode konsisten.

Prinsip warna:

- Light mode menggunakan background terang dan teks gelap.
- Dark mode menggunakan background gelap dan teks terang.
- Tombol dinamis seperti Like dan Wishlist memakai class eksplisit agar tidak terjadi konflik warna.
- Toast, card, form, table, badge, recommendation card, loading state, dan empty state memiliki variasi warna untuk light dan dark mode.

## Product Detail Recommendation Section

Halaman detail produk menampilkan section rekomendasi produk terkait.

Komposisi:

- 3 produk dari Content-Based Filtering
- 2 produk dari Hybrid Recommendation

Jika user belum login atau data personal belum tersedia, sistem menggunakan cold-start fallback.

Produk yang sedang dibuka tidak ditampilkan ulang pada section rekomendasi. Section ini bertujuan membantu user menemukan produk lain yang relevan saat melihat detail produk.

## Unit Testing

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

## Demo Accounts

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

## Authentication and Role Security

- Password local disimpan dalam bentuk hash menggunakan bcryptjs.
- Password tidak pernah dikirim ulang ke frontend.
- Register manual selalu menghasilkan role `user`.
- Role `admin` hanya berasal dari seed database atau update database oleh administrator.
- Google OAuth tetap didukung.
- Admin route dilindungi oleh middleware `requireAuth` dan `requireAdmin`.
- Navbar menampilkan role badge agar status user jelas saat demo.

## Batasan Sistem

- Google OAuth harus dikonfigurasi manual.
- Role admin harus diubah manual melalui database saat development.
- Admin route tetap dilindungi `requireAuth` dan `requireAdmin`.
- Rekomendasi personal membutuhkan data interaksi user.
- WhatsApp URL membutuhkan `WHATSAPP_ADMIN_NUMBER`.
- Frontend masih static HTML, bukan SPA.

## Pengujian Manual

Flow user:

1. Jalankan backend dan frontend.
2. Buka `http://localhost:3000`.
3. Login Google atau login local dengan `userdemo` / `user12345`.
4. Buka detail produk.
5. Klik like, favorite, dan Tanya Admin.
6. Buka `profile.html` untuk melihat history, implicit rating, Produk yang Disukai, dan Wishlist Saya.
7. Buka `recommendations.html` untuk melihat tiga algoritma.

Flow admin:

1. Login local dengan `admin` / `admin12345`, atau login Google lalu ubah role user menjadi admin:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'email_google_anda@gmail.com';
```

2. Buka `admin-dashboard.html`.
3. Buka `admin-products.html`.
4. Tambah produk, edit produk, lalu deactivate produk.
5. Pastikan produk inactive tidak muncul di halaman publik.
