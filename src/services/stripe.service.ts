import Stripe from 'stripe';
import { config } from '../config/env';
import prisma from '../lib/prisma';
import { paymentService } from './payment.service';

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2023-10-16',
});

export class StripeService {
  async createInvoice(invoice: any) {
    try {
      // Create or retrieve Stripe customer
      let stripeCustomerId = invoice.customer.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: invoice.customer.email,
          name: invoice.customer.name,
          phone: invoice.customer.phone,
          address: {
            line1: invoice.customer.address,
            city: invoice.customer.city,
            state: invoice.customer.state,
            postal_code: invoice.customer.zipCode,
            country: invoice.customer.country || 'US',
          },
        });

        stripeCustomerId = customer.id;
      }

      // Create Stripe invoice
      const stripeInvoice = await stripe.invoices.create({
        customer: stripeCustomerId,
        auto_advance: false,
        collection_method: 'send_invoice',
        days_until_due: Math.ceil(
          (new Date(invoice.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
        },
      });

      // Add line items
      for (const item of invoice.items) {
        await stripe.invoiceItems.create({
          customer: stripeCustomerId,
          invoice: stripeInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_amount: Math.round(item.unitPrice * 100), // Convert to cents
        });
      }

      // Finalize invoice
      await stripe.invoices.finalizeInvoice(stripeInvoice.id);

      return stripeInvoice;
    } catch (error) {
      console.error('Error creating Stripe invoice:', error);
      throw error;
    }
  }

  async handleWebhook(payload: string, signature: string) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripeWebhookSecret
      );

      switch (event.type) {
        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;

        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }

  private async handleInvoicePaid(stripeInvoice: Stripe.Invoice) {
    const invoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: stripeInvoice.id },
    });

    if (!invoice) {
      console.error('Invoice not found for Stripe invoice:', stripeInvoice.id);
      return;
    }

    // Create payment record
    await paymentService.createPayment(invoice.tenantId, {
      invoiceId: invoice.id,
      amount: stripeInvoice.amount_paid / 100, // Convert from cents
      paymentMethod: 'STRIPE',
      transactionId: stripeInvoice.payment_intent as string,
    });
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log('Payment succeeded:', paymentIntent.id);
    // Additional logic if needed
  }

  private async handlePaymentFailed(stripeInvoice: Stripe.Invoice) {
    const invoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: stripeInvoice.id },
    });

    if (invoice) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'OVERDUE' },
      });
    }
  }
}

export const stripeService = new StripeService();
