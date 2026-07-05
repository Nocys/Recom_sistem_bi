# Frontend Guide

## 1. Overview

Frontend dibuat menggunakan HTML5, Tailwind CSS via CDN, dan Vanilla JavaScript. Tidak ada React, Vue, Angular, jQuery, bundler, atau framework frontend lain.

Frontend berkomunikasi dengan backend melalui Fetch API dan selalu memakai `credentials: 'include'` agar session Google OAuth dapat dikirim.

## 2. Pages

- `public/index.html`: homepage, kategori, produk aktif, rekomendasi cold-start atau personal.
- `public/login.html`: form login local, form register local, tombol login Google, dan status user.
- `public/product-detail.html`: detail produk, tombol interaksi, produk pelengkap ruangan, dan inspirasi produk lainnya.
- `public/recommendations.html`: halaman analisis teknis rekomendasi khusus admin.
- `public/profile.html`: informasi akun, produk yang disukai, dan wishlist pribadi.
- `public/admin-dashboard.html`: ringkasan admin.
- `public/admin-products.html`: list produk admin, form tambah/edit, filter, deactivate, dan delete permanen aman.

## 3. JavaScript Modules

- `assets/js/api.js`: base API helper, formatter, loading state, empty state.
- `assets/js/auth.js`: session check, local login/register, Google login, logout, require user/admin.
- `assets/js/products.js`: produk publik, homepage, detail produk.
- `assets/js/interactions.js`: page view, like, favorite, WhatsApp inquiry, unlike, dan unwishlist.
- `assets/js/profile.js`: profile user, liked products, wishlist products, dan action private user list.
- `assets/js/recommendations.js`: cold-start, personal, CBF, User-Based CF, Hybrid, produk pelengkap ruangan, dan inspirasi product detail.
- `assets/js/admin.js`: admin dashboard dan CRUD produk.

## 4. Admin Product UX

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

## 5. How to Run

Jalankan backend lebih dulu di `http://localhost:5000`.

Frontend dapat dijalankan dengan static server bawaan:

```bash
cd frontend
node server.js
```

Buka:

```text
http://localhost:3000
```

Alternatif: gunakan VS Code Live Server dari folder `frontend/public`, tetapi pastikan origin frontend sesuai dengan konfigurasi CORS backend.

## 6. Authentication

Login Google diarahkan ke backend:

```text
http://localhost:5000/auth/google
```

Login local memakai:

```http
POST /auth/login
POST /auth/register
```

Frontend membaca status login dari:

```http
GET /auth/me
```

Google OAuth membutuhkan credential manual di file `backend/.env`.

## 7. Demo Accounts

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

## 8. Authentication and Role Security

- Password local disimpan dalam bentuk hash menggunakan bcryptjs.
- Password tidak pernah dikirim ulang ke frontend.
- Register manual selalu menghasilkan role `user`.
- Role `admin` hanya berasal dari seed database atau update database oleh administrator.
- Google OAuth tetap didukung.
- Admin route dilindungi oleh middleware `requireAuth` dan `requireAdmin`.
- Navbar menampilkan role badge agar status user jelas saat demo.

## Role-Based Navbar

Navbar dibedakan berdasarkan status login dan role user.

Guest:
- Home
- Produk
- Login

User:
- Home
- Produk
- Profile
- Logout

Admin:
- Home
- Produk
- Admin Dashboard
- Kelola Produk
- Analisis Rekomendasi
- Profile
- Logout

Menu admin tidak ditampilkan untuk user biasa.

## Category Scroll Behavior

Saat user memilih kategori produk, daftar produk diperbarui dan halaman otomatis melakukan scroll ke section daftar produk.

## Profile Privacy

Pada akun user biasa, halaman profile hanya menampilkan informasi akun, produk yang disukai, dan wishlist.

Riwayat interaksi, ringkasan aktivitas, dan skor aktivitas tidak ditampilkan pada user biasa karena data tersebut bersifat teknis dan lebih sesuai untuk kebutuhan admin atau analisis sistem.

## Smooth Scroll Navigation

Navigasi antar section dalam halaman yang sama menggunakan smooth scroll. Hal ini diterapkan pada menu Produk, tombol Lihat Produk, category card, filter produk, reset filter, dan hash navigation dari halaman lain menuju section produk di homepage.

## 9. Recommendation Page

