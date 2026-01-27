# Project Folder Structure

```
invoice_CRM/
│
├── prisma/                          # Database schema and migrations
│   ├── schema.prisma               # Prisma database schema (multi-tenant)
│   └── seed.ts                     # Database seeding script
│
├── src/                            # Source code
│   │
│   ├── config/                     # Configuration files
│   │   └── env.ts                  # Environment variables configuration
│   │
│   ├── lib/                        # Shared libraries
│   │   └── prisma.ts               # Prisma client instance
│   │
│   ├── middleware/                 # Fastify middleware
│   │   └── auth.ts                 # JWT authentication middleware
│   │
│   ├── routes/                     # API route handlers
│   │   ├── auth.routes.ts          # Authentication endpoints
│   │   ├── customer.routes.ts      # Customer CRUD endpoints
│   │   ├── invoice.routes.ts       # Invoice CRUD + PDF endpoints
│   │   ├── payment.routes.ts       # Payment endpoints
│   │   └── webhook.routes.ts       # Stripe webhook handler
│   │
│   ├── schemas/                    # Zod validation schemas
│   │   ├── auth.schema.ts          # Auth input validation
│   │   ├── customer.schema.ts      # Customer input validation
│   │   ├── invoice.schema.ts       # Invoice input validation
│   │   └── payment.schema.ts       # Payment input validation
│   │
│   ├── services/                   # Business logic layer
│   │   ├── auth.service.ts         # User authentication logic
│   │   ├── customer.service.ts     # Customer management logic
│   │   ├── invoice.service.ts      # Invoice management logic
│   │   ├── payment.service.ts      # Payment processing logic
│   │   ├── pdf.service.ts          # PDF generation (PDFKit)
│   │   ├── stripe.service.ts       # Stripe integration
│   │   └── webhook.service.ts      # n8n webhook triggers
│   │
│   ├── utils/                      # Utility functions
│   │   └── password.ts             # Password hashing utilities
│   │
│   └── server.ts                   # Main application entry point
│
├── storage/                        # File storage (gitignored)
│   └── invoices/                   # Generated PDF invoices
│
├── dist/                           # Compiled TypeScript (gitignored)
│
├── node_modules/                   # Dependencies (gitignored)
│
├── .env                            # Environment variables (gitignored)
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── .dockerignore                   # Docker ignore rules
├── .prettierrc                     # Prettier configuration
├── .eslintrc.json                  # ESLint configuration
│
├── package.json                    # NPM dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── Dockerfile                      # Docker container definition
├── docker-compose.yml              # Docker Compose orchestration
│
├── README.md                       # Main documentation
├── QUICKSTART.md                   # Quick start guide
├── SETUP.md                        # Detailed setup instructions
├── API_DOCUMENTATION.md            # API endpoint documentation
├── N8N_WORKFLOWS.md                # n8n webhook setup guide
├── SECURITY.md                     # Security best practices
└── FOLDER_STRUCTURE.md             # This file
```

## Key Components Explained

### 📁 `/prisma`
- **schema.prisma**: Defines database tables with multi-tenant architecture
- **seed.ts**: Creates demo data for testing

### 📁 `/src/config`
- **env.ts**: Centralizes environment variable access with validation

### 📁 `/src/lib`
- **prisma.ts**: Singleton Prisma client instance

### 📁 `/src/middleware`
- **auth.ts**: JWT verification and role-based access control

### 📁 `/src/routes`
- **auth.routes.ts**: Register, login, get current user
- **customer.routes.ts**: CRUD operations for customers
- **invoice.routes.ts**: CRUD + PDF generation + status updates
- **payment.routes.ts**: Payment recording and tracking
- **webhook.routes.ts**: Stripe webhook event handling

### 📁 `/src/schemas`
Zod validation schemas for type-safe input validation:
- Email format validation
- UUID validation
- Number range validation
- Required vs optional fields

