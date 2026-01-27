import { config } from '../config/env';

export class WebhookService {
  private async sendWebhook(url: string, data: any) {
    if (!url) {
      console.log('Webhook URL not configured, skipping...');
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error(`Webhook failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending webhook:', error);
    }
  }

  async triggerInvoiceCreated(invoice: any) {
    await this.sendWebhook(config.n8nInvoiceCreatedWebhook, {
      event: 'invoice.created',
      timestamp: new Date().toISOString(),
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        customerName: invoice.customer?.name,
        customerEmail: invoice.customer?.email,
        total: invoice.total,
        dueDate: invoice.dueDate,
        status: invoice.status,
      },
    });
  }

  async triggerInvoiceOverdue(invoice: any) {
    await this.sendWebhook(config.n8nInvoiceOverdueWebhook, {
      event: 'invoice.overdue',
      timestamp: new Date().toISOString(),
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        customerName: invoice.customer?.name,
        customerEmail: invoice.customer?.email,
        total: invoice.total,
        dueDate: invoice.dueDate,
        daysOverdue: Math.floor(
          (Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        ),
      },
    });
  }

  async triggerPaymentReceived(payment: any) {
    await this.sendWebhook(config.n8nPaymentReceivedWebhook, {
      event: 'payment.received',
      timestamp: new Date().toISOString(),
      data: {
        paymentId: payment.id,
        invoiceId: payment.invoiceId,
        invoiceNumber: payment.invoice?.invoiceNumber,
        customerId: payment.invoice?.customerId,
        customerName: payment.invoice?.customer?.name,
        customerEmail: payment.invoice?.customer?.email,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate,
      },
    });
  }
}

export const webhookService = new WebhookService();

