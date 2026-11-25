# Inventory API — AWS Track A (EC2 + RDS MySQL)

Repositori ini berisi rancangan awal dan pondasi kode untuk layanan **Manajemen Inventaris** sederhana yang disiapkan di **AWS Learner Lab** menggunakan **Track A (Amazon EC2 + Amazon RDS MySQL)**.

Fokus utama di tahap ini bukan bikin aplikasi yang sudah serba kompleks, melainkan memastikan desain sistemnya masuk akal, alur jaringan dan keamanannya jelas, struktur data dan endpoint CRUD-nya rapi, serta koneksi awal antara server aplikasi dan database di AWS bisa diuji.

## Gambaran Umum Proyek
Di proyek ini, aplikasi inventaris dipakai untuk mencatat dan memantau data barang atau aset secara dasar—mulai dari menambah item baru, melihat daftar/detail item, memperbarui stok atau status barang, sampai menghapus item yang sudah tidak dipakai.

### Kenapa Pakai Track A?
- **Amazon EC2** dipakai sebagai server aplikasi backend/API supaya kontrol lingkungan, instalasi *runtime*, pengaturan *environment variable*, dan pengujian koneksi lebih mudah dipantau.
- **Amazon RDS MySQL** dipakai sebagai database relasional untuk menyimpan data inventaris secara terstruktur dan terkelola.

## Ringkasan Arsitektur
Secara garis besar, alur sistemnya berjalan di dalam **VPC** pada lingkungan **AWS Learner Lab** (`us-east-1`):
1. **User / API Client** (seperti Postman, browser, atau `curl`) mengirim *request* CRUD (HTTP/HTTPS) ke server aplikasi.
2. **Amazon EC2** (`app-sg`) memproses *request* dan mengirim *query* SQL ke database.
3. **Amazon RDS MySQL** (`db-sg`) menerima koneksi database pada port `3306` (diarahkan dari *security group* EC2) lalu mengembalikan data ke aplikasi.
4. **IAM & Keamanan Lab:** Akses AWS mengikuti peran/kredensial bawaan sesi AWS Learner Lab tanpa membuat IAM user/role baru di luar aturan lab, sementara koneksi ke MySQL memakai kredensial database yang diatur lewat *environment variable*.

## Entitas Data: `InventoryItem`
Sistem ini memakai satu entitas utama agar fokus dan mudah dikembangkan:

| Field | Tipe Data | Keterangan | Contoh |
| :--- | :--- | :--- | :--- |
| `id` | Integer / UUID | Identifier unik tiap item | `1` |
| `sku` | String | Kode barang inventaris | `INV-001` |
| `name` | String | Nama barang atau aset | `Laptop ThinkPad` |
| `quantity` | Integer | Jumlah stok barang | `10` |
| `status` | String / Enum | Status barang | `AVAILABLE` / `IN_USE` / `MAINTENANCE` |
| `updated_at` | Timestamp | Waktu pembaruan terakhir | `2026-11-25T13:00:00Z` |

## Rancangan 4 Endpoint CRUD
- `POST /items` — **Create:** Menambahkan data barang inventaris baru.
- `GET /items` (dan opsional `GET /items/{id}`) — **Read:** Mengambil daftar barang atau detail satu barang.
- `PUT /items/{id}` — **Update:** Memperbarui informasi barang (seperti nama, jumlah stok, atau status).
- `DELETE /items/{id}` — **Delete:** Menghapus data barang dari inventaris.

## Catatan Penggunaan AWS Learner Lab
Karena kredit di AWS Learner Lab terbatas dan **tidak bisa di-reset**, biasakan menghentikan atau menghapus *resource* (seperti instance EC2 atau RDS) setelah selesai melakukan pengujian dan mengambil bukti (*evidence*) agar saldo tidak terus terpotong.

## Penulis
- **Nama:** `Josiah Hermes`
- **NIU:** `543958`