`recommendations.html` adalah halaman analisis teknis rekomendasi dan hanya tersedia untuk admin.

Halaman ini menampilkan informasi teknis tentang metode rekomendasi:

- User-Based Collaborative Filtering
- Content-Based Filtering
- Hybrid Recommendation
- Room-Based Complementary Recommendation
- Role-Based Recommendation Display

Admin juga dapat melihat contoh output endpoint rekomendasi beserta skor teknis, seperti `Similarity Score`, `CF Score`, `CBF Score`, dan `Final Score`.

User biasa dan guest tidak melihat halaman ini. Menu `Analisis Rekomendasi` hanya muncul pada navbar admin.

## Admin Recommendation Analysis Page

Halaman `recommendations.html` hanya tersedia untuk admin.

Halaman ini menampilkan informasi teknis tentang metode rekomendasi:

- Content-Based Filtering
- User-Based Collaborative Filtering
- Hybrid Recommendation
- Room-Based Complementary Recommendation

User biasa tidak melihat halaman ini dan tidak melihat istilah teknis pada product detail.

## 10. Dark Mode

Frontend mendukung dark mode berbasis class Tailwind.

Preferensi theme disimpan di localStorage dengan key:

```text
theme
```

Nilai yang didukung:

```text
light
dark
```

Dark mode dapat diubah melalui tombol toggle di navbar. Helper tema berada di `assets/js/ui.js` dan akan menambahkan atau menghapus class `dark` pada root HTML.

## 11. UI Theme Audit

Aplikasi menggunakan palet warna berbasis Tailwind `stone` agar tampilan light mode dan dark mode konsisten.

Prinsip warna:

- Light mode menggunakan background terang dan teks gelap.
- Dark mode menggunakan background gelap dan teks terang.
- Tombol dinamis seperti Like dan Wishlist memakai class eksplisit agar tidak terjadi konflik warna.
- Toast, card, form, table, badge, recommendation card, loading state, dan empty state memiliki variasi warna untuk light dan dark mode.

Audit warna mencakup halaman home, login, detail produk, rekomendasi, profile, admin dashboard, dan admin product management.

## 12. Product Detail Recommendation Sections

Halaman detail produk memiliki dua section rekomendasi untuk user:

1. Sangat Disarankan untuk Pelengkap Ruangan Anda
   - Menampilkan produk pelengkap berdasarkan room_category.
   - Maksimal 6 produk.

2. Inspirasi Produk Lainnya
   - Menampilkan produk dari gabungan rekomendasi CBF dan Hybrid.
   - Jika data personal belum tersedia, sistem memakai fallback/cold-start.
   - Maksimal 6 produk.

User tidak melihat istilah teknis seperti CBF, Hybrid, similarity score, atau TF-IDF.

Produk yang sedang dibuka tidak ditampilkan ulang pada section rekomendasi. Section ini bertujuan membantu user menemukan produk lain yang relevan saat melihat detail produk.

## 13. Profile Like and Wishlist

Halaman profil menampilkan dua daftar personal:

- Produk yang Disukai
- Wishlist Saya

Daftar ini bersifat private dan hanya menampilkan data milik user yang sedang login. Frontend mengambil data dari:

```http
GET /interactions/my-liked-products
GET /interactions/my-wishlist-products
```

User dapat membuka detail produk, melakukan unlike, atau menghapus produk dari wishlist langsung dari halaman profil. Section ini memiliki loading state, empty state, error state, dan class warna light/dark mode yang konsisten dengan halaman lain.

## 14. Profile Pagination and Compact Layout

Halaman profil memakai layout compact untuk `Produk yang Disukai` dan `Wishlist Saya`.

Standar tampilan:

- Grid produk compact dengan `lg:grid-cols-6` pada desktop.
- Maksimal 12 produk per halaman untuk liked products dan wishlist.
- Pagination frontend memakai metadata dari backend.
- User biasa tidak melihat riwayat aktivitas. Jika admin membuka profile, riwayat milik admin sendiri tetap berada dalam vertical scroll terbatas, bukan pagination.
- Gambar produk memakai fallback lokal jika URL kosong atau gagal dimuat.
- Footer sederhana ditambahkan ke halaman publik dan admin.

Endpoint yang dipakai:

```http
GET /interactions/my-liked-products?page=1&limit=12
GET /interactions/my-wishlist-products?page=1&limit=12
```
