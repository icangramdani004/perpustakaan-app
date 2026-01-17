-- ===== PERPUSTAKAAN DATABASE SCHEMA =====
-- Created: 14 Januari 2026

-- Create Database
DROP DATABASE IF EXISTS perpustakaan;
CREATE DATABASE perpustakaan;
USE perpustakaan;

-- ===== TABLE BUKU =====
CREATE TABLE buku (
  id INT PRIMARY KEY AUTO_INCREMENT,
  judul VARCHAR(255) NOT NULL,
  pengarang VARCHAR(255) NOT NULL,
  penerbit VARCHAR(255) NOT NULL,
  tahun INT NOT NULL,
  isbn VARCHAR(20) UNIQUE NOT NULL,
  kategori VARCHAR(100) NOT NULL,
  stok INT NOT NULL DEFAULT 0,
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_isbn (isbn),
  INDEX idx_kategori (kategori),
  INDEX idx_judul (judul)
);

-- ===== TABLE USERS =====
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(255) NOT NULL,
  nim VARCHAR(20) NOT NULL UNIQUE,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_username (username),
  INDEX idx_nim (nim)
);

-- ===== TABLE PEMINJAMAN =====
CREATE TABLE peminjaman (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  buku_id INT NOT NULL,
  tgl_pinjam DATE NOT NULL,
  tgl_kembali DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Dipinjam',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (buku_id) REFERENCES buku(id) ON DELETE CASCADE,
  
  INDEX idx_user (user_id),
  INDEX idx_buku (buku_id),
  INDEX idx_status (status),
  INDEX idx_tgl_pinjam (tgl_pinjam)
);

-- ===== TABLE DENDA =====
CREATE TABLE denda (
  id INT PRIMARY KEY AUTO_INCREMENT,
  peminjaman_id INT NOT NULL,
  nominal DECIMAL(10, 2) NOT NULL,
  alasan TEXT,
  status VARCHAR(50) DEFAULT 'Belum dibayar',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (peminjaman_id) REFERENCES peminjaman(id) ON DELETE CASCADE,
  
  INDEX idx_peminjaman (peminjaman_id),
  INDEX idx_status (status)
);

-- ===== SAMPLE DATA =====

-- Insert sample books
INSERT INTO buku (judul, pengarang, penerbit, tahun, isbn, kategori, stok, deskripsi) VALUES
('JavaScript untuk Pemula', 'John Doe', 'Tech Press', 2023, '978-1234567890', 'Teknologi', 5, 'Panduan lengkap belajar JavaScript dari nol'),
('Python Dasar', 'Jane Smith', 'Code Academy', 2023, '978-0987654321', 'Teknologi', 3, 'Tutorial Python untuk pemula dan menengah'),
('Web Development Modern', 'Mike Johnson', 'Dev Books', 2024, '978-1111111111', 'Teknologi', 4, 'Teknologi web terkini dan best practices'),
('Database Design', 'Sarah Williams', 'Data Press', 2023, '978-2222222222', 'Referensi', 2, 'Desain dan optimasi database relasional'),
('Algoritma & Struktur Data', 'Tom Brown', 'Science Books', 2022, '978-3333333333', 'Teknologi', 6, 'Pemahaman mendalam algoritma dan struktur data');

-- Insert sample users
INSERT INTO users (nama, nim, username, password) VALUES
('Budi Santoso', '210101001', 'budi123', '$2a$10$0W5m5TqXJdKdCUVvGhJEJ.yxTWdIhKkN3kNpVH6pVJx0Zr8DpCNJi'),
('Siti Nurhaliza', '210101002', 'siti456', '$2a$10$0W5m5TqXJdKdCUVvGhJEJ.yxTWdIhKkN3kNpVH6pVJx0Zr8DpCNJi'),
('Ahmad Hidayat', '210101003', 'ahmad789', '$2a$10$0W5m5TqXJdKdCUVvGhJEJ.yxTWdIhKkN3kNpVH6pVJx0Zr8DpCNJi');

-- Note: Password untuk semua user adalah 'password123'
-- Hash generated dengan bcryptjs

-- Insert sample peminjaman
INSERT INTO peminjaman (user_id, buku_id, tgl_pinjam, tgl_kembali, status) VALUES
(1, 1, '2026-01-10', '2026-01-17', 'Dipinjam'),
(1, 2, '2026-01-08', '2026-01-15', 'Kembali'),
(2, 3, '2026-01-12', '2026-01-19', 'Dipinjam'),
(3, 4, '2026-01-11', '2026-01-18', 'Dipinjam');

-- Insert sample denda
INSERT INTO denda (peminjaman_id, nominal, alasan, status) VALUES
(2, 500, 'Keterlambatan pengembalian 2 hari', 'Belum dibayar');

-- ===== VIEWS =====

-- View untuk laporan peminjaman lengkap
CREATE VIEW v_laporan_peminjaman AS
SELECT 
  p.id,
  u.nama,
  u.nim,
  b.judul,
  b.pengarang,
  p.tgl_pinjam,
  p.tgl_kembali,
  p.status,
  DATEDIFF(CURDATE(), p.tgl_kembali) as hari_telat,
  CASE 
    WHEN DATEDIFF(CURDATE(), p.tgl_kembali) > 0 THEN DATEDIFF(CURDATE(), p.tgl_kembali) * 500
    ELSE 0 
  END as total_denda
FROM peminjaman p
JOIN users u ON p.user_id = u.id
JOIN buku b ON p.buku_id = b.id
ORDER BY p.id DESC;

-- View untuk statistik buku
CREATE VIEW v_statistik_buku AS
SELECT 
  kategori,
  COUNT(*) as total_buku,
  SUM(stok) as total_stok,
  COUNT(CASE WHEN stok = 0 THEN 1 END) as habis,
  COUNT(CASE WHEN stok > 0 THEN 1 END) as tersedia
FROM buku
GROUP BY kategori;

-- ===== CREATE INDEXES =====
CREATE INDEX idx_peminjaman_user_status ON peminjaman(user_id, status);
CREATE INDEX idx_denda_user ON denda(peminjaman_id);

-- ===== PRIVILEGES =====
-- Uncomment jika ingin membuat user terpisah untuk aplikasi
-- CREATE USER 'perpustakaan'@'localhost' IDENTIFIED BY 'secure_password';
-- GRANT ALL PRIVILEGES ON perpustakaan.* TO 'perpustakaan'@'localhost';
-- FLUSH PRIVILEGES;

-- ===== DISPLAY INFO =====
SELECT '✅ Database perpustakaan created successfully!' as info;
