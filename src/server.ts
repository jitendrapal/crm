import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { config } from './config/env';
import { authRoutes } from './routes/auth.routes';
import { customerRoutes } from './routes/customer.routes';
import { invoiceRoutes } from './routes/invoice.routes';
import { paymentRoutes } from './routes/payment.routes';
import { webhookRoutes } from './routes/webhook.routes';
import { dashboardRoutes } from './routes/dashboard.routes';

const fastify = Fastify({
  logger: {
    level: config.nodeEnv === 'development' ? 'info' : 'error',
  },
});

async function buildServer() {
  // Register plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: config.nodeEnv === 'production',
  });

  await fastify.register(cors, {
    origin: config.corsOrigin,
    credentials: true,
  });

  await fastify.register(jwt, {
    secret: config.jwtSecret,
  });

  await fastify.register(rateLimit, {
    max: config.rateLimitMax,
    timeWindow: config.rateLimitTimeWindow,
  });

  await fastify.register(multipart);

  // Health check
  fastify.get('/health', async (_request, _reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // API routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(dashboardRoutes, { prefix: '/api/dashboard' });
  await fastify.register(customerRoutes, { prefix: '/api/customers' });
  await fastify.register(invoiceRoutes, { prefix: '/api/invoices' });
  await fastify.register(paymentRoutes, { prefix: '/api/payments' });
  await fastify.register(webhookRoutes, { prefix: '/api/webhooks' });

  // Error handler
  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);

    const statusCode = error.statusCode || 500;
    const message =
      config.nodeEnv === 'production' && statusCode === 500
        ? 'Internal Server Error'
        : error.message;

    reply.status(statusCode).send({
      error: message,
      statusCode,
    });
  });

  // 404 handler
  fastify.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      error: 'Route not found',
      statusCode: 404,
    });
  });

  return fastify;
}

async function start() {
  try {
    const server = await buildServer();

    await server.listen({
      port: config.port,
      host: config.host,
    });

    console.log(`
    🚀 Server is running!
    
    📍 URL: http://${config.host}:${config.port}
    🌍 Environment: ${config.nodeEnv}
    📊 Health: http://${config.host}:${config.port}/health
    
    API Endpoints:
    - POST   /api/auth/register
    - POST   /api/auth/login
    - GET    /api/auth/me
    - GET    /api/customers
    - POST   /api/customers
    - GET    /api/invoices
    - POST   /api/invoices
    - GET    /api/payments
    - POST   /api/payments
    - POST   /api/webhooks/stripe
    `);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

// Start server
if (require.main === module) {
  start();
}

export { buildServer };
