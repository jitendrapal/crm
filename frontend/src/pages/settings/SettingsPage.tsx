import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { Tenant } from '@/types';

// Validation schemas
const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type CompanyForm = z.infer<typeof companySchema>;
type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export function SettingsPage() {
  const { user, setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('company');

  // Fetch tenant data
  const { data: tenant } = useQuery({
    queryKey: ['tenant'],
    queryFn: async () => {
      const response = await api.get<Tenant>(`/tenants/${user?.tenantId}`);
      return response.data;
    },
    enabled: !!user?.tenantId,
  });

  // Company form
  const companyForm = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    values: {
      name: tenant?.name || '',
      email: tenant?.email || '',
      phone: tenant?.phone || '',
      address: tenant?.address || '',
    },
  });

  // Profile form
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  });

  // Password form
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const newPassword = passwordForm.watch('newPassword');

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: (data: CompanyForm) => api.put(`/tenants/${user?.tenantId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      toast.success('Company information updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Failed to update company information'
      );
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileForm) => api.put(`/users/${user?.id}`, data),
    onSuccess: (response) => {
      // Update auth store with new user data
      if (user) {
        setAuth({ ...user, ...response.data.user }, localStorage.getItem('token') || '');
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordForm) => api.put('/auth/change-password', data),
    onSuccess: () => {
      passwordForm.reset();
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="Manage your account and company settings" />

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Company Tab */}
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Update your company details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={companyForm.handleSubmit((data) =>
                      updateCompanyMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input id="companyName" {...companyForm.register('name')} />
                      {companyForm.formState.errors.name && (
                        <p className="text-sm text-destructive">
                          {companyForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">Company Email</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        {...companyForm.register('email')}
                      />
                      {companyForm.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {companyForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">Phone (Optional)</Label>
                      <Input id="companyPhone" {...companyForm.register('phone')} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyAddress">Address (Optional)</Label>
                      <Input id="companyAddress" {...companyForm.register('address')} />
                    </div>

                    <Button
                      type="submit"
                      disabled={updateCompanyMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {updateCompanyMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>User Profile</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={profileForm.handleSubmit((data) =>
                      updateProfileMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" {...profileForm.register('firstName')} />
                        {profileForm.formState.errors.firstName && (
                          <p className="text-sm text-destructive">
                            {profileForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" {...profileForm.register('lastName')} />
                        {profileForm.formState.errors.lastName && (
                          <p className="text-sm text-destructive">
                            {profileForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" {...profileForm.register('email')} />
                      {profileForm.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input value={user?.role} disabled />
                      <p className="text-xs text-muted-foreground">
                        Contact an administrator to change your role
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={passwordForm.handleSubmit((data) =>
                      changePasswordMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        {...passwordForm.register('currentPassword')}
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-destructive">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        {...passwordForm.register('newPassword')}
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-destructive">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                      <PasswordStrength password={newPassword || ''} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...passwordForm.register('confirmPassword')}
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {changePasswordMutation.isPending
                        ? 'Changing...'
                        : 'Change Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
