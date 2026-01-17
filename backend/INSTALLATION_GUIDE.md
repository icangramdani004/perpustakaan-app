# 🚀 PERPUSTAKAAN BACKEND SETUP - STEP BY STEP

## 📋 CHECKLIST

- [ ] Install Node.js
- [ ] Install MySQL
- [ ] Create Database
- [ ] Install Backend Dependencies
- [ ] Configure .env file
- [ ] Start Backend Server
- [ ] Test API Endpoints
- [ ] Connect Frontend

---

## 1️⃣ **INSTALL NODE.JS**

### Windows:
1. Download dari: https://nodejs.org/ (LTS version)
2. Run installer
3. Follow installation wizard
4. Restart computer

### Linux (Ubuntu/Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### macOS:
```bash
brew install node
```

### Verify installation:
```bash
node --version    # Should show v14+
npm --version     # Should show v6+
```

---

## 2️⃣ **INSTALL MYSQL**

### Windows:
1. Download from: https://dev.mysql.com/downloads/mysql/
2. Run MySQL Installer
3. Choose "Server only"
4. Configure MySQL Server:
   - Port: 3306 (default)
   - Config type: Server Machine
5. Configure MySQL Service
6. Complete installation

**Alternative (using Chocolatey):**
```bash
choco install mysql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install -y mysql-server
sudo mysql_secure_installation
```

### macOS:
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Verify MySQL installed:
```bash
mysql --version
```

### Start MySQL Service:

**Windows:**
- Services → MySQL80 (or your version) → Start

**Linux:**
```bash
sudo systemctl start mysql
sudo systemctl enable mysql
```

**macOS:**
```bash
brew services start mysql
```

---

## 3️⃣ **CREATE DATABASE**

### Step 1: Open MySQL Console

**Windows/Linux/macOS:**
```bash
mysql -u root -p
```

**When prompted for password:**
- If you set a password: enter it
- If no password: just press Enter

### Step 2: Run SQL Script

Inside MySQL console, run:

```sql
-- Copy and paste semua isi dari: backend/database.sql

DROP DATABASE IF EXISTS perpustakaan;
CREATE DATABASE perpustakaan;
USE perpustakaan;

-- Paste rest of SQL from database.sql file
-- ...
```

**OR run file directly:**

From terminal (outside MySQL):
```bash
mysql -u root -p perpustakaan < backend/database.sql
```

### Step 3: Verify Database Created

Inside MySQL console:
```sql
SHOW DATABASES;        -- Should see 'perpustakaan'
USE perpustakaan;
SHOW TABLES;           -- Should see 5 tables

SELECT * FROM buku LIMIT 3;  -- Should see sample books
```

### Step 4: Exit MySQL
```sql
EXIT;
```

---

## 4️⃣ **INSTALL BACKEND DEPENDENCIES**

### Step 1: Open Terminal/Command Prompt

Navigate to backend folder:
```bash
cd path/to/perpustakaan-appv1/backend
# Example: cd C:\pribadi\perpustakaan-appv1\backend
```

### Step 2: Install npm packages
```bash
npm install
```

**Expected output:**
```
added 50 packages in 10s
```

**Files created:**
- `node_modules/` folder
- `package-lock.json`

---

## 5️⃣ **CONFIGURE .ENV FILE**

### Step 1: Open `.env` file

Location: `backend/.env`

### Step 2: Edit configuration

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=              # Enter your MySQL password (empty if none)
DB_NAME=perpustakaan

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5500
```

### Important fields:
- `DB_PASSWORD`: Enter your MySQL password here
- `CORS_ORIGIN`: Frontend URL (adjust if frontend on different port)

---

## 6️⃣ **START BACKEND SERVER**

### Option A: Using npm start

```bash
npm start
```

### Option B: Using npm run dev (with auto-reload)

```bash
npm install -g nodemon    # Install once
npm run dev
```

### Expected output:
```
╔═══════════════════════════════════════════════════════╗
║     🎉 PERPUSTAKAAN API SERVER RUNNING                ║
║     ✅ Server: http://localhost:3000                  ║
║     ✅ Database: Connected                           ║
║     ✅ Environment: development                      ║
╚═══════════════════════════════════════════════════════╝
```

**If error appears:**
```
❌ Error: connect ECONNREFUSED
→ MySQL not running - start MySQL service

❌ Error: ER_ACCESS_DENIED_FOR_USER
→ Wrong password - check .env file

❌ Error: EADDRINUSE :::3000
→ Port 3000 in use - change PORT in .env
```

---

## 7️⃣ **TEST API ENDPOINTS**

### Using PowerShell (Windows):

```powershell
# Test 1: Health Check
Invoke-WebRequest -Uri "http://localhost:3000/api/health"

# Test 2: Get All Books
Invoke-WebRequest -Uri "http://localhost:3000/api/buku"

