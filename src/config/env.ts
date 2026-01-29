import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',

  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // JWT
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

  // n8n Webhooks
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || '',
  n8nInvoiceCreatedWebhook: process.env.N8N_INVOICE_CREATED_WEBHOOK || '',
  n8nInvoiceOverdueWebhook: process.env.N8N_INVOICE_OVERDUE_WEBHOOK || '',
  n8nPaymentReceivedWebhook: process.env.N8N_PAYMENT_RECEIVED_WEBHOOK || '',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Rate Limiting
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  rateLimitTimeWindow: process.env.RATE_LIMIT_TIME_WINDOW || '15m',

  // PDF
  pdfStoragePath: process.env.PDF_STORAGE_PATH || './storage/invoices',
  companyLogoUrl: process.env.COMPANY_LOGO_URL || '',

  // Email (Resend)
  resendApiKey: process.env.RESEND_API_KEY || '',
  fromEmail: process.env.FROM_EMAIL || 'onboarding@resend.dev',
  companyName: process.env.COMPANY_NAME || 'Invoice CRM',
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
