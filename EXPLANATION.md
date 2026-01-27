# Invoice CRM SaaS - Simple Explanation

This document explains each component of the Invoice CRM system in simple terms.

## 🎯 What Does This System Do?

This is a **complete backend system** for managing invoices, like a mini QuickBooks or FreshBooks. It allows:

1. **Companies** to sign up and manage their invoicing
2. **Create customers** (clients who will receive invoices)
3. **Generate invoices** with line items, taxes, and discounts
4. **Track payments** when customers pay
5. **Generate PDF invoices** for sending to customers
6. **Automate notifications** via webhooks (email, Slack, etc.)
7. **Process payments** through Stripe

## 🏢 Multi-Tenant Architecture (Simple Explanation)

**What is Multi-Tenant?**
Think of it like an apartment building:
- Each company is a separate apartment (tenant)
- Each tenant has their own data (customers, invoices, payments)
- Tenants can't see each other's data
- They all use the same building (database)

**How It Works:**
```
Company A logs in → Can only see Company A's data
Company B logs in → Can only see Company B's data
```

Every database table has a `tenantId` column that keeps data separated.

## 🔐 Authentication Flow (Simple Explanation)

**Registration:**
1. User fills out registration form
2. System creates a new company (tenant)
3. System creates first user as admin
4. System returns a JWT token (like a digital key card)

**Login:**
1. User enters email and password
2. System checks if password is correct
3. System creates a JWT token
4. User uses this token for all future requests

**Making Requests:**
```
Every request includes: Authorization: Bearer <token>
Server reads token → knows who you are → shows only your data
```

## 📊 Database Schema (Simple Explanation)

### Tenant (Company)
```
- id: Unique identifier
- name: Company name
- email: Company email
- phone, address: Contact info
```

### User
```
- id: Unique identifier
- email, password: Login credentials
- firstName, lastName: User name
- role: ADMIN or USER
- tenantId: Which company they belong to
```

### Customer (Your Clients)
```
- id: Unique identifier
- name, email, phone: Contact info
- address, city, state, zipCode: Location
- tenantId: Which company owns this customer
```

### Invoice
```
- id: Unique identifier
- invoiceNumber: INV-2024-00001
- customerId: Who to bill
- status: DRAFT, SENT, PAID, OVERDUE, CANCELLED
- dueDate: When payment is due
- subtotal, tax, discount, total: Money amounts
- tenantId: Which company owns this invoice
```

### InvoiceItem (Line Items)
```
- description: "Web Development Services"
- quantity: 40 hours
- unitPrice: $100 per hour
- amount: $4,000 (quantity × unitPrice)
```

### Payment
```
- invoiceId: Which invoice was paid
- amount: How much was paid
- paymentMethod: CREDIT_CARD, BANK_TRANSFER, etc.
- paymentDate: When payment was received
- tenantId: Which company received payment
```

## 🔄 How Each Feature Works

### 1. User Registration
```
POST /api/auth/register
→ Creates tenant (company)
→ Creates admin user
→ Returns JWT token
```

### 2. Creating a Customer
```
POST /api/customers
→ Validates input (email format, required fields)
→ Saves to database with tenantId
→ Returns customer data
```

### 3. Creating an Invoice
```
POST /api/invoices
→ Validates customer belongs to your company
→ Calculates totals (subtotal + tax - discount)
→ Generates invoice number (INV-2024-00001)
→ Creates invoice and line items
→ Triggers webhook (sends notification to n8n)
→ Returns invoice data
```

### 4. Recording a Payment
```
POST /api/payments
→ Validates invoice belongs to your company
→ Checks payment doesn't exceed invoice total
→ Creates payment record
→ Updates invoice status to PAID if fully paid
→ Triggers webhook (payment received notification)
→ Returns payment data
```

### 5. Generating PDF
```
GET /api/invoices/:id/pdf
→ Fetches invoice with all details
→ Uses PDFKit to create professional PDF
→ Saves to storage/invoices/
→ Returns PDF file for download
```

## 🔔 Webhook System (Simple Explanation)

**What are Webhooks?**
Webhooks are like automatic phone calls to other systems when something happens.

**Example Flow:**
```
1. Customer pays invoice
2. System records payment
3. System calls webhook URL (n8n)
4. n8n receives notification
5. n8n sends email to customer: "Payment received!"
6. n8n posts to Slack: "💰 New payment: $5,000"
```

**Three Webhook Events:**
1. **Invoice Created** → Send invoice to customer
2. **Invoice Overdue** → Send reminder to customer
3. **Payment Received** → Send thank you email

## 💳 Stripe Integration (Simple Explanation)

**What is Stripe?**
Stripe processes credit card payments online.

