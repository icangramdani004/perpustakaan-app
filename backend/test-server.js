const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Simple logging
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.path}`);
  next();
});

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'perpustakaan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/api/user/login', async (req, res) => {
  console.log('Login request received:', req.body);
  let connection;
  try {
    const { username, password } = req.body;
    console.log('Credentials:', { username, password });
    
    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ error: 'Username dan password harus diisi' });
    }

    connection = await pool.getConnection();
    console.log('Got connection');
    
    const [rows] = await connection.query('SELECT id, nama, nim, username, password FROM users WHERE username = ?', [username]);
    console.log('Query result:', rows.length, 'rows');

    if (rows.length === 0) {
      console.log('User not found');
      return res.status(401).json({ error: 'Username tidak ditemukan' });
    }

    const user = rows[0];
    console.log('User found:', user.username);
    console.log('Password hash in DB:', user.password.substring(0, 20) + '...');
    
    console.log('Comparing password...');
    const passwordMatch = await bcryptjs.compare(password, user.password);
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Password salah' });
    }

    const responseData = {
      id: user.id,
      nama: user.nama,
      nim: user.nim,
      username: user.username,
      role: user.username === 'admin' ? 'admin' : 'user'
    };

    console.log('Sending response:', responseData);
    return res.json({
      message: 'Login berhasil',
      data: responseData
    });

  } catch (error) {
    console.error('CRITICAL ERROR:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    if (connection) {
      try {
        await connection.release();
        console.log('Connection released');
      } catch (err) {
        console.error('Error releasing connection:', err);
      }
    }
  }
});

const PORT = 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ TEST SERVER RUNNING ON PORT ${PORT}\n`);
});

server.on('error', (err) => {
  console.error('SERVER ERROR:', err);
});

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});
