import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Company Inc.',
      email: 'demo@company.com',
      phone: '+1-555-0100',
      address: '123 Business Avenue, Suite 100, New York, NY 10001',
    },
  });

  console.log('✅ Created tenant:', tenant.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash('Demo123!', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create demo customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Tech Startup LLC',
        email: 'contact@techstartup.com',
        phone: '+1-555-0101',
        address: '456 Innovation Drive',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
        tenantId: tenant.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Retail Solutions Corp',
        email: 'billing@retailsolutions.com',
        phone: '+1-555-0102',
        address: '789 Commerce Street',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        tenantId: tenant.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Global Consulting Group',
        email: 'accounts@globalconsulting.com',
        phone: '+1-555-0103',
        address: '321 Executive Plaza',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        country: 'USA',
        tenantId: tenant.id,
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // Create demo invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-00001',
      customerId: customers[0].id,
      tenantId: tenant.id,
      status: 'SENT',
      issueDate: new Date('2024-01-01'),
      dueDate: new Date('2024-01-31'),
      subtotal: 5000,
      tax: 500,
      discount: 0,
      total: 5500,
      notes: 'Web development services for Q1 2024',
      items: {
        create: [
          {
            description: 'Frontend Development',
            quantity: 40,
            unitPrice: 100,
            amount: 4000,
          },
          {
            description: 'Backend API Development',
            quantity: 10,
            unitPrice: 100,
            amount: 1000,
          },
        ],
      },
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-00002',
      customerId: customers[1].id,
      tenantId: tenant.id,
      status: 'PAID',
      issueDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
      subtotal: 3000,
      tax: 300,
      discount: 150,
      total: 3150,
      notes: 'E-commerce platform setup',
      items: {
        create: [
          {
            description: 'Platform Setup',
            quantity: 1,
            unitPrice: 2000,
            amount: 2000,
          },
          {
            description: 'Training Sessions',
            quantity: 10,
            unitPrice: 100,
            amount: 1000,
          },
        ],
      },
    },
  });

  console.log(`✅ Created 2 invoices`);

  // Create a payment for the paid invoice
  await prisma.payment.create({
    data: {
      invoiceId: invoice2.id,
      tenantId: tenant.id,
      amount: 3150,
      paymentMethod: 'BANK_TRANSFER',
      paymentDate: new Date('2024-02-10'),
      transactionId: 'TXN-2024-001',
      notes: 'Payment received via wire transfer',
    },
  });

  console.log('✅ Created payment record');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Demo Credentials:');
  console.log('   Email: admin@demo.com');
  console.log('   Password: Demo123!');
  console.log('\n🚀 You can now start the server with: npm run dev');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

