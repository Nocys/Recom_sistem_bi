# Thesis Notes

## 1. Latar Teknis Sistem

Sistem ini dikembangkan sebagai aplikasi e-commerce produk interior dengan Hybrid Recommendation System. Domain interior dipilih karena produk memiliki karakteristik konten yang kuat, seperti kategori, material, style, warna dominan, dan kategori ruangan.

## 2. Alasan Menggunakan Implicit Feedback

Sistem memakai implicit feedback karena user e-commerce tidak selalu memberikan rating eksplisit. Aktivitas seperti melihat produk, memberi like, menyimpan favorite, dan menghubungi admin lewat WhatsApp sudah dapat menjadi sinyal ketertarikan.

Bobot interaksi historis untuk activity/profile:

- `page_view` = 1.0
- `like` = 1.0
- `favorite` = 1.5
- `whatsapp_inquiry` = 1.5

Akumulasi rating dibatasi maksimal 5.0 agar produk yang sama tidak terlalu dominan.

Untuk User-Based Collaborative Filtering, sistem memakai skor preferensi implisit pengguna, bukan rating kualitas produk. Skor preferensi implisit diperoleh dari tindakan pengguna terhadap produk, yaitu like, wishlist, dan tanya admin. Skor ini tidak merepresentasikan penilaian kualitas produk setelah digunakan, melainkan tingkat ketertarikan pengguna terhadap produk berdasarkan informasi yang tersedia pada sistem.

Rumus skor preferensi implisit:

```text
implicit_score(u, i)
= (1.0 x active_like)
+ (1.5 x active_wishlist)
+ (2.5 x has_whatsapp_inquiry)
```

Dengan bobot:

- Like aktif dari `product_likes` = 1.0
- Wishlist aktif dari `product_wishlists` = 1.5
- Pernah tanya admin dari `interactions.whatsapp_inquiry` = 2.5

Nilai maksimal adalah 5.0 dan skor CF dinormalisasi ke rentang 0 sampai 1 sebelum digunakan oleh Hybrid Recommendation.

Page view tidak digunakan sebagai sinyal Collaborative Filtering karena aktivitas melihat halaman produk belum tentu menunjukkan preferensi yang kuat. Oleh karena itu, page view hanya disimpan sebagai histori aktivitas, sedangkan nilai CF dihitung dari sinyal preferensi yang lebih kuat.

## 3. Alasan Menggunakan Content-Based Filtering

Content-Based Filtering relevan untuk produk interior karena keputusan user banyak dipengaruhi karakteristik produk. Produk dengan kategori, material, style, warna, dan ruangan yang mirip cenderung memiliki peluang relevansi yang lebih tinggi.

Pada sistem ini, metadata produk diproses menjadi metadata soup, dinormalisasi, ditokenisasi, lalu dihitung dengan TF-IDF. Cosine Similarity digunakan untuk mengukur kemiripan produk kandidat terhadap produk yang pernah diminati user.

## 4. Alasan Menggunakan User-Based Collaborative Filtering

User-Based Collaborative Filtering digunakan untuk menangkap pola perilaku kolektif. Jika dua user memiliki pola implicit rating yang mirip, maka produk yang diminati user pertama dapat menjadi kandidat rekomendasi bagi user kedua.

Metode ini melengkapi CBF karena tidak hanya melihat isi produk, tetapi juga hubungan antar perilaku user.

Pada Bagian 14A, pola perilaku tersebut direpresentasikan dengan user-product matrix dari view `user_product_preference_scores`. Like dan wishlist dihitung dari state aktif sehingga unlike atau unwishlist langsung menghapus kontribusi sinyal tersebut dari CF. Tanya admin dihitung binary; jika user pernah bertanya tentang produk yang sama lebih dari satu kali, sinyal WhatsApp tetap bernilai 1.

## 5. Alasan Menggunakan Hybrid Recommendation

Hybrid Recommendation menggabungkan kelebihan dua pendekatan:

- CBF kuat pada kemiripan atribut produk.
- User-Based CF kuat pada pola perilaku user lain.

Kombinasi ini membuat sistem lebih stabil dibanding hanya memakai satu algoritma, terutama ketika data user belum banyak tetapi metadata produk tersedia.

## 6. Alasan Bobot 70:30

Formula:

