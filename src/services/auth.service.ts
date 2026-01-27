import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

export class AuthService {
  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Check if tenant email already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { email: data.companyEmail },
    });

    if (existingTenant) {
      throw new Error('Company email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.companyName,
          email: data.companyEmail,
          phone: data.companyPhone,
          address: data.companyAddress,
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'ADMIN', // First user is admin
          tenantId: tenant.id,
        },
      });

      return { user, tenant };
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result.user;

    return {
      user: userWithoutPassword,
      tenant: result.tenant,
    };
  }

  async login(data: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { tenant: true },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();

