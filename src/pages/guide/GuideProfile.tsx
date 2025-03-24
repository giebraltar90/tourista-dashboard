
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRole } from '@/contexts/RoleContext';

const GuideProfile = () => {
  const { role, guideName } = useRole();
  
  return (
    <DashboardLayout title="Guide Profile">
      <div className="space-y-6 py-4">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Name:</strong> {guideName || 'Unknown'}
              </div>
              <div>
                <strong>Role:</strong> {role}
              </div>
              <div>
                <strong>Status:</strong> Active
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GuideProfile;