# Test 3: Add Book
$body = @{
    judul = "Test Book"
    pengarang = "Test Author"
    penerbit = "Test"
    tahun = 2024
    isbn = "978-9999999998"
    kategori = "Teknologi"
    stok = 1
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/buku" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

### Using Postman (GUI - Recommended):

1. Download Postman: https://www.postman.com/
2. Import collection OR create manual requests

**Test requests:**
```
1. GET http://localhost:3000/api/health
   → Should return: {"status":"OK","message":"Server is running"}

2. GET http://localhost:3000/api/buku
   → Should return array of books

3. POST http://localhost:3000/api/buku
   Headers: Content-Type: application/json
   Body: {
     "judul":"New Book",
     "pengarang":"Author",
     ...
   }
   → Should return: {"id":6,"message":"Buku berhasil ditambahkan"}
```

### Using Browser:

```
Get requests can be tested in browser:
http://localhost:3000/api/health
http://localhost:3000/api/buku
```

---

## 8️⃣ **CONNECT FRONTEND TO BACKEND**

### Update `admin-dashboard.html`:

Replace localhost API calls in JavaScript:

**Before (using localStorage):**
```javascript
const books = DB.getBuku();
```

**After (using API):**
```javascript
async function loadBooks() {
  const response = await fetch('http://localhost:3000/api/buku');
  const books = await response.json();
  // Display books...
}
```

### Update form submission:

**Before:**
```javascript
DB.saveBuku(books);
```

**After:**
```javascript
await fetch('http://localhost:3000/api/buku', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(bookData)
});
```

---

## 📁 **BACKEND FOLDER STRUCTURE**

```
backend/
├── server.js                  # Main server entry point
├── config.js                  # Database configuration
├── env-config.js              # Environment variables
├── package.json               # Dependencies
├── .env                       # Local environment vars
├── .env.example               # Template
├── database.sql               # Database schema + sample data
├── BACKEND_SETUP.md           # This file
├── API_DOCUMENTATION.md       # API endpoints documentation
│
├── routes/
│   ├── buku.js               # Books API routes
│   ├── user.js               # Users API routes
│   ├── peminjaman.js         # Borrowing API routes
│   └── denda.js              # Penalty API routes
│
├── middleware/               # For future middleware
│   └── (placeholder)
│
└── node_modules/             # Dependencies (generated)
```

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] Node.js installed (`node --version`)
- [ ] MySQL installed (`mysql --version`)
- [ ] MySQL service running
- [ ] Database 'perpustakaan' created
- [ ] Tables created (5 tables)
- [ ] Sample data inserted
- [ ] `npm install` completed
- [ ] `.env` file configured
- [ ] Backend server running (`npm start`)
- [ ] Health check returns OK
- [ ] Can GET /api/buku
- [ ] Can POST new book
- [ ] Can GET /api/user
- [ ] Can register new user

---

## 🔧 **TROUBLESHOOTING**

### MySQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306

Solution:
1. Check if MySQL is running
   Windows: Services → MySQL
   Linux: sudo systemctl status mysql
   macOS: brew services list

2. Check connection string in .env
   DB_HOST should be 'localhost' or '127.0.0.1'
   DB_PORT should be 3306 (default)
```

### Database Not Found
```
Error: ER_BAD_DB_ERROR: Unknown database 'perpustakaan'

Solution:
1. Run database.sql script
   mysql -u root -p < backend/database.sql
2. Verify database exists
   mysql -u root -p
   SHOW DATABASES;
   USE perpustakaan;
   SHOW TABLES;
```

### Port Already In Use
```
Error: EADDRINUSE :::3000

Solution:
1. Kill process on port 3000
   Windows: netstat -ano | findstr :3000
   Linux: lsof -i :3000 | kill
2. Or change PORT in .env to 3001
```

### Dependencies Error
```
Error: npm ERR! missing

Solution:
1. Delete node_modules folder
   rm -rf node_modules
2. Delete package-lock.json
3. Run npm install again
```

---

## 🎯 **COMMON TASKS**

### Change Database Password
Edit `.env`:
```env
DB_PASSWORD=your_new_password
```

### Change Server Port
Edit `.env`:
```env
PORT=3001
```
Access at: `http://localhost:3001`

### Stop Backend Server
```bash
Press Ctrl + C in terminal
```

### Restart Backend Server
```bash
Stop server (Ctrl+C)
Run: npm start
```

### Check Database Contents
```bash
mysql -u root -p
USE perpustakaan;
SELECT * FROM buku;
SELECT * FROM users;
SELECT * FROM peminjaman;
SELECT * FROM denda;
```

---

## 📞 **HELP & SUPPORT**

- **Node.js Docs**: https://nodejs.org/docs/
- **MySQL Docs**: https://dev.mysql.com/doc/
- **Express.js**: https://expressjs.com/
- **MySQL2**: https://github.com/sidorares/node-mysql2

---

## ✨ **SUCCESS INDICATORS**

You know it's working when:

1. ✅ Terminal shows "PERPUSTAKAAN API SERVER RUNNING"
2. ✅ Database Connected message appears
3. ✅ Can visit http://localhost:3000/api/health
4. ✅ Can see books at http://localhost:3000/api/buku
5. ✅ Can POST new book via Postman
6. ✅ No console errors

---

**Status**: Ready for Use  
**Setup Time**: ~15 minutes  
**Last Updated**: 14 Januari 2026
