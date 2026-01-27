# Security Best Practices

This document outlines the security measures implemented in the Invoice CRM SaaS backend.

## 🔐 Authentication & Authorization

### JWT Tokens
- **Secret Key**: Use a strong, random secret (minimum 32 characters)
- **Expiration**: Tokens expire after 7 days (configurable)
- **Storage**: Never store JWT secret in code, use environment variables
- **Rotation**: Implement token refresh mechanism for production

### Password Security
- **Hashing**: Bcrypt with 10 salt rounds
- **Minimum Length**: 8 characters (enforce in validation)
- **Complexity**: Recommend uppercase, lowercase, numbers, special characters
- **Storage**: Never store plain text passwords

### Role-Based Access Control (RBAC)
- **Roles**: ADMIN, USER
- **Middleware**: `authenticate` and `requireAdmin` middleware
- **Tenant Isolation**: All queries filtered by `tenantId`

## 🛡️ Multi-Tenant Security

### Tenant Isolation
Every database query includes tenant filtering:

```typescript
// ✅ CORRECT - Tenant isolated
const customers = await prisma.customer.findMany({
  where: { tenantId: request.user.tenantId }
});

// ❌ WRONG - No tenant filtering
const customers = await prisma.customer.findMany();
```

### Best Practices
1. **Always filter by tenantId** in all queries
2. **Verify ownership** before updates/deletes
3. **Never trust client-provided tenantId**
4. **Use JWT payload** for tenantId (server-verified)

## 🚦 Rate Limiting

### Configuration
- **Default**: 100 requests per 15 minutes per IP
- **Customizable**: Via `RATE_LIMIT_MAX` and `RATE_LIMIT_TIME_WINDOW`
- **Per Route**: Can be customized per endpoint

### Implementation
```typescript
await fastify.register(rateLimit, {
  max: config.rateLimitMax,
  timeWindow: config.rateLimitTimeWindow,
});
```

## 🔒 Input Validation

### Zod Schemas
All inputs validated using Zod:

```typescript
const data = createCustomerSchema.parse(request.body);
```

### Validation Rules
- **Email**: Valid email format
- **UUID**: Valid UUID format for IDs
- **Numbers**: Positive values for amounts
- **Dates**: Valid ISO 8601 format
- **Strings**: Minimum/maximum length

### SQL Injection Prevention
- **Prisma ORM**: Parameterized queries prevent SQL injection
- **No raw SQL**: Avoid `prisma.$executeRaw` with user input

## 🌐 CORS Configuration

### Development
```env
CORS_ORIGIN=http://localhost:3001
```

### Production
```env
CORS_ORIGIN=https://your-frontend-domain.com
```

### Multiple Origins
```typescript
corsOrigin: ['https://app.example.com', 'https://admin.example.com']
```

## 🔐 Helmet Security Headers

Helmet adds security headers:
- `X-DNS-Prefetch-Control`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Strict-Transport-Security`
- `X-XSS-Protection`

## 💳 Stripe Security

### Webhook Verification
```typescript
const event = stripe.webhooks.constructEvent(
  payload,
  signature,
  config.stripeWebhookSecret
);
```

### Best Practices
1. **Verify signatures** on all webhook requests
2. **Use webhook secrets** from Stripe dashboard
3. **Handle idempotency** for payment events
4. **Log all transactions** for audit trail

## 🔑 Environment Variables

### Required Security Variables
```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
STRIPE_SECRET_KEY=sk_live_... # Use live keys in production
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql://... # Use SSL in production
```

### Best Practices
1. **Never commit** `.env` to version control
2. **Use different secrets** for dev/staging/prod
3. **Rotate secrets** regularly
4. **Use secret management** (AWS Secrets Manager, Vault)

## 🗄️ Database Security

### Connection Security
```env
# Production: Use SSL
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### Access Control
1. **Principle of least privilege**: App user has minimal permissions
2. **No direct access**: Database not publicly accessible
3. **Backup encryption**: Encrypt database backups
4. **Audit logging**: Enable PostgreSQL audit logs

### Prisma Security
```typescript
// ✅ Use Prisma's type-safe queries
await prisma.user.findUnique({ where: { id } });

// ❌ Avoid raw queries with user input
await prisma.$executeRaw`SELECT * FROM users WHERE id = ${id}`;
```

## 📝 Logging & Monitoring

### What to Log
- ✅ Authentication attempts (success/failure)
- ✅ Authorization failures
- ✅ API errors
- ✅ Webhook events
- ✅ Payment transactions

### What NOT to Log
- ❌ Passwords (even hashed)
- ❌ JWT tokens
- ❌ Credit card numbers
- ❌ Personal identification numbers
- ❌ API keys/secrets

### Implementation
```typescript
fastify.log.info({ userId, action: 'login' }, 'User logged in');
fastify.log.error({ error, userId }, 'Payment failed');
```

## 🚨 Error Handling

### Production Error Messages
```typescript
const message =
  config.nodeEnv === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : error.message;
```

### Best Practices
1. **Don't expose stack traces** in production
2. **Log detailed errors** server-side
3. **Return generic messages** to clients
4. **Use error codes** for client handling

## 🔄 API Security Checklist

- [x] JWT authentication on protected routes
- [x] Input validation with Zod
- [x] Rate limiting enabled
- [x] CORS configured
- [x] Helmet security headers
- [x] HTTPS in production
- [x] SQL injection prevention (Prisma)
- [x] XSS prevention (input sanitization)
- [x] CSRF protection (for cookie-based auth)
- [x] Tenant isolation
- [x] Password hashing (bcrypt)
- [x] Webhook signature verification

## 🚀 Production Deployment Security

### 1. HTTPS/TLS
```bash
# Use reverse proxy (nginx, Caddy)
# Or use cloud provider SSL (AWS ALB, Cloudflare)
```

### 2. Environment Isolation
- Separate databases for dev/staging/prod
- Different API keys per environment
- Isolated network/VPC

### 3. Secrets Management
```bash
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id prod/invoice-crm/jwt-secret

# HashiCorp Vault
vault kv get secret/invoice-crm/jwt-secret
```

### 4. Monitoring & Alerts
- Set up error tracking (Sentry, Rollbar)
- Monitor failed login attempts
- Alert on unusual API activity
- Track payment failures

### 5. Regular Updates
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Security patches
npm audit fix
```

## 🔍 Security Audit Checklist

### Monthly
- [ ] Review access logs
- [ ] Check for failed authentication attempts
- [ ] Review API error rates
- [ ] Audit user permissions

### Quarterly
- [ ] Rotate JWT secrets
- [ ] Update dependencies
- [ ] Review CORS settings
- [ ] Audit database access

### Annually
- [ ] Security penetration testing
- [ ] Code security review
- [ ] Update security policies
- [ ] Review compliance requirements

## 📞 Incident Response

### If Security Breach Detected
1. **Isolate**: Disable affected accounts/services
2. **Investigate**: Review logs, identify scope
3. **Notify**: Inform affected users (if required by law)
4. **Remediate**: Fix vulnerability, rotate secrets
5. **Document**: Record incident and response
6. **Review**: Update security measures

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Fastify Security](https://www.fastify.io/docs/latest/Guides/Security/)
- [Prisma Security](https://www.prisma.io/docs/guides/security)

