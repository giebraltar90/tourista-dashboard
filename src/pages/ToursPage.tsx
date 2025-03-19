
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UpcomingTours } from "@/components/dashboard/UpcomingTours";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { mockTours } from "@/data/mockData";
import { 
  CalendarDays, 
  ListFilter, 
  Plus,
  FileText,
  CalendarRange,
  Calendar as CalendarIcon
} from "lucide-react";
import { 
  addDays, 
  isWithinInterval, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  isToday, 
  isTomorrow, 
  startOfDay, 
  endOfDay, 
  addWeeks, 
  addMonths,
  isSameDay 
} from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Define the time range type
type TimeRangeType = "all" | "today" | "tomorrow" | "this-week" | "next-week" | "this-month" | "next-month";

const ToursPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"all" | "calendar">("all");
  const [timeRange, setTimeRange] = useState<TimeRangeType>("all");
  
  // Filter tours based on selected date if in calendar view
  let filteredTours = viewMode === "calendar" && date
    ? mockTours.filter(tour => 
        isSameDay(tour.date, date)
      )
    : mockTours;
  
  // Apply time range filters
  if (timeRange !== "all") {
    const today = new Date();
    
    if (timeRange === "today") {
      filteredTours = mockTours.filter(tour => isToday(tour.date));
    } 
    else if (timeRange === "tomorrow") {
      filteredTours = mockTours.filter(tour => isTomorrow(tour.date));
    } 
    else if (timeRange === "this-week") {
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);
      
      filteredTours = mockTours.filter(tour => 
        isWithinInterval(tour.date, { start: weekStart, end: weekEnd })
      );
    } 
    else if (timeRange === "next-week") {
      const nextWeekStart = startOfWeek(addWeeks(today, 1));
      const nextWeekEnd = endOfWeek(addWeeks(today, 1));
      
      filteredTours = mockTours.filter(tour => 
        isWithinInterval(tour.date, { start: nextWeekStart, end: nextWeekEnd })
      );
    } 
    else if (timeRange === "this-month") {
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      
      filteredTours = mockTours.filter(tour => 
        isWithinInterval(tour.date, { start: monthStart, end: monthEnd })
      );
    } 
    else if (timeRange === "next-month") {
      const nextMonthStart = startOfMonth(addMonths(today, 1));
      const nextMonthEnd = endOfMonth(addMonths(today, 1));
      
      filteredTours = mockTours.filter(tour => 
        isWithinInterval(tour.date, { start: nextMonthStart, end: nextMonthEnd })
      );
    }
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tours Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage all your tours, guides, and participant groups
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Tour
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Tour Overview</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <ToggleGroup type="single" value={timeRange} onValueChange={(value: TimeRangeType) => value && setTimeRange(value)}>
                  <ToggleGroupItem value="all">
                    <ListFilter className="mr-2 h-4 w-4" />
                    All
                  </ToggleGroupItem>
                  <ToggleGroupItem value="today">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Today
                  </ToggleGroupItem>
                  <ToggleGroupItem value="tomorrow">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Tomorrow
                  </ToggleGroupItem>
                  <ToggleGroupItem value="this-week">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    This Week
                  </ToggleGroupItem>
                  <ToggleGroupItem value="next-week">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Next Week
                  </ToggleGroupItem>
                  <ToggleGroupItem value="this-month">
                    <CalendarRange className="mr-2 h-4 w-4" />
                    This Month
                  </ToggleGroupItem>
                  <ToggleGroupItem value="next-month">
                    <CalendarRange className="mr-2 h-4 w-4" />
                    Next Month
                  </ToggleGroupItem>
                </ToggleGroup>
                
                <div className="flex items-center gap-2 ml-2 mt-2 sm:mt-0">
                  <Button 
                    variant={viewMode === "all" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setViewMode("all")}
                  >
                    <ListFilter className="mr-2 h-4 w-4" />
                    All Tours
                  </Button>
                  <Button 
                    variant={viewMode === "calendar" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setViewMode("calendar")}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Calendar View
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "calendar" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Select Date</h3>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium mb-3">
                    {timeRange === "this-week" || timeRange === "next-week"
                      ? "Tours this Week" 
                      : timeRange === "this-month" || timeRange === "next-month"
                        ? "Tours this Month" 
                        : "Tours on Selected Date"}
                  </h3>
                  {filteredTours.length > 0 ? (
                    <div className="space-y-4">
                      <UpcomingTours tours={filteredTours} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 border rounded-md bg-muted/20">
                      <div className="text-center">
                        <p className="text-muted-foreground">
                          {timeRange === "this-week" || timeRange === "next-week"
                            ? "No tours scheduled for this week" 
                            : timeRange === "this-month" || timeRange === "next-month"
                              ? "No tours scheduled for this month" 
                              : "No tours scheduled for this date"}
                        </p>
                        <Button variant="link" size="sm" className="mt-2">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Tour
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upcoming">Upcoming Tours</TabsTrigger>
                    <TabsTrigger value="past">Past Tours</TabsTrigger>
                    <TabsTrigger value="all">All Tours</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming" className="mt-6">
                    <UpcomingTours tours={filteredTours} />
                  </TabsContent>
                  
                  <TabsContent value="past" className="mt-6">
                    <div className="text-center py-8 text-muted-foreground">
                      Past tours will appear here
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="all" className="mt-6">
                    <UpcomingTours tours={filteredTours} />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tour Business Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Guides</h3>
                <p className="text-sm text-muted-foreground">
                  Up to two guides per tour (high season sometimes 3 guides)
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Booking Capacity</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Standard: 24 bookings per tour time (split into two even groups)</li>
                  <li>• Exceptions: Max. would be 29 (split into two even groups)</li>
                  <li>• High Season: Adjust to 36 bookings (split into three groups)</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Group Division</h3>
                <p className="text-sm text-muted-foreground">
                  Split into families or couples + singles. Further divided into adults + children.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Tickets (Versailles Tours)</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Adult tickets: Required for guests aged 18 and above</li>
                  <li>• Children tickets: For guests below 18 years</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Minimum Participants</h3>
                <p className="text-sm text-muted-foreground">
                  4 people minimum. 3 or less will be moved to another tour or starting time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ToursPage;
