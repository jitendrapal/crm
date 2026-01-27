/**
 * Comprehensive Sanity Test for Invoice CRM Backend
 * Tests all major API endpoints with demo credentials
 */

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Helper function to make API calls
async function apiCall(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }
    
    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test functions
async function testLogin() {
  console.log('\n🔐 Testing Login...');
  const result = await apiCall('POST', '/auth/login', {
    email: 'admin@demo.com',
    password: 'Demo123!'
  });

  if (result.success) {
    authToken = result.data.token;
    console.log('✅ Login successful');
    console.log(`   User: ${result.data.user.firstName} ${result.data.user.lastName}`);
    console.log(`   Email: ${result.data.user.email}`);
    return true;
  } else {
    console.log('❌ Login failed:', result.error);
    return false;
  }
}

async function testDashboardStats() {
  console.log('\n📊 Testing Dashboard Stats...');
  const result = await apiCall('GET', '/dashboard/stats');

  if (result.success) {
    console.log('✅ Dashboard stats retrieved');
    console.log(`   Total Customers: ${result.data.totalCustomers}`);
    console.log(`   Total Invoices: ${result.data.totalInvoices}`);
    console.log(`   Paid Invoices: ${result.data.paidInvoices}`);
    console.log(`   Total Revenue: $${result.data.totalRevenue.toFixed(2)}`);
    return true;
  } else {
    console.log('❌ Dashboard stats failed:', result.error);
    return false;
  }
}

async function testCustomers() {
  console.log('\n👥 Testing Customers...');
  const result = await apiCall('GET', '/customers?page=1&limit=10');

  if (result.success) {
    console.log('✅ Customers retrieved');
    console.log(`   Total: ${result.data.pagination.total}`);
    console.log(`   Page: ${result.data.pagination.page}/${result.data.pagination.totalPages}`);
    if (result.data.data && result.data.data.length > 0) {
      console.log(`   First customer: ${result.data.data[0].name}`);
    }
    return true;
  } else {
    console.log('❌ Customers failed:', result.error);
    return false;
  }
}

async function testInvoices() {
  console.log('\n📄 Testing Invoices...');
  const result = await apiCall('GET', '/invoices?page=1&limit=10');

  if (result.success) {
    console.log('✅ Invoices retrieved');
    console.log(`   Total: ${result.data.pagination.total}`);
    console.log(`   Page: ${result.data.pagination.page}/${result.data.pagination.totalPages}`);
    if (result.data.data && result.data.data.length > 0) {
      const inv = result.data.data[0];
      console.log(`   First invoice: ${inv.invoiceNumber} - $${inv.total.toFixed(2)} (${inv.status})`);
    }
    return true;
  } else {
    console.log('❌ Invoices failed:', result.error);
    return false;
  }
}

async function testPayments() {
  console.log('\n💰 Testing Payments...');
  const result = await apiCall('GET', '/payments?page=1&limit=10');

  if (result.success) {
    console.log('✅ Payments retrieved');
    console.log(`   Total: ${result.data.pagination.total}`);
    console.log(`   Page: ${result.data.pagination.page}/${result.data.pagination.totalPages}`);
    if (result.data.data && result.data.data.length > 0) {
      const payment = result.data.data[0];
      console.log(`   First payment: $${payment.amount.toFixed(2)} via ${payment.paymentMethod}`);
    }
    return true;
  } else {
    console.log('❌ Payments failed:', result.error);
    return false;
  }
}

async function testMe() {
  console.log('\n👤 Testing Get Current User...');
  const result = await apiCall('GET', '/auth/me');

  if (result.success) {
    console.log('✅ Current user retrieved');
    console.log(`   Name: ${result.data.user.firstName} ${result.data.user.lastName}`);
    console.log(`   Role: ${result.data.user.role}`);
    return true;
  } else {
    console.log('❌ Get current user failed:', result.error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🧪 INVOICE CRM - COMPREHENSIVE SANITY TEST');
  console.log('═══════════════════════════════════════════════════');

  const tests = [
    testLogin,
    testMe,
    testDashboardStats,
    testCustomers,
    testInvoices,
    testPayments,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test();
    if (result) passed++;
    else failed++;
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('📈 TEST RESULTS');
  console.log('═══════════════════════════════════════════════════');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  console.log('═══════════════════════════════════════════════════\n');

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Your Invoice CRM is working perfectly!\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
  }
}

// Run the tests
runAllTests().catch(console.error);