```text
Final Score = (0.7 x CBF Score) + (0.3 x CF Score)
```

Bobot CBF 70% dipilih karena domain interior sangat dipengaruhi metadata produk. Bobot CF 30% tetap memberi ruang pada pola perilaku kolektif, tetapi tidak mengalahkan kecocokan karakteristik produk.

## 7. Dukungan Pembuktian Skripsi

Sistem mendukung pembuktian skripsi melalui:

- Log interaction yang dapat ditelusuri.
- View skor preferensi implisit `user_product_preference_scores` untuk User-Based CF.
- View implicit rating historis `user_product_ratings` untuk activity/profile.
- Implementasi CBF dengan metadata soup, TF-IDF, dan Cosine Similarity.
- Implementasi User-Based CF dengan user-product matrix dan Cosine Similarity antar user.
- Implementasi hybrid dengan formula eksplisit.
- Cold-start fallback saat data personal belum cukup.

## 8. Halaman Pembanding Algoritma

`frontend/public/recommendations.html` menjadi media pembanding hasil algoritma. Halaman tersebut menampilkan:

- User-Based Collaborative Filtering
- Content-Based Filtering
- Hybrid Recommendation

Setiap section menampilkan produk, kategori, harga, dan skor rekomendasi. Untuk hybrid, UI menampilkan `CBF Score`, `CF Score`, dan `Final Score`, sehingga formula 70:30 dapat dijelaskan secara langsung saat demo.

## 9. Local Authentication untuk Demo

Bagian 11A menambahkan local authentication agar demo tidak bergantung penuh pada Google OAuth. User dapat register dan login memakai username/email serta password. Password disimpan dalam bentuk hash menggunakan bcryptjs.

Akun demo:

```text
Admin Demo
username: admin
email: admin@example.com
password: admin12345
role: admin

User Demo
username: userdemo
email: userdemo@example.com
password: user12345
role: user
```

Catatan keamanan:

- User Google tidak memiliki `password_hash`.
- Register manual selalu menghasilkan role `user`.
- Role admin hanya berasal dari seed atau update database oleh admin/developer.
- Admin route tetap dilindungi `requireAuth` dan `requireAdmin`.
- Google OAuth tetap dipertahankan untuk membandingkan dua metode login.

## 10. Like and Wishlist State

Sistem memisahkan log historis interaksi dan state aktif UI.

- `interactions` menyimpan positive feedback historis dan aktivitas profile.
- `product_likes` menyimpan status aktif like.
- `product_wishlists` menyimpan status aktif wishlist.

Saat user melakukan like atau menambahkan produk ke wishlist, sistem menyimpan state aktif dan log positif untuk histori. Wishlist pada UI tetap dicatat sebagai `favorite` di tabel `interactions` agar histori lama dan endpoint profile tetap berjalan.

Saat user melakukan unlike atau unwishlist, sistem hanya menghapus state aktif. Sistem tidak menambahkan negative feedback karena model rekomendasi pada proyek ini menggunakan positive implicit feedback.

Untuk User-Based CF, like dan wishlist yang dipakai adalah state aktif dari `product_likes` dan `product_wishlists`, bukan log historis `like` atau `favorite`.

## 11. Demo Readiness

Aplikasi menyediakan beberapa elemen UI untuk mendukung demonstrasi sistem:

1. Badge role untuk membedakan admin dan user.
2. Toast notification untuk memberi feedback terhadap aksi user.
3. Like dan wishlist toggle untuk menunjukkan interaksi aktif user.
4. Halaman rekomendasi yang membandingkan User-Based CF, Content-Based Filtering, dan Hybrid Recommendation.
5. Admin product management untuk membuktikan metadata produk dapat dikelola.
6. Profile page untuk menunjukkan bahwa interaksi user tercatat.

## 12. Controlled Product Metadata

Bagian 12A membatasi metadata produk agar input admin lebih konsisten dan Content-Based Filtering lebih mudah dijelaskan.

Category digunakan sebagai jenis produk. Category final yang didukung:

- Kitchen Set
- Living Set
- Bedset
- Minibar
- Meja
- Kursi
- Lemari
- Nakas
- Meja Rias

Room category tetap digunakan sebagai konteks ruangan:

Room category dibatasi menjadi:

