const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'perpustakaan'
};

async function resetAdminPassword() {
  let connection;
  try {
    console.log('🔧 Resetting admin password...\n');
    
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database\n');

    // Generate correct password hash for 'admin123'
    console.log('🔐 Hashing password "admin123"...');
    const passwordHash = await bcrypt.hash('admin123', 5);
    console.log(`✅ Password hash generated: ${passwordHash}\n`);

    // Update admin password
    console.log('📝 Updating admin user password...');
    const [result] = await connection.query(
      'UPDATE users SET password = ? WHERE username = ?',
      [passwordHash, 'admin']
    );
    console.log(`✅ Updated ${result.affectedRows} record(s)\n`);

    // Verify admin exists and has correct role
    console.log('🔍 Verifying admin account...');
    const [users] = await connection.query(
      'SELECT id, username, nama, role FROM users WHERE username = ?',
      ['admin']
    );

    if (users.length === 0) {
      console.error('❌ Admin user not found!');
      await connection.end();
      return;
    }

    const admin = users[0];
    console.log(`✅ Admin account verified:`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Nama: ${admin.nama}`);
    console.log(`   Role: ${admin.role}\n`);

    // Test password match
    console.log('🧪 Testing password...');
    const [adminWithPassword] = await connection.query(
      'SELECT password FROM users WHERE username = ?',
      ['admin']
    );
    
    if (adminWithPassword.length === 0) {
      console.error('❌ Password not found!');
      await connection.end();
      return;
    }

    const passwordMatch = await bcrypt.compare('admin123', adminWithPassword[0].password);
    if (passwordMatch) {
      console.log('✅ Password "admin123" matches! Ready to login.\n');
    } else {
      console.error('❌ Password does not match!');
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ ADMIN PASSWORD RESET COMPLETE!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📝 Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n🚀 Ready to login!');

    await connection.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

resetAdminPassword();
