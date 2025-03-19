
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
  FileText
} from "lucide-react";

const ToursPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"all" | "calendar">("all");
  
  // Filter tours based on selected date if in calendar view
  const filteredTours = viewMode === "calendar" && date
    ? mockTours.filter(tour => 
        tour.date.getDate() === date.getDate() &&
        tour.date.getMonth() === date.getMonth() &&
        tour.date.getFullYear() === date.getFullYear()
      )
    : mockTours;
  
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
            <div className="flex items-center justify-between">
              <CardTitle>Tour Overview</CardTitle>
              <div className="flex items-center gap-2">
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
                  <h3 className="text-sm font-medium mb-3">Tours on Selected Date</h3>
                  {filteredTours.length > 0 ? (
                    <div className="space-y-4">
                      <UpcomingTours tours={filteredTours} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 border rounded-md bg-muted/20">
                      <div className="text-center">
                        <p className="text-muted-foreground">No tours scheduled for this date</p>
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
                    <UpcomingTours tours={mockTours} />
                  </TabsContent>
                  
                  <TabsContent value="past" className="mt-6">
                    <div className="text-center py-8 text-muted-foreground">
                      Past tours will appear here
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="all" className="mt-6">
                    <UpcomingTours tours={mockTours} />
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
