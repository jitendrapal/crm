import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { FileText, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import api from '@/lib/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      // TODO: Implement forgot password API endpoint
      await api.post('/auth/forgot-password', data);
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Forgot Password Form */}
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

          {!emailSent ? (
            <>
              {/* Welcome Text */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Forgot password?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              {/* Forgot Password Form */}
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

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Sending...'
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Send reset link
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Back to Login Link */}
              <div className="mt-6">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-3">
                  Check your email
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  We've sent password reset instructions to{' '}
                  <span className="font-medium text-foreground">
                    {getValues('email')}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mb-8">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-primary hover:underline font-medium"
                  >
                    try again
                  </button>
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="relative hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />

        <div className="relative flex flex-col justify-center px-12 xl:px-16 text-white">
          {/* Main Content */}
          <div className="max-w-md">
            <div className="mb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
                <Mail className="h-8 w-8" />
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-4">Secure Password Reset</h2>
            <p className="text-lg text-blue-100 mb-8">
              We'll send you a secure link to reset your password and get you back to
              managing your invoices.
            </p>

            {/* Security Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 mt-1">
                  <span className="text-xs">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Secure & Encrypted</h3>
                  <p className="text-sm text-blue-100">
                    All password reset links are encrypted and expire after 1 hour
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 mt-1">
                  <span className="text-xs">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email Verification</h3>
                  <p className="text-sm text-blue-100">
                    Only you can access the reset link sent to your email
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 mt-1">
                  <span className="text-xs">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Quick & Easy</h3>
                  <p className="text-sm text-blue-100">
                    Reset your password in just a few clicks and get back to work
                  </p>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-12 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-sm text-blue-50">
                <strong>Need help?</strong> Contact our support team at{' '}
                <a href="mailto:support@invoicecrm.com" className="underline">
                  support@invoicecrm.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
