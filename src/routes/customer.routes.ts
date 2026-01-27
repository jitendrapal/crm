import { FastifyInstance } from 'fastify';
import { customerService } from '../services/customer.service';
import { createCustomerSchema, updateCustomerSchema } from '../schemas/customer.schema';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';

export async function customerRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // Create customer
  fastify.post('/', async (request: AuthenticatedRequest, reply) => {
    try {
      const data = createCustomerSchema.parse(request.body);
      const customer = await customerService.createCustomer(
        request.user!.tenantId,
        data
      );
      reply.code(201).send({ customer });
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Get all customers
  fastify.get('/', async (request: AuthenticatedRequest, reply) => {
    try {
      const { page = 1, limit = 10 } = request.query as any;
      const result = await customerService.getCustomers(
        request.user!.tenantId,
        parseInt(page),
        parseInt(limit)
      );
      reply.send(result);
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Get customer by ID
  fastify.get('/:id', async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as any;
      const customer = await customerService.getCustomerById(
        request.user!.tenantId,
        id
      );
      reply.send({ customer });
    } catch (error: any) {
      reply.code(404).send({ error: error.message });
    }
  });

  // Update customer
  fastify.put('/:id', async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as any;
      const data = updateCustomerSchema.parse(request.body);
      const customer = await customerService.updateCustomer(
        request.user!.tenantId,
        id,
        data
      );
      reply.send({ customer });
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Delete customer
  fastify.delete('/:id', async (request: AuthenticatedRequest, reply) => {
    try {
      const { id } = request.params as any;
      await customerService.deleteCustomer(request.user!.tenantId, id);
      reply.code(204).send();
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });
}

