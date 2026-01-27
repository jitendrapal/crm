import { FastifyRequest, FastifyReply } from 'fastify';

// Define the JWT payload type
export interface JWTPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

// Extend the @fastify/jwt module to use our payload type
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
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

    const user = request.user as JWTPayload;
    if (user?.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden: Admin access required' });
    }
  } catch (_err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}
