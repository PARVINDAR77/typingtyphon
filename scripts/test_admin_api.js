const http = require('http');

async function testApi() {
  // 1. Admin login
  const loginPayload = JSON.stringify({
    email: 'admin@typingtyphon.com',
    password: 'Admin@Typhon2026!',
  });

  const loginRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 4001,
      path: '/api/v1/admin/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginPayload),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(loginPayload);
    req.end();
  });

  console.log('1. Admin Login Response:', loginRes.status, loginRes.body.success, 'Token present:', !!loginRes.body.accessToken);

  const token = loginRes.body.accessToken;
  const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'].join('; ') : '';

  // 2. Dashboard
  const dashboardRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 4001,
      path: '/api/v1/admin/dashboard?period=30d',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': cookie,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.end();
  });

  console.log('2. Dashboard KPIs:', dashboardRes.status, dashboardRes.body.data.kpis);

  // 3. Users
  const usersRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 4001,
      path: '/api/v1/admin/users?page=1&limit=5',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.end();
  });

  console.log('3. Users meta:', usersRes.status, usersRes.body.data.meta, 'Returned users:', usersRes.body.data.users.length);

  // 4. Reports CSV Export
  const reportsCsvRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 4001,
      path: '/api/v1/admin/reports?type=usage&dateRange=30d&exportFormat=csv',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, contentType: res.headers['content-type'], body: data }));
    });
    req.on('error', reject);
    req.end();
  });

  console.log('4. Reports CSV:', reportsCsvRes.status, reportsCsvRes.contentType, reportsCsvRes.body.split('\r\n')[0]);

  // 5. System Health
  const healthRes = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 4001,
      path: '/api/v1/admin/system/health',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.end();
  });

  console.log('5. System Health:', healthRes.status, healthRes.body.data.status, 'Memory MB:', healthRes.body.data.memoryUsageMb);
}

testApi().catch(console.error);
