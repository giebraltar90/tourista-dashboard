
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar } from "lucide-react";
import { UpcomingTours } from "@/components/dashboard/UpcomingTours";
import { useGuideTours } from "@/hooks/guides/useGuideTours";

const GuideDashboard = () => {
  const { role, guideView } = useRole();
  const { data: guideTours = [], isLoading, error, guideName } = useGuideTours();
  
  // If accessed directly as an operator without guide view, redirect to main dashboard
  if (role === "operator" && !guideView) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Welcome, {guideName}</h1>
          <p className="text-muted-foreground">
            Here are your upcoming tours and assignments
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              There was a problem loading your tour data.
            </AlertDescription>
          </Alert>
        ) : guideTours.length > 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Your Upcoming Tours</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <UpcomingTours tours={guideTours} />
            </CardContent>
          </Card>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Tours Assigned</AlertTitle>
            <AlertDescription>
              You currently have no upcoming tours assigned to you.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GuideDashboard;
