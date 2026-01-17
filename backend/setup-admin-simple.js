const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');

async function setupAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'perpustakaan'
  });

  console.log('✅ Connected to database');

  try {
    // Hash password first
    const plainPassword = 'admin123';
    const hashedPassword = await bcryptjs.hash(plainPassword, 10);
    console.log('Password hashed:', hashedPassword);

    // Update admin password
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, 'admin']
    );

    console.log('✅ Admin password updated!');
    console.log('   Username: admin');
    console.log('   Password: admin123');

    // Verify
    const [rows] = await connection.execute(
      'SELECT id, nama, username FROM users WHERE username = ?',
      ['admin']
    );

    if (rows.length > 0) {
      console.log('✅ Admin user verified:');
      console.log('   ID:', rows[0].id);
      console.log('   Nama:', rows[0].nama);
      console.log('   Username:', rows[0].username);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

setupAdmin();
