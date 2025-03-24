
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRole } from '@/contexts/RoleContext';

const GuideDashboard = () => {
  const { role, guideName } = useRole();
  
  return (
    <DashboardLayout title="Guide Dashboard">
      <div className="space-y-6 py-4">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {guideName || 'Guide'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is your personal dashboard where you can view your assigned tours and manage your schedule.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GuideDashboard;
