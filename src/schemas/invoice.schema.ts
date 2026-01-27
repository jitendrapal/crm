import { z } from 'zod';

export const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().uuid(),
  issueDate: z.string().optional(), // Optional, not used but frontend sends it
  dueDate: z.string(), // Accept any date string format
  items: z.array(invoiceItemSchema).min(1),
  tax: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  notes: z.string().optional(),
});

export const updateInvoiceSchema = z.object({
  customerId: z.string().uuid().optional(),
  dueDate: z.string().optional(), // Accept any date string format
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  items: z.array(invoiceItemSchema).optional(),
  tax: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
