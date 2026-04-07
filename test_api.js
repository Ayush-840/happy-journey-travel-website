const http = require('http');

const endpoints = [
  '/api/states',
  '/api/states/rajasthan',
  '/api/cities/jaipur',
  '/api/places/amber-fort',
  '/api/transport?city=jaipur',
  '/api/stays?city=jaipur',
  '/api/nearby?lat=26.9124&lng=75.7873'
];

async function testApi() {
  console.log('Starting API Tests...\n');
  let allPassed = true;

  for (const endpoint of endpoints) {
    process.stdout.write(`Testing GET ${endpoint}... `);
    
    try {
      const response = await new Promise((resolve, reject) => {
        http.get(`http://localhost:3000${endpoint}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, data }));
        }).on('error', reject);
      });

      if (response.statusCode === 200) {
        const json = JSON.parse(response.data);
        if (json.success) {
          console.log('✅ OK');
        } else {
          console.log(`❌ FAILED (API returned success: false)`);
          console.log(json);
          allPassed = false;
        }
      } else {
        console.log(`❌ FAILED (Status ${response.statusCode})`);
        allPassed = false;
      }
    } catch (err) {
      console.log(`❌ ERROR: ${err.message}`);
      allPassed = false;
    }
  }

  // Test POST Booking
  process.stdout.write(`Testing POST /api/bookings/transport... `);
  try {
    const postData = JSON.stringify({
      user_name: 'Test Auto',
      user_phone: '1234567890',
      from_city: 'Delhi',
      to_city: 'Agra',
      transport_type: 'Cab',
      travel_date: '2026-04-01'
    });

    const response = await new Promise((resolve, reject) => {
      const req = http.request('http://localhost:3000/api/bookings/transport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    if (response.statusCode === 201) {
      console.log('✅ OK');
    } else {
      console.log(`❌ FAILED (Status ${response.statusCode}) - ${response.data}`);
      allPassed = false;
    }
  } catch(err) {
    console.log(`❌ ERROR: ${err.message}`);
    allPassed = false; 
  }

  console.log('\n=====================');
  console.log(allPassed ? '✅ ALL API TESTS PASSED' : '❌ SOME TESTS FAILED');
}

testApi();
