const express = require('express');
const router = express.Router();
const pool = require('../config');
const bcrypt = require('bcryptjs');

// POST registrasi user
router.post('/register', async (req, res) => {
  try {
    const { nama, nim, username, password } = req.body;
    
    if (!nama || !nim || !username || !password) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const connection = await pool.getConnection();
    
    try {
      // Check username already exists
      const [existing] = await connection.query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Username sudah terdaftar' });
      }

      // Hash password with reduced salt rounds for faster registration
      const hashedPassword = await bcrypt.hash(password, 5);

      const [result] = await connection.query(
        'INSERT INTO users (nama, nim, username, password) VALUES (?, ?, ?, ?)',
        [nama, nim, username, hashedPassword]
      );

      res.status(201).json({
        id: result.insertId,
        message: 'Registrasi berhasil'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST login user
router.post('/login', async (req, res) => {
  let connection;
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password harus diisi' });
    }

    connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, nama, nim, username, password, role FROM users WHERE username = ? LIMIT 1', 
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username tidak ditemukan' });
    }

    const user = rows[0];
    
    // Use bcryptjs correctly
    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('Bcrypt error:', bcryptError);
      return res.status(500).json({ error: 'Bcrypt comparison failed' });
    }

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Password salah' });
    }

    // Create response object without password
    const responseData = {
      id: user.id,
      nama: user.nama,
      nim: user.nim,
      username: user.username,
      role: user.role || (user.username === 'admin' ? 'admin' : 'member')
    };

    return res.json({
      message: 'Login berhasil',
      data: responseData
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (err) {
        console.error('Connection release error:', err);
      }
    }
  }
});

// GET semua user
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT id, nama, nim, username, created_at FROM users');
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET user by ID with detailed profile
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get user info
    const [userRows] = await connection.query('SELECT id, nama, nim, username, created_at, updated_at FROM users WHERE id = ?', [req.params.id]);
    
    if (userRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const user = userRows[0];
    
    // Get user statistics
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_peminjaman,
        SUM(CASE WHEN status = 'Dipinjam' THEN 1 ELSE 0 END) as aktif,
        SUM(CASE WHEN status = 'Kembali' THEN 1 ELSE 0 END) as kembali
      FROM peminjaman
      WHERE user_id = ?
    `, [req.params.id]);
    
    // Get total denda
    const [dendaRows] = await connection.query(`
      SELECT SUM(nominal) as total_denda
      FROM denda d
      JOIN peminjaman p ON d.peminjaman_id = p.id
      WHERE p.user_id = ? AND d.status = 'Belum dibayar'
    `, [req.params.id]);
    
    connection.release();
    
    res.json({
      ...user,
      stats: stats[0],
      total_denda: dendaRows[0].total_denda || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update user profile
router.put('/:id', async (req, res) => {
  try {
    const { nama, nim } = req.body;
    const userId = req.params.id;
    
    if (!nama || !nim) {
      return res.status(400).json({ error: 'Nama dan NIM harus diisi' });
    }

    const connection = await pool.getConnection();
    
    // Check user exists
    const [userCheck] = await connection.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (userCheck.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    // Check NIM unique (if changed)
    const [nimCheck] = await connection.query('SELECT id FROM users WHERE nim = ? AND id != ?', [nim, userId]);
    if (nimCheck.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'NIM sudah terdaftar user lain' });
    }

    // Update user
    await connection.query(
      'UPDATE users SET nama = ?, nim = ? WHERE id = ?',
      [nama, nim, userId]
    );
    
    connection.release();

    res.json({ 
      message: 'Profil berhasil diperbarui',
      updated: { nama, nim }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET user riwayat (peminjaman dan denda)
router.get('/:id/riwayat', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [riwayat] = await connection.query(`
      SELECT 
        p.id,
        p.tgl_pinjam,
        p.tgl_kembali,
        p.status,
        b.judul,
        b.pengarang,
        b.isbn,
        DATEDIFF(CURDATE(), p.tgl_kembali) as hari_terlambat,
        COALESCE(SUM(d.nominal), 0) as denda
      FROM peminjaman p
      JOIN buku b ON p.buku_id = b.id
      LEFT JOIN denda d ON p.id = d.peminjaman_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.tgl_pinjam DESC
    `, [req.params.id]);
    
    connection.release();
    
    res.json(riwayat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE user (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent deleting admin user
    if (userId == 1) {
      return res.status(400).json({ error: 'Tidak bisa menghapus akun admin' });
    }

    const connection = await pool.getConnection();
    
    try {
      // Check user exists
      const [userCheck] = await connection.query('SELECT id FROM users WHERE id = ?', [userId]);
      if (userCheck.length === 0) {
        return res.status(404).json({ error: 'User tidak ditemukan' });
      }

      // Check if user has active loans
      const [activeLoan] = await connection.query(
        'SELECT id FROM peminjaman WHERE user_id = ? AND status = "Dipinjam" LIMIT 1',
        [userId]
      );
      
      if (activeLoan.length > 0) {
        return res.status(400).json({ error: 'User masih memiliki peminjaman aktif, tidak bisa dihapus' });
      }

      // Delete user
      await connection.query('DELETE FROM users WHERE id = ?', [userId]);
      
      res.json({ message: 'User berhasil dihapus' });
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
