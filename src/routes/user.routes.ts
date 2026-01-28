import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service';
import { authenticate, JWTPayload } from '../middleware/auth';
import { z } from 'zod';

const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

export async function userRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // Update user
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;
      const { id } = request.params as any;

      // Users can only update their own profile
      if (user.userId !== id) {
        return reply.code(403).send({ error: 'Forbidden' });
      }

      const data = updateUserSchema.parse(request.body);
      const updatedUser = await authService.updateUser(id, data);
      reply.send({ user: updatedUser });
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });
}

