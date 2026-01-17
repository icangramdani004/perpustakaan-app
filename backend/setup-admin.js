const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'perpustakaan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function setupAdmin() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected!');

    // Check if admin exists
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      ['admin']
    );

    if (users.length > 0) {
      console.log('Admin exists:', users[0]);
      
      // Hash new password
      const newPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await connection.execute(
        'UPDATE users SET password = ? WHERE username = ?',
        [hashedPassword, 'admin']
      );
      
      console.log(`✅ Admin password reset to: ${newPassword}`);
      console.log(`✅ Password hash: ${hashedPassword}`);
    } else {
      console.log('❌ Admin user not found!');
    }

    connection.release();
    
    // Test login
    console.log('\n🧪 Testing login...');
    const [testResult] = await connection.execute(
      'SELECT password FROM users WHERE username = ?',
      ['admin']
    );
    
    if (testResult.length > 0) {
      const match = await bcrypt.compare('admin123', testResult[0].password);
      console.log(`Password match test: ${match ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
