import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { paymentService } from '../services/payment.service';
import { createPaymentSchema } from '../schemas/payment.schema';
import { authenticate, JWTPayload } from '../middleware/auth';

export async function paymentRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // Create payment
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;
      const data = createPaymentSchema.parse(request.body);
      const payment = await paymentService.createPayment(user.tenantId, data);
      reply.code(201).send({ payment });
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Get all payments
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;
      const {
        page = 1,
        limit = 10,
        invoiceId,
        search,
        paymentMethod,
        minAmount,
        maxAmount,
        startDate,
        endDate,
        dateFilter,
      } = request.query as any;

      const result = await paymentService.getPayments(
        user.tenantId,
        {
          invoiceId,
          search,
          paymentMethod,
          minAmount: minAmount ? parseFloat(minAmount) : undefined,
          maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
          startDate,
          endDate,
          dateFilter,
        },
        parseInt(page),
        parseInt(limit)
      );
      reply.send(result);
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Get payment by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;
      const { id } = request.params as any;
      const payment = await paymentService.getPaymentById(user.tenantId, id);
      reply.send({ payment });
    } catch (error: any) {
      reply.code(404).send({ error: error.message });
    }
  });
}
