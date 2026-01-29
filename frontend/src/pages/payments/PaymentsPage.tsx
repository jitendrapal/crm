import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, CreditCard, Search, X, Wallet } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';
import { RecordPaymentDialog } from './RecordPaymentDialog';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Payment, PaginatedResponse } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';

export function PaymentsPage() {
  const { formatCurrency } = useCurrency();
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'payments',
      page,
      searchQuery,
      paymentMethod,
      dateFilter,
      minAmount,
      maxAmount,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(paymentMethod && { paymentMethod }),
        ...(dateFilter && { dateFilter }),
        ...(minAmount && { minAmount }),
        ...(maxAmount && { maxAmount }),
      });
      const response = await api.get<PaginatedResponse<Payment>>(`/payments?${params}`);
      console.log('Payments API Response:', response.data);
      return response.data;
    },
  });

  const clearFilters = () => {
    setSearchQuery('');
    setPaymentMethod('');
    setDateFilter('');
    setMinAmount('');
    setMaxAmount('');
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery || paymentMethod || dateFilter || minAmount || maxAmount;

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
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by invoice number, customer name, or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? 'Hide' : 'Show'} Filters
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Payment Method</label>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="">All Methods</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="CHECK">Check</option>
                  <option value="OTHER">Other</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="">All Time</option>
                  <option value="THIS_MONTH">This Month</option>
                  <option value="LAST_MONTH">Last Month</option>
                  <option value="THIS_QUARTER">This Quarter</option>
                  <option value="THIS_YEAR">This Year</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Min Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Max Amount</label>
                <Input
                  type="number"
                  placeholder="10000.00"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <ResponsiveTable
          data={data?.data || []}
          columns={[
            {
              header: 'Payment Date',
              accessor: (payment) => formatDate(payment.paymentDate),
              mobileLabel: 'Date',
            },
            {
              header: 'Invoice',
              accessor: (payment) => payment.invoice?.invoiceNumber || 'N/A',
              className: 'font-medium',
            },
            {
              header: 'Customer',
              accessor: (payment) => payment.invoice?.customer?.name || 'N/A',
            },
            {
              header: 'Method',
              accessor: (payment) => (
                <div className="flex items-center gap-2">
                  {getPaymentMethodIcon(payment.paymentMethod)}
                  <span className="text-sm">
                    {payment.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
              ),
            },
            {
              header: 'Amount',
              accessor: (payment) => formatCurrency(payment.amount),
              className: 'font-medium text-green-600',
            },
            {
              header: 'Reference',
              accessor: (payment) => payment.reference || '-',
              className: 'text-sm text-muted-foreground',
              hideOnMobile: true,
            },
          ]}
          keyExtractor={(payment) => payment.id}
          isLoading={isLoading}
          error={error as Error}
          emptyState={
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
                <Wallet className="h-10 w-10 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {hasActiveFilters ? 'No payments found' : 'No payments yet'}
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                {hasActiveFilters
                  ? "Try adjusting your filters to find what you're looking for."
                  : 'Record your first payment when a customer pays an invoice.'}
              </p>
              {!hasActiveFilters && (
                <Button onClick={() => setIsRecordOpen(true)} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Record Your First Payment
                </Button>
              )}
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          }
        />

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
