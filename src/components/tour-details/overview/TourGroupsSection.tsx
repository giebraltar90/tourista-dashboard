
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { useGuideData } from "@/hooks/useGuideData";
import { TourGroupGuide } from "./TourGroupGuide";
import { isUuid } from "@/services/api/tour/guideUtils";

interface TourGroupsSectionProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export const TourGroupsSection = ({ 
  tour, 
  guide1Info, 
  guide2Info, 
  guide3Info 
}: TourGroupsSectionProps) => {
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  const { guides = [] } = useGuideData() || { guides: [] };
  
  // Create guide options for the select dropdown - making sure we handle undefined values
  const getGuideOptions = () => {
    if (!tour) return [];
    
    const options = [
      { id: "guide1", name: tour.guide1, info: guide1Info },
      ...(tour.guide2 ? [{ id: "guide2", name: tour.guide2, info: guide2Info }] : []),
      ...(tour.guide3 ? [{ id: "guide3", name: tour.guide3, info: guide3Info }] : []),
    ];
    
    // Add additional guides from the database that might not be primary guides
    if (guides && Array.isArray(guides)) {
      guides.forEach(guide => {
        // Skip if this guide is already in the options (compare by id and name)
        if (!options.some(g => g.id === guide.id || g.name === guide.name)) {
          options.push({ id: guide.id, name: guide.name, info: guide });
        }
      });
    }
    
    // Remove any invalid options (no name)
    return options.filter(guide => guide && guide.name);
  };

  // Guard against tour being undefined or tourGroups not being an array
  if (!tour || !Array.isArray(tour.tourGroups)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tour Groups & Guides</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No tour groups available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Groups & Guides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tour.tourGroups.map((group, index) => {
            const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);
            
            return (
              <TourGroupGuide
                key={`group-${index}-${group.id || index}`}
                tour={tour}
                group={group}
                groupIndex={index}
                guideName={guideName}
                guideInfo={guideInfo}
                guideOptions={getGuideOptions()}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
