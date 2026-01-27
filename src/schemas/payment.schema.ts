import { z } from 'zod';

export const createPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'CASH', 'CHECK', 'STRIPE', 'OTHER']),
  paymentDate: z.string().datetime().or(z.date()).optional(),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

