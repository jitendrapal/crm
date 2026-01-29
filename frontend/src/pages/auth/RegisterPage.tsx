import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  FileText,
  User,
  Mail,
  Lock,
  Building2,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { AuthResponse } from '@/types';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyEmail: z.string().email('Invalid email address'),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      setAuth(response.data.user, response.data.token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side - Registration Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 overflow-y-auto">
        <div className="mx-auto w-full max-w-xl">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Invoice CRM</h1>
              <p className="text-sm text-muted-foreground">Professional invoicing</p>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start managing your invoices professionally in minutes
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-foreground">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="pl-9 h-11"
                      {...register('firstName')}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="pl-9 h-11"
                      {...register('lastName')}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 h-11"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  className="pl-10 h-11"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <PasswordStrength password={password || ''} />
            </div>

            {/* Company Information */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-4 text-foreground">
                Company Information
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Company Name
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="companyName"
                      placeholder="Acme Inc."
                      className="pl-10 h-11"
                      {...register('companyName')}
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-sm text-destructive">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail" className="text-sm font-medium">
                    Company Email
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="companyEmail"
                      type="email"
                      placeholder="contact@acme.com"
                      className="pl-10 h-11"
                      {...register('companyEmail')}
                    />
                  </div>
                  {errors.companyEmail && (
                    <p className="text-sm text-destructive">
                      {errors.companyEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone" className="text-sm font-medium">
                    Company Phone{' '}
                    <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="companyPhone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="pl-10 h-11"
                      {...register('companyPhone')}
                    />
                  </div>
                  {errors.companyPhone && (
                    <p className="text-sm text-destructive">
                      {errors.companyPhone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress" className="text-sm font-medium">
                    Company Address{' '}
                    <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="companyAddress"
                      placeholder="123 Business St, City, State 12345"
                      className="pl-10 h-11"
                      {...register('companyAddress')}
                    />
                  </div>
                  {errors.companyAddress && (
                    <p className="text-sm text-destructive">
                      {errors.companyAddress.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                'Creating account...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-primary hover:underline"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Gradient Background with Pattern */}
      <div className="relative hidden lg:flex lg:w-1/3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative flex items-center justify-center p-12">
          <div className="text-white text-center">
            <div className="mb-6">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
                <FileText className="h-10 w-10" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">Join thousands of businesses</h2>
            <p className="text-lg text-blue-100 mb-8">
              Start creating professional invoices and get paid faster
            </p>
            <div className="space-y-3 text-left max-w-sm mx-auto">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-blue-50">Unlimited invoices and customers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-blue-50">Professional PDF generation</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-blue-50">Automated payment reminders</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-blue-50">Real-time analytics dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
