# 🚀 Backend Setup Guide - MySQL + Node.js

## 📋 Prerequisites

- **Node.js** (v14+) - https://nodejs.org/
- **MySQL** (v5.7+) - https://www.mysql.com/
- **npm** (comes with Node.js)

---

## 1️⃣ **Install MySQL**

### Windows:
```bash
# Download dari https://www.mysql.com/downloads/
# Atau gunakan installer
# Atau pakai package manager:
choco install mysql
```

### Linux:
```bash
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

### macOS:
```bash
brew install mysql
brew services start mysql
```

**Verify MySQL installed:**
```bash
mysql --version
```

---

## 2️⃣ **Create Database**

### Open MySQL:
```bash
# Windows/Linux/macOS
mysql -u root -p
```

Masukkan password (atau Enter jika belum ada password)

### Inside MySQL Console:
```sql
-- Copy semua isi dari backend/database.sql
-- Paste ke MySQL console
-- Atau jalankan:

source backend/database.sql
```

**Verify database created:**
```sql
SHOW DATABASES;  -- Lihat database perpustakaan
USE perpustakaan;
SHOW TABLES;     -- Lihat semua tables
```

---

## 3️⃣ **Setup Backend Application**

### Step 1: Navigate to backend folder
```bash
cd backend
```

### Step 2: Install dependencies
```bash
npm install
```

**Output yang diharapkan:**
```
added 50+ packages in X seconds
```

### Step 3: Check .env file
```bash
# Edit file: backend/.env
# Pastikan value ini sesuai dengan MySQL Anda:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          # Isi dengan password MySQL Anda (kosongkan jika tidak ada)
DB_NAME=perpustakaan

PORT=3000
NODE_ENV=development
```

### Step 4: Start server
```bash
# Dengan npm
npm start

# Atau dengan nodemon (auto-restart saat code berubah)
npm run dev
```

**Expected output:**
```
╔═══════════════════════════════════════════════════════╗
║     🎉 PERPUSTAKAAN API SERVER RUNNING                ║
║     ✅ Server: http://localhost:3000                  ║
║     ✅ Database: Connected                           ║
║     ✅ Environment: development                      ║
╚═══════════════════════════════════════════════════════╝
```

---

## 4️⃣ **Test API Endpoints**

### Test 1: Health Check
```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{"status":"OK","message":"Server is running"}
```

### Test 2: Get All Books
```bash
curl http://localhost:3000/api/buku
```

**Expected response (JSON array dengan buku-buku):**
```json
[
  {
    "id": 1,
    "judul": "JavaScript untuk Pemula",
    "pengarang": "John Doe",
    "isbn": "978-1234567890",
    "stok": 5,
    ...
  }
]
```

### Test 3: Add New Book
```bash
curl -X POST http://localhost:3000/api/buku \
  -H "Content-Type: application/json" \
  -d '{
    "judul": "React Basics",
    "pengarang": "Jane Doe",
    "penerbit": "React Books",
    "tahun": 2024,
    "isbn": "978-4444444444",
    "kategori": "Teknologi",
    "stok": 4,
    "deskripsi": "Pelajari React dari dasar"
  }'
```

### Test 4: Register User
```bash
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Eka Surya",
    "nim": "210101004",
    "username": "eka123",
    "password": "password123"
  }'
```

### Test 5: Login User
```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "budi123",
    "password": "password123"
  }'
```

---

## 🔌 **API Endpoints Summary**

### Books
```
GET    /api/buku              - Get all books
GET    /api/buku/:id          - Get book by ID
POST   /api/buku              - Create new book
PUT    /api/buku/:id          - Update book
DELETE /api/buku/:id          - Delete book
GET    /api/buku/search/:keyword - Search books
```

### Users
```
POST   /api/user/register     - Register user
POST   /api/user/login        - Login user
GET    /api/user              - Get all users
GET    /api/user/:id          - Get user by ID
```

### Peminjaman (Borrowing)
```
POST   /api/peminjaman        - Create borrowing
GET    /api/peminjaman        - Get all borrowings
GET    /api/peminjaman/user/:user_id - Get user borrowings
PUT    /api/peminjaman/:id/return    - Return book
```

### Denda (Penalties)
```
POST   /api/denda             - Add penalty
GET    /api/denda             - Get all penalties
GET    /api/denda/user/:user_id - Get user penalties
PUT    /api/denda/:id/bayar   - Pay penalty
```

---

## 🧪 **Testing dengan Postman**

1. Download Postman: https://www.postman.com/downloads/
2. Import collection dari `backend/postman-collection.json` (jika ada)
3. Atau buat requests secara manual

**Example dalam Postman:**

**Request 1: Add Book**
```
Method: POST
URL: http://localhost:3000/api/buku
Headers: Content-Type: application/json
Body (JSON):
{
  "judul": "Docker for Beginners",
  "pengarang": "David Smith",
  "penerbit": "Tech Books",
  "tahun": 2024,
  "isbn": "978-5555555555",
  "kategori": "Teknologi",
  "stok": 3,
  "deskripsi": "Pelajari Docker dan containerization"
}
```

---

## ⚠️ **Common Issues & Solutions**

### Issue: "connect ECONNREFUSED 127.0.0.1:3306"
```
❌ MySQL server tidak running
✅ Solution: 
  - Windows: Start MySQL dari Services
  - Linux: sudo service mysql start
  - macOS: brew services start mysql
