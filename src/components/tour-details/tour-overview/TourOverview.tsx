
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { TourInfoGrid } from "./TourInfoGrid";
import { GuidesSection } from "./GuidesSection";
import { TicketRequirementsSection } from "./TicketRequirementsSection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

interface TourOverviewProps {
  tour: TourCardProps;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const TourOverview = ({ tour, guide1Info, guide2Info, guide3Info }: TourOverviewProps) => {
  // Add debug logging
  useEffect(() => {
    console.log("TourOverview rendering with tour data:", {
      id: tour.id,
      name: tour.tourName,
      date: tour.date instanceof Date ? tour.date.toISOString() : tour.date,
      location: tour.location,
      tourType: tour.tourType,
      startTime: tour.startTime,
      hasGuide1: !!guide1Info,
      hasGuide2: !!guide2Info,
      hasGuide3: !!guide3Info
    });
  }, [tour, guide1Info, guide2Info, guide3Info]);

  // Verify tour data is valid
  if (!tour || !tour.id) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Invalid Tour Data</AlertTitle>
        <AlertDescription>
          The tour information appears to be incomplete or corrupted. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Tour Information</h2>
        <TourInfoGrid tour={tour} />
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Guides</h2>
        <GuidesSection 
          guide1Info={guide1Info}
          guide2Info={guide2Info}
          guide3Info={guide3Info}
        />
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Ticket Requirements</h2>
        <TicketRequirementsSection tourId={tour.id} />
      </div>
    </div>
  );
};
