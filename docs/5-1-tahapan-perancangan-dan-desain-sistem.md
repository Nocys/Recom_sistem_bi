# 5.1 Tahapan Perancangan dan Desain Sistem

Tahapan perancangan dan desain sistem merupakan tahap yang dilakukan setelah kebutuhan sistem dianalisis. Pada tahap ini, kebutuhan yang telah ditentukan diterjemahkan menjadi rancangan sistem yang lebih terstruktur agar dapat digunakan sebagai dasar implementasi. Perancangan tidak berfokus pada penulisan kode program secara rinci, melainkan pada kebutuhan sistem, arsitektur, basis data, proses rekomendasi, API, antarmuka, keamanan, dan rancangan pengujian.

Sistem yang dirancang pada penelitian ini adalah aplikasi e-commerce produk interior yang dilengkapi dengan sistem rekomendasi hybrid. Sistem rekomendasi tersebut menggabungkan pendekatan Content-Based Filtering dan User-Based Collaborative Filtering. Content-Based Filtering digunakan untuk membaca kemiripan karakteristik produk interior, sedangkan User-Based Collaborative Filtering digunakan untuk membaca kemiripan pola preferensi antar pengguna berdasarkan implicit feedback. Hasil dari kedua pendekatan tersebut kemudian digabungkan menjadi rekomendasi hybrid.

Secara umum, sistem dibangun menggunakan tiga lapisan utama, yaitu frontend, backend, dan database. Frontend digunakan sebagai antarmuka pengguna, backend digunakan untuk memproses autentikasi, produk, interaksi, dan rekomendasi, sedangkan database digunakan untuk menyimpan data pengguna, produk, session, interaksi, like, wishlist, serta view pendukung rekomendasi.

## 5.1.1 Rancangan Kebutuhan Sistem

Rancangan kebutuhan sistem menjadi tahap awal dalam proses perancangan perangkat lunak. Tahap ini bertujuan untuk mengidentifikasi fitur dan kualitas yang harus dimiliki oleh sistem agar aplikasi dapat menyelesaikan permasalahan yang telah dirumuskan pada bab sebelumnya. Pada sistem ini, kebutuhan utama yang dirancang adalah aplikasi katalog produk interior yang mampu mencatat interaksi pengguna dan mengolahnya menjadi rekomendasi produk secara personal.

Kebutuhan sistem dikelompokkan menjadi dua, yaitu kebutuhan fungsional dan kebutuhan nonfungsional. Kebutuhan fungsional menjelaskan layanan yang harus disediakan oleh sistem, sedangkan kebutuhan nonfungsional menjelaskan standar kualitas sistem yang berkaitan dengan performa, keamanan, integritas data, kemudahan penggunaan, dan keterpeliharaan sistem.

### A. Kebutuhan Fungsional

Kebutuhan fungsional dalam sistem rekomendasi produk interior ini meliputi fitur-fitur utama yang berhubungan langsung dengan pengguna, admin, dan proses rekomendasi. Adapun kebutuhan fungsional sistem yang dirancang adalah sebagai berikut:

a. Sistem dapat menyediakan proses autentikasi pengguna melalui login lokal menggunakan username atau email dan password, serta login menggunakan Google OAuth.

b. Sistem dapat membedakan hak akses pengguna berdasarkan role, yaitu user dan admin.

c. Sistem dapat menampilkan katalog produk interior yang berstatus aktif kepada pengguna umum.

d. Sistem dapat menyediakan fitur pencarian dan filter produk berdasarkan kategori.

e. Sistem dapat menampilkan detail produk yang memuat nama produk, gambar, kategori, material, variasi material, tema desain, warna dominan, kategori ruangan, deskripsi, harga, stok, dan status produk.

f. Sistem dapat mencatat interaksi pengguna terhadap produk, seperti page view, like, wishlist, dan tanya admin melalui WhatsApp.

g. Sistem dapat menyimpan status aktif like dan wishlist pengguna terhadap produk agar pengguna dapat melihat kembali produk yang disukai dan produk yang masuk wishlist.

h. Sistem dapat menghitung skor preferensi implisit pengguna berdasarkan sinyal like aktif, wishlist aktif, dan riwayat tanya admin melalui WhatsApp.

i. Sistem dapat menghasilkan rekomendasi Content-Based Filtering berdasarkan kemiripan metadata produk, seperti kategori, material, variasi material, tema desain, warna dominan, dan kategori ruangan.

j. Sistem dapat menghasilkan rekomendasi User-Based Collaborative Filtering berdasarkan kemiripan skor preferensi implisit antar pengguna.

k. Sistem dapat menghasilkan rekomendasi hybrid dengan menggabungkan skor Content-Based Filtering dan User-Based Collaborative Filtering menggunakan bobot 70:30.

l. Sistem dapat menyediakan rekomendasi cold-start untuk pengguna yang belum login atau pengguna yang belum memiliki data interaksi yang cukup.

