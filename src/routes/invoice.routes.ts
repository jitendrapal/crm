import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { invoiceService } from '../services/invoice.service';
import { pdfService } from '../services/pdf.service';
import { emailService } from '../services/email.service';
import { createInvoiceSchema, updateInvoiceSchema } from '../schemas/invoice.schema';
import { authenticate, JWTPayload } from '../middleware/auth';
import prisma from '../lib/prisma';
import fs from 'fs';

export async function invoiceRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // Create invoice
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;
      const data = createInvoiceSchema.parse(request.body);
      const invoice = await invoiceService.createInvoice(user.tenantId, data);
      reply.code(201).send({ invoice });
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Get all invoices
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;
      const {
        page = 1,
        limit = 10,
        status,
        customerId,
        search,
        minAmount,
        maxAmount,
        startDate,
        endDate,
        dateFilter,
      } = request.query as any;

      const result = await invoiceService.getInvoices(
        user.tenantId,
        {
          status,
          customerId,
          search,
          minAmount: minAmount ? parseFloat(minAmount) : undefined,
          maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
          startDate,
          endDate,
          dateFilter,
        },
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
      const user = request.user as JWTPayload;
      const { id } = request.params as any;
      const invoice = await invoiceService.getInvoiceById(user.tenantId, id);
      reply.send({ invoice });
    } catch (error: any) {
      reply.code(404).send({ error: error.message });
    }
  });

  // Update invoice
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;
      const { id } = request.params as any;
      const data = updateInvoiceSchema.parse(request.body);
      const invoice = await invoiceService.updateInvoice(user.tenantId, id, data);
      reply.send({ invoice });
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Delete invoice
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;
      const { id } = request.params as any;
      await invoiceService.deleteInvoice(user.tenantId, id);
      reply.code(204).send();
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Send invoice via email
  fastify.post('/:id/send', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;
      const { id } = request.params as any;

      // Get invoice with customer details
      const invoice = await invoiceService.getInvoiceById(user.tenantId, id);

      if (!invoice.customer) {
        return reply.code(400).send({ error: 'Customer information not found' });
      }

      // Get tenant info for PDF
      const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
      });

      if (!tenant) {
        return reply.code(400).send({ error: 'Tenant information not found' });
      }

      // Generate PDF as Buffer for email attachment
      const invoiceWithTenant = { ...invoice, tenant };
      const pdfBuffer = await pdfService.generateInvoicePDFBuffer(invoiceWithTenant);

      // Send email with PDF attachment
      const emailResult = await emailService.sendInvoice(
        invoice,
        invoice.customer,
        pdfBuffer
      );

      if (!emailResult.success) {
        return reply.code(500).send({
          error: 'Failed to send email',
          details: emailResult.error,
        });
      }

      // Mark invoice as sent
      const updatedInvoice = await invoiceService.markInvoiceAsSent(user.tenantId, id);

      reply.send({
        invoice: updatedInvoice,
        message: 'Invoice sent successfully',
        emailId: emailResult.messageId,
      });
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      reply.code(400).send({ error: error.message });
    }
  });

  // Generate PDF
  fastify.get('/:id/pdf', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;
      const { id } = request.params as any;
      const invoice = await invoiceService.getInvoiceById(user.tenantId, id);

      // Include tenant info for PDF
      const invoiceWithTenant = {
        ...invoice,
        tenant: await prisma.tenant.findUnique({
          where: { id: user.tenantId },
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

  // Send payment reminder
  fastify.post('/:id/remind', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as JWTPayload;
      const { id } = request.params as any;

      // Get invoice with customer details
      const invoice = await invoiceService.getInvoiceById(user.tenantId, id);

      if (!invoice.customer) {
        return reply.code(400).send({ error: 'Customer information not found' });
      }

      // Send payment reminder email
      const emailResult = await emailService.sendPaymentReminder(
        invoice,
        invoice.customer
      );

      if (!emailResult.success) {
        return reply.code(500).send({
          error: 'Failed to send payment reminder',
          details: emailResult.error,
        });
      }

      reply.send({
        message: 'Payment reminder sent successfully',
        emailId: emailResult.messageId,
      });
    } catch (error: any) {
      console.error('Error sending payment reminder:', error);
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
