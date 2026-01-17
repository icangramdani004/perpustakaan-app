#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'perpustakaan_db',
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0
};

async function setupAdmin() {
  let connection;
  try {
    console.log('🔧 Setting up admin account...');
    
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Check if admin exists
    const [users] = await connection.query(
      'SELECT id, username, nama FROM users WHERE username = ?',
      ['admin']
    );

    if (users.length > 0) {
      console.log('⚠️  Admin account already exists');
      console.log('   ID:', users[0].id);
      console.log('   Username:', users[0].username);
      console.log('   Nama:', users[0].nama);
      await connection.end();
      return;
    }

    // Create admin account
    console.log('\n👤 Creating new admin account...');
    const hashedPassword = await bcrypt.hash('admin123', 5);
    
    const [result] = await connection.query(
      'INSERT INTO users (nama, nim, username, password) VALUES (?, ?, ?, ?)',
      ['Administrator', 'ADMIN001', 'admin', hashedPassword]
    );

    console.log('✅ Admin account created successfully!');
    console.log('   ID:', result.insertId);
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Nama: Administrator');
    console.log('   NIM: ADMIN001');

    // Verify admin can login
    console.log('\n🔐 Verifying admin login...');
    const [adminUser] = await connection.query(
      'SELECT id, username, password FROM users WHERE username = ?',
      ['admin']
    );

    if (adminUser.length === 0) {
      console.error('❌ Admin not found after creation!');
      await connection.end();
      return;
    }

    const passwordMatch = await bcrypt.compare('admin123', adminUser[0].password);
    if (passwordMatch) {
      console.log('✅ Admin password verified! Ready to login.');
    } else {
      console.error('❌ Password verification failed!');
    }

    await connection.end();
    console.log('\n✅ Setup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