m. Sistem dapat menyediakan rekomendasi produk pelengkap ruangan pada halaman detail produk berdasarkan kategori ruangan dan aturan produk pelengkap.

n. Sistem dapat menyediakan halaman profil pengguna yang menampilkan ringkasan interaksi, riwayat interaksi, skor implisit, produk yang disukai, dan wishlist pengguna.

o. Sistem dapat menyediakan halaman perbandingan rekomendasi untuk menampilkan hasil Content-Based Filtering, User-Based Collaborative Filtering, dan Hybrid Recommendation.

p. Sistem dapat menyediakan fitur admin untuk mengelola produk, meliputi tambah produk, ubah produk, nonaktifkan produk, dan hapus produk secara permanen.

q. Sistem dapat menyediakan API backend sebagai penghubung antara frontend, database, autentikasi, pengelolaan produk, pencatatan interaksi, dan proses rekomendasi.

Tabel 5.1 Kebutuhan Fungsional Sistem

| Nama Kebutuhan Fungsional | Deskripsi Kebutuhan |
| --- | --- |
| Autentikasi Pengguna | Sistem menyediakan login lokal dan Google OAuth untuk proses masuk ke aplikasi. |
| Hak Akses User dan Admin | Sistem membedakan akses user dan admin berdasarkan role yang tersimpan pada data pengguna. |
| Katalog Produk | Sistem menampilkan produk interior aktif kepada pengguna umum. |
| Pencarian dan Filter Produk | Sistem menyediakan pencarian produk dan filter berdasarkan kategori. |
| Detail Produk | Sistem menampilkan informasi lengkap produk interior dan tombol interaksi pengguna. |
| Pencatatan Interaksi | Sistem mencatat page view, like, wishlist, dan tanya admin sebagai riwayat interaksi pengguna. |
| Status Like dan Wishlist | Sistem menyimpan status aktif produk yang disukai dan produk yang masuk wishlist. |
| Skor Preferensi Implisit | Sistem menghitung skor preferensi berdasarkan like aktif, wishlist aktif, dan tanya admin. |
| Content-Based Filtering | Sistem merekomendasikan produk berdasarkan kemiripan metadata produk. |
| User-Based Collaborative Filtering | Sistem merekomendasikan produk berdasarkan kemiripan pola preferensi antar pengguna. |
| Hybrid Recommendation | Sistem menggabungkan skor Content-Based Filtering dan User-Based Collaborative Filtering. |
| Cold-Start Recommendation | Sistem menyediakan rekomendasi fallback ketika data personal pengguna belum tersedia atau belum mencukupi. |
| Rekomendasi Pelengkap Ruangan | Sistem menampilkan produk pelengkap berdasarkan kategori ruangan pada halaman detail produk. |
| Profil Pengguna | Sistem menampilkan ringkasan interaksi, histori interaksi, implicit rating, like, dan wishlist pengguna. |
| Pengelolaan Produk Admin | Admin dapat menambah, mengubah, menonaktifkan, dan menghapus produk secara permanen. |
| API Sistem | Sistem menyediakan endpoint untuk autentikasi, produk, interaksi, rekomendasi, admin, dan health check. |

### B. Kebutuhan Nonfungsional

Kebutuhan nonfungsional merupakan standar kualitas yang harus dipenuhi agar sistem dapat berjalan dengan baik dan layak digunakan. Kebutuhan nonfungsional pada sistem ini meliputi performa, keamanan, integritas data, usability, maintainability, dan ketersediaan hasil rekomendasi.

a. Sistem dirancang agar proses pemuatan halaman, pengambilan data produk, pencatatan interaksi, dan pengambilan rekomendasi dapat berjalan dalam waktu yang wajar sehingga tidak mengganggu pengalaman pengguna.

b. Sistem menggunakan session-based authentication untuk menjaga status login pengguna.

c. Sistem menyimpan password login lokal dalam bentuk hash menggunakan bcryptjs sehingga password asli tidak disimpan langsung pada database.

d. Sistem membatasi akses admin menggunakan middleware autentikasi dan otorisasi sehingga hanya pengguna dengan role admin yang dapat mengakses endpoint dan halaman admin.

e. Sistem menggunakan database PostgreSQL untuk menyimpan data pengguna, produk, interaksi, like, wishlist, dan session secara terstruktur.

f. Sistem menjaga konsistensi metadata produk melalui pembatasan nilai kategori produk, material, variasi material, kategori ruangan, tema desain, dan aturan stok.

g. Sistem menyediakan fallback rekomendasi cold-start agar halaman rekomendasi tetap dapat menampilkan produk meskipun data personal pengguna belum tersedia.

h. Sistem menggunakan pemisahan folder routes, controllers, services, middleware, config, dan utils agar kode lebih mudah dipelihara.

Tabel 5.2 Kebutuhan Nonfungsional Sistem

