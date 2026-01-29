import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  FileText,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { AuthResponse } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      setAuth(response.data.user, response.data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Login Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-background">
        <div className="mx-auto w-full max-w-sm lg:w-96">
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
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account to continue managing your invoices
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
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
                <p className="text-sm text-destructive flex items-center gap-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 h-11"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">
                  New to Invoice CRM?
                </span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="text-sm font-medium text-primary hover:underline"
              >
                Create a free account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="relative hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />

        <div className="relative flex flex-col justify-center px-12 xl:px-16 text-white">
          {/* Main Heading */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">Streamline Your Invoicing</h2>
            <p className="text-lg text-blue-100">
              Professional invoice management made simple and efficient
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Create Beautiful Invoices</h3>
                <p className="text-blue-100">
                  Generate professional PDF invoices in seconds with customizable
                  templates
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Track Payments</h3>
                <p className="text-blue-100">
                  Monitor payment status and get real-time insights into your cash flow
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Manage Customers</h3>
                <p className="text-blue-100">
                  Keep all your customer information organized in one place
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Automated Reminders</h3>
                <p className="text-blue-100">
                  Never miss a payment with automated email reminders
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-blue-100">Invoices Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-blue-100">Happy Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-sm text-blue-100">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
