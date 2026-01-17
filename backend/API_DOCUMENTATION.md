# 📚 API Documentation - Perpustakaan Digital

**Base URL**: `http://localhost:3000/api`

---

## 📖 BOOKS API

### 1. Get All Books
```
GET /buku
```

**Description**: Mengambil semua data buku dari database

**Response**:
```json
[
  {
    "id": 1,
    "judul": "JavaScript untuk Pemula",
    "pengarang": "John Doe",
    "penerbit": "Tech Press",
    "tahun": 2023,
    "isbn": "978-1234567890",
    "kategori": "Teknologi",
    "stok": 5,
    "deskripsi": "Panduan lengkap belajar JavaScript dari nol",
    "created_at": "2026-01-14T10:30:00.000Z"
  }
]
```

---

### 2. Get Book by ID
```
GET /buku/:id
```

**Parameters**:
- `id` (integer, required): Book ID

**Example**:
```
GET /buku/1
```

**Response**:
```json
{
  "id": 1,
  "judul": "JavaScript untuk Pemula",
  "pengarang": "John Doe",
  "penerbit": "Tech Press",
  "tahun": 2023,
  "isbn": "978-1234567890",
  "kategori": "Teknologi",
  "stok": 5,
  "deskripsi": "Panduan lengkap belajar JavaScript dari nol",
  "created_at": "2026-01-14T10:30:00.000Z"
}
```

**Error Response** (404):
```json
{
  "error": "Buku tidak ditemukan"
}
```

---

### 3. Create New Book
```
POST /buku
```

**Request Body**:
```json
{
  "judul": "React Basics",
  "pengarang": "Jane Doe",
  "penerbit": "React Books",
  "tahun": 2024,
  "isbn": "978-4444444444",
  "kategori": "Teknologi",
  "stok": 4,
  "deskripsi": "Pelajari React dari dasar"
}
```

**Required Fields**: judul, pengarang, isbn, stok

**Response** (201):
```json
{
  "id": 6,
  "message": "Buku berhasil ditambahkan"
}
```

**Error Response** (400):
```json
{
  "error": "Data tidak lengkap"
}
```

---

### 4. Update Book
```
PUT /buku/:id
```

**Parameters**:
- `id` (integer, required): Book ID

**Request Body**:
```json
{
  "judul": "React Advanced",
  "pengarang": "Jane Doe",
  "penerbit": "React Books",
  "tahun": 2024,
  "isbn": "978-4444444444",
  "kategori": "Teknologi",
  "stok": 5,
  "deskripsi": "Pelajari React tingkat lanjut"
}
```

**Response**:
```json
{
  "message": "Buku berhasil diupdate"
}
```

---

### 5. Delete Book
```
DELETE /buku/:id
```

**Parameters**:
- `id` (integer, required): Book ID

**Response**:
```json
{
  "message": "Buku berhasil dihapus"
}
```

---

### 6. Search Books
```
GET /buku/search/:keyword
```

**Parameters**:
- `keyword` (string, required): Keyword untuk mencari

**Example**:
```
GET /buku/search/JavaScript
```

**Response**:
```json
[
  {
    "id": 1,
    "judul": "JavaScript untuk Pemula",
    "pengarang": "John Doe",
    ...
  }
]
```

---

## 👥 USERS API

### 1. Register User
```
POST /user/register
```

**Request Body**:
```json
{
  "nama": "Eka Surya",
  "nim": "210101004",
  "username": "eka123",
  "password": "password123"
}
```

**Required Fields**: nama, nim, username, password

**Response** (201):
```json
{
  "id": 4,
  "message": "Registrasi berhasil"
}
```

**Error Response** (400):
```json
{
  "error": "Username sudah terdaftar"
}
```

---

### 2. Login User
```
POST /user/login
```

**Request Body**:
```json
{
  "username": "budi123",
  "password": "password123"
}
```

**Response**:
```json
{
  "message": "Login berhasil",
  "user": {
    "id": 1,
    "nama": "Budi Santoso",
    "nim": "210101001",
    "username": "budi123",
    "created_at": "2026-01-14T10:30:00.000Z"
  }
}
```

**Error Response** (401):
```json
{
  "error": "Password salah"
}
```

---

### 3. Get All Users
```
GET /user
```

**Response**:
```json
[
  {
    "id": 1,
    "nama": "Budi Santoso",
    "nim": "210101001",
    "username": "budi123",
    "created_at": "2026-01-14T10:30:00.000Z"
  }
]
```

---

### 4. Get User by ID
```
GET /user/:id
```

**Parameters**:
- `id` (integer, required): User ID

**Response**:
```json
{
  "id": 1,
  "nama": "Budi Santoso",
  "nim": "210101001",
  "username": "budi123",
  "created_at": "2026-01-14T10:30:00.000Z"
}
```

---

## 📤 BORROWING API

### 1. Create Borrowing
```
POST /peminjaman
```

