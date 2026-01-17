const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');

async function checkAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'perpustakaan'
  });

  console.log('✅ Connected to database\n');

  try {
    // Get admin user
    const [rows] = await connection.execute(
      'SELECT id, nama, username, password FROM users WHERE username = ?',
      ['admin']
    );

    if (rows.length > 0) {
      const user = rows[0];
      console.log('Admin user found:');
      console.log('  ID:', user.id);
      console.log('  Name:', user.nama);
      console.log('  Username:', user.username);
      console.log('  Password hash:', user.password);
      console.log('  Hash length:', user.password.length);
      console.log('  Is bcrypt hash:', user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'));

      console.log('\n Testing password match...');
      try {
        const match = await bcryptjs.compare('admin123', user.password);
        console.log('  ✅ admin123 match:', match);
      } catch (err) {
        console.log('  ❌ bcrypt.compare error:', err.message);
      }
    } else {
      console.log('❌ Admin user not found!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkAdmin();
