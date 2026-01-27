import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { seedDatabase } from '../scripts/seed-database';

export async function seedRoutes(fastify: FastifyInstance) {
  // Seed database endpoint (should be protected in production)
  // Using GET for easier testing
  fastify.get('/seed', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Only allow seeding in development or with a secret key
      const secretKey = process.env.SEED_SECRET_KEY || 'allow-seed-in-dev';
      const providedKey = (_request.headers['x-seed-key'] ||
        (_request.query as any)?.key) as string;

      if (process.env.NODE_ENV === 'production' && providedKey !== secretKey) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      await seedDatabase();

      reply.send({
        message: 'Database seeded successfully',
        credentials: {
          email: 'admin@demo.com',
          password: 'Demo123!',
        },
      });
    } catch (error: any) {
      fastify.log.error(error);
      reply.status(500).send({ error: error.message });
    }
  });

  // Check seed status
  fastify.get('/seed/status', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const prisma = (await import('../lib/prisma')).default;

      const userCount = await prisma.user.count();
      const tenantCount = await prisma.tenant.count();
      const customerCount = await prisma.customer.count();
      const invoiceCount = await prisma.invoice.count();

      reply.send({
        seeded: userCount > 0,
        counts: {
          users: userCount,
          tenants: tenantCount,
          customers: customerCount,
          invoices: invoiceCount,
        },
      });
    } catch (error: any) {
      reply.status(500).send({ error: error.message });
    }
  });
}
