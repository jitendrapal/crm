import * as React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  mobileLabel?: string; // Label to show on mobile card view
  hideOnMobile?: boolean; // Hide this column on mobile
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  emptyState?: React.ReactNode; // Custom empty state component
  className?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  isLoading,
  error,
  emptyMessage = 'No data found',
  emptyState,
  className,
}: ResponsiveTableProps<T>) {
  const getCellValue = (row: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor] as React.ReactNode;
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border">
        <div className="px-6 py-12 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border">
        <div className="px-6 py-12 text-center text-red-500">
          Error: {error.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-lg border">
        {emptyState ? (
          <div className="px-6 py-16">{emptyState}</div>
        ) : (
          <div className="px-6 py-12 text-center text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View - Hidden on mobile */}
      <div className={cn('hidden md:block bg-card rounded-lg border', className)}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={cn(
                      'px-6 py-3 text-left text-sm font-medium',
                      column.className
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'hover:bg-muted/50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((column, index) => (
                    <td key={index} className={cn('px-6 py-4', column.className)}>
                      {getCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - Hidden on desktop */}
      <div className="md:hidden space-y-4">
        {data.map((row) => (
          <div
            key={keyExtractor(row)}
            onClick={() => onRowClick?.(row)}
            className={cn(
              'bg-card rounded-lg border p-4 space-y-3',
              onRowClick && 'cursor-pointer active:bg-muted/50'
            )}
          >
            {columns
              .filter((column) => !column.hideOnMobile)
              .map((column, index) => (
                <div key={index} className="flex justify-between items-start gap-4">
                  <span className="text-sm font-medium text-muted-foreground min-w-[100px]">
                    {column.mobileLabel || column.header}:
                  </span>
                  <span className={cn('text-sm text-right flex-1', column.className)}>
                    {getCellValue(row, column)}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}
