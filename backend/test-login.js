#!/usr/bin/env node

/**
 * Login API Test
 * Test login dengan users yang ada di database
 */

async function testLogin(username, password) {
  console.log(`\n🔐 Testing login: ${username}`);
  console.log('─'.repeat(40));
  
  try {
    const response = await fetch('http://localhost:3000/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      signal: AbortSignal.timeout(5000)
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ LOGIN SUCCESS!`);
      console.log(`Status: ${response.status}`);
      console.log(`ID: ${data.data?.id}`);
      console.log(`Username: ${data.data?.username}`);
      console.log(`Nama: ${data.data?.nama}`);
      console.log(`Role: ${data.data?.role}`);
      return true;
    } else {
      console.log(`❌ LOGIN FAILED`);
      console.log(`Status: ${response.status}`);
      console.log(`Error: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  🧪 LOGIN API TESTER');
  console.log('═══════════════════════════════════════════');

  // Test users dari database
  const testCases = [
    { username: 'admin', password: 'admin123', note: 'Admin user' },
    { username: 'budi123', password: 'budi123', note: 'Demo user' },
    { username: 'admin', password: 'wrongpass', note: 'Wrong password' },
    { username: 'invalid_user', password: 'password', note: 'Non-existent user' }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.note}`);
    const result = await testLogin(testCase.username, testCase.password);
    if (result) passed++;
    else failed++;
    await new Promise(r => setTimeout(r, 500)); // Delay antar test
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(`📊 RESULTS: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════\n');
}

main().catch(console.error);
