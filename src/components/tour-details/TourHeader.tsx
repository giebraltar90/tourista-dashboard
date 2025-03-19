
import { format } from "date-fns";
import { AlertCircle, Calendar, Clock, MapPin, PenSquare, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TourCardProps } from "@/components/tours/TourCard";
import { useRole } from "@/contexts/RoleContext";
import { GuideInfo } from "@/types/ventrata";

export interface TourHeaderProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
}

export const TourHeader = ({ tour, guide1Info, guide2Info }: TourHeaderProps) => {
  const { guideView } = useRole();
  const formattedDate = format(tour.date, 'EEEE, MMMM d, yyyy');
  const totalParticipants = tour.tourGroups.reduce((sum, group) => sum + group.size, 0);
  const isBelowMinimum = totalParticipants < 4;

  return (
    <>
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
        
        {!guideView && (
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
        )}
      </div>
      
      {isBelowMinimum && !guideView && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Below Minimum Participants</AlertTitle>
          <AlertDescription>
            This tour has fewer than 4 participants. Consider rescheduling or combining with another tour.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
