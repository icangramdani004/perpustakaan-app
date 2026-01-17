const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  const correctPassword = 'admin123';
  
  // Generate hash dengan salt rounds = 5 (sesuai dengan register)
  const hash = await bcrypt.hash(correctPassword, 5);
  
  console.log('Password: admin123');
  console.log('Generated Hash:', hash);
  console.log('\nRun this SQL command to reset admin password:');
  console.log(`UPDATE users SET password = '${hash}' WHERE username = 'admin';`);
  
  // Test verify
  const isMatch = await bcrypt.compare(correctPassword, hash);
  console.log('\nPassword Verification Test:', isMatch ? '✅ PASS' : '❌ FAIL');
}

resetAdminPassword().catch(err => console.error('Error:', err));
