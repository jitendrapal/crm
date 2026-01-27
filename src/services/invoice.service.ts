import prisma from '../lib/prisma';
import { CreateInvoiceInput, UpdateInvoiceInput } from '../schemas/invoice.schema';
import { webhookService } from './webhook.service';

export class InvoiceService {
  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count();
    return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  async createInvoice(tenantId: string, data: CreateInvoiceInput) {
    // Verify customer belongs to tenant
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, tenantId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const total = subtotal + data.tax - data.discount;

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: data.customerId,
        tenantId,
        dueDate: new Date(data.dueDate),
        subtotal,
        tax: data.tax,
        discount: data.discount,
        total,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    // Trigger n8n webhook for invoice created
    await webhookService.triggerInvoiceCreated(invoice);

    return invoice;
  }

  async getInvoices(
    tenantId: string,
    filters?: { status?: string; customerId?: string },
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: true,
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getInvoiceById(tenantId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: {
        customer: true,
        items: true,
        payments: true,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return invoice;
  }

  async updateInvoice(tenantId: string, invoiceId: string, data: UpdateInvoiceInput) {
    // Verify invoice belongs to tenant
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // If updating items, recalculate totals
    let updateData: any = { ...data };

    if (data.items) {
      const subtotal = data.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const tax = data.tax ?? invoice.tax;
      const discount = data.discount ?? invoice.discount;
      const total = subtotal + tax - discount;

      updateData = {
        ...updateData,
        subtotal,
        total,
      };

      // Delete existing items and create new ones
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId },
      });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...updateData,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        items: data.items
          ? {
              create: data.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.quantity * item.unitPrice,
              })),
            }
          : undefined,
      },
      include: {
        items: true,
        customer: true,
      },
    });

    return updatedInvoice;
  }

  async deleteInvoice(tenantId: string, invoiceId: string) {
    // Verify invoice belongs to tenant
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Check if invoice has payments
    const paymentCount = await prisma.payment.count({
      where: { invoiceId },
    });

    if (paymentCount > 0) {
      throw new Error('Cannot delete invoice with existing payments');
    }

    return prisma.invoice.delete({
      where: { id: invoiceId },
    });
  }

  async markInvoiceAsSent(tenantId: string, invoiceId: string) {
    return this.updateInvoice(tenantId, invoiceId, { status: 'SENT' });
  }

  async checkOverdueInvoices() {
    const now = new Date();
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: 'SENT',
        dueDate: { lt: now },
      },
      include: {
        customer: true,
      },
    });

    for (const invoice of overdueInvoices) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'OVERDUE' },
      });

      // Trigger n8n webhook for overdue invoice
      await webhookService.triggerInvoiceOverdue(invoice);
    }

    return overdueInvoices;
  }
}

export const invoiceService = new InvoiceService();
