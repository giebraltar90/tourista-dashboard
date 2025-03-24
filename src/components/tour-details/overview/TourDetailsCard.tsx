
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { formatParticipantCount } from "@/hooks/group-management/services/participantService/formatParticipantService";
import { calculateTotalParticipants, calculateTotalChildCount } from "@/hooks/group-management/utils/countingService";

interface TourDetailsCardProps {
  tour: TourCardProps;
}

export const TourDetailsCard = ({ tour }: TourDetailsCardProps) => {
  // Calculate total participants and child count
  const tourGroups = Array.isArray(tour.tourGroups) ? tour.tourGroups : [];
  const totalParticipants = calculateTotalParticipants(tourGroups);
  const totalChildCount = calculateTotalChildCount(tourGroups);
  
  // Format the date nicely
  let formattedDate = "";
  try {
    if (tour.date) {
      const dateObj = new Date(tour.date);
      formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    formattedDate = String(tour.date);
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Tour Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Reference Code</h3>
            <p className="text-lg font-semibold">{tour.referenceCode || "N/A"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Tour Type</h3>
            <p className="text-lg font-semibold capitalize">{tour.tourType || "Default"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
            <p className="text-lg font-semibold">{tour.location || "Unknown"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
            <p className="text-lg font-semibold">{formattedDate || "Unknown"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Start Time</h3>
            <p className="text-lg font-semibold">{tour.startTime || "Not specified"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Season</h3>
            <p className="text-lg font-semibold">
              {tour.isHighSeason ? "High Season" : "Standard Season"}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Total Participants</h3>
            <p className="text-lg font-semibold">
              {totalParticipants > 0 
                ? formatParticipantCount(totalParticipants, totalChildCount)
                : "No participants"}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Tickets Required</h3>
            <p className="text-lg font-semibold">{tour.numTickets || totalParticipants || "0"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