**How It Works:**
1. Create invoice in our system
2. System creates matching invoice in Stripe
3. Customer pays via Stripe
4. Stripe sends webhook to our system
5. Our system records the payment
6. Invoice marked as PAID

## 🛡️ Security Features (Simple Explanation)

### 1. Password Security
- Passwords are **hashed** (scrambled) before saving
- Even admins can't see your password
- Uses bcrypt with 10 salt rounds (very secure)

### 2. JWT Tokens
- Like a digital ID card
- Contains: userId, tenantId, email, role
- Expires after 7 days
- Can't be faked (cryptographically signed)

### 3. Rate Limiting
- Maximum 100 requests per 15 minutes
- Prevents abuse and attacks
- Protects server from overload

### 4. Input Validation
- Every input is checked (Zod schemas)
- Email must be valid email format
- Numbers must be positive
- Required fields must be present

### 5. Tenant Isolation
- Every query filters by tenantId
- Impossible to see other companies' data
- Enforced at database level

## 📁 Code Organization (Simple Explanation)

### Routes (API Endpoints)
```typescript
// auth.routes.ts
POST /api/auth/register → Register new user
POST /api/auth/login → Login user
GET /api/auth/me → Get current user
```

### Services (Business Logic)
```typescript
// invoice.service.ts
createInvoice() → Creates invoice + items + triggers webhook
getInvoices() → Lists invoices with pagination
updateInvoice() → Updates invoice and recalculates totals
```

### Schemas (Validation)
```typescript
// invoice.schema.ts
createInvoiceSchema → Validates invoice creation input
- customerId must be UUID
- items must have at least 1 item
- tax and discount must be non-negative
```

### Middleware (Security)
```typescript
// auth.ts
authenticate() → Verifies JWT token
requireAdmin() → Checks if user is admin
```

## 🚀 Deployment Options

### Option 1: Traditional Server
```bash
npm run build
npm start
# Use PM2 for process management
```

### Option 2: Docker
```bash
docker-compose up -d
# Starts database + API + n8n
```

### Option 3: Cloud Platforms
- **Heroku**: Easy deployment
- **AWS**: Elastic Beanstalk or ECS
- **DigitalOcean**: App Platform
- **Railway**: Simple deployment

## 🔧 Environment Variables (Simple Explanation)

**What are Environment Variables?**
Settings that change between development and production.

**Required Variables:**
```env
DATABASE_URL → Where is the database?
JWT_SECRET → Secret key for tokens (like a master password)
STRIPE_SECRET_KEY → Stripe API key
N8N_*_WEBHOOK → Where to send notifications
```

**Why Not Hardcode?**
- Different settings for dev/staging/production
- Keep secrets out of code
- Easy to change without redeploying

## 📈 Typical User Journey

1. **Company Signs Up**
   - POST /api/auth/register
   - Gets JWT token

2. **Add First Customer**
   - POST /api/customers
   - Saves client information

3. **Create Invoice**
   - POST /api/invoices
   - Invoice created with DRAFT status

4. **Send Invoice**
   - POST /api/invoices/:id/send
   - Status changes to SENT
   - Webhook triggers → Email sent to customer

5. **Customer Pays**
   - Payment processed via Stripe
   - Webhook received from Stripe
   - POST /api/payments (automatic)
   - Status changes to PAID
   - Webhook triggers → Thank you email sent

6. **Download PDF**
   - GET /api/invoices/:id/pdf
   - Professional PDF generated
   - Sent to customer

## 🎓 Key Concepts

### REST API
- **GET**: Retrieve data
- **POST**: Create new data
- **PUT**: Update existing data
- **DELETE**: Remove data

### JWT (JSON Web Token)
- Secure way to identify users
- Contains user info (encrypted)
- Sent with every request

### ORM (Prisma)
- Talks to database using TypeScript
- Prevents SQL injection
- Type-safe queries

### Validation (Zod)
- Checks input before processing
- Prevents bad data
- Type-safe schemas

## 🆘 Common Questions

**Q: Can Company A see Company B's invoices?**
A: No! Every query filters by tenantId automatically.

**Q: What happens if someone forgets their password?**
A: You'll need to implement password reset (not included in starter).

**Q: Can I customize the PDF design?**
A: Yes! Edit `src/services/pdf.service.ts`

**Q: How do I add more user roles?**
A: Update the `UserRole` enum in `prisma/schema.prisma`

**Q: Is this production-ready?**
A: Yes, but add: password reset, email verification, better error handling, monitoring, backups.

## 📚 Learning Path

1. **Start Here**: QUICKSTART.md
2. **Understand Structure**: FOLDER_STRUCTURE.md
3. **Learn API**: API_DOCUMENTATION.md
4. **Setup Webhooks**: N8N_WORKFLOWS.md
5. **Security**: SECURITY.md
6. **Deploy**: SETUP.md

Happy coding! 🎉

