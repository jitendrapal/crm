import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import api from '@/lib/api';
import { Invoice, PaymentMethod, Payment } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';

const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentDate: z.string().min(1, 'Payment date is required'),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordPaymentDialog({ open, onOpenChange }: RecordPaymentDialogProps) {
  const queryClient = useQueryClient();
  const { formatCurrency } = useCurrency();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data: invoices } = useQuery({
    queryKey: ['unpaid-invoices'],
    queryFn: async () => {
      const response = await api.get<{ data: Invoice[] }>(
        '/invoices?status=SENT&limit=1000'
      );
      return response.data.data;
    },
    enabled: open,
  });

  // Fetch payments for selected invoice
  const { data: invoicePayments } = useQuery({
    queryKey: ['invoice-payments', selectedInvoiceId],
    queryFn: async () => {
      const response = await api.get<{ data: Payment[] }>(
        `/payments?invoiceId=${selectedInvoiceId}`
      );
      return response.data.data;
    },
    enabled: !!selectedInvoiceId,
  });

  // Calculate total paid and remaining balance
  const totalPaid =
    invoicePayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const remainingBalance = selectedInvoice ? selectedInvoice.total - totalPaid : 0;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: PaymentMethod.CREDIT_CARD,
    },
  });

  const watchedInvoiceId = watch('invoiceId');

  // Update selected invoice when invoice is selected
  useEffect(() => {
    if (watchedInvoiceId && invoices) {
      const invoice = invoices.find((inv) => inv.id === watchedInvoiceId);
      setSelectedInvoice(invoice || null);
      setSelectedInvoiceId(watchedInvoiceId);
    } else {
      setSelectedInvoice(null);
      setSelectedInvoiceId('');
    }
  }, [watchedInvoiceId, invoices]);

  // Auto-fill remaining balance when invoice payments are loaded
  useEffect(() => {
    if (selectedInvoice && invoicePayments !== undefined) {
      setValue('amount', remainingBalance);
    }
  }, [selectedInvoice, invoicePayments, remainingBalance, setValue]);

  const mutation = useMutation({
    mutationFn: (data: PaymentForm) => {
      // Convert date string to ISO datetime format
      const paymentData = {
        ...data,
        paymentDate: new Date(data.paymentDate).toISOString(),
      };
      return api.post('/payments', paymentData);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['unpaid-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-payments'] });
      toast.success(
        `Payment of ${formatCurrency(variables.amount)} recorded for Invoice ${selectedInvoice?.invoiceNumber || ''}`
      );
      reset();
      setSelectedInvoice(null);
      setSelectedInvoiceId('');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    },
  });

  const onSubmit = (data: PaymentForm) => {
    // Validate payment amount doesn't exceed remaining balance
    if (selectedInvoice && data.amount > remainingBalance) {
      toast.error(
        `Payment amount (${formatCurrency(data.amount)}) exceeds remaining balance (${formatCurrency(remainingBalance)})`
      );
      return;
    }

    mutation.mutate(data);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Record Payment</h2>
          <p className="text-sm text-muted-foreground">
            Record a payment received from a customer
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceId">Invoice *</Label>
            <Select id="invoiceId" {...register('invoiceId')}>
              <option value="">Select invoice</option>
              {invoices?.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoiceNumber} - {invoice.customer?.name} (
                  {formatCurrency(invoice.total)})
                </option>
              ))}
            </Select>
            {errors.invoiceId && (
              <p className="text-sm text-destructive">{errors.invoiceId.message}</p>
            )}
          </div>

          {/* Payment Summary */}
          {selectedInvoice && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 border-2 border-primary/20">
              <h3 className="font-semibold text-sm text-primary">Payment Summary</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Total:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedInvoice.total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Paid:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
                <div className="border-t pt-1.5 mt-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Amount Due:</span>
                    <span className="font-bold text-lg text-primary">
                      {formatCurrency(remainingBalance)}
                    </span>
                  </div>
                </div>
              </div>
              {invoicePayments && invoicePayments.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Previous Payments ({invoicePayments.length}):
                  </p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {invoicePayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex justify-between text-xs bg-background/50 rounded px-2 py-1"
                      >
                        <span className="text-muted-foreground">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Payment Amount *
                {selectedInvoice && remainingBalance > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    (Due: {formatCurrency(remainingBalance)})
                  </span>
                )}
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input id="paymentDate" type="date" {...register('paymentDate')} />
              {errors.paymentDate && (
                <p className="text-sm text-destructive">{errors.paymentDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select id="paymentMethod" {...register('paymentMethod')}>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="CHECK">Check</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID / Reference</Label>
            <Input
              id="transactionId"
              placeholder="Transaction ID or check number"
              {...register('transactionId')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Additional notes" {...register('notes')} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
