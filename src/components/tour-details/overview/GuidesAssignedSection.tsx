
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { GuideAssignmentDisplay } from "./GuideAssignmentDisplay";

interface GuidesAssignedSectionProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  getGuideTypeBadgeColor: (guideType?: string) => string;
}

export const GuidesAssignedSection = ({ 
  tour, 
  guide1Info, 
  guide2Info, 
  guide3Info,
  getGuideTypeBadgeColor
}: GuidesAssignedSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Guides Assigned</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GuideAssignmentDisplay
            guideName={tour.guide1}
            guideInfo={guide1Info}
            guideId="guide1"
            isPrimary={true}
            tourGroups={tour.tourGroups}
            getGuideTypeBadgeColor={getGuideTypeBadgeColor}
          />
          
          {tour.guide2 && (
            <GuideAssignmentDisplay
              guideName={tour.guide2}
              guideInfo={guide2Info}
              guideId="guide2"
              isPrimary={false}
              tourGroups={tour.tourGroups}
              getGuideTypeBadgeColor={getGuideTypeBadgeColor}
            />
          )}
          
          {tour.guide3 && (
            <GuideAssignmentDisplay
              guideName={tour.guide3}
              guideInfo={guide3Info}
              guideId="guide3"
              isPrimary={false}
              tourGroups={tour.tourGroups}
              getGuideTypeBadgeColor={getGuideTypeBadgeColor}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
