import { FastifyInstance } from 'fastify';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/register', async (request, reply) => {
    try {
      const data = registerSchema.parse(request.body);
      const result = await authService.register(data);

      const token = fastify.jwt.sign({
        userId: result.user.id,
        tenantId: result.user.tenantId,
        email: result.user.email,
        role: result.user.role,
      });

      reply.code(201).send({
        message: 'Registration successful',
        token,
        user: result.user,
        tenant: result.tenant,
      });
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const data = loginSchema.parse(request.body);
      const result = await authService.login(data);

      const token = fastify.jwt.sign({
        userId: result.user.id,
        tenantId: result.user.tenantId,
        email: result.user.email,
        role: result.user.role,
      });

      reply.send({
        message: 'Login successful',
        token,
        user: result.user,
      });
    } catch (error: any) {
      reply.code(401).send({ error: error.message });
    }
  });

  // Get current user
  fastify.get(
    '/me',
    { onRequest: [authenticate] },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const user = await authService.getUserById(request.user!.userId);
        reply.send({ user });
      } catch (error: any) {
        reply.code(404).send({ error: error.message });
      }
    }
  );
}

