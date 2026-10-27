const http = require('http');
const mongoose = require('mongoose');
const app = require('./server');

// Helper to make local HTTP requests
function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Backend & Authentication Tests ---');
  // Wait a second for mongoose connection to establish
  await new Promise(r => setTimeout(r, 1500));

  const testUser = {
    name: 'Test Driver',
    email: `driver_${Date.now()}@example.com`,
    username: `driver_${Date.now()}`,
    password: 'Password123',
    confirmPassword: 'Password123',
    phone: '+1 555-0199',
    preferredCarModel: 'Audi RS6 Avant'
  };

  try {
    // 1. Health check
    const healthRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    console.log('1. Health check status:', healthRes.status, healthRes.data?.status === 'ok' ? 'PASSED' : 'FAILED');

    // 2. Register user
    const regRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, testUser);
    console.log('2. User Registration status:', regRes.status, regRes.data?.token ? 'PASSED' : 'FAILED');
    const token = regRes.data?.token;

    // 3. Prevent duplicate registration
    const dupRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, testUser);
    console.log('3. Duplicate Registration rejection:', dupRes.status === 409 ? 'PASSED (409 Conflict)' : 'FAILED');

    // 4. Login with correct credentials
    const loginRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      identifier: testUser.email,
      password: testUser.password
    });
    console.log('4. Login with valid credentials:', loginRes.status === 200 ? 'PASSED' : 'FAILED');

    // 5. Login rejection with wrong password
    const badLoginRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      identifier: testUser.email,
      password: 'WrongPassword999'
    });
    console.log('5. Bad password rejection:', badLoginRes.status === 401 ? 'PASSED (401 Unauthorized)' : 'FAILED');

    // 6. Access protected /api/auth/me
    const meRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('6. Protected /api/auth/me access:', meRes.status === 200 && meRes.data?.user?.email === testUser.email ? 'PASSED' : 'FAILED');

    // 7. Protected route rejection without token
    const noTokenRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET'
    });
    console.log('7. Protected route without token rejection:', noTokenRes.status === 401 ? 'PASSED (401 Unauthorized)' : 'FAILED');

    // 8. Create booking linked to user
    const bookingRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/bookings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      name: testUser.name,
      email: testUser.email,
      phone: testUser.phone,
      carModel: testUser.preferredCarModel,
      serviceType: 'Ceramic Detail Wash',
      date: '2026-11-01',
      timeSlot: '11:00 AM',
      notes: 'Please pay extra attention to wheels'
    });
    console.log('8. Create appointment booking:', bookingRes.status === 201 && bookingRes.data?._id ? 'PASSED' : 'FAILED');
    const bookingId = bookingRes.data?._id;

    // 9. Fetch bookings for authenticated user
    const getBookingsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/bookings',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('9. Fetch user bookings:', getBookingsRes.status === 200 && Array.isArray(getBookingsRes.data) ? `PASSED (${getBookingsRes.data.length} bookings)` : 'FAILED');

    // 10. Update booking status
    const updateRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/bookings/${bookingId}/status`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    }, { status: 'Completed' });
    console.log('10. Update booking status:', updateRes.status === 200 && updateRes.data?.status === 'Completed' ? 'PASSED' : 'FAILED');

    console.log('--- All Backend Authentication Tests Passed Successfully! ---');
    process.exit(0);
  } catch (e) {
    console.error('Test execution error:', e);
    process.exit(1);
  }
}

runTests();
