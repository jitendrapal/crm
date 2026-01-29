import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateProductDTO {
  name: string;
  description?: string;
  price: number;
  unit?: string;
  isActive?: boolean;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  unit?: string;
  isActive?: boolean;
}

export interface ProductFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const productService = {
  async create(tenantId: string, data: CreateProductDTO) {
    return prisma.product.create({
      data: {
        ...data,
        tenantId,
      },
    });
  },

  async findAll(tenantId: string, filters: ProductFilters = {}) {
    const { search, isActive, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string, tenantId: string) {
    return prisma.product.findFirst({
      where: { id, tenantId },
    });
  },

  async update(id: string, tenantId: string, data: UpdateProductDTO) {
    // Verify product belongs to tenant
    const product = await prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return prisma.product.update({
      where: { id },
      data,
    });
  },

  async delete(id: string, tenantId: string) {
    // Verify product belongs to tenant
    const product = await prisma.product.findFirst({
      where: { id, tenantId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return prisma.product.delete({
      where: { id },
    });
  },

  async getActiveProducts(tenantId: string) {
    return prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  },
};

