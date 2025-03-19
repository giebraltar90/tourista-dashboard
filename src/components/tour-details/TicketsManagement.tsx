
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PenSquare, Ticket } from "lucide-react";
import { TourCardProps } from "@/components/tours/TourCard";

interface TicketsManagementProps {
  tour: TourCardProps;
}

export const TicketsManagement = ({ tour }: TicketsManagementProps) => {
  const totalParticipants = tour.tourGroups.reduce((sum, group) => sum + group.size, 0);
  const adultTickets = Math.round(tour.numTickets * 0.7) || Math.round(totalParticipants * 0.7);
  const childTickets = (tour.numTickets || totalParticipants) - adultTickets;

  return (
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
  );
};
