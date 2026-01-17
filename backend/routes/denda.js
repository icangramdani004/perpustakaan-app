const express = require('express');
const router = express.Router();
const pool = require('../config');

// POST tambah denda
router.post('/', async (req, res) => {
  try {
    const { peminjaman_id, nominal, alasan } = req.body;
    
    if (!peminjaman_id || !nominal || !alasan) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const connection = await pool.getConnection();
    
    // Check peminjaman exists
    const [peminjamanCheck] = await connection.query('SELECT id FROM peminjaman WHERE id = ?', [peminjaman_id]);
    if (peminjamanCheck.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Peminjaman tidak ditemukan' });
    }

    const [result] = await connection.query(
      'INSERT INTO denda (peminjaman_id, nominal, alasan, status) VALUES (?, ?, ?, ?)',
      [peminjaman_id, nominal, alasan, 'Belum dibayar']
    );
    connection.release();

    res.status(201).json({
      id: result.insertId,
      message: 'Denda berhasil ditambahkan'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET semua denda
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT d.*, p.user_id, u.nama, b.judul 
      FROM denda d 
      JOIN peminjaman p ON d.peminjaman_id = p.id 
      JOIN users u ON p.user_id = u.id 
      JOIN buku b ON p.buku_id = b.id 
      ORDER BY d.id DESC
    `);
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET denda by user
router.get('/user/:user_id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT d.*, b.judul 
      FROM denda d 
      JOIN peminjaman p ON d.peminjaman_id = p.id 
      JOIN buku b ON p.buku_id = b.id 
      WHERE p.user_id = ?
      ORDER BY d.id DESC
    `, [req.params.user_id]);
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT bayar denda
router.put('/:id/bayar', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [denda] = await connection.query('SELECT id FROM denda WHERE id = ?', [req.params.id]);
    if (denda.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Denda tidak ditemukan' });
    }

    await connection.query('UPDATE denda SET status = ? WHERE id = ?', ['Sudah dibayar', req.params.id]);
    connection.release();

    res.json({ message: 'Denda berhasil dibayar' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update denda (for payment)
router.put('/:id', async (req, res) => {
  try {
    const { status, metode_bayar, keterangan_bayar } = req.body;
    const connection = await pool.getConnection();
    
    const [denda] = await connection.query('SELECT id FROM denda WHERE id = ?', [req.params.id]);
    if (denda.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Denda tidak ditemukan' });
    }

    await connection.query(
      'UPDATE denda SET status = ?, metode_bayar = ?, keterangan_bayar = ?, tgl_bayar = CURDATE() WHERE id = ?',
      [status || 'Belum dibayar', metode_bayar, keterangan_bayar, req.params.id]
    );
    connection.release();

    res.json({ message: 'Denda berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