- Ruang Tamu
- Ruang Makan
- Dapur
- Kamar Tidur
- Mini Bar

Material produk dibuat lebih terstruktur melalui dua atribut:

- material
- material_variant

Contoh:

- material: HPL
- material_variant: Woodgrain

Material utama dibatasi menjadi HPL, Kayu, Logam, Kaca, Linen, Kayu + Logam, Logam + Linen, Kayu + Linen, dan HPL + Kaca. Material variant dibatasi menjadi Tidak Ada, Woodgrain, Solid, Marble, dan Glossy.

Style theme dibatasi menjadi:

- Modern
- Minimalis
- Japandi

Tidak semua produk interior menggunakan stock. Produk `Meja`, `Kursi`, `Lemari`, `Nakas`, dan `Meja Rias` menggunakan stock integer minimal 0, sedangkan `Kitchen Set`, `Living Set`, `Bedset`, dan `Minibar` menyimpan `stock` sebagai NULL.

Pembatasan category, material, material_variant, room_category, dan style_theme mengurangi typo metadata sehingga token pada metadata soup Content-Based Filtering lebih stabil. Harga tetap ditampilkan di UI, tetapi tidak digunakan dalam metadata CBF.

## Product Taxonomy

Pada sistem ini, category digunakan sebagai jenis produk, sedangkan room_category digunakan sebagai lokasi atau konteks ruangan produk.

Contoh:

- category: Bedset
- room_category: Kamar Tidur

Struktur ini digunakan agar sistem dapat membedakan antara jenis produk dan konteks ruangan.

## Material Structure

Material produk dibuat lebih terstruktur melalui dua atribut:

- material
- material_variant

Contoh:

- material: HPL
- material_variant: Woodgrain

Struktur ini membantu menjaga konsistensi data dan mendukung proses Content-Based Filtering.

## 13. Admin Product UX and Safe Delete

Bagian 12B menambahkan pemisahan antara deactivate dan delete permanen pada produk admin.

### Deactivate

Deactivate hanya mengubah status produk menjadi `inactive`. Data produk dan aktivitas user tetap tersimpan.

Gunakan deactivate jika admin ingin menyembunyikan produk tanpa menghapus histori data.

### Delete Permanen

Delete permanen menghapus produk dari database. Semua aktivitas user terkait produk tersebut, seperti like, wishlist, dan interaction, ikut dihapus.

Gunakan delete permanen jika admin benar-benar ingin menghapus produk dari sistem.

Admin product form juga menyesuaikan metadata terkontrol:

- Category, material, material_variant, room category, dan style theme memakai select final.
- Image tetap memakai field `image_url` dengan dukungan `http://`, `https://`, dan `data:image/`.
- Stock hanya tampil untuk category `Meja`, `Kursi`, `Lemari`, `Nakas`, dan `Meja Rias`.
- Category `Kitchen Set`, `Living Set`, `Bedset`, dan `Minibar` menyimpan `stock` sebagai NULL.

## 14. UI Readiness for Demonstration

Dark mode, toast notification, role badge, dan visual state pada Like/Wishlist ditambahkan untuk meningkatkan kelayakan demo aplikasi.

Fitur ini tidak mengubah algoritma rekomendasi, tetapi membantu penguji melihat bahwa sistem memiliki alur interaksi user yang jelas dan status aplikasi yang mudah diamati.

Dark mode disimpan di `localStorage` dengan key `theme`, sehingga tampilan tetap konsisten setelah halaman di-refresh. Perbaikan warna Like/Wishlist memastikan tombol aktif dan nonaktif tetap terbaca di light mode maupun dark mode.

## 15. UI Theme Audit

Bagian 13A melakukan audit warna UI agar aplikasi layak didemokan dalam light mode dan dark mode.

Prinsip warna yang digunakan:

- Light mode memakai background terang, card putih, border `stone`, dan teks gelap.
- Dark mode memakai background gelap, card gelap, border `stone`, dan teks terang.
- Tombol dinamis Like/Wishlist memakai `className` eksplisit untuk state inactive dan active.
- Toast, card, form, table admin, badge status, recommendation card, empty state, dan loading skeleton memiliki variasi warna untuk dua mode.

Audit ini tidak mengubah database, backend endpoint, bobot interaction, bobot hybrid, atau recommendation engine.