| Nama Kebutuhan Nonfungsional | Deskripsi Kebutuhan |
| --- | --- |
| Performa | Sistem merespons permintaan halaman, produk, interaksi, dan rekomendasi dalam waktu yang wajar. |
| Keamanan Akses | Sistem menggunakan login, session, password hash, dan pembatasan role untuk melindungi fitur pengguna dan admin. |
| Integritas Data | Sistem menggunakan PostgreSQL, relasi tabel, constraint, dan validasi metadata produk untuk menjaga konsistensi data. |
| Usability | Sistem menyediakan antarmuka katalog, detail produk, profil, rekomendasi, dan admin yang mudah digunakan. |
| Maintainability | Sistem memisahkan kode berdasarkan tanggung jawab agar pengembangan dan perbaikan lebih mudah dilakukan. |
| Ketersediaan Rekomendasi | Sistem menyediakan fallback cold-start ketika data personal belum mencukupi. |

## 5.1.2 Rancangan Arsitektur Sistem

Arsitektur sistem dirancang menggunakan tiga lapisan utama, yaitu frontend, backend, dan database. Pemisahan lapisan ini bertujuan agar setiap bagian memiliki tanggung jawab yang jelas dan dapat dikembangkan secara terpisah.

Lapisan frontend dibangun menggunakan HTML5, Tailwind CSS melalui CDN, dan Vanilla JavaScript. Frontend bertugas menampilkan halaman utama, katalog produk, detail produk, halaman rekomendasi, halaman profil, halaman login, halaman admin dashboard, dan halaman pengelolaan produk admin. Frontend mengirim request ke backend menggunakan Fetch API dengan session cookie.

Lapisan backend dibangun menggunakan Node.js dan Express.js. Backend bertugas menangani autentikasi, otorisasi, pengelolaan produk, pencatatan interaksi, proses rekomendasi, validasi request, serta pengiriman response dalam format JSON. Logika rekomendasi ditempatkan pada service terpisah agar controller tetap berfokus pada proses request dan response.

Lapisan database menggunakan PostgreSQL. Database menyimpan data pengguna, produk, interaction log, status like, status wishlist, dan session. Database juga menyediakan view untuk menghitung skor preferensi implisit dan popularitas produk sebagai dasar rekomendasi.

Tabel 5.3 Rancangan Komponen Arsitektur Sistem

| Komponen | Teknologi | Fungsi |
| --- | --- | --- |
| Frontend | HTML5, Tailwind CSS CDN, Vanilla JavaScript | Menampilkan antarmuka pengguna dan mengirim request ke backend. |
| Backend | Node.js, Express.js | Mengelola autentikasi, produk, interaksi, rekomendasi, dan response API. |
| Authentication | Passport.js, Google OAuth, session | Mengelola login lokal, login Google, dan session pengguna. |
| Database | PostgreSQL | Menyimpan data user, produk, interaksi, like, wishlist, session, dan view rekomendasi. |
| Recommendation Service | JavaScript backend | Menghitung rekomendasi CBF, User-Based CF, hybrid, cold-start, dan pelengkap ruangan. |

Alur umum sistem dirancang sebagai berikut:

1. Pengguna membuka aplikasi melalui frontend.
2. Frontend memeriksa status login pengguna melalui endpoint autentikasi.
3. Pengguna melihat katalog produk dan detail produk.
4. Sistem mencatat interaksi pengguna apabila pengguna sudah login.
5. Database menyimpan riwayat interaksi dan status aktif like atau wishlist.
6. Backend membaca data produk, interaksi, dan skor preferensi untuk memproses rekomendasi.
7. Frontend menampilkan hasil rekomendasi kepada pengguna.

## 5.1.3 Rancangan Basis Data

Basis data dirancang menggunakan PostgreSQL dengan beberapa tabel utama yang saling berelasi. Rancangan basis data dibuat untuk mendukung proses autentikasi, pengelolaan produk, pencatatan interaksi, penyimpanan session, serta perhitungan rekomendasi.

Tabel 5.4 Rancangan Tabel Basis Data

| Nama Tabel atau View | Fungsi |
| --- | --- |
| users | Menyimpan data pengguna, data login Google, data login lokal, dan role pengguna. |
| products | Menyimpan data produk interior, metadata produk, harga, stok, dan status produk. |
| interactions | Menyimpan riwayat interaksi pengguna terhadap produk. |
| product_likes | Menyimpan status aktif like pengguna terhadap produk. |
| product_wishlists | Menyimpan status aktif wishlist pengguna terhadap produk. |
| sessions | Menyimpan data session login pengguna. |
| user_product_ratings | View untuk menghitung implicit rating historis berdasarkan interaction log. |
| user_product_preference_scores | View untuk menghitung skor preferensi implisit yang digunakan oleh User-Based Collaborative Filtering. |
| popular_products | View untuk menghitung popularitas produk sebagai fallback cold-start. |

