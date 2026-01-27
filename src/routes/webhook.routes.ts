import { FastifyInstance } from 'fastify';
import { stripeService } from '../services/stripe.service';

export async function webhookRoutes(fastify: FastifyInstance) {
  // Stripe webhook handler
  fastify.post(
    '/stripe',
    {
      config: {
        // Disable body parsing for Stripe webhooks (need raw body)
        rawBody: true,
      },
    },
    async (request, reply) => {
      try {
        const signature = request.headers['stripe-signature'] as string;

        if (!signature) {
          return reply.code(400).send({ error: 'Missing stripe-signature header' });
        }

        const payload = (request as any).rawBody || request.body;

        const result = await stripeService.handleWebhook(
          typeof payload === 'string' ? payload : JSON.stringify(payload),
          signature
        );

        reply.send(result);
      } catch (error: any) {
        console.error('Webhook error:', error);
        reply.code(400).send({ error: error.message });
      }
    }
  );

  // Health check for webhooks
  fastify.get('/health', async (request, reply) => {
    reply.send({ status: 'ok', timestamp: new Date().toISOString() });
  });
}

