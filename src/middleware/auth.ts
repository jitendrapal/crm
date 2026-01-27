import { FastifyRequest, FastifyReply } from 'fastify';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    userId: string;
    tenantId: string;
    email: string;
    role: string;
  };
}

export async function authenticate(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    // The decoded JWT payload is automatically attached to request.user by @fastify/jwt
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}

export async function requireAdmin(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
    
    if (request.user?.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden: Admin access required' });
    }
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}

