/**
 * Test PDF Generation
 * 
 * This script tests the PDF generation functionality by:
 * 1. Logging in as admin
 * 2. Fetching an existing invoice
 * 3. Downloading the PDF
 * 4. Verifying the PDF was generated successfully
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

async function testPDFGeneration() {
  console.log('🧪 Testing PDF Generation...\n');

  try {
    // Step 1: Login
    console.log('1️⃣  Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@demo.com',
      password: 'Demo123!',
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Get invoices list
    console.log('2️⃣  Fetching invoices...');
    const invoicesResponse = await axios.get(`${API_URL}/invoices`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const invoices = invoicesResponse.data.invoices;
    if (invoices.length === 0) {
      console.log('❌ No invoices found. Please create an invoice first.');
      return;
    }

    const invoice = invoices[0];
    console.log(`✅ Found invoice: ${invoice.invoiceNumber}\n`);

    // Step 3: Download PDF
    console.log('3️⃣  Generating and downloading PDF...');
    const pdfResponse = await axios.get(`${API_URL}/invoices/${invoice.id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'arraybuffer',
    });

    // Step 4: Save PDF to file
    const pdfDir = path.join(__dirname, 'test-pdfs');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfPath = path.join(pdfDir, `${invoice.invoiceNumber}.pdf`);
    fs.writeFileSync(pdfPath, pdfResponse.data);

    console.log(`✅ PDF generated successfully!`);
    console.log(`📄 PDF saved to: ${pdfPath}`);
    console.log(`📊 PDF size: ${(pdfResponse.data.length / 1024).toFixed(2)} KB\n`);

    // Step 5: Verify PDF content
    const pdfBuffer = fs.readFileSync(pdfPath);
    const isPDF = pdfBuffer.toString('utf8', 0, 4) === '%PDF';

    if (isPDF) {
      console.log('✅ PDF file is valid (starts with %PDF header)\n');
    } else {
      console.log('❌ PDF file might be corrupted\n');
    }

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('📈 TEST RESULTS');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Login: PASSED`);
    console.log(`✅ Fetch Invoices: PASSED`);
    console.log(`✅ Generate PDF: PASSED`);
    console.log(`✅ Save PDF: PASSED`);
    console.log(`✅ Validate PDF: ${isPDF ? 'PASSED' : 'FAILED'}`);
    console.log('═══════════════════════════════════════════════════');
    console.log(`\n🎉 PDF Generation Test ${isPDF ? 'PASSED' : 'FAILED'}!\n`);

    console.log('📝 Invoice Details:');
    console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
    console.log(`   Customer: ${invoice.customer?.name || 'N/A'}`);
    console.log(`   Total: $${invoice.total?.toFixed(2) || '0.00'}`);
    console.log(`   Status: ${invoice.status}`);
    console.log(`   PDF Location: ${pdfPath}\n`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testPDFGeneration();