Tabel users digunakan untuk menyimpan data pengguna, seperti google_id, username, email, name, avatar_url, password_hash, auth_provider, dan role. Field role digunakan untuk membedakan akses user dan admin. Field password_hash hanya digunakan pada login lokal, sedangkan pengguna Google OAuth tidak wajib memiliki password_hash.

Tabel products digunakan untuk menyimpan data produk interior, seperti name, image_url, category, material, material_variant, style_theme, dominant_color, room_category, description, price, stock, dan status. Produk yang berstatus active ditampilkan pada halaman publik, sedangkan produk inactive tidak ditampilkan kepada pengguna umum.

Tabel interactions digunakan untuk menyimpan riwayat interaksi pengguna. Jenis interaksi yang disimpan adalah page_view, like, favorite, dan whatsapp_inquiry. Data ini digunakan untuk histori pengguna, implicit rating historis, popularitas produk, serta basis awal Content-Based Filtering.

Tabel product_likes dan product_wishlists digunakan untuk menyimpan status aktif like dan wishlist. Pemisahan tabel ini diperlukan karena riwayat interaksi dan status aktif memiliki fungsi yang berbeda. Riwayat interaksi tetap menjadi catatan aktivitas, sedangkan status aktif menentukan apakah produk saat ini masih disukai atau masih berada dalam wishlist pengguna.

Tabel sessions digunakan untuk menyimpan session Express.js di PostgreSQL. Dengan penyimpanan session pada database, status login pengguna dapat dipertahankan selama session masih berlaku.

Selain tabel utama, sistem menggunakan tiga view pendukung. View user_product_ratings menghitung implicit rating historis dari interaction log. View user_product_preference_scores menghitung skor preferensi implisit berdasarkan like aktif, wishlist aktif, dan tanya admin. View popular_products menghitung popularitas produk berdasarkan jumlah dan bobot interaksi.

Konsistensi metadata produk dijaga melalui aturan sebagai berikut:

a. Kategori produk yang digunakan adalah Kitchen Set, Living Set, Bedset, Minibar, Meja, Kursi, Lemari, Nakas, dan Meja Rias.

b. Material produk yang digunakan adalah HPL, Kayu, Logam, Kaca, Linen, Kayu + Logam, Logam + Linen, Kayu + Linen, dan HPL + Kaca.

c. Variasi material yang digunakan adalah Tidak Ada, Woodgrain, Solid, Marble, dan Glossy.

d. Kategori ruangan yang digunakan adalah Ruang Tamu, Ruang Makan, Dapur, Kamar Tidur, dan Mini Bar.

e. Tema desain yang digunakan adalah Modern, Minimalis, dan Japandi.

f. Produk kategori Meja, Kursi, Lemari, Nakas, dan Meja Rias menggunakan stok.

g. Produk kategori Kitchen Set, Living Set, Bedset, dan Minibar tidak menggunakan stok sehingga nilai stock disimpan sebagai NULL.

## 5.1.4 Rancangan Proses Rekomendasi

Proses rekomendasi dirancang menggunakan pendekatan hybrid yang menggabungkan Content-Based Filtering dan User-Based Collaborative Filtering. Sistem menggunakan implicit feedback karena pengguna e-commerce tidak selalu memberikan rating eksplisit terhadap produk. Aktivitas seperti like, wishlist, dan tanya admin dapat menunjukkan ketertarikan pengguna terhadap produk.

Pada sistem ini, terdapat dua bentuk data implisit. Pertama, interaction log digunakan sebagai riwayat aktivitas pengguna, dasar implicit rating historis, dan popularitas produk. Kedua, preference score digunakan sebagai sumber nilai pada User-Based Collaborative Filtering. Pemisahan ini dilakukan karena tidak semua interaksi memiliki kekuatan preferensi yang sama. Page view tetap dicatat sebagai riwayat aktivitas, tetapi tidak digunakan sebagai sumber skor Collaborative Filtering.

Tabel 5.5 Bobot Interaksi Historis

| Jenis Interaksi | Bobot | Keterangan |
| --- | ---: | --- |
| page_view | 1.0 | Pengguna melihat detail produk. |
| like | 1.0 | Pengguna memberi like pada produk. |
| favorite | 1.5 | Pengguna menyimpan produk ke wishlist. |
| whatsapp_inquiry | 1.5 | Pengguna menghubungi admin melalui WhatsApp. |

Interaction log digunakan untuk membentuk view user_product_ratings dengan rumus:

```text
implicit_rating(u, i) = min(total_bobot_interaksi(u, i), 5.0)
```

Untuk User-Based Collaborative Filtering, sistem menggunakan view user_product_preference_scores. Skor ini dihitung dari sinyal yang menunjukkan ketertarikan lebih kuat, yaitu like aktif, wishlist aktif, dan pernah tanya admin.

Tabel 5.6 Bobot Skor Preferensi Implisit untuk Collaborative Filtering

| Sinyal Preferensi | Bobot | Keterangan |
| --- | ---: | --- |
| active_like | 1.0 | Produk masih berada dalam daftar like pengguna. |
| active_wishlist | 1.5 | Produk masih berada dalam wishlist pengguna. |
| has_whatsapp_inquiry | 2.5 | Pengguna pernah bertanya kepada admin tentang produk tersebut. |

Rumus skor preferensi implisit adalah sebagai berikut:

```text
implicit_score(u, i)
= (1.0 x active_like)
+ (1.5 x active_wishlist)
+ (2.5 x has_whatsapp_inquiry)
```

Nilai maksimal skor preferensi implisit adalah 5.0. Skor tersebut kemudian dinormalisasi ke rentang 0 sampai 1 sebelum digunakan pada perhitungan hybrid.

### A. Content-Based Filtering

Content-Based Filtering digunakan untuk menghasilkan rekomendasi berdasarkan kemiripan karakteristik produk. Metadata produk yang digunakan meliputi category, material, material_variant, style_theme, dominant_color, dan room_category. Metadata tersebut digabung menjadi metadata soup, kemudian diproses menjadi token dan vektor TF-IDF.

Tahapan Content-Based Filtering adalah sebagai berikut:

1. Mengambil data produk aktif dari database.
2. Mengambil produk basis dari produk yang pernah diinteraksi pengguna.
3. Menggabungkan metadata setiap produk menjadi metadata soup.
4. Melakukan normalisasi teks dan tokenisasi.
5. Menghitung Term Frequency untuk setiap token pada produk.
6. Menghitung Inverse Document Frequency dari seluruh produk aktif.
7. Membentuk vektor TF-IDF untuk setiap produk.
8. Menghitung Cosine Similarity antara produk kandidat dan produk basis pengguna.
9. Menghapus produk yang sudah pernah diinteraksi pengguna dari daftar kandidat.
10. Mengurutkan produk berdasarkan similarity tertinggi.
11. Menggunakan fallback produk populer apabila kandidat personal belum mencukupi.

Rumus TF-IDF yang digunakan adalah sebagai berikut:

```text
TF(term) = jumlah kemunculan term / total token dokumen
IDF(term) = log((N + 1) / (DF(term) + 1)) + 1
TF-IDF(term) = TF(term) x IDF(term)
```

Kemiripan antarproduk dihitung menggunakan Cosine Similarity:

```text
cosine_similarity(A, B) = dot(A, B) / (||A|| x ||B||)
```

Pendekatan ini sesuai untuk produk interior karena preferensi pengguna sangat dipengaruhi oleh atribut produk, seperti kategori, material, tema desain, warna, dan ruangan.

### B. User-Based Collaborative Filtering

User-Based Collaborative Filtering digunakan untuk menghasilkan rekomendasi berdasarkan kemiripan pola preferensi antar pengguna. Apabila dua pengguna memiliki pola skor preferensi yang mirip, maka produk yang diminati oleh pengguna lain dapat menjadi kandidat rekomendasi untuk pengguna aktif.

Tahapan User-Based Collaborative Filtering adalah sebagai berikut:

1. Mengambil seluruh skor preferensi dari view user_product_preference_scores.
2. Membentuk product vocabulary sebagai daftar dimensi vektor.
3. Membentuk user-product matrix berdasarkan implicit_score.
4. Mengubah setiap pengguna menjadi user vector.
5. Menghitung Cosine Similarity antara pengguna aktif dan pengguna lain.
6. Mengambil beberapa pengguna dengan nilai similarity tertinggi.
7. Mengumpulkan produk yang diminati oleh pengguna yang mirip.
8. Menghapus produk yang sudah memiliki preference score pada pengguna aktif.
9. Menghitung candidate score berdasarkan similarity dan implicit score pengguna lain.
10. Menormalisasi skor Collaborative Filtering ke rentang 0 sampai 1.
11. Mengurutkan produk berdasarkan skor tertinggi.

Rumus candidate score adalah sebagai berikut:

```text
score(product) = Sum(similarity x implicit_score) / Sum(similarity)
```

Skor prediksi kemudian dinormalisasi dengan membagi skor terhadap nilai maksimum 5.0. Hasil normalisasi tersebut digunakan sebagai cf_score pada proses hybrid.

### C. Hybrid Recommendation

Hybrid Recommendation dirancang untuk menggabungkan kelebihan Content-Based Filtering dan User-Based Collaborative Filtering. Content-Based Filtering kuat dalam membaca kemiripan metadata produk, sedangkan User-Based Collaborative Filtering kuat dalam membaca pola preferensi pengguna lain.

Formula hybrid yang digunakan adalah:

```text
Final Score = (0.7 x CBF Score) + (0.3 x CF Score)
```

Bobot 70% diberikan kepada Content-Based Filtering karena produk interior sangat dipengaruhi oleh atribut konten, seperti kategori, material, style, warna, dan ruangan. Bobot 30% diberikan kepada Collaborative Filtering agar pola preferensi pengguna lain tetap menjadi faktor pendukung tanpa mengalahkan kesesuaian karakteristik produk.

