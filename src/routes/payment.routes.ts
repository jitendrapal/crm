import { FastifyInstance } from 'fastify';
import { paymentService } from '../services/payment.service';
import { createPaymentSchema } from '../schemas/payment.schema';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';

export async function paymentRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // Create payment
  fastify.post('/', async (request: AuthenticatedRequest, reply) => {
    try {
      const data = createPaymentSchema.parse(request.body);
      const payment = await paymentService.createPayment(
        request.user!.tenantId,
        data
      );
      reply.code(201).send({ payment });
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Get all payments
  fastify.get('/', async (request: AuthenticatedRequest, reply) => {
    try {
      const { page = 1, limit = 10, invoiceId } = request.query as any;
      const result = await paymentService.getPayments(
        request.user!.tenantId,
        invoiceId,
        parseInt(page),
        parseInt(limit)
      );
      reply.send(result);
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Get payment by ID
  fastify.get('/:id', async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as any;
      const payment = await paymentService.getPaymentById(
        request.user!.tenantId,
        id
      );
      reply.send({ payment });
    } catch (error: any) {
      reply.code(404).send({ error: error.message });
    }
  });
}

