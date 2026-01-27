import prisma from '../lib/prisma';
import { CreateCustomerInput, UpdateCustomerInput } from '../schemas/customer.schema';

export class CustomerService {
  async createCustomer(tenantId: string, data: CreateCustomerInput) {
    return prisma.customer.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async getCustomers(
    tenantId: string,
    filters?: {
      search?: string;
      city?: string;
      state?: string;
      country?: string;
    },
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };

    // Search by name, email, or phone
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Location filters
    if (filters?.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }
    if (filters?.state) {
      where.state = { contains: filters.state, mode: 'insensitive' };
    }
    if (filters?.country) {
      where.country = { contains: filters.country, mode: 'insensitive' };
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerById(tenantId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId,
      },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  }

  async updateCustomer(tenantId: string, customerId: string, data: UpdateCustomerInput) {
    // Verify customer belongs to tenant
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return prisma.customer.update({
      where: { id: customerId },
      data,
    });
  }

  async deleteCustomer(tenantId: string, customerId: string) {
    // Verify customer belongs to tenant
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Check if customer has invoices
    const invoiceCount = await prisma.invoice.count({
      where: { customerId },
    });

    if (invoiceCount > 0) {
      throw new Error('Cannot delete customer with existing invoices');
    }

    return prisma.customer.delete({
      where: { id: customerId },
    });
  }
}

export const customerService = new CustomerService();
