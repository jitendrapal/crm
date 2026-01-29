import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Download, Send, Search, X, Edit, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Invoice, InvoiceStatus, PaginatedResponse } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';

export function InvoicesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { formatCurrency } = useCurrency();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'invoices',
      page,
      statusFilter,
      searchQuery,
      dateFilter,
      minAmount,
      maxAmount,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
        ...(dateFilter && { dateFilter }),
        ...(minAmount && { minAmount }),
        ...(maxAmount && { maxAmount }),
      });
      const response = await api.get<PaginatedResponse<Invoice>>(`/invoices?${params}`);
      console.log('Invoices API Response:', response.data);
      return response.data;
    },
  });

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setDateFilter('');
    setMinAmount('');
    setMaxAmount('');
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== 'ALL' || dateFilter || minAmount || maxAmount;

  const getStatusVariant = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'OVERDUE':
        return 'destructive';
      case 'SENT':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Download PDF handler
  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const response = await api.get(`/invoices/${invoice.id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Invoice ${invoice.invoiceNumber} downloaded successfully`);
    } catch (error) {
      toast.error(`Failed to download invoice ${invoice.invoiceNumber}`);
    }
  };

  // Send invoice mutation
  const sendInvoiceMutation = useMutation({
    mutationFn: (invoiceId: string) => api.post(`/invoices/${invoiceId}/send`),
    onSuccess: (_data, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      const invoice = data?.data.find((inv) => inv.id === invoiceId);
      toast.success(
        `Invoice ${invoice?.invoiceNumber || ''} sent to ${invoice?.customer?.name || 'customer'}`
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send invoice');
    },
  });

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Invoices"
        subtitle="Manage and track your invoices"
        action={
          <Button onClick={() => navigate('/invoices/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
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
                placeholder="Search by invoice number or customer name..."
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
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as InvoiceStatus | 'ALL')
                  }
                >
                  <option value="ALL">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="CANCELLED">Cancelled</option>
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

        {/* Table */}
        <ResponsiveTable
          data={data?.data || []}
          columns={[
            {
              header: 'Invoice #',
              accessor: 'invoiceNumber',
              className: 'font-medium',
              mobileLabel: 'Invoice',
            },
            {
              header: 'Customer',
              accessor: (invoice) => invoice.customer?.name || 'N/A',
            },
            {
              header: 'Issue Date',
              accessor: (invoice) => formatDate(invoice.issueDate),
              className: 'text-sm text-muted-foreground',
              mobileLabel: 'Issued',
            },
            {
              header: 'Due Date',
              accessor: (invoice) => formatDate(invoice.dueDate),
              className: 'text-sm text-muted-foreground',
              mobileLabel: 'Due',
            },
            {
              header: 'Amount',
              accessor: (invoice) => formatCurrency(invoice.total),
              className: 'font-medium',
            },
            {
              header: 'Status',
              accessor: (invoice) => (
                <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
              ),
            },
            {
              header: 'Actions',
              accessor: (invoice) => (
                <div className="flex justify-end gap-1 md:gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                    title="View Invoice"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                    title="Edit Invoice"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownloadPDF(invoice)}
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {invoice.status === 'DRAFT' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => sendInvoiceMutation.mutate(invoice.id)}
                      title="Send Invoice"
                      disabled={sendInvoiceMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ),
              className: 'text-right',
              hideOnMobile: false,
            },
          ]}
          keyExtractor={(invoice) => invoice.id}
          isLoading={isLoading}
          error={error as Error}
          emptyState={
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {hasActiveFilters ? 'No invoices found' : 'No invoices yet'}
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                {hasActiveFilters
                  ? "Try adjusting your filters to find what you're looking for."
                  : 'Create your first invoice to start billing your customers and tracking payments.'}
              </p>
              {!hasActiveFilters && (
                <Button onClick={() => navigate('/invoices/new')} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Invoice
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
    </div>
  );
}
