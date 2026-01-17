const express = require('express');
const router = express.Router();
const pool = require('../config');

// POST tambah peminjaman
router.post('/', async (req, res) => {
  try {
    const { user_id, buku_id, tgl_pinjam, tgl_kembali } = req.body;
    
    if (!user_id || !buku_id || !tgl_pinjam || !tgl_kembali) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const connection = await pool.getConnection();
    
    // Check user exists
    const [userCheck] = await connection.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (userCheck.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    // Check book exists and stok available
    const [bukuCheck] = await connection.query('SELECT stok FROM buku WHERE id = ?', [buku_id]);
    if (bukuCheck.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Buku tidak ditemukan' });
    }
    
    if (bukuCheck[0].stok <= 0) {
      connection.release();
      return res.status(400).json({ error: 'Stok buku habis' });
    }

    // Create peminjaman
    const [result] = await connection.query(
      'INSERT INTO peminjaman (user_id, buku_id, tgl_pinjam, tgl_kembali, status) VALUES (?, ?, ?, ?, ?)',
      [user_id, buku_id, tgl_pinjam, tgl_kembali, 'Dipinjam']
    );

    // Update stok buku
    await connection.query('UPDATE buku SET stok = stok - 1 WHERE id = ?', [buku_id]);
    
    connection.release();

    res.status(201).json({
      id: result.insertId,
      message: 'Peminjaman berhasil'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET semua peminjaman
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT p.*, u.nama, b.judul 
      FROM peminjaman p 
      JOIN users u ON p.user_id = u.id 
      JOIN buku b ON p.buku_id = b.id 
      ORDER BY p.id DESC
    `);
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET peminjaman by user
router.get('/user/:user_id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT p.*, u.nama, b.judul, b.pengarang 
      FROM peminjaman p 
      JOIN users u ON p.user_id = u.id 
      JOIN buku b ON p.buku_id = b.id 
      WHERE p.user_id = ?
      ORDER BY p.id DESC
    `, [req.params.user_id]);
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT return buku
router.put('/:id/return', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get peminjaman
    const [peminjaman] = await connection.query('SELECT * FROM peminjaman WHERE id = ?', [req.params.id]);
    if (peminjaman.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Peminjaman tidak ditemukan' });
    }

    // Update status
    await connection.query('UPDATE peminjaman SET status = ? WHERE id = ?', ['Kembali', req.params.id]);

    // Update stok buku
    await connection.query('UPDATE buku SET stok = stok + 1 WHERE id = ?', [peminjaman[0].buku_id]);
    
    connection.release();

    res.json({ message: 'Buku berhasil dikembalikan' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
