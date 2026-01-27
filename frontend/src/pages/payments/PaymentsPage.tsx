import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, CreditCard } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { RecordPaymentDialog } from './RecordPaymentDialog';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Payment, PaginatedResponse } from '@/types';

export function PaymentsPage() {
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Payment>>(
        `/payments?page=${page}&limit=10`
      );
      return response.data;
    },
  });

  const getPaymentMethodIcon = (_method: string) => {
    return <CreditCard className="h-4 w-4" />;
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Payments"
        subtitle="Track and manage payment records"
        action={
          <Button onClick={() => setIsRecordOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-card rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Invoice</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Method</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : data?.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No payments found
                    </td>
                  </tr>
                ) : (
                  data?.data.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4">{formatDate(payment.paymentDate)}</td>
                      <td className="px-6 py-4 font-medium">
                        {payment.invoice?.invoiceNumber}
                      </td>
                      <td className="px-6 py-4">{payment.invoice?.customer?.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span className="text-sm">
                            {payment.paymentMethod.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-green-600">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {payment.reference || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {page} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <RecordPaymentDialog open={isRecordOpen} onOpenChange={setIsRecordOpen} />
    </div>
  );
}