## 16. Product Detail Recommendation Section

Bagian 13B menambahkan section rekomendasi produk pada halaman detail produk. Pada Bagian 17D, section ini dirapikan menjadi "Inspirasi Produk Lainnya" agar bahasa UI lebih natural untuk user.

Komposisi section:

- 3 produk dari Content-Based Filtering
- 2 produk dari Hybrid Recommendation

Jika user belum login atau data personal belum tersedia, sistem menggunakan cold-start fallback. Produk yang sedang dibuka tidak ditampilkan ulang pada section rekomendasi, dan hasil duplikat dari CBF, Hybrid, maupun fallback dihapus di frontend.

Section ini membantu user menemukan produk lain yang relevan saat sedang melihat detail produk. Istilah teknis seperti CBF, Hybrid, TF-IDF, cosine similarity, dan score tidak ditampilkan pada UI user. Perubahan ini tidak mengubah database, endpoint backend, bobot hybrid, bobot interaction, atau recommendation engine.

## 17. Private User Preference Lists

Bagian 14B menambahkan daftar preferensi pribadi pada halaman profil pengguna.

Daftar yang ditampilkan:

- Produk yang Disukai
- Wishlist Saya

Fitur Like dan Wishlist tidak hanya digunakan sebagai sinyal preferensi untuk Collaborative Filtering, tetapi juga ditampilkan kembali pada halaman profil pengguna.

Daftar produk yang disukai dan wishlist bersifat private untuk masing-masing user. Endpoint backend mengambil data berdasarkan user yang sedang login melalui session, sehingga client tidak dapat mengirim `user_id` untuk melihat data preferensi milik user lain.

Dalam konteks sistem rekomendasi, Like dan Wishlist digunakan sebagai state aktif. Jika user melakukan unlike atau menghapus produk dari wishlist, maka sinyal tersebut tidak lagi digunakan dalam perhitungan skor preferensi implisit.

## 18. Pengujian Unit Recommendation Logic

Bagian 14C menambahkan pengujian unit pada bagian logika rekomendasi untuk memastikan bahwa perhitungan sistem sesuai dengan rumus yang digunakan dalam penelitian.

Pengujian dilakukan menggunakan Jest dan difokuskan pada:

- Skor preferensi implisit
- User-product matrix
- Product vocabulary
- User vector
- Cosine similarity
- Ranking user mirip
- Pemilihan kandidat produk
- Prediksi skor Collaborative Filtering
- Normalisasi skor CF
- Perhitungan skor Hybrid Recommendation

Pengujian ini membantu memastikan bahwa perubahan kode tidak mengubah rumus utama sistem rekomendasi dan tidak membutuhkan koneksi PostgreSQL, session login, Google OAuth, atau frontend.

## 19. Profile Pagination and Website Polish

Bagian 15 merapikan halaman profil agar lebih siap untuk demo dengan data yang lebih banyak.

Perubahan utama:

- Produk yang Disukai dan Wishlist Saya memakai grid compact.
- Pada desktop, grid dapat menampilkan 6 card per baris.
- Backend mengembalikan pagination untuk liked products dan wishlist.
- Frontend hanya meminta 12 produk per halaman.
- Riwayat aktivitas tetap berupa vertical scroll terbatas agar kronologi interaksi mudah dibaca.
- Gambar produk memakai fallback jika URL kosong atau gagal dimuat.
- Footer sederhana ditambahkan ke semua halaman utama.

Perubahan ini hanya memengaruhi penyajian data profil dan standar UI. Database schema, endpoint auth, bobot implicit preference score, bobot CBF/CF/Hybrid, dan algoritma rekomendasi tidak diubah.

## 20. Permanent Delete Cleanup

Bagian 16 memperbarui permanent delete product agar admin dapat menghapus produk walaupun produk tersebut sudah memiliki aktivitas user.

Saat delete permanen dijalankan, backend menghapus data terkait dari `product_likes`, `product_wishlists`, dan `interactions`, lalu menghapus data pada `products`. Proses ini dilakukan dalam database transaction sehingga jika salah satu langkah gagal, seluruh proses dibatalkan dengan rollback.

