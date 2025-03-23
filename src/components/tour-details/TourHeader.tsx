
import { format } from "date-fns";
import { AlertCircle, Calendar, Clock, MapPin, PenSquare, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRole } from "@/contexts/RoleContext";
import { GuideInfo } from "@/types/ventrata";

export interface TourHeaderProps {
  tourName: string;
  date: Date;
  startTime: string;
  location: string;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const TourHeader = ({ 
  tourName = "Unnamed Tour", 
  date = new Date(),  
  startTime = "00:00", 
  location = "Unknown",
  guide1Info,
  guide2Info,
  guide3Info
}: TourHeaderProps) => {
  const { guideView } = useRole();
  
  // Safely format the date with fallback
  let formattedDate;
  try {
    formattedDate = format(date instanceof Date ? date : new Date(date), 'EEEE, MMMM d, yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    formattedDate = "Invalid date";
  }
  
  // This will be determined elsewhere - not needed for this component
  const isBelowMinimum = false;

  return (
    <>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{tourName}</h1>
          <div className="flex items-center mt-1 text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{formattedDate}</span>
            <Clock className="ml-4 mr-2 h-4 w-4" />
            <span>{startTime}</span>
            <MapPin className="ml-4 mr-2 h-4 w-4" />
            <span>{location}</span>
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
