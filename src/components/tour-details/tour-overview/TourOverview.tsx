
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { TourInfoGrid } from "./TourInfoGrid";
import { GuidesSection } from "./GuidesSection";
import { TicketRequirementsSection } from "./TicketRequirementsSection";

interface TourOverviewProps {
  tour: TourCardProps;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const TourOverview = ({ tour, guide1Info, guide2Info, guide3Info }: TourOverviewProps) => {
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
