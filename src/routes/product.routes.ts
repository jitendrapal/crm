import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { productService } from '../services/product.service';

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  unit: z.string().optional().default('item'),
  isActive: z.boolean().optional().default(true),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  unit: z.string().optional(),
  isActive: z.boolean().optional(),
});

const querySchema = z.object({
  search: z.string().optional(),
  isActive: z.string().optional().transform((val) => val === 'true'),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 50)),
});

export async function productRoutes(fastify: FastifyInstance) {
  // Get all products
  fastify.get('/', async (request, reply) => {
    try {
      const tenantId = request.user.tenantId;
      const filters = querySchema.parse(request.query);

      const result = await productService.findAll(tenantId, filters);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Get active products (for dropdown)
  fastify.get('/active', async (request, reply) => {
    try {
      const tenantId = request.user.tenantId;
      const products = await productService.getActiveProducts(tenantId);
      return reply.send({ data: products });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Get product by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const tenantId = request.user.tenantId;

      const product = await productService.findById(id, tenantId);

      if (!product) {
        return reply.status(404).send({ error: 'Product not found' });
      }

      return reply.send(product);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Create product
  fastify.post('/', async (request, reply) => {
    try {
      const tenantId = request.user.tenantId;
      const data = createProductSchema.parse(request.body);

      const product = await productService.create(tenantId, data);
      return reply.status(201).send(product);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      return reply.status(400).send({ error: error.message });
    }
  });

  // Update product
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const tenantId = request.user.tenantId;
      const data = updateProductSchema.parse(request.body);

      const product = await productService.update(id, tenantId, data);
      return reply.send(product);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      if (error.message === 'Product not found') {
        return reply.status(404).send({ error: error.message });
      }
      return reply.status(400).send({ error: error.message });
    }
  });

  // Delete product
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const tenantId = request.user.tenantId;

      await productService.delete(id, tenantId);
      return reply.status(204).send();
    } catch (error: any) {
      if (error.message === 'Product not found') {
        return reply.status(404).send({ error: error.message });
      }
      return reply.status(400).send({ error: error.message });
    }
  });
}

