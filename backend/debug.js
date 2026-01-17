#!/usr/bin/env node

/**
 * Database & API Debugger
 * Check if users exist and test API endpoints
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'perpustakaan'
};

async function debugDatabase() {
  console.log('\n📊 DATABASE DEBUG START\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected!\n');

    // Check users table
    console.log('👥 Checking USERS table...');
    const [users] = await connection.query('SELECT id, nama, username, created_at FROM users');
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database!');
      console.log('\n💡 Create admin user:');
      console.log('Username: admin');
      console.log('Password: admin123');
    } else {
      console.log(`✅ Found ${users.length} users:\n`);
      users.forEach((user, idx) => {
        console.log(`  ${idx + 1}. ID: ${user.id}, Username: ${user.username}, Nama: ${user.nama}`);
      });
    }

    // Check each table exists
    console.log('\n\n📚 Checking TABLES...');
    const tables = ['users', 'buku', 'peminjaman', 'denda'];
    
    for (const table of tables) {
      try {
        const [result] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result[0].count;
        console.log(`✅ ${table}: ${count} records`);
      } catch (error) {
        console.log(`❌ ${table}: Error - ${error.message}`);
      }
    }

    await connection.end();
    console.log('\n✅ Database check complete!\n');

  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Is MySQL running? (Start MySQL service)');
    console.log('2. Database "perpustakaan" exists?');
    console.log('3. Credentials correct? (user: root, password: admin)');
    process.exit(1);
  }
}

async function testAPI() {
  console.log('🌐 API TEST START\n');
  
  try {
    // Test health endpoint
    console.log('Testing /api/health...');
    let response = await fetch('http://localhost:3000/api/health');
    let data = await response.json();
    console.log(`✅ ${response.status}: ${data.status}`);

    // Test user list
    console.log('\nTesting /api/user (get all users)...');
    response = await fetch('http://localhost:3000/api/user');
    data = await response.json();
    
    if (Array.isArray(data)) {
      console.log(`✅ ${response.status}: ${data.length} users found`);
      data.forEach((user, idx) => {
        console.log(`  ${idx + 1}. ${user.username} - ${user.nama}`);
      });
    } else {
      console.log(`⚠️ Unexpected response:`, data);
    }

    // Test login with demo user if exists
    if (Array.isArray(data) && data.length > 0) {
      const testUser = data[0];
      console.log(`\n💡 To test login, use:`);
      console.log(`  Username: ${testUser.username}`);
      console.log(`  Password: (depends on what you registered)`);
    }

    console.log('\n✅ API test complete!\n');

  } catch (error) {
    console.error('❌ API test error:', error.message);
    console.log('\n💡 Make sure server is running: cd backend && npm start');
    process.exit(1);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  🔧 PERPUSTAKAAN DEBUG TOOL');
  console.log('═══════════════════════════════════════════');
  
  await debugDatabase();
  await testAPI();

  console.log('═══════════════════════════════════════════');
  console.log('  ✅ DEBUG COMPLETE');
  console.log('═══════════════════════════════════════════\n');
}

main().catch(console.error);
