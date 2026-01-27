import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { Tenant } from '@/types';

export function SettingsPage() {
  const { user } = useAuthStore();

  const { data: tenant } = useQuery({
    queryKey: ['tenant'],
    queryFn: async () => {
      const response = await api.get<Tenant>(`/tenants/${user?.tenantId}`);
      return response.data;
    },
    enabled: !!user?.tenantId,
  });

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="Manage your account and company settings" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={user?.firstName} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={user?.lastName} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={user?.role} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Your company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input value={tenant?.name} disabled />
              </div>
              <div className="space-y-2">
                <Label>Company Email</Label>
                <Input value={tenant?.email} disabled />
              </div>
              {tenant?.phone && (
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={tenant.phone} disabled />
                </div>
              )}
              {tenant?.address && (
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={tenant.address} disabled />
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Information */}
          <Card>
            <CardHeader>
              <CardTitle>API Information</CardTitle>
              <CardDescription>Integration details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tenant ID</Label>
                <Input value={user?.tenantId} disabled />
              </div>
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input value={user?.id} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              <Button variant="outline" className="w-full">
                Update Profile
              </Button>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

