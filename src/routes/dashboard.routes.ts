import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate, JWTPayload } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export async function dashboardRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // Get dashboard statistics
  fastify.get('/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;
      const tenantId = user.tenantId;

      // Get total customers
      const totalCustomers = await prisma.customer.count({
        where: { tenantId },
      });

      // Get invoice statistics
      const invoices = await prisma.invoice.findMany({
        where: { tenantId },
        select: {
          status: true,
          total: true,
        },
      });

      const totalInvoices = invoices.length;
      const paidInvoices = invoices.filter((inv) => inv.status === 'PAID').length;
      const overdueInvoices = invoices.filter((inv) => inv.status === 'OVERDUE').length;

      // Calculate revenue
      const totalRevenue = invoices
        .filter((inv) => inv.status === 'PAID')
        .reduce((sum, inv) => sum + inv.total, 0);

      const pendingRevenue = invoices
        .filter((inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
        .reduce((sum, inv) => sum + inv.total, 0);

      reply.send({
        totalCustomers,
        totalInvoices,
        paidInvoices,
        overdueInvoices,
        totalRevenue,
        pendingRevenue,
      });
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });
}
