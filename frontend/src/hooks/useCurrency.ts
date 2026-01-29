import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { Tenant, Currency } from '@/types';

export const CURRENCY_CONFIG = {
  USD: {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar',
    locale: 'en-US',
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
    locale: 'de-DE',
  },
  INR: {
    symbol: '₹',
    code: 'INR',
    name: 'Indian Rupee',
    locale: 'en-IN',
  },
} as const;

export function useCurrency() {
  const { user } = useAuthStore();

  const { data: tenant } = useQuery({
    queryKey: ['tenant', user?.tenantId],
    queryFn: async () => {
      const response = await api.get<Tenant>(`/tenants/${user?.tenantId}`);
      return response.data;
    },
    enabled: !!user?.tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const currency: Currency = tenant?.currency || 'USD';
  const currencyConfig = CURRENCY_CONFIG[currency];

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return `${currencyConfig.symbol}0.00`;
    }

    return new Intl.NumberFormat(currencyConfig.locale, {
      style: 'currency',
      currency: currencyConfig.code,
    }).format(amount);
  };

  return {
    currency,
    currencyConfig,
    formatCurrency,
  };
}

