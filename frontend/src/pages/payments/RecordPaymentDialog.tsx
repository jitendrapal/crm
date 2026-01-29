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
import { Invoice, PaymentMethod } from '@/types';

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: PaymentMethod.CREDIT_CARD,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PaymentForm) => {
      // Convert date string to ISO datetime format
      const paymentData = {
        ...data,
        paymentDate: new Date(data.paymentDate).toISOString(),
      };
      return api.post('/payments', paymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['unpaid-invoices'] });
      toast.success('Payment recorded successfully');
      reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    },
  });

  const onSubmit = (data: PaymentForm) => {
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
                  {invoice.invoiceNumber} - {invoice.customer?.name} (${invoice.total})
                </option>
              ))}
            </Select>
            {errors.invoiceId && (
              <p className="text-sm text-destructive">{errors.invoiceId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
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
