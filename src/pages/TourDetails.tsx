
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { 
  Bike, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Ticket, 
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  PenSquare,
  FileText
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { mockTours } from "@/data/mockData";

const TourDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Find the tour from mock data
  const tour = mockTours.find(tour => tour.id === id);
  
  if (!tour) {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Tour not found. Please check the tour ID and try again.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }
  
  // Calculate totals
  const totalParticipants = tour.tourGroups.reduce((sum, group) => sum + group.size, 0);
  const totalGroups = tour.tourGroups.length;
  const formattedDate = format(tour.date, 'EEEE, MMMM d, yyyy');
  
  // Determine if tour is below minimum participants
  const isBelowMinimum = totalParticipants < 4;
  
  // Simulate ticket breakdown
  const adultTickets = Math.round(tour.numTickets * 0.7) || Math.round(totalParticipants * 0.7);
  const childTickets = (tour.numTickets || totalParticipants) - adultTickets;
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{tour.tourName}</h1>
            <div className="flex items-center mt-1 text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{formattedDate}</span>
              <Clock className="ml-4 mr-2 h-4 w-4" />
              <span>{tour.startTime}</span>
              <MapPin className="ml-4 mr-2 h-4 w-4" />
              <span>{tour.location}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <PenSquare className="mr-2 h-4 w-4" />
              Edit Tour
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message Guides
            </Button>
            <Button size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>
        
        {isBelowMinimum && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Below Minimum Participants</AlertTitle>
            <AlertDescription>
              This tour has fewer than 4 participants. Consider rescheduling or combining with another tour.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="groups">Groups & Guides</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="modifications">Modifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tour Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reference:</span>
                      <span className="font-medium">#{tour.referenceCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className={
                        tour.tourType === 'food' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                        tour.tourType === 'private' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                        'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }>
                        {tour.tourType === 'food' ? 'Food Tour' : 
                         tour.tourType === 'private' ? 'Private Tour' : 
                         'Standard Tour'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                        Confirmed
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">{totalParticipants} participants</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Groups:</span>
                      <span className="font-medium">{totalGroups} groups</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="font-medium">
                        {totalParticipants} / {totalGroups > 2 ? '36' : '24'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Adult (18+):</span>
                      <span className="font-medium">{adultTickets} tickets</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Child (Under 18):</span>
                      <span className="font-medium">{childTickets} tickets</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">
                        {tour.numTickets || totalParticipants} tickets
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Guides Assigned</CardTitle>
                <CardDescription>Tour guides responsible for this tour</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{tour.guide1}</h3>
                      <p className="text-sm text-muted-foreground">Primary Guide</p>
                    </div>
                  </div>
                  
                  {tour.guide2 && (
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{tour.guide2}</h3>
                        <p className="text-sm text-muted-foreground">Secondary Guide</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="groups" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Group Management</CardTitle>
                <CardDescription>Details of participant groups and their assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Group Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Entry Time</TableHead>
                      <TableHead>Guide</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tour.tourGroups.map((group, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>{group.size}</TableCell>
                        <TableCell>{group.entryTime}</TableCell>
                        <TableCell>{index === 0 ? tour.guide1 : tour.guide2 || tour.guide1}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Confirmed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <div className="text-sm text-muted-foreground">
                  Group division is based on families or couples + singles and further divided into adults + children.
                </div>
                <Button variant="outline" size="sm">
                  <PenSquare className="mr-2 h-4 w-4" />
                  Edit Groups
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="tickets" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Management</CardTitle>
                <CardDescription>Manage tickets for this tour</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Adult Tickets (18+)</h3>
                      <div className="flex items-center justify-between bg-secondary/30 p-4 rounded-md">
                        <div className="flex items-center">
                          <Ticket className="h-5 w-5 mr-2 text-primary" />
                          <span>Required for guests aged 18 and above</span>
                        </div>
                        <Badge>{adultTickets}</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Child Tickets (Under 18)</h3>
                      <div className="flex items-center justify-between bg-secondary/30 p-4 rounded-md">
                        <div className="flex items-center">
                          <Ticket className="h-5 w-5 mr-2 text-primary" />
                          <span>For guests below 18 years</span>
                        </div>
                        <Badge>{childTickets}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Ticket Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between bg-green-100 p-4 rounded-md">
                        <span className="text-green-800">Purchased</span>
                        <Badge variant="outline" className="bg-green-200 text-green-800 border-green-300">
                          {tour.numTickets || totalParticipants}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between bg-yellow-100 p-4 rounded-md">
                        <span className="text-yellow-800">Pending</span>
                        <Badge variant="outline" className="bg-yellow-200 text-yellow-800 border-yellow-300">
                          0
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between bg-blue-100 p-4 rounded-md">
                        <span className="text-blue-800">Distributed</span>
                        <Badge variant="outline" className="bg-blue-200 text-blue-800 border-blue-300">
                          {tour.numTickets || totalParticipants}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <Button className="ml-auto">
                  <PenSquare className="mr-2 h-4 w-4" />
                  Manage Tickets
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="modifications" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tour Modifications</CardTitle>
                <CardDescription>View and manage all changes made to this tour</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="text-sm font-medium">Special Instructions</h3>
                    <p className="mt-2 text-muted-foreground">
                      Group division: Split into families or couples + singles. Further divided into adults + children.
                    </p>
                    <p className="mt-2 text-muted-foreground">
                      Adults: {adultTickets}, Children: {childTickets}
                    </p>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Modification</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>{format(new Date(), 'MMM d, yyyy')}</TableCell>
                        <TableCell>System</TableCell>
                        <TableCell>Tour created</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                            <span>Complete</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      {/* Example modifications - would be populated from actual data */}
                      <TableRow>
                        <TableCell>{format(new Date(), 'MMM d, yyyy')}</TableCell>
                        <TableCell>Operations</TableCell>
                        <TableCell>Added second guide</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                            <span>Complete</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <Button variant="outline" className="ml-auto">
                  <PenSquare className="mr-2 h-4 w-4" />
                  Add Modification
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TourDetails;
