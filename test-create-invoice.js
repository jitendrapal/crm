/**
 * Test Invoice Creation
 */

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let customerId = '';

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

async function login() {
  console.log('🔐 Logging in...');
  const result = await apiCall('POST', '/auth/login', {
    email: 'admin@demo.com',
    password: 'Demo123!'
  });

  if (result.success) {
    authToken = result.data.token;
    console.log('✅ Login successful\n');
    return true;
  } else {
    console.log('❌ Login failed:', result.error);
    return false;
  }
}

async function getFirstCustomer() {
  console.log('👥 Getting first customer...');
  const result = await apiCall('GET', '/customers?page=1&limit=1');

  if (result.success && result.data.data && result.data.data.length > 0) {
    customerId = result.data.data[0].id;
    console.log(`✅ Customer found: ${result.data.data[0].name} (${customerId})\n`);
    return true;
  } else {
    console.log('❌ No customers found');
    return false;
  }
}

async function createInvoice() {
  console.log('📄 Creating invoice...');
  
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const invoiceData = {
    customerId: customerId,
    issueDate: today,
    dueDate: dueDate,
    tax: 150,
    discount: 50,
    notes: 'Test invoice created via API',
    items: [
      {
        description: 'Web Development Services',
        quantity: 10,
        unitPrice: 100
      },
      {
        description: 'Consulting Hours',
        quantity: 5,
        unitPrice: 150
      }
    ]
  };

  console.log('Invoice data:', JSON.stringify(invoiceData, null, 2));
  
  const result = await apiCall('POST', '/invoices', invoiceData);

  if (result.success) {
    console.log('\n✅ Invoice created successfully!');
    console.log(`   Invoice Number: ${result.data.invoice.invoiceNumber}`);
    console.log(`   Customer: ${result.data.invoice.customer.name}`);
    console.log(`   Subtotal: $${result.data.invoice.subtotal.toFixed(2)}`);
    console.log(`   Tax: $${result.data.invoice.tax.toFixed(2)}`);
    console.log(`   Discount: $${result.data.invoice.discount.toFixed(2)}`);
    console.log(`   Total: $${result.data.invoice.total.toFixed(2)}`);
    console.log(`   Status: ${result.data.invoice.status}`);
    console.log(`   Items: ${result.data.invoice.items.length}`);
    return true;
  } else {
    console.log('\n❌ Invoice creation failed!');
    console.log('Error:', result.error);
    return false;
  }
}

async function runTest() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🧪 TEST: CREATE INVOICE');
  console.log('═══════════════════════════════════════════════════\n');

  const loginSuccess = await login();
  if (!loginSuccess) return;

  const customerSuccess = await getFirstCustomer();
  if (!customerSuccess) return;

  await createInvoice();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════\n');
}

runTest().catch(console.error);

