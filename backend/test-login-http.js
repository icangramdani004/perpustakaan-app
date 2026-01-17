const http = require('http');

const postData = JSON.stringify({
  username: 'admin',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/user/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\nResponse:');
    console.log(data);
    
    try {
      const parsed = JSON.parse(data);
      console.log('\n✅ Login Response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('❌ Could not parse JSON');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
});

console.log('Testing login to http://localhost:3000/api/user/login');
console.log('Credentials: admin / admin123\n');
req.write(postData);
req.end();
