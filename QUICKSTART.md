# Quick Start Guide

Get your Invoice CRM SaaS backend up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 13+ installed (or use Docker)

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

## Step 2: Setup Environment (1 min)

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` and set minimum required variables:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/invoice_crm?schema=public"
JWT_SECRET="change-this-to-a-random-32-character-secret-key"
```

## Step 3: Setup Database (2 min)

### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL in Docker
docker run --name invoice-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=invoice_crm \
  -p 5432:5432 \
  -d postgres:15

# Wait 5 seconds for DB to start
sleep 5
```

### Option B: Using Local PostgreSQL

```bash
# Create database
createdb invoice_crm
```

## Step 4: Initialize Database (1 min)

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed with demo data (optional)
npm run prisma:seed
```

## Step 5: Start Server (< 1 min)

```bash
npm run dev
```

🎉 **Done!** Your server is running at `http://localhost:3000`

## Test It Out

### 1. Check Health

```bash
curl http://localhost:3000/health
```

### 2. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mycompany.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "companyName": "My Company Inc",
    "companyEmail": "info@mycompany.com"
  }'
```

Save the `token` from the response!

### 3. Create a Customer

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "First Client",
    "email": "client@example.com",
    "phone": "+1234567890"
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
        "description": "Consulting Services",
        "quantity": 10,
        "unitPrice": 100
      }
    ],
    "tax": 100,
    "discount": 0
  }'
```

## Using Demo Data

If you ran `npm run prisma:seed`, you can login with:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Demo123!"
  }'
```

## Next Steps

1. **Explore API**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. **Setup n8n**: See [N8N_WORKFLOWS.md](./N8N_WORKFLOWS.md)
3. **Configure Stripe**: Add your Stripe keys to `.env`
4. **Security**: Review [SECURITY.md](./SECURITY.md)
5. **Deploy**: See [SETUP.md](./SETUP.md) for production deployment

## Using Docker Compose (Alternative)

Start everything with one command:

```bash
# Create .env file first
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down
```

This starts:
- PostgreSQL database
- Invoice CRM API
- n8n automation platform

## Troubleshooting

### Port 3000 already in use

Change the port in `.env`:
```env
PORT=3001
```

### Database connection error

Check PostgreSQL is running:
```bash
# Docker
docker ps | grep postgres

# Local
pg_isready
```

### Prisma errors

Reset and regenerate:
```bash
npm run prisma:generate
npm run db:push
```

## Development Tools

### Prisma Studio (Database GUI)

```bash
npm run prisma:studio
```

Opens at `http://localhost:5555`

### View Logs

```bash
# Development mode shows detailed logs
npm run dev
```

### Format Code

```bash
npm run format
```

### Lint Code

```bash
npm run lint
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/customers` | List customers |
| POST | `/api/customers` | Create customer |
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Create invoice |
| GET | `/api/invoices/:id/pdf` | Download PDF |
| GET | `/api/payments` | List payments |
| POST | `/api/payments` | Record payment |

## Support

- 📖 Full Documentation: [README.md](./README.md)
- 🔧 Setup Guide: [SETUP.md](./SETUP.md)
- 🔐 Security: [SECURITY.md](./SECURITY.md)
- 🔔 Webhooks: [N8N_WORKFLOWS.md](./N8N_WORKFLOWS.md)
- 📡 API Docs: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

Happy coding! 🚀

