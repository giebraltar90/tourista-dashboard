
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useTours } from "@/hooks/tourData/useTours";
import { useTourFilters } from "@/hooks/useTourFilters";
import { ToursPageHeader } from "@/components/tours/ToursPageHeader";
import { TourFilters } from "@/components/tours/TourFilters";
import { CalendarView } from "@/components/tours/CalendarView";
import { TabbedToursView } from "@/components/tours/TabbedToursView";
import { TourBusinessRules } from "@/components/tours/TourBusinessRules";
import { useGuideTours } from "@/hooks/guides";
import { useRole } from "@/contexts/RoleContext";
import { TestDataControls } from "@/components/tours/TestDataControls";
import { toast } from "sonner";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const ToursPage = () => {
  const { guideView } = useRole();
  
  // Use guide tours if in guide view, otherwise use all tours
  const { 
    data: guideTours, 
    isLoading: guideToursLoading, 
    error: guideToursError,
    refetch: refetchGuideTours
  } = useGuideTours();
  
  const { 
    data: allTours, 
    isLoading: allToursLoading, 
    error: allToursError,
    refetch: refetchAllTours
  } = useTours();
  
  // Choose which data source to use based on guide view
  const tours = guideView ? guideTours : allTours;
  const isLoading = guideView ? guideToursLoading : allToursLoading;
  const error = guideView ? guideToursError : allToursError;
  const refetchTours = guideView ? refetchGuideTours : refetchAllTours;
  
  // Notify if no tours are found when data is loaded
  useEffect(() => {
    if (!isLoading && !error && (!tours || tours.length === 0)) {
      toast.info("No tours found. You can create test data using the controls below.");
    }
  }, [tours, isLoading, error]);

  const {
    date,
    setDate,
    viewMode,
    setViewMode,
    timeRange,
    setTimeRange,
    filteredTours
  } = useTourFilters(tours || []);
  
  const handleRefresh = () => {
    toast.info("Refreshing tours data...");
    refetchTours();
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 py-4">
        <ToursPageHeader />
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                {guideView ? "My Tours" : "Tour Overview"}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRefresh} 
                  title="Refresh tours data"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardTitle>
              <TourFilters 
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            
            {error && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error loading tours</AlertTitle>
                  <AlertDescription>
                    {error instanceof Error 
                      ? error.message 
                      : "Failed to fetch tours. Please check your network connection."}
                  </AlertDescription>
                </Alert>
                <div className="flex justify-center">
                  <Button onClick={handleRefresh} className="flex gap-2 items-center">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}
            
            {!isLoading && !error && tours && tours.length === 0 && (
              <div className="text-center py-10 space-y-4">
                <p className="text-muted-foreground">No tours found.</p>
                <TestDataControls />
              </div>
            )}
            
            {!isLoading && !error && tours && tours.length > 0 && (
              viewMode === "calendar" ? (
                <CalendarView 
                  date={date}
                  onDateChange={setDate}
                  tours={filteredTours}
                  timeRange={timeRange}
                />
              ) : (
                <TabbedToursView tours={filteredTours} />
              )
            )}
            
            {/* Only show test data controls if no tours loaded or at the bottom */}
            {(!isLoading && !error && (!tours || tours.length === 0)) ? null : (
              <div className="mt-8 pt-4 border-t">
                <TestDataControls />
              </div>
            )}
          </CardContent>
        </Card>
        
        {!guideView && <TourBusinessRules />}
      </div>
    </DashboardLayout>
  );
};

export default ToursPage;
