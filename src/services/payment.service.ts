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

  async getPayments(
    tenantId: string,
    filters?: {
      invoiceId?: string;
      search?: string;
      paymentMethod?: string;
      minAmount?: number;
      maxAmount?: number;
      startDate?: string;
      endDate?: string;
      dateFilter?: 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR';
    },
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };

    // Invoice filter
    if (filters?.invoiceId) {
      where.invoiceId = filters.invoiceId;
    }

    // Search by invoice number or customer name
    if (filters?.search) {
      where.OR = [
        { invoice: { invoiceNumber: { contains: filters.search, mode: 'insensitive' } } },
        {
          invoice: {
            customer: { name: { contains: filters.search, mode: 'insensitive' } },
          },
        },
        { transactionId: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Payment method filter
    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    // Amount range filter
    if (filters?.minAmount !== undefined || filters?.maxAmount !== undefined) {
      where.amount = {};
      if (filters.minAmount !== undefined) {
        where.amount.gte = filters.minAmount;
      }
      if (filters.maxAmount !== undefined) {
        where.amount.lte = filters.maxAmount;
      }
    }

    // Date range filter
    if (filters?.startDate || filters?.endDate || filters?.dateFilter) {
      where.paymentDate = {};

      if (filters.dateFilter) {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = now;

        switch (filters.dateFilter) {
          case 'THIS_MONTH':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'LAST_MONTH':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
          case 'THIS_QUARTER':
            const quarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), quarter * 3, 1);
            break;
          case 'THIS_YEAR':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startDate = new Date(0);
        }

        where.paymentDate.gte = startDate;
        where.paymentDate.lte = endDate;
      } else {
        if (filters.startDate) {
          where.paymentDate.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.paymentDate.lte = new Date(filters.endDate);
        }
      }
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
