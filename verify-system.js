#!/usr/bin/env node

/**
 * SISTEM VERIFIKASI PERPUSTAKAAN DIGITAL
 * Cek konfigurasi dan status sistem
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║       🏛️  VERIFIKASI SISTEM PERPUSTAKAAN DIGITAL          ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const checks = {
  success: [],
  warning: [],
  error: []
};

// 1. Check backend files
console.log('📂 Checking backend files...');
const backendFiles = [
  'backend/server.js',
  'backend/config.js',
  'backend/database-fresh.sql',
  'backend/routes/user.js',
  'backend/routes/denda.js',
  'backend/routes/peminjaman.js',
  'backend/package.json'
];

backendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    checks.success.push(`✅ ${file}`);
  } else {
    checks.error.push(`❌ ${file} - NOT FOUND`);
  }
});

// 2. Check frontend files
console.log('\n📄 Checking frontend files...');
const frontendFiles = [
  'index.html',
  'admin-login-bersih.html',
  'admin-dashboard.html',
  'katalog.html',
  'denda.html',
  'pinjam.html',
  'api.js',
  'script.js',
  'style.css'
];

frontendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    checks.success.push(`✅ ${file}`);
  } else {
    checks.error.push(`❌ ${file} - NOT FOUND`);
  }
});

// 3. Check key code patterns
console.log('\n🔍 Checking code patterns...');

// Check denda.html for payment endpoint
const dendaHtml = fs.readFileSync('denda.html', 'utf8');
if (dendaHtml.includes('PUT') && dendaHtml.includes('/api/denda/')) {
  checks.success.push('✅ denda.html - Payment PUT endpoint found');
} else {
  checks.warning.push('⚠️ denda.html - Payment endpoint might be incomplete');
}

// Check admin-login-bersih.html exists and has proper logic
const adminLogin = fs.readFileSync('admin-login-bersih.html', 'utf8');
if (adminLogin.includes('admin_login') && adminLogin.includes('admin-dashboard.html')) {
  checks.success.push('✅ admin-login-bersih.html - Proper login logic found');
} else {
  checks.warning.push('⚠️ admin-login-bersih.html - Check localStorage logic');
}

// Check katalog.html is cleaned
const katalog = fs.readFileSync('katalog.html', 'utf8');
const htmlClose = (katalog.match(/<\/html>/g) || []).length;
if (htmlClose === 1) {
  checks.success.push('✅ katalog.html - HTML structure is clean (1 closing tag)');
} else {
  checks.error.push(`❌ katalog.html - Found ${htmlClose} closing </html> tags (should be 1)`);
}

// Check denda.js routes
const dendaJs = fs.readFileSync('backend/routes/denda.js', 'utf8');
if (dendaJs.includes("router.put('/:id'")) {
  checks.success.push('✅ backend/routes/denda.js - PUT /:id endpoint found');
} else {
  checks.warning.push('⚠️ backend/routes/denda.js - PUT /:id endpoint not found');
}

// Check database-fresh.sql for correct denda amount
const dbFresh = fs.readFileSync('backend/database-fresh.sql', 'utf8');
const hasDenda500 = dbFresh.includes(', 500,') && !dbFresh.includes('50000');
if (hasDenda500) {
  checks.success.push('✅ database-fresh.sql - Denda rate is 500 rupiah/hari');
} else {
  checks.error.push('❌ database-fresh.sql - Denda rate might still be 50000 (should be 500)');
}

// Check denda calculation in view
if (dbFresh.includes('* 500') && !dbFresh.includes('* 10000')) {
  checks.success.push('✅ database-fresh.sql - Denda calculation is 500/hari (not 10000)');
} else {
  checks.warning.push('⚠️ database-fresh.sql - Check denda calculation multiplier');
}

// 4. Display results
console.log('\n════════════════════════════════════════════════════════════\n');

if (checks.success.length > 0) {
  console.log('✅ SUCCESS CHECKS:\n');
  checks.success.forEach(check => console.log(`   ${check}`));
}

if (checks.warning.length > 0) {
  console.log('\n⚠️  WARNING CHECKS:\n');
  checks.warning.forEach(check => console.log(`   ${check}`));
}

if (checks.error.length > 0) {
  console.log('\n❌ ERROR CHECKS:\n');
  checks.error.forEach(check => console.log(`   ${check}`));
}

// 5. Summary
console.log('\n════════════════════════════════════════════════════════════\n');
console.log('📊 SUMMARY:');
console.log(`   ✅ Success: ${checks.success.length}`);
console.log(`   ⚠️  Warning: ${checks.warning.length}`);
console.log(`   ❌ Error:   ${checks.error.length}`);

// 6. Recommendations
console.log('\n📋 NEXT STEPS:\n');
if (checks.error.length === 0) {
  console.log('   1. ✅ System files are in place');
  console.log('   2. Run: npm install (in backend folder)');
  console.log('   3. Run: mysql -u root -padmin < backend/database-fresh.sql');
  console.log('   4. Run: node backend/server.js');
  console.log('   5. Open index.html or admin-login-bersih.html in browser\n');
  console.log('   🎉 SYSTEM IS READY TO USE!\n');
} else {
  console.log('   ❌ Please fix errors above before running the system\n');
}

console.log('════════════════════════════════════════════════════════════\n');

// Exit with appropriate code
process.exit(checks.error.length > 0 ? 1 : 0);
