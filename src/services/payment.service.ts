import prisma from '../lib/prisma';
import { CreatePaymentInput } from '../schemas/payment.schema';
import { webhookService } from './webhook.service';

export class PaymentService {
  async createPayment(tenantId: string, data: CreatePaymentInput) {
    // Verify invoice belongs to tenant
    const invoice = await prisma.invoice.findFirst({
      where: { id: data.invoiceId, tenantId },
      include: { payments: true },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Calculate total paid
    const totalPaid =
      invoice.payments.reduce((sum, p) => sum + p.amount, 0) + data.amount;

    // Check if payment exceeds invoice total
    if (totalPaid > invoice.total) {
      throw new Error('Payment amount exceeds invoice total');
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId: data.invoiceId,
        tenantId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        transactionId: data.transactionId,
        notes: data.notes,
      },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });

    // Update invoice status if fully paid
    if (totalPaid >= invoice.total) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'PAID' },
      });
    }

    // Trigger n8n webhook for payment received
    await webhookService.triggerPaymentReceived(payment);

    return payment;
  }

  async getPayments(tenantId: string, invoiceId?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };

    if (invoiceId) {
      where.invoiceId = invoiceId;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paymentDate: 'desc' },
        include: {
          invoice: {
            include: {
              customer: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPaymentById(tenantId: string, paymentId: string) {
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, tenantId },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  }
}

export const paymentService = new PaymentService();
