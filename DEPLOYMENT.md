# Deployment Plan — AWS Track A (EC2 + RDS MySQL)

Dokumen ini berisi rencana dan langkah awal deployment aplikasi **Inventory API** ke **AWS Learner Lab** menggunakan **Amazon EC2** dan **Amazon RDS MySQL** (`us-east-1`).

## 1. Prasyarat di AWS Learner Lab
- Sesi **AWS Learner Lab** aktif dengan saldo kredit yang mencukupi.
- Menggunakan jaringan **VPC** pada region yang sama untuk instance EC2 dan database RDS MySQL.
- Aturan **Security Group** selaras dengan desain arsitektur:
  - **Security Group EC2 (`app-sg`):** Mengizinkan akses port aplikasi (misalnya `3000` atau `80`/`8080` sesuai port yang dipakai) dan akses administrasi/SSH saat pengujian.
  - **Security Group RDS (`db-sg`):** Mengizinkan koneksi masuk pada port `3306` dengan sumber dari Security Group EC2 (`app-sg`).

## 2. Menyiapkan RDS MySQL
1. Buat database **RDS MySQL** di AWS Learner Lab dan catat informasi koneksinya:
   - Endpoint (`DB_HOST`)
   - Port (`3306`)
   - Master username & password (`DB_USER`, `DB_PASSWORD`)
   - Nama database (`DB_NAME`, misalnya `inventory_db`)
2. Pastikan database dan tabel `inventory_items` sudah dibuat menggunakan query di `sql/schema.sql`.

## 3. Menyiapkan & Menjalankan Aplikasi di EC2
1. Luncurkan instance **EC2** lalu hubungkan ke terminal server (SSH / Session Manager).
2. Pasang **Node.js** dan **Git** di instance EC2 bila belum tersedia.
3. *Clone* repositori proyek ke EC2 dan masuk ke folder proyek:
   ```bash
   git clone https://github.com/JosiahHermes/cloud-inventory-ec2-rds.git
   cd cloud-inventory-ec2-rds
   npm install