Perubahan ini membuat produk yang dihapus tidak lagi muncul pada admin table, daftar like, wishlist, riwayat aktivitas, maupun rekomendasi. Bobot implicit preference score, bobot CBF/CF/Hybrid, endpoint auth, dan algoritma rekomendasi tidak diubah.

## 21. Role-Based User Interface

Antarmuka sistem dibedakan berdasarkan role pengguna. User biasa hanya melihat menu yang berkaitan dengan pencarian produk dan profil, sedangkan admin memiliki akses ke dashboard, manajemen produk, dan analisis rekomendasi.

Pemisahan ini dilakukan agar user tidak melihat informasi teknis yang tidak diperlukan, sementara admin tetap dapat memantau sistem.

## 22. Rekomendasi Pelengkap Ruangan

Selain rekomendasi berbasis kemiripan produk, sistem juga menyediakan rekomendasi pelengkap ruangan.

Fitur ini digunakan agar user tidak hanya mendapatkan produk yang mirip, tetapi juga produk lain yang relevan untuk melengkapi ruangan.

Contoh:
Jika user melihat produk Bedset pada `room_category` Kamar Tidur, sistem dapat merekomendasikan Lemari, Nakas, dan Meja Rias sebagai produk pelengkap.

Pada tampilan user, fitur ini ditampilkan dengan judul "Sangat Disarankan untuk Pelengkap Ruangan Anda" agar lebih mudah dipahami oleh user awam.

## 23. Inspirasi Produk Lainnya

Section "Inspirasi Produk Lainnya" digunakan untuk menampilkan produk lain yang relevan bagi pengguna berdasarkan hasil rekomendasi sistem.

Secara teknis, section ini mengambil hasil dari Content-Based Filtering dan Hybrid Recommendation. Namun, pada tampilan user, informasi teknis tidak ditampilkan agar user awam dapat memahami rekomendasi dengan bahasa yang lebih natural.

## 24. Perbedaan Tampilan Rekomendasi User dan Admin

Sistem membedakan penyajian informasi rekomendasi berdasarkan role.

User melihat rekomendasi dengan bahasa natural, seperti "For You", "Sangat Disarankan untuk Pelengkap Ruangan Anda", dan "Inspirasi Produk Lainnya".

Admin memiliki halaman khusus `recommendations.html` untuk melihat informasi teknis rekomendasi, seperti CBF, CF, Hybrid, similarity score, final score, implicit preference score, dan rule rekomendasi pelengkap ruangan.

Tujuannya adalah agar admin dapat memantau dan memvalidasi proses rekomendasi tanpa membingungkan user awam.

## 25. Dataset Demo

Dataset demo pada sistem disusun berdasarkan kategori produk, kategori ruangan, material, style, dan warna dominan.

Data interaksi pengguna tidak dibuat secara acak, melainkan berdasarkan persona preferensi. Hal ini dilakukan agar pola interaksi antar pengguna dapat digunakan oleh User-Based Collaborative Filtering dalam mencari kemiripan preferensi.

Seed 18A menyediakan 54 produk dengan distribusi 6 produk per category final dan 12 user demo dengan minat yang jelas, seperti Kamar Tidur Japandi, Mini Bar Modern, Ruang Makan Japandi, dan Minimalis lintas ruangan.

Interaksi demo hanya memakai like aktif, wishlist aktif, dan tanya admin. Sinyal page view atau click tidak digunakan sebagai sumber preferensi rekomendasi.

## 26. Penyederhanaan Tampilan Profile User

Halaman profile user dibuat sederhana agar user hanya melihat informasi yang relevan, yaitu informasi akun, produk yang disukai, dan wishlist. Riwayat interaksi, ringkasan aktivitas, dan skor aktivitas tidak ditampilkan pada user biasa karena informasi tersebut bersifat teknis dan digunakan untuk proses rekomendasi di sisi sistem.

Informasi teknis rekomendasi tetap tersedia untuk admin melalui halaman `recommendations.html`, sehingga pemisahan antara tampilan user dan tampilan analisis admin tetap jelas.

## 27. Smooth Scroll pada Antarmuka

Smooth scroll digunakan untuk meningkatkan kenyamanan navigasi ketika user berpindah ke section lain dalam halaman yang sama, seperti dari menu Produk atau tombol Lihat Produk menuju daftar produk.

Section tujuan memakai scroll margin agar judul section tidak tertutup navbar sticky.
