
import { TourCardProps } from "@/components/tours/tour-card/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, MapPinIcon, ClockIcon, TicketIcon, UsersIcon } from "lucide-react";

interface TourDetailsCardProps {
  tour: TourCardProps;
}

export const TourDetailsCard = ({ tour }: TourDetailsCardProps) => {
  // Format date for display
  const formattedDate = tour.date instanceof Date 
    ? format(tour.date, 'PPP') 
    : typeof tour.date === 'string'
      ? tour.date
      : 'Unknown date';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>Tour Details</span>
          <Badge variant="outline" className="font-normal">
            {tour.referenceCode || "No Reference"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <TicketIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tour Type:</span>
              <span className="font-medium capitalize">{tour.tourType || "Default"}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <MapPinIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{tour.location || "Unknown location"}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Start Time:</span>
              <span className="font-medium">{tour.startTime || "Unknown time"}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Season:</span>
              <Badge variant="outline" 
                className={`font-normal ${tour.isHighSeason 
                  ? "bg-blue-100 text-blue-800 border-blue-300" 
                  : "bg-green-100 text-green-800 border-green-300"}`}
              >
                {tour.isHighSeason ? "High Season" : "Standard Season"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <TicketIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Required Tickets:</span>
              <span className="font-medium">{tour.numTickets || "Auto-calculated"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