**Request Body**:
```json
{
  "user_id": 1,
  "buku_id": 1,
  "tgl_pinjam": "2026-01-14",
  "tgl_kembali": "2026-01-21"
}
```

**Required Fields**: user_id, buku_id, tgl_pinjam, tgl_kembali

**Response** (201):
```json
{
  "id": 5,
  "message": "Peminjaman berhasil"
}
```

**Error Response** (400):
```json
{
  "error": "Stok buku habis"
}
```

---

### 2. Get All Borrowings
```
GET /peminjaman
```

**Response**:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "buku_id": 1,
    "nama": "Budi Santoso",
    "judul": "JavaScript untuk Pemula",
    "tgl_pinjam": "2026-01-10",
    "tgl_kembali": "2026-01-17",
    "status": "Dipinjam",
    "created_at": "2026-01-10T10:30:00.000Z"
  }
]
```

---

### 3. Get User Borrowings
```
GET /peminjaman/user/:user_id
```

**Parameters**:
- `user_id` (integer, required): User ID

**Response**:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "buku_id": 1,
    "nama": "Budi Santoso",
    "judul": "JavaScript untuk Pemula",
    "pengarang": "John Doe",
    "tgl_pinjam": "2026-01-10",
    "tgl_kembali": "2026-01-17",
    "status": "Dipinjam"
  }
]
```

---

### 4. Return Book
```
PUT /peminjaman/:id/return
```

**Parameters**:
- `id` (integer, required): Borrowing ID

**Response**:
```json
{
  "message": "Buku berhasil dikembalikan"
}
```

---

## 💰 PENALTY API

### 1. Add Penalty
```
POST /denda
```

**Request Body**:
```json
{
  "peminjaman_id": 1,
  "nominal": 50000,
  "alasan": "Keterlambatan pengembalian 5 hari"
}
```

**Required Fields**: peminjaman_id, nominal, alasan

**Response** (201):
```json
{
  "id": 1,
  "message": "Denda berhasil ditambahkan"
}
```

---

### 2. Get All Penalties
```
GET /denda
```

**Response**:
```json
[
  {
    "id": 1,
    "peminjaman_id": 1,
    "user_id": 1,
    "nama": "Budi Santoso",
    "judul": "JavaScript untuk Pemula",
    "nominal": 50000,
    "alasan": "Keterlambatan pengembalian 5 hari",
    "status": "Belum dibayar",
    "created_at": "2026-01-18T10:30:00.000Z"
  }
]
```

---

### 3. Get User Penalties
```
GET /denda/user/:user_id
```

**Parameters**:
- `user_id` (integer, required): User ID

**Response**:
```json
[
  {
    "id": 1,
    "peminjaman_id": 1,
    "judul": "JavaScript untuk Pemula",
    "nominal": 50000,
    "alasan": "Keterlambatan pengembalian 5 hari",
    "status": "Belum dibayar"
  }
]
```

---

### 4. Pay Penalty
```
PUT /denda/:id/bayar
```

**Parameters**:
- `id` (integer, required): Penalty ID

**Response**:
```json
{
  "message": "Denda berhasil dibayar"
}
```

---

## 🏥 HEALTH CHECK

### Health Status
```
GET /health
```

**Response**:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## 📊 Data Types & Formats

### Date Format
```
YYYY-MM-DD
Example: 2026-01-14
```

### Decimal Format (untuk nominal)
```
Currency (2 decimal places)
Example: 50000.00
```

### Status Values
```
Peminjaman Status:
- "Dipinjam" - Book is borrowed
- "Kembali" - Book returned

Denda Status:
- "Belum dibayar" - Not paid
- "Sudah dibayar" - Paid
```

### Kategori Buku
```
- Teknologi
- Referensi
- Fiksi
- Non-Fiksi
- Seni
- Bisnis
(Dapat ditambah sesuai kebutuhan)
```

---

## ⚠️ Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | Data tidak lengkap | Pastikan semua field required terisi |
| 400 | Username sudah terdaftar | Gunakan username yang berbeda |
| 400 | Stok buku habis | Pilih buku lain yang tersedia |
| 401 | Password salah | Pastikan password benar |
| 404 | Buku tidak ditemukan | Periksa ID buku |
| 404 | User tidak ditemukan | Periksa ID user |
| 500 | Internal Server Error | Check server logs |

---

## 🧪 Testing Examples

### Using curl

**Get all books:**
```bash
curl http://localhost:3000/api/buku
```

**Add new book:**
```bash
curl -X POST http://localhost:3000/api/buku \
  -H "Content-Type: application/json" \
  -d '{
    "judul": "Test Book",
    "pengarang": "Test Author",
    "penerbit": "Test Publisher",
    "tahun": 2024,
    "isbn": "978-9999999999",
    "kategori": "Teknologi",
    "stok": 1
  }'
```

**Login user:**
```bash
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "budi123",
    "password": "password123"
  }'
```

---

## 📝 Response Format

### Success Response
```json
{
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": "Error message here"
}
```

---

**API Version**: 1.0.0  
**Last Updated**: 14 Januari 2026
