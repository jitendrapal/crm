import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Mail, Phone, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { CreateCustomerDialog } from './CreateCustomerDialog';
import { EditCustomerDialog } from './EditCustomerDialog';
import api from '@/lib/api';
import { Customer, PaginatedResponse } from '@/types';

export function CustomersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', page, searchQuery, city, state, country],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(city && { city }),
        ...(state && { state }),
        ...(country && { country }),
      });
      const response = await api.get<PaginatedResponse<Customer>>(`/customers?${params}`);
      console.log('Customers API Response:', response.data);
      return response.data;
    },
  });

  const clearFilters = () => {
    setSearchQuery('');
    setCity('');
    setState('');
    setCountry('');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || city || state || country;

  // Log for debugging
  console.log('Customers data:', data);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to delete customer';
      toast.error(errorMessage);
      console.error('Delete customer error:', error.response?.data);
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Customers"
        subtitle="Manage your customer database"
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
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
                placeholder="Search by name, email, or phone..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">City</label>
                <Input
                  type="text"
                  placeholder="Enter city..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">State</label>
                <Input
                  type="text"
                  placeholder="Enter state..."
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Country</label>
                <Input
                  type="text"
                  placeholder="Enter country..."
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            Error loading customers: {(error as any)?.message || 'Unknown error'}
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No customers found. Click "Add Customer" to create one.
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((customer) => (
              <Card
                key={customer.id}
                className="hover:shadow-md transition-shadow active:shadow-lg"
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-4 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{customer.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {customer.city}, {customer.state}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(customer)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(customer.id, customer.name)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                  </div>

                  {customer.address && (
                    <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                      {customer.address}
                      <br />
                      {customer.city}, {customer.state} {customer.zipCode}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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

      <CreateCustomerDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <EditCustomerDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        customer={selectedCustomer}
      />
    </div>
  );
}
