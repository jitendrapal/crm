import { useQuery } from '@tanstack/react-query';
import { FileText, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Invoice, DashboardStats } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get<DashboardStats>('/dashboard/stats');
      return response.data;
    },
  });

  const { data: recentInvoices } = useQuery({
    queryKey: ['recent-invoices'],
    queryFn: async () => {
      const response = await api.get<{ data: Invoice[] }>('/invoices?limit=5');
      return response.data.data;
    },
  });

  const statusData = [
    { name: 'Paid', value: stats?.paidInvoices || 0 },
    {
      name: 'Sent',
      value:
        (stats?.totalInvoices || 0) -
        (stats?.paidInvoices || 0) -
        (stats?.overdueInvoices || 0),
    },
    { name: 'Overdue', value: stats?.overdueInvoices || 0 },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" subtitle="Welcome back! Here's your business overview" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue Card */}
          <Card className="relative overflow-hidden card-hover border-l-4 border-l-success">
            <div className="absolute inset-0 gradient-success" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold tracking-tight">
                {formatCurrency(stats?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1 text-success" />
                All time earnings
              </p>
            </CardContent>
          </Card>

          {/* Pending Revenue Card */}
          <Card className="relative overflow-hidden card-hover border-l-4 border-l-warning">
            <div className="absolute inset-0 gradient-warning" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold tracking-tight">
                {formatCurrency(stats?.pendingRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
            </CardContent>
          </Card>

          {/* Total Invoices Card */}
          <Card className="relative overflow-hidden card-hover border-l-4 border-l-primary">
            <div className="absolute inset-0 gradient-primary" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold tracking-tight">
                {stats?.totalInvoices || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-success font-medium">
                  {stats?.paidInvoices || 0} paid
                </span>
                {stats?.overdueInvoices ? (
                  <>
                    ,{' '}
                    <span className="text-destructive font-medium">
                      {stats.overdueInvoices} overdue
                    </span>
                  </>
                ) : null}
              </p>
            </CardContent>
          </Card>

          {/* Total Customers Card */}
          <Card className="relative overflow-hidden card-hover border-l-4 border-l-info">
            <div className="absolute inset-0 gradient-info" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-info" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold tracking-tight">
                {stats?.totalCustomers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active clients</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Total', value: stats?.totalRevenue || 0 },
                    { name: 'Pending', value: stats?.pendingRevenue || 0 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices?.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.customer?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.total)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(invoice.dueDate)}
                      </p>
                    </div>
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
  );
}
