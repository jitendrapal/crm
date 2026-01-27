import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';

export async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  // Check if already seeded
  const existingUser = await prisma.user.findFirst();
  if (existingUser) {
    console.log('⚠️  Database already seeded. Skipping...');
    return;
  }

  // Create demo tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Company',
      email: 'contact@democompany.com',
      phone: '+1-555-0100',
      address: '123 Business St, Suite 100, San Francisco, CA 94105, USA',
    },
  });

  console.log('✓ Created demo tenant');

  // Create demo admin user
  const hashedPassword = await bcrypt.hash('Demo123!', 10);
  await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  console.log('✓ Created admin user (admin@demo.com / Demo123!)');

  // Create demo customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        phone: '+1-555-0101',
        address: '456 Corporate Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        tenantId: tenant.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'TechStart Inc',
        email: 'accounts@techstart.com',
        phone: '+1-555-0102',
        address: '789 Innovation Dr',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        country: 'USA',
        tenantId: tenant.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Global Solutions Ltd',
        email: 'finance@globalsolutions.com',
        phone: '+1-555-0103',
        address: '321 Enterprise Blvd',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA',
        tenantId: tenant.id,
      },
    }),
  ]);

  console.log('✓ Created 3 demo customers');

  // Create demo invoices
  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-001',
        customerId: customers[0].id,
        tenantId: tenant.id,
        issueDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-15'),
        status: 'PAID',
        subtotal: 5000,
        tax: 500,
        total: 5500,
        notes: 'Thank you for your business!',
        items: {
          create: [
            {
              description: 'Web Development Services',
              quantity: 40,
              unitPrice: 100,
              amount: 4000,
            },
            {
              description: 'Hosting & Maintenance',
              quantity: 1,
              unitPrice: 1000,
              amount: 1000,
            },
          ],
        },
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-002',
        customerId: customers[1].id,
        tenantId: tenant.id,
        issueDate: new Date('2024-01-20'),
        dueDate: new Date('2024-02-20'),
        status: 'SENT',
        subtotal: 3000,
        tax: 300,
        total: 3300,
        notes: 'Payment due within 30 days',
        items: {
          create: [
            {
              description: 'Mobile App Development',
              quantity: 30,
              unitPrice: 100,
              amount: 3000,
            },
          ],
        },
      },
    }),
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2024-003',
        customerId: customers[2].id,
        tenantId: tenant.id,
        issueDate: new Date('2024-01-25'),
        dueDate: new Date('2024-01-10'),
        status: 'OVERDUE',
        subtotal: 7500,
        tax: 750,
        total: 8250,
        notes: 'Urgent: Payment overdue',
        items: {
          create: [
            {
              description: 'Consulting Services',
              quantity: 50,
              unitPrice: 150,
              amount: 7500,
            },
          ],
        },
      },
    }),
  ]);

  console.log('✓ Created 3 demo invoices');

  // Create payment for the paid invoice
  await prisma.payment.create({
    data: {
      invoiceId: invoices[0].id,
      tenantId: tenant.id,
      amount: 5500,
      paymentDate: new Date('2024-01-20'),
      paymentMethod: 'BANK_TRANSFER',
      transactionId: 'TXN-2024-001',
      notes: 'Payment received via bank transfer',
    },
  });

  console.log('✓ Created demo payment');

  console.log('🎉 Database seeded successfully!');
  console.log('📧 Login with: admin@demo.com / Demo123!');
}