### 📁 `/src/services`
Business logic separated from routes:
- **auth.service.ts**: User registration, login, JWT generation
- **customer.service.ts**: Customer management with tenant isolation
- **invoice.service.ts**: Invoice creation, updates, overdue checking
- **payment.service.ts**: Payment processing, invoice status updates
- **pdf.service.ts**: Professional PDF invoice generation
- **stripe.service.ts**: Stripe API integration
- **webhook.service.ts**: n8n webhook notifications

### 📁 `/src/utils`
- **password.ts**: Bcrypt hashing and comparison

### 📄 `server.ts`
Main application file:
- Fastify server setup
- Plugin registration (CORS, Helmet, JWT, Rate Limiting)
- Route registration
- Error handling
- Graceful shutdown

## Data Flow

```
Client Request
    ↓
Fastify Server (server.ts)
    ↓
Middleware (auth.ts) → JWT Verification
    ↓
Routes (*.routes.ts) → Request Handling
    ↓
Schemas (*.schema.ts) → Input Validation
    ↓
Services (*.service.ts) → Business Logic
    ↓
Prisma (prisma.ts) → Database Operations
    ↓
PostgreSQL Database
    ↓
Response to Client
```

## Multi-Tenant Architecture

Every request follows this pattern:

```
1. User logs in → JWT contains tenantId
2. Request includes JWT token
3. Middleware verifies JWT → extracts tenantId
4. Service layer filters by tenantId
5. Database query includes WHERE tenantId = ...
6. Only tenant's data is returned
```

## Security Layers

```
1. Rate Limiting → Prevent abuse
2. CORS → Control origins
3. Helmet → Security headers
4. JWT → Authentication
5. Zod → Input validation
6. Prisma → SQL injection prevention
7. Bcrypt → Password hashing
8. Tenant Isolation → Data separation
```

## File Naming Conventions

- **Routes**: `*.routes.ts` - API endpoint handlers
- **Services**: `*.service.ts` - Business logic
- **Schemas**: `*.schema.ts` - Validation schemas
- **Config**: `*.ts` - Configuration files
- **Utils**: `*.ts` - Utility functions

## Environment Files

- `.env` - Local environment variables (gitignored)
- `.env.example` - Template for required variables
- Production uses environment variables from hosting platform

## Build Output

```
dist/
├── config/
├── lib/
├── middleware/
├── routes/
├── schemas/
├── services/
├── utils/
└── server.js
```

## Docker Structure

```
Dockerfile → Multi-stage build
    ↓
Stage 1: Builder → Compile TypeScript
    ↓
Stage 2: Production → Minimal runtime image
```

## Scripts (package.json)

- `npm run dev` → Development with hot reload
- `npm run build` → Compile TypeScript
- `npm start` → Production server
- `npm run prisma:generate` → Generate Prisma Client
- `npm run prisma:migrate` → Run database migrations
- `npm run prisma:studio` → Open database GUI
- `npm run prisma:seed` → Seed demo data

## Port Usage

- **3000**: API Server
- **5432**: PostgreSQL
- **5555**: Prisma Studio
- **5678**: n8n (optional)

## Storage

- `/storage/invoices/` - Generated PDF files
- Gitignored, created at runtime
- Should be backed up in production

## Dependencies

### Production
- `fastify` - Web framework
- `@prisma/client` - Database ORM
- `bcrypt` - Password hashing
- `stripe` - Payment processing
- `pdfkit` - PDF generation
- `zod` - Schema validation

### Development
- `typescript` - Type safety
- `tsx` - TypeScript execution
- `prisma` - Database toolkit
- `eslint` - Code linting
- `prettier` - Code formatting

## Best Practices

1. **Separation of Concerns**: Routes → Services → Database
2. **Type Safety**: TypeScript + Zod validation
3. **Security First**: Multiple security layers
4. **Multi-tenancy**: Strict tenant isolation
5. **Error Handling**: Centralized error handler
6. **Logging**: Structured logging with Fastify
7. **Testing**: Organized structure for easy testing
8. **Documentation**: Comprehensive docs for all features

