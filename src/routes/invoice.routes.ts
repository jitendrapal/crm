import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { invoiceService } from '../services/invoice.service';
import { pdfService } from '../services/pdf.service';
import { createInvoiceSchema, updateInvoiceSchema } from '../schemas/invoice.schema';
import { authenticate } from '../middleware/auth';
import prisma from '../lib/prisma';
import fs from 'fs';

export async function invoiceRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // Create invoice
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = createInvoiceSchema.parse(request.body);
      const invoice = await invoiceService.createInvoice(request.user!.tenantId, data);
      reply.code(201).send({ invoice });
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Get all invoices
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { page = 1, limit = 10, status, customerId } = request.query as any;
      const result = await invoiceService.getInvoices(
        request.user!.tenantId,
        { status, customerId },
        parseInt(page),
        parseInt(limit)
      );
      reply.send(result);
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Get invoice by ID
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const invoice = await invoiceService.getInvoiceById(request.user!.tenantId, id);
      reply.send({ invoice });
    } catch (error: any) {
      reply.code(404).send({ error: error.message });
    }
  });

  // Update invoice
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const data = updateInvoiceSchema.parse(request.body);
      const invoice = await invoiceService.updateInvoice(
        request.user!.tenantId,
        id,
        data
      );
      reply.send({ invoice });
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Delete invoice
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      await invoiceService.deleteInvoice(request.user!.tenantId, id);
      reply.code(204).send();
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Mark invoice as sent
  fastify.post('/:id/send', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const invoice = await invoiceService.markInvoiceAsSent(request.user!.tenantId, id);
      reply.send({ invoice });
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Generate PDF
  fastify.get('/:id/pdf', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as any;
      const invoice = await invoiceService.getInvoiceById(request.user!.tenantId, id);

      // Include tenant info for PDF
      const invoiceWithTenant = {
        ...invoice,
        tenant: await prisma.tenant.findUnique({
          where: { id: request.user!.tenantId },
        }),
      };

      const pdfPath = await pdfService.generateInvoicePDF(invoiceWithTenant);

      // Update invoice with PDF URL
      await prisma.invoice.update({
        where: { id },
        data: { pdfUrl: pdfPath },
      });

      // Send the PDF file
      const pdfBuffer = fs.readFileSync(pdfPath);
      reply.type('application/pdf').send(pdfBuffer);
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Check overdue invoices (admin only)
  fastify.post(
    '/check-overdue',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const overdueInvoices = await invoiceService.checkOverdueInvoices();
        reply.send({
          message: `Checked ${overdueInvoices.length} overdue invoices`,
          invoices: overdueInvoices,
        });
      } catch (error: any) {
        reply.code(400).send({ error: error.message });
      }
    }
  );
}
