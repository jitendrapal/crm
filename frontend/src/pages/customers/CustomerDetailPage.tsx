import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Customer, Invoice } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { formatCurrency } = useCurrency();

  const { data: customer } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await api.get<Customer>(`/customers/${id}`);
      return response.data;
    },
  });

  const { data: invoices } = useQuery({
    queryKey: ['customer-invoices', id],
    queryFn: async () => {
      const response = await api.get<{ data: Invoice[] }>(`/invoices?customerId=${id}`);
      return response.data.data;
    },
  });

  if (!customer) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-full">
      <Header title={customer.name} subtitle="Customer Details" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    {customer.address}
                    <br />
                    {customer.city}, {customer.state} {customer.zipCode}
                    <br />
                    {customer.country}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices?.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(invoice.issueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{formatCurrency(invoice.total)}</span>
                      <Badge
                        variant={
                          invoice.status === 'PAID'
                            ? 'success'
                            : invoice.status === 'OVERDUE'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
