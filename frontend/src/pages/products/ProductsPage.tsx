import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, X, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CreateProductDialog } from './CreateProductDialog';
import { EditProductDialog } from './EditProductDialog';
import api from '@/lib/api';
import { Product, PaginatedResponse } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';

export function ProductsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const queryClient = useQueryClient();
  const { formatCurrency } = useCurrency();

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', page, searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('isActive', statusFilter);

      const response = await api.get<PaginatedResponse<Product>>(`/products?${params}`);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Product "${productToDelete?.name}" deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete product');
    },
  });

  const handleDelete = (id: string, name: string) => {
    setProductToDelete({ id, name });
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all';

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Products & Services"
        subtitle="Manage your product and service catalog"
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48"
          >
            <option value="all">All Products</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </Select>

          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Table */}
        <ResponsiveTable
          data={data?.data || []}
          columns={[
            {
              header: 'Name',
              accessor: (product) => product.name,
              className: 'font-medium',
            },
            {
              header: 'Description',
              accessor: (product) => product.description || '-',
              className: 'text-muted-foreground hidden md:table-cell',
            },
            {
              header: 'Price',
              accessor: (product) => formatCurrency(product.price),
              className: 'font-medium',
            },
            {
              header: 'Unit',
              accessor: (product) => product.unit,
              className: 'capitalize hidden sm:table-cell',
            },
            {
              header: 'Status',
              accessor: (product) => (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.isActive
                      ? 'bg-success/10 text-success'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              ),
            },
            {
              header: 'Actions',
              accessor: (product) => (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(product)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product.id, product.name)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ),
            },
          ]}
          keyExtractor={(product) => product.id}
          isLoading={isLoading}
          error={error as Error}
          emptyState={
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Package className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {hasActiveFilters ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                {hasActiveFilters
                  ? "Try adjusting your filters to find what you're looking for."
                  : 'Create your first product or service to speed up invoice creation.'}
              </p>
              {!hasActiveFilters && (
                <Button onClick={() => setIsCreateOpen(true)} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Your First Product
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
      </div>

      <CreateProductDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <EditProductDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        product={selectedProduct}
      />
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Product"
        description={`Are you sure you want to delete ${productToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
