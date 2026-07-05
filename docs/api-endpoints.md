# API Endpoints

Base URL backend lokal:

```text
http://localhost:5000
```

Response sukses memakai format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

Response error memakai format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": null
}
```

## Authentication

```http
GET /auth/google
GET /auth/google/callback
GET /auth/me
POST /auth/register
POST /auth/login
POST /auth/logout
GET /auth/failure
```

Register local:

```http
POST /auth/register
Content-Type: application/json
```

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "name": "New User",
  "password": "newuser123"
}
```

Login local:

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "identifier": "admin",
  "password": "admin12345"
}
```

`identifier` dapat berisi username atau email.

`GET /auth/me` mengembalikan status session:

```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "google_id": null,
    "username": "admin",
    "name": "User Name",
    "email": "user@example.com",
    "avatar_url": null,
    "role": "user",
    "auth_provider": "local"
  }
}
```

Response auth tidak mengirim `password_hash`.

Demo local accounts:

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

Password local disimpan dalam bentuk hash menggunakan bcryptjs. User Google tidak memiliki `password_hash`. Register manual selalu menghasilkan role `user`.

## Products

Public products:

```http
GET /products
GET /products/:id
```

Query `GET /products`:

- `category`
- `search`
- `limit`
- `offset`

Admin products:

```http
GET /admin/products
GET /admin/products/:id
POST /admin/products
PUT /admin/products/:id
DELETE /admin/products/:id
DELETE /admin/products/:id/permanent
```

Query `GET /admin/products`:

- `category`
- `status`
- `search`
- `limit`
- `offset`

Product category yang valid:

- Kitchen Set
- Living Set
- Bedset
- Minibar
- Meja
- Kursi
- Lemari
- Nakas
- Meja Rias

Material utama yang valid:

- HPL
- Kayu
- Logam
- Kaca
- Linen
- Kayu + Logam
- Logam + Linen
- Kayu + Linen
- HPL + Kaca

Material variant yang valid:

- Tidak Ada
- Woodgrain
- Solid
- Marble
- Glossy

Room category yang valid:

- Ruang Tamu
- Ruang Makan
- Dapur
- Kamar Tidur
- Mini Bar

Style theme yang valid:

- Modern
- Minimalis
- Japandi

Stock rules:

- `Meja`, `Kursi`, `Lemari`, `Nakas`, dan `Meja Rias` wajib mengirim `stock` integer minimal 0.
- `Kitchen Set`, `Living Set`, `Bedset`, dan `Minibar` disimpan dengan `stock: null`.

Admin product payload:

```json
{
  "name": "Nakas HPL Woodgrain",
  "image_url": "https://placehold.co/600x400",
  "category": "Nakas",
  "material": "HPL",
  "material_variant": "Woodgrain",
  "style_theme": "Japandi",
  "dominant_color": "Beige",
  "room_category": "Kamar Tidur",
  "description": "Nakas minimalis dengan finishing HPL woodgrain.",
  "price": 1200000,
  "stock": 10,
  "status": "active"
}
```

Contoh payload category stock-tracked:

```json
{
  "name": "Kursi Japandi Linen",
  "image_url": "https://placehold.co/600x400?text=Kursi+Japandi",
  "category": "Kursi",
  "material": "Kayu + Linen",
  "material_variant": "Tidak Ada",
  "style_theme": "Japandi",
  "dominant_color": "Beige",
  "room_category": "Ruang Makan",
  "description": "Kursi bergaya Japandi dengan material kayu jati dan dudukan linen.",
  "price": 1250000,
  "stock": 15,
  "status": "active"
}
```

`DELETE /admin/products/:id` melakukan soft delete dengan mengubah status menjadi `inactive`.

## Admin Product Permanent Delete

Status: Updated in Bagian 16

### DELETE /admin/products/:id/permanent

Menghapus produk secara permanen.

Auth:

- Required
- Admin only

Behavior:

- Produk tetap dapat dihapus walaupun memiliki aktivitas user.
- Sistem akan menghapus data terkait produk dari:
  - `product_likes`
  - `product_wishlists`
  - `interactions`
- Proses dilakukan menggunakan database transaction.
- Jika terjadi error, proses dibatalkan dengan rollback.

Response success:

```json
{
  "success": true,
  "message": "Product permanently deleted successfully",
  "data": {
    "deleted_product": {},
    "deleted_related_activity": {
      "likes": 0,
      "wishlists": 0,
      "interactions": 0
    }
  }
}
```

## Interactions

Semua endpoint interaction membutuhkan login.

```http
POST /interactions/view
POST /interactions/like
DELETE /interactions/like/:productId
POST /interactions/wishlist
DELETE /interactions/wishlist/:productId
POST /interactions/favorite
POST /interactions/whatsapp
GET /interactions/product-state/:productId
GET /interactions/my-liked-products
GET /interactions/my-wishlist-products
GET /interactions/my-history
GET /interactions/my-ratings
GET /interactions/my-summary
```

Body logging interaction:

```json
{
  "product_id": "uuid-product"
}
```

Query `GET /interactions/my-history`:

- `limit`
- `offset`
- `interaction_type`

Nilai `interaction_type`:

- `page_view`
- `like`
- `favorite`
- `whatsapp_inquiry`

## Interaction State and Toggle

Status: Implemented in Bagian 11B

- `GET /interactions/product-state/:productId`
- `POST /interactions/like`
- `DELETE /interactions/like/:productId`
- `POST /interactions/wishlist`
- `DELETE /interactions/wishlist/:productId`

Notes:

- Like and wishlist active states are stored separately from interaction logs.
- `product_likes` stores current active like state.
- `product_wishlists` stores current active wishlist state.
- Wishlist UI is recorded as `favorite` in the `interactions` table for legacy history/profile data.
- Unlike and unwishlist do not add positive interaction logs.
- `POST /interactions/favorite` remains available as a backward-compatible alias to wishlist.

Product state response:

```json
{
  "product_id": "uuid",
  "liked": true,
  "wishlisted": false
}
```

## Private User Product Lists

### GET /interactions/my-liked-products

Mengambil daftar produk yang sedang di-like oleh user yang sedang login.

Auth: Required

Query:

- `page` optional, default `1`
- `limit` optional, default `12`, maksimum `24`

Response:

```json
{
  "products": [],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total_items": 0,
    "total_pages": 0,
    "has_previous_page": false,
    "has_next_page": false
  }
}
```

Catatan:

- Endpoint ini private.
- User tidak bisa mengambil daftar like milik user lain.
- Endpoint memakai user dari session backend, bukan `user_id` dari query/body.
- Data diambil dari state aktif `product_likes`.
- Pagination dipakai oleh profile agar maksimal 12 produk tampil per halaman.

### GET /interactions/my-wishlist-products

Mengambil daftar produk yang sedang masuk wishlist user yang sedang login.

Auth: Required

Query:

- `page` optional, default `1`
- `limit` optional, default `12`, maksimum `24`

Response:

```json
{
  "products": [],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total_items": 0,
    "total_pages": 0,
    "has_previous_page": false,
    "has_next_page": false
  }
}
```

Catatan:

- Endpoint ini private.
- User tidak bisa mengambil wishlist milik user lain.
- Endpoint memakai user dari session backend, bukan `user_id` dari query/body.
- Data diambil dari state aktif `product_wishlists`.
- Pagination dipakai oleh profile agar maksimal 12 produk tampil per halaman.

## Recommendations

```http
GET /recommendations/user-based
GET /recommendations/content-based
GET /recommendations/hybrid
GET /recommendations/personal
GET /recommendations/cold-start
GET /recommendations/room-complementary/:productId
```

Authentication:

- `/recommendations/user-based`: login required
- `/recommendations/content-based`: login required
- `/recommendations/hybrid`: login required
- `/recommendations/personal`: login required
- `/recommendations/cold-start`: public
- `/recommendations/room-complementary/:productId`: public

Query:

- `limit`: default 10, maksimal 10

Skor rekomendasi:

- CBF memakai `score`.
- User-Based CF memakai `score` dan `cf_score` yang sama-sama bernilai 0 sampai 1.
- User-Based CF juga mengirim `predicted_preference_score` pada skala 0 sampai 5.
- Hybrid memakai `cbf_score`, `cf_score`, dan `final_score`.

User-Based CF memakai skor preferensi implisit dari view `user_product_preference_scores`:

- Like aktif dari `product_likes` = 1.0
- Wishlist aktif dari `product_wishlists` = 1.5
- Pernah tanya admin dari `interactions.whatsapp_inquiry` = 2.5

`page_view`, log historis `like`, dan log historis `favorite` tidak digunakan sebagai sumber nilai CF.

Metadata response `/recommendations/user-based` berisi:

```json
{
  "scoring_method": "implicit_preference_score",
  "scoring_weights": {
    "like": 1,
    "wishlist": 1.5,
    "whatsapp_inquiry": 2.5
  },
  "page_view_used_for_cf": false,
  "cf_score_normalized": true
}
```

Formula hybrid:

```text
Final Score = (0.7 x CBF Score) + (0.3 x CF Score)
```

## Recommendation Access Rules

Halaman `recommendations.html` digunakan sebagai halaman analisis teknis rekomendasi dan hanya dapat diakses oleh admin.

Endpoint rekomendasi yang digunakan oleh halaman user-facing, seperti homepage dan product detail, tetap dapat diakses sesuai kebutuhan sistem dan tidak semuanya dikunci admin.

Endpoint user-facing yang tetap dipakai frontend:

```http
GET /recommendations/cold-start
GET /recommendations/content-based
GET /recommendations/hybrid
GET /recommendations/room-complementary/:productId
```

Jika tersedia endpoint teknis khusus admin pada pengembangan berikutnya, endpoint tersebut harus menggunakan middleware `requireAdmin`.

## GET /recommendations/room-complementary/:productId

Mengambil rekomendasi produk pelengkap berdasarkan `room_category` produk aktif.

Auth:

- Not required

Query:

- `limit`: number, default 6, maksimal 6

Behavior:

- Membaca `room_category` produk aktif.
- Mengambil produk aktif lain dalam `room_category` yang sama.
- Memprioritaskan category pelengkap berdasarkan rule ruangan.
- Tidak menggunakan harga.
- Tidak menampilkan produk yang sedang dibuka.

Example:

- Jika produk aktif berada di `room_category` Kamar Tidur, sistem dapat merekomendasikan Lemari, Nakas, dan Meja Rias.

## Health Check

```http
GET /health
GET /auth/health
GET /products/health
GET /admin/products/health
GET /interactions/health
GET /recommendations/health
```
