const express = require('express');
const router = express.Router();
const pool = require('../config');

// GET semua buku
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM buku ORDER BY id DESC');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// GET buku by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM buku WHERE id = ?', [req.params.id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Buku tidak ditemukan' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST tambah buku
router.post('/', async (req, res) => {
  try {
    const { judul, pengarang, penerbit, tahun, isbn, kategori, stok, deskripsi } = req.body;
    
    // Validasi
    if (!judul || !pengarang || !isbn || stok === undefined) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const connection = await pool.getConnection();
    
    // Check ISBN already exists
    const [existing] = await connection.query('SELECT id FROM buku WHERE isbn = ?', [isbn]);
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'ISBN sudah terdaftar' });
    }

    const [result] = await connection.query(
      'INSERT INTO buku (judul, pengarang, penerbit, tahun, isbn, kategori, stok, deskripsi) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [judul, pengarang, penerbit, tahun, isbn, kategori, stok, deskripsi]
    );
    connection.release();

    res.status(201).json({
      id: result.insertId,
      message: 'Buku berhasil ditambahkan'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update buku
router.put('/:id', async (req, res) => {
  try {
    const { judul, pengarang, penerbit, tahun, isbn, kategori, stok, deskripsi } = req.body;
    
    const connection = await pool.getConnection();
    
    // Check if book exists
    const [existing] = await connection.query('SELECT id FROM buku WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Buku tidak ditemukan' });
    }

    const [result] = await connection.query(
      'UPDATE buku SET judul=?, pengarang=?, penerbit=?, tahun=?, isbn=?, kategori=?, stok=?, deskripsi=? WHERE id=?',
      [judul, pengarang, penerbit, tahun, isbn, kategori, stok, deskripsi, req.params.id]
    );
    connection.release();

    res.json({ message: 'Buku berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE buku
router.delete('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Check if book exists
    const [existing] = await connection.query('SELECT id FROM buku WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Buku tidak ditemukan' });
    }

    await connection.query('DELETE FROM buku WHERE id=?', [req.params.id]);
    connection.release();
    
    res.json({ message: 'Buku berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SEARCH buku
router.get('/search/:keyword', async (req, res) => {
  try {
    const keyword = `%${req.params.keyword}%`;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM buku WHERE judul LIKE ? OR pengarang LIKE ? OR isbn LIKE ? OR kategori LIKE ?',
      [keyword, keyword, keyword, keyword]
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET buku by kategori
router.get('/kategori/:kategori', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM buku WHERE kategori = ?', [req.params.kategori]);
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
