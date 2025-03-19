
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
import { useGuideTours } from "@/hooks/useGuideData";
import { useRole } from "@/contexts/RoleContext";

const ToursPage = () => {
  const { guideView } = useRole();
  
  // Use guide tours if in guide view, otherwise use all tours
  const { data: guideTours, isLoading: guideToursLoading, error: guideToursError } = useGuideTours();
  const { data: allTours, isLoading: allToursLoading, error: allToursError } = useTours();
  
  // Choose which data source to use based on guide view
  const tours = guideView ? guideTours : allTours;
  const isLoading = guideView ? guideToursLoading : allToursLoading;
  const error = guideView ? guideToursError : allToursError;
  
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
              <CardTitle>
                {guideView ? "My Tours" : "Tour Overview"}
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
        
        {!guideView && <TourBusinessRules />}
      </div>
    </DashboardLayout>
  );
};

export default ToursPage;
