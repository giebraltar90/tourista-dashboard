
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useTours } from "@/hooks/useTourData";
import { useTourFilters } from "@/hooks/useTourFilters";
import { ToursPageHeader } from "@/components/tours/ToursPageHeader";
import { TourFilters } from "@/components/tours/TourFilters";
import { CalendarView } from "@/components/tours/CalendarView";
import { TabbedToursView } from "@/components/tours/TabbedToursView";
import { TourBusinessRules } from "@/components/tours/TourBusinessRules";

const ToursPage = () => {
  // Fetch tours from API
  const { data: tours, isLoading, error } = useTours();
  
  const {
    date,
    setDate,
    viewMode,
    setViewMode,
    timeRange,
    setTimeRange,
    filteredTours
  } = useTourFilters(tours);
  
  return (
    <DashboardLayout>
      <div className="space-y-6 py-4">
        <ToursPageHeader />
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Tour Overview</CardTitle>
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
              <div className="text-center text-red-500 py-10">
                Error loading tours. Please try again.
              </div>
            )}
            
            {!isLoading && !error && (
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
          </CardContent>
        </Card>
        
        <TourBusinessRules />
      </div>
    </DashboardLayout>
  );
};

export default ToursPage;