```

### Issue: "ER_ACCESS_DENIED_FOR_USER"
```
❌ Password salah atau user tidak ada
✅ Solution:
  - Cek password di .env file
  - Sesuaikan dengan MySQL user Anda
  - Reset password jika perlu
```

### Issue: "ER_BAD_DB_ERROR"
```
❌ Database 'perpustakaan' belum dibuat
✅ Solution:
  - Run: source backend/database.sql
  - Atau run SQL queries manual di MySQL
```

### Issue: "Port 3000 already in use"
```
❌ Port 3000 sudah digunakan aplikasi lain
✅ Solution:
  - Gunakan port lain di .env (PORT=3001)
  - Atau stop aplikasi lain yang pakai port 3000
  - Windows: netstat -ano | findstr :3000
  - Linux: lsof -i :3000
```

---

## 📦 **Folder Structure**

```
backend/
├── server.js              (Main server file)
├── config.js              (Database configuration)
├── env-config.js          (Environment variables)
├── database.sql           (Database schema & sample data)
├── package.json           (Dependencies)
├── .env                   (Environment variables - LOCAL)
├── .env.example           (Template untuk .env)
│
├── routes/
│   ├── buku.js            (Books API routes)
│   ├── user.js            (Users API routes)
│   ├── peminjaman.js      (Borrowing API routes)
│   └── denda.js           (Penalty API routes)
│
└── middleware/            (Placeholder for middleware)
```

---

## 🔄 **Workflow**

### Add New Book:
```
Frontend Form Submit
    ↓
POST /api/buku
    ↓
Backend Validation
    ↓
Insert to MySQL
    ↓
Return JSON response
    ↓
Frontend Display Book
```

### User Borrowing:
```
Member Select Book
    ↓
POST /api/peminjaman
    ↓
Check Book Stok
    ↓
Create Peminjaman Record
    ↓
Update Stok (stok - 1)
    ↓
Return Success Message
```

---

## 🔐 **Security Notes**

1. **Password Hashing**: Menggunakan bcryptjs
2. **SQL Injection**: Menggunakan prepared statements
3. **CORS**: Enabled untuk frontend development
4. **JWT**: Siap untuk implementasi authentication

---

## 📚 **Database Schema Overview**

**BUKU**
- Menyimpan informasi buku
- Fields: judul, pengarang, penerbit, tahun, isbn, kategori, stok

**USERS**
- Menyimpan data member/user
- Fields: nama, nim, username, password (hashed)

**PEMINJAMAN**
- Menyimpan data peminjaman
- Relasi dengan USERS dan BUKU
- Track tanggal pinjam & kembali

**DENDA**
- Menyimpan data denda/penalty
- Relasi dengan PEMINJAMAN
- Track nominal dan status pembayaran

---

## 🚀 **Next Steps**

1. ✅ Setup MySQL & Backend
2. ✅ Test API dengan curl/Postman
3. ⬜ Connect Frontend ke Backend API
4. ⬜ Remove localStorage, gunakan API calls
5. ⬜ Deploy ke production

---

## 📞 **Support**

- MySQL Documentation: https://dev.mysql.com/doc/
- Express.js Guide: https://expressjs.com/
- MySQL2 Package: https://github.com/sidorares/node-mysql2

---

**Status**: ✅ Backend Setup Ready  
**Version**: 1.0.0  
**Last Updated**: 14 Januari 2026
