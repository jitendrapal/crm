import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate, JWTPayload } from '../middleware/auth';
import { z } from 'zod';
import prisma from '../lib/prisma';

const updateTenantSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.enum(['USD', 'EUR', 'INR']).optional(),
});

export async function tenantRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // Get tenant
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;
      const { id } = request.params as any;

      // Users can only access their own tenant
      if (user.tenantId !== id) {
        return reply.code(403).send({ error: 'Forbidden' });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id },
      });

      if (!tenant) {
        return reply.code(404).send({ error: 'Tenant not found' });
      }

      reply.send(tenant);
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Update tenant
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;
      const { id } = request.params as any;

      // Users can only update their own tenant
      if (user.tenantId !== id) {
        return reply.code(403).send({ error: 'Forbidden' });
      }

      const data = updateTenantSchema.parse(request.body);

      // Check if email is being changed and if it's already taken
      if (data.email) {
        const existingTenant = await prisma.tenant.findFirst({
          where: {
            email: data.email,
            id: { not: id },
          },
        });

        if (existingTenant) {
          return reply.code(400).send({ error: 'Email already in use' });
        }
      }

      const tenant = await prisma.tenant.update({
        where: { id },
        data,
      });

      reply.send(tenant);
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });
}