Jika produk hanya muncul pada salah satu algoritma, skor dari algoritma lain dianggap 0. Hasil akhir diurutkan berdasarkan final_score tertinggi.

### D. Cold-Start Recommendation

Cold-start digunakan ketika pengguna belum login atau belum memiliki data personal yang cukup. Pada kondisi ini, sistem mengambil produk dari view popular_products berdasarkan popularity_score dan total_interactions. Apabila data popularitas belum tersedia, sistem mengambil produk aktif secara acak. Strategi ini membuat sistem tetap dapat menampilkan rekomendasi meskipun data personal belum lengkap.

### E. Room-Based Complementary Recommendation

Room-Based Complementary Recommendation digunakan pada halaman detail produk untuk menampilkan produk pelengkap ruangan. Berbeda dengan Content-Based Filtering yang mencari produk serupa, rekomendasi pelengkap ruangan mencari produk yang dapat melengkapi kebutuhan ruang yang sama.

Formula skor pelengkap ruangan adalah sebagai berikut:

```text
Complementary Score
= (0.45 x room_match)
+ (0.35 x complementary_category_match)
+ (0.15 x style_match)
+ (0.05 x color_match)
```

Sistem tidak menggunakan harga dalam perhitungan skor pelengkap ruangan karena fokus rekomendasi ini adalah kesesuaian fungsi dan tampilan produk dalam satu ruangan.

## 5.1.5 Rancangan Alur Sistem

Rancangan alur sistem menjelaskan bagaimana pengguna, admin, frontend, backend, dan database saling berinteraksi. Alur ini dibagi menjadi alur pengguna, alur rekomendasi, dan alur admin.

### A. Alur Pengguna

Alur pengguna dirancang sebagai berikut:

1. Pengguna membuka halaman utama aplikasi.
2. Sistem menampilkan produk aktif dan rekomendasi awal.
3. Pengguna dapat melakukan register, login lokal, atau login Google OAuth.
4. Pengguna melihat katalog produk, melakukan pencarian, atau memilih filter kategori.
5. Pengguna membuka detail produk.
6. Sistem mencatat page view apabila pengguna sudah login.
7. Pengguna dapat memberi like, memasukkan produk ke wishlist, atau menghubungi admin melalui WhatsApp.
8. Sistem menyimpan interaction log dan memperbarui status aktif like atau wishlist.
9. Pengguna dapat membuka halaman profil untuk melihat ringkasan interaksi, histori, like, wishlist, dan implicit rating.

### B. Alur Rekomendasi

Alur rekomendasi dirancang sebagai berikut:

1. Frontend meminta data rekomendasi ke endpoint rekomendasi.
2. Backend memeriksa status login pengguna apabila endpoint membutuhkan autentikasi.
3. Backend membaca produk aktif, interaction log, status like, status wishlist, dan view skor preferensi.
4. Content-Based Filtering menghitung similarity berdasarkan metadata produk.
5. User-Based Collaborative Filtering menghitung similarity antar pengguna berdasarkan skor preferensi implisit.
6. Hybrid Recommendation menggabungkan skor CBF dan CF dengan bobot 70:30.
7. Apabila data personal belum cukup, sistem menggunakan cold-start fallback.
8. Frontend menampilkan hasil rekomendasi kepada pengguna.

### C. Alur Admin

Alur admin dirancang sebagai berikut:

1. Admin login menggunakan akun yang memiliki role admin.
2. Sistem memvalidasi session dan role admin.
3. Admin membuka dashboard admin atau halaman pengelolaan produk.
4. Admin dapat menambah produk dengan metadata yang sudah dibatasi oleh aturan sistem.
5. Admin dapat mengubah data produk.
6. Admin dapat menonaktifkan produk sehingga produk tidak tampil pada halaman publik.
7. Admin dapat menghapus produk secara permanen. Pada proses ini, sistem menghapus data terkait produk, seperti like, wishlist, dan interaction log, menggunakan transaksi database.

## 5.1.6 Rancangan API Sistem

API sistem dirancang sebagai penghubung antara frontend, backend, dan database. Backend mengembalikan response dalam format JSON agar mudah digunakan oleh frontend. Endpoint dikelompokkan berdasarkan fungsi utama, yaitu autentikasi, produk, admin produk, interaksi, rekomendasi, dan health check.

Tabel 5.7 Rancangan Endpoint Sistem

