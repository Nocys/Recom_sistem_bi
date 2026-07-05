# Architecture Overview

## 1. Project Purpose

Aplikasi ini adalah e-commerce produk interior dengan sistem rekomendasi hybrid. Sistem dibuat untuk kebutuhan akademik/skripsi, sehingga arsitektur dipisahkan agar alur data dan algoritma mudah dijelaskan.

## 2. Layers

Sistem memiliki tiga lapisan utama:

- Frontend static HTML.
- Backend Express.js API.
- Database PostgreSQL.

## 3. Frontend Layer

Frontend menggunakan HTML5, Tailwind CSS via CDN, dan Vanilla JavaScript.

Tugas frontend:

- Menampilkan homepage, detail produk, rekomendasi, profile, dan admin page.
- Membaca session dari `GET /auth/me`.
- Mengirim request Fetch API dengan `credentials: 'include'`.
- Mengirim interaction logging dari halaman detail produk.
- Menampilkan tiga algoritma rekomendasi pada `recommendations.html`.
- Menyimpan preferensi dark/light mode di `localStorage` dan menerapkan class `dark` pada root HTML.

File utama:

- `frontend/public/*.html`
- `frontend/assets/js/api.js`
- `frontend/assets/js/auth.js`
- `frontend/assets/js/products.js`
- `frontend/assets/js/interactions.js`
- `frontend/assets/js/recommendations.js`
- `frontend/assets/js/admin.js`

Dark mode sepenuhnya berada di frontend layer. Fitur ini tidak mengubah schema database, endpoint backend, bobot interaction, atau formula rekomendasi.

## 4. Backend Layer

Backend menggunakan Node.js dan Express.js.

Tugas backend:

- Google OAuth dan session login.
- Role management `user` dan `admin`.
- Public product API.
- Admin product CRUD.
- Interaction logging.
- Recommendation services.
- Response dan error handling terpusat.

Struktur backend:

- `routes/`: definisi endpoint.
- `controllers/`: request/response handler.
- `services/`: business logic dan algoritma rekomendasi.
- `middleware/`: auth, admin, validasi, error handler.
- `config/`: database, env, Passport.
- `utils/`: response helper, constants, math, text processing.

## 5. Database Layer

Database memakai PostgreSQL.

Tabel utama:

- `users`: data user Google dan role.
- `products`: katalog produk interior.
- `interactions`: log interaksi user.
- `sessions`: session store Express.

Metadata produk dikontrol di database dan backend validation:

- Category: Kitchen Set, Kamar Tidur, Ruang Tamu, Mini Bar, Meja, Kursi, Lemari.
- Room category: Ruang Tamu, Ruang Makan, Dapur, Kamar Tidur, Mini Bar.
- Style theme: Modern, Minimalis, Japandi.
- Stock hanya digunakan oleh Meja, Kursi, dan Lemari.
- Category non-stock menyimpan `stock` sebagai NULL.

View:

- `user_product_ratings`: akumulasi implicit rating per user-product pair.
- `popular_products`: fallback cold-start berbasis popularitas.

## 6. Authentication and Authorization

Login memakai Google OAuth melalui Passport.js. Setelah callback sukses, user disimpan di tabel `users` dan session disimpan di tabel `sessions`.

Proteksi route:

- `requireAuth`: memastikan user login.
- `requireAdmin`: memastikan user memiliki role `admin`.

## 7. Recommendation Layer

Recommendation engine ditempatkan pada service terpisah:

- `contentBasedService.js`
- `userBasedService.js`
- `hybridRecommendationService.js`

Alasan pemisahan:

- Controller tetap tipis.
- Formula rekomendasi mudah dibaca.
- Algoritma dapat dijelaskan per tahap dalam skripsi.

## 8. Data Flow

1. User membuka frontend.
2. Frontend membaca `/auth/me`.
3. User membuka detail produk dan mengirim page view jika login.
4. Like, favorite, dan WhatsApp inquiry dicatat sebagai interaction.
5. Database view menghitung implicit rating.
6. Endpoint rekomendasi membaca produk, rating, dan metadata.
7. Frontend menampilkan rekomendasi per algoritma.

## 9. Hybrid Weight

Formula final:

```text
Final Score = (0.7 x CBF Score) + (0.3 x CF Score)
```

Content-Based Filtering diberi bobot lebih besar karena preferensi interior sangat dipengaruhi atribut produk seperti kategori, material, style, warna, dan ruangan.
