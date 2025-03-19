
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { TourCardProps } from "@/components/tours/TourCard";

interface TourOverviewProps {
  tour: TourCardProps;
}

export const TourOverview = ({ tour }: TourOverviewProps) => {
  const totalParticipants = tour.tourGroups.reduce((sum, group) => sum + group.size, 0);
  const totalGroups = tour.tourGroups.length;
  
  const adultTickets = Math.round(tour.numTickets * 0.7) || Math.round(totalParticipants * 0.7);
  const childTickets = (tour.numTickets || totalParticipants) - adultTickets;

  return (
    <div className="space-y-4">
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
          <CardContent>Tour guides responsible for this tour</CardContent>
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
    </div>
  );
};
