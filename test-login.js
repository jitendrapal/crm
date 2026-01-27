// Quick test script to verify login works
const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with demo credentials...');
    
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@demo.com',
      password: 'Demo123!'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', response.data.token);
    console.log('User:', response.data.user);
  } catch (error) {
    console.log('❌ Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();