| Kelompok API | Endpoint | Fungsi |
| --- | --- | --- |
| Authentication | GET /auth/me | Mengecek status login pengguna. |
| Authentication | POST /auth/register | Mendaftarkan pengguna lokal baru. |
| Authentication | POST /auth/login | Melakukan login lokal menggunakan username atau email dan password. |
| Authentication | POST /auth/logout | Mengakhiri session pengguna. |
| Authentication | GET /auth/google | Mengarahkan pengguna ke proses login Google OAuth. |
| Authentication | GET /auth/google/callback | Menerima callback dari Google OAuth. |
| Products | GET /products | Mengambil daftar produk aktif untuk halaman publik. |
| Products | GET /products/:id | Mengambil detail produk aktif berdasarkan id. |
| Admin Products | GET /admin/products | Mengambil daftar seluruh produk untuk admin. |
| Admin Products | GET /admin/products/:id | Mengambil detail produk untuk admin. |
| Admin Products | POST /admin/products | Menambahkan produk baru. |
| Admin Products | PUT /admin/products/:id | Mengubah data produk. |
| Admin Products | DELETE /admin/products/:id | Menonaktifkan produk. |
| Admin Products | DELETE /admin/products/:id/permanent | Menghapus produk permanen beserta data terkait. |
| Interactions | GET /interactions/product-state/:productId | Mengambil status like dan wishlist produk untuk pengguna login. |
| Interactions | POST /interactions/view | Mencatat page view produk. |
| Interactions | POST /interactions/like | Menambahkan status like aktif dan mencatat interaksi like. |
| Interactions | DELETE /interactions/like/:productId | Menghapus status like aktif. |
| Interactions | POST /interactions/wishlist | Menambahkan status wishlist aktif dan mencatat interaksi favorite. |
| Interactions | DELETE /interactions/wishlist/:productId | Menghapus status wishlist aktif. |
| Interactions | POST /interactions/favorite | Alias untuk menambahkan produk ke wishlist. |
| Interactions | POST /interactions/whatsapp | Mencatat interaksi tanya admin melalui WhatsApp. |
| Interactions | GET /interactions/my-liked-products | Mengambil daftar produk yang sedang disukai pengguna. |
| Interactions | GET /interactions/my-wishlist-products | Mengambil daftar produk yang berada dalam wishlist pengguna. |
| Interactions | GET /interactions/my-history | Mengambil histori interaksi pengguna. |
| Interactions | GET /interactions/my-ratings | Mengambil implicit rating historis pengguna. |
| Interactions | GET /interactions/my-summary | Mengambil ringkasan interaksi pengguna. |
| Recommendations | GET /recommendations/content-based | Mengambil rekomendasi Content-Based Filtering. |
| Recommendations | GET /recommendations/user-based | Mengambil rekomendasi User-Based Collaborative Filtering. |
| Recommendations | GET /recommendations/hybrid | Mengambil rekomendasi hybrid. |
| Recommendations | GET /recommendations/personal | Mengambil rekomendasi personal berbasis hybrid. |
| Recommendations | GET /recommendations/cold-start | Mengambil rekomendasi cold-start untuk pengguna umum. |
| Recommendations | GET /recommendations/room-complementary/:productId | Mengambil rekomendasi produk pelengkap ruangan. |
| Health Check | GET /health | Mengecek status backend utama. |
| Health Check | GET /auth/health | Mengecek status modul autentikasi. |
| Health Check | GET /products/health | Mengecek status modul produk publik. |
| Health Check | GET /admin/products/health | Mengecek status modul admin produk. |
| Health Check | GET /interactions/health | Mengecek status modul interaksi. |
| Health Check | GET /recommendations/health | Mengecek status modul rekomendasi. |

Response API dirancang menggunakan format umum sebagai berikut:

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

