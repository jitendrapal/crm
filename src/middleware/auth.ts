import { FastifyRequest, FastifyReply } from 'fastify';

// Extend the FastifyRequest interface for JWT
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      tenantId: string;
      email: string;
      role: string;
    };
  }
}

export type AuthenticatedRequest = FastifyRequest;

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    // The decoded JWT payload is automatically attached to request.user by @fastify/jwt
  } catch (_err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();

    if (request.user?.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden: Admin access required' });
    }
  } catch (_err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}
