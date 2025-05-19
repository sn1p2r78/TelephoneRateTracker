import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Phone, MessageCircle, CreditCard, FileText, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PermissionItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

const PermissionItem = ({ title, description, icon, enabled }: PermissionItemProps) => (
  <div className="flex items-start gap-3 mb-3">
    <div className={cn(
      "mt-1 p-1.5 rounded-md",
      enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
    )}>
      {icon}
    </div>
    <div>
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium">{title}</h4>
        {enabled ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Enabled</Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">Disabled</Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    </div>
  </div>
);

export function RolePanel() {
  const { user } = useAuth();
  const userRole = user?.role || 'user';

  // Define permissions based on roles
  const permissions = {
    admin: {
      userManagement: true,
      fullCDIR: true,
      paymentSystem: true,
      numberManagement: true,
      editNumbers: true,
      viewAllUsers: true,
      generateReports: true,
    },
    support: {
      userManagement: true,
      fullCDIR: true,
      paymentSystem: false,
      numberManagement: true,
      editNumbers: true,
      viewAllUsers: true,
      generateReports: true,
    },
    user: {
      userManagement: false,
      fullCDIR: false,
      paymentSystem: false,
      numberManagement: false,
      editNumbers: true,
      viewAllUsers: false,
      generateReports: false,
    },
    test: {
      userManagement: false,
      fullCDIR: false,
      paymentSystem: false,
      numberManagement: false,
      editNumbers: false,
      viewAllUsers: false,
      generateReports: false,
    }
  };

  const activePermissions = permissions[userRole as keyof typeof permissions] || permissions.user;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          Role & Permissions
        </CardTitle>
        <CardDescription>
          Your current role is: <Badge variant="outline" className="ml-1 bg-primary/10 text-primary font-medium">{userRole.toUpperCase()}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <PermissionItem
            title="User Management"
            description="Create, edit, and manage user accounts"
            icon={<Users size={18} />}
            enabled={activePermissions.userManagement}
          />
          
          <PermissionItem
            title="Full CDIR History"
            description="Access complete call and message history for all users"
            icon={<MessageCircle size={18} />}
            enabled={activePermissions.fullCDIR}
          />
          
          <PermissionItem
            title="Payment System"
            description="Process payments and manage financial transactions"
            icon={<CreditCard size={18} />}
            enabled={activePermissions.paymentSystem}
          />
          
          <PermissionItem
            title="Number Management"
            description="Add, edit, and assign premium rate numbers"
            icon={<Phone size={18} />}
            enabled={activePermissions.numberManagement}
          />
          
          <PermissionItem
            title="Edit Assigned Numbers"
            description="Modify settings for assigned numbers"
            icon={<FileText size={18} />}
            enabled={activePermissions.editNumbers}
          />
          
          <PermissionItem
            title="Generate Reports"
            description="Create and export system reports"
            icon={<FileText size={18} />}
            enabled={activePermissions.generateReports}
          />
          
          <PermissionItem
            title="View All Users"
            description="Access information about all system users"
            icon={<Shield size={18} />}
            enabled={activePermissions.viewAllUsers}
          />
        </div>
      </CardContent>
    </Card>
  );
}