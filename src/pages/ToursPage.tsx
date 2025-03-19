
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { mockTours } from "@/data/mockData";
import { useTourFilters } from "@/hooks/useTourFilters";
import { ToursPageHeader } from "@/components/tours/ToursPageHeader";
import { TourFilters } from "@/components/tours/TourFilters";
import { CalendarView } from "@/components/tours/CalendarView";
import { TabbedToursView } from "@/components/tours/TabbedToursView";
import { TourBusinessRules } from "@/components/tours/TourBusinessRules";

const ToursPage = () => {
  const {
    date,
    setDate,
    viewMode,
    setViewMode,
    timeRange,
    setTimeRange,
    filteredTours
  } = useTourFilters(mockTours);
  
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
            {viewMode === "calendar" ? (
              <CalendarView 
                date={date}
                onDateChange={setDate}
                tours={filteredTours}
                timeRange={timeRange}
              />
            ) : (
              <TabbedToursView tours={filteredTours} />
            )}
          </CardContent>
        </Card>
        
        <TourBusinessRules />
      </div>
    </DashboardLayout>
  );
};

export default ToursPage;
