
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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a query client instance for the component
const queryClient = new QueryClient();

const ToursPage = () => {
  const { guideView } = useRole();
  
  // Wrap the component content in a QueryClientProvider
  return (
    <QueryClientProvider client={queryClient}>
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
                  timeRange={null}
                  onTimeRangeChange={() => {}}
                  viewMode="calendar"
                  onViewModeChange={() => {}}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ToursContent guideView={guideView} />
            </CardContent>
          </Card>
          
          {!guideView && <TourBusinessRules />}
        </div>
      </DashboardLayout>
    </QueryClientProvider>
  );
};

// Separate component for the tours content to avoid hooks conditional rendering issues
const ToursContent = ({ guideView }: { guideView: boolean }) => {
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
    <>
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
      
      {/* Add test data controls */}
      <TestDataControls />
    </>
  );
};

export default ToursPage;