Apabila terjadi kesalahan, response API menggunakan format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": null
}
```

## 5.1.7 Rancangan Antarmuka Sistem

Antarmuka sistem dirancang agar pengguna dapat melihat produk, melakukan interaksi, dan memperoleh rekomendasi dengan mudah. Frontend menggunakan halaman statis HTML yang didukung Tailwind CSS dan Vanilla JavaScript.

Tabel 5.8 Rancangan Antarmuka Sistem

| Halaman | Fungsi |
| --- | --- |
| login.html | Menyediakan form login lokal, register, dan tombol login Google OAuth. |
| index.html | Menampilkan halaman utama, daftar produk aktif, filter, pencarian, dan rekomendasi. |
| product-detail.html | Menampilkan detail produk, tombol like, wishlist, tanya admin, dan rekomendasi produk terkait. |
| recommendations.html | Menampilkan perbandingan hasil Content-Based Filtering, User-Based Collaborative Filtering, dan Hybrid Recommendation. |
| profile.html | Menampilkan ringkasan interaksi, histori, implicit rating, produk yang disukai, dan wishlist pengguna. |
| admin-dashboard.html | Menampilkan halaman awal untuk admin. |
| admin-products.html | Menyediakan fitur tambah, ubah, nonaktifkan, dan hapus permanen produk. |

Antarmuka juga mendukung fitur dark mode, role-based navbar, role badge, toast notification, like/unlike toggle, wishlist/unwishlist toggle, pagination daftar produk pribadi, dan product image preview pada halaman admin. Fitur tersebut dirancang untuk membantu pengguna memahami status sistem dan hasil tindakan yang dilakukan.

Pada halaman detail produk, sistem menampilkan rekomendasi produk terkait dengan komposisi rekomendasi dari Content-Based Filtering, Hybrid Recommendation, dan fallback apabila hasil personal belum mencukupi. Selain itu, sistem juga menampilkan rekomendasi pelengkap ruangan agar pengguna dapat menemukan produk lain yang sesuai dengan ruangan yang sedang dilihat.

## 5.1.8 Rancangan Keamanan dan Hak Akses

Keamanan sistem dirancang melalui autentikasi, session, password hashing, dan pembatasan akses berdasarkan role. Sistem menyediakan dua metode autentikasi, yaitu login lokal dan Google OAuth. Pada login lokal, password pengguna disimpan dalam bentuk hash menggunakan bcryptjs. Sistem tidak mengirimkan password_hash kembali ke frontend.

Session pengguna disimpan menggunakan PostgreSQL melalui session store. Setelah login berhasil, frontend dapat mengecek status pengguna melalui endpoint /auth/me. Data session ini digunakan backend untuk menentukan apakah pengguna sudah login atau belum.

Hak akses sistem dibagi menjadi dua, yaitu user dan admin. User dapat melihat produk, melakukan interaksi, melihat profil, dan memperoleh rekomendasi. Admin memiliki akses tambahan untuk mengelola produk melalui halaman dan endpoint admin. Endpoint admin dilindungi oleh middleware requireAuth dan requireAdmin sehingga hanya pengguna dengan role admin yang dapat mengaksesnya.

Register manual selalu menghasilkan role user. Role admin berasal dari data seed atau perubahan langsung oleh administrator pada database. Dengan aturan ini, pengguna umum tidak dapat mendaftarkan diri sebagai admin melalui form register.

Sistem juga menerapkan validasi pada data produk. Metadata seperti kategori, material, variasi material, tema desain, kategori ruangan, dan aturan stok dibatasi agar data produk konsisten. Konsistensi metadata ini penting karena metadata produk digunakan pada proses Content-Based Filtering.

## 5.1.9 Rancangan Pengujian Sistem

Pengujian sistem dirancang untuk memastikan setiap fitur berjalan sesuai kebutuhan. Pengujian dilakukan terhadap proses autentikasi, katalog produk, pengelolaan produk admin, pencatatan interaksi, perhitungan skor implisit, dan hasil rekomendasi.

Rancangan pengujian yang dilakukan adalah sebagai berikut:

a. Pengujian autentikasi dilakukan dengan mencoba register, login lokal, login Google OAuth, cek session, dan logout.

b. Pengujian hak akses dilakukan dengan memastikan halaman dan endpoint admin hanya dapat diakses oleh pengguna dengan role admin.

c. Pengujian katalog produk dilakukan dengan membuka daftar produk, melakukan pencarian, memilih filter kategori, dan membuka detail produk.

d. Pengujian interaksi dilakukan dengan mencatat page view, like, wishlist, dan tanya admin pada produk.

e. Pengujian status like dan wishlist dilakukan dengan memastikan tombol like dan wishlist dapat aktif, nonaktif, serta tersimpan pada daftar pribadi pengguna.

f. Pengujian implicit rating historis dilakukan dengan memastikan bobot interaction log terakumulasi pada view user_product_ratings dan dibatasi maksimal 5.0.

g. Pengujian skor preferensi Collaborative Filtering dilakukan dengan memastikan active_like, active_wishlist, dan has_whatsapp_inquiry membentuk implicit_score sesuai bobot yang ditentukan.

h. Pengujian Content-Based Filtering dilakukan dengan memastikan produk yang direkomendasikan memiliki kemiripan metadata dengan produk yang pernah diminati pengguna.

i. Pengujian User-Based Collaborative Filtering dilakukan dengan memastikan rekomendasi dipengaruhi oleh pengguna lain yang memiliki nilai similarity tinggi.

j. Pengujian Hybrid Recommendation dilakukan dengan memastikan final_score dihitung menggunakan formula 70% CBF dan 30% CF.

k. Pengujian cold-start dilakukan dengan memastikan sistem tetap menampilkan produk populer atau produk aktif acak ketika data personal pengguna belum tersedia.

l. Pengujian rekomendasi pelengkap ruangan dilakukan dengan memastikan produk yang ditampilkan memiliki kategori ruangan yang sesuai dan mengikuti aturan produk pelengkap.

m. Pengujian admin product dilakukan dengan memastikan admin dapat menambah, mengubah, menonaktifkan, dan menghapus produk permanen sesuai aturan sistem.

n. Pengujian unit dilakukan pada logic rekomendasi backend, seperti perhitungan skor preferensi implisit, pembentukan user-product matrix, cosine similarity, candidate score, normalisasi CF score, dan hybrid score.
