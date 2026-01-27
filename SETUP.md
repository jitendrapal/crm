# Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL Database

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (if not already installed)
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql
sudo systemctl start postgresql

# Create database
createdb invoice_crm
```

#### Option B: Docker PostgreSQL

```bash
docker run --name invoice-crm-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=invoice_crm \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and update:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/invoice_crm?schema=public"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
```

### 4. Initialize Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# View database in Prisma Studio (optional)
npm run prisma:studio
```

### 5. Start Development Server

```bash
npm run dev
```

Server will be running at `http://localhost:3000`

## Testing the API

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "companyName": "Acme Corp",
    "companyEmail": "info@acme.com",
    "companyPhone": "+1234567890"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePass123!"
  }'
```

Save the returned `token` for authenticated requests.

### 3. Create a Customer

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Client Company",
    "email": "client@example.com",
    "phone": "+1987654321",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }'
```

### 4. Create an Invoice

```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "customerId": "CUSTOMER_ID_FROM_STEP_3",
    "dueDate": "2024-12-31T00:00:00Z",
    "items": [
      {
        "description": "Web Development Services",
        "quantity": 40,
        "unitPrice": 100
      },
      {
        "description": "Hosting (Annual)",
        "quantity": 1,
        "unitPrice": 500
      }
    ],
    "tax": 450,
    "discount": 100,
    "notes": "Thank you for your business!"
  }'
```

### 5. Record a Payment

```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "invoiceId": "INVOICE_ID_FROM_STEP_4",
    "amount": 4850,
    "paymentMethod": "BANK_TRANSFER",
    "transactionId": "TXN123456",
    "notes": "Payment received via bank transfer"
  }'
```

## n8n Webhook Setup

### 1. Install n8n (Optional)

```bash
npm install -g n8n
n8n start
```

n8n will be available at `http://localhost:5678`

### 2. Create Webhooks in n8n

1. Create a new workflow
2. Add a "Webhook" node
3. Set the webhook path (e.g., `/webhook/invoice-created`)
4. Copy the webhook URL
5. Update `.env` with the webhook URLs

### 3. Test Webhooks

Create an invoice and check n8n for the webhook trigger.

## Stripe Setup (Optional)

### 1. Get Stripe Keys

1. Sign up at https://stripe.com
2. Get your API keys from the Dashboard
3. Update `.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 2. Setup Stripe Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events: `invoice.paid`, `payment_intent.succeeded`, `invoice.payment_failed`
4. Copy the webhook signing secret to `.env`

## Production Deployment

### Environment Variables

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@prod-host:5432/invoice_crm"
JWT_SECRET="use-a-strong-random-secret-at-least-32-characters"
CORS_ORIGIN="https://your-frontend-domain.com"
```

### Build and Run

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Using PM2

```bash
npm install -g pm2

# Start with PM2
pm2 start dist/server.js --name invoice-crm

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U username -d invoice_crm

# Check if PostgreSQL is running
# macOS
brew services list

# Linux
sudo systemctl status postgresql
```

### Prisma Issues

```bash
# Reset database (WARNING: deletes all data)
npm run db:reset

# Push schema without migrations
npm run db:push
```

### Port Already in Use

```bash
# Change PORT in .env
PORT=3001
```

## Next Steps

1. Set up automated backups for PostgreSQL
2. Configure monitoring (e.g., Sentry, DataDog)
3. Set up CI/CD pipeline
4. Implement automated testing
5. Add logging service
6. Configure SSL/TLS certificates
7. Set up load balancing (if needed)

