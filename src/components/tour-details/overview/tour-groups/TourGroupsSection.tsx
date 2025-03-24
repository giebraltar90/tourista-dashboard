
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuideInfo } from "@/types/ventrata";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { useGuideData } from "@/hooks/guides/useGuideData";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { logger } from "@/utils/logger";
import { GroupsList } from "./GroupsList";
import { processGuideInfo, addSpecialGuides } from "./GuideUtils";
import { AssignGuideDialog } from "../../groups-management/dialogs/AssignGuideDialog";

interface TourGroupsSectionProps {
  tour: TourCardProps;
  isHighSeason: boolean;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const TourGroupsSection = ({ 
  tour, 
  isHighSeason,
  guide1Info = null, 
  guide2Info = null, 
  guide3Info = null 
}: TourGroupsSectionProps) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  const { guides = [] } = useGuideData();
  
  // State for guide assignment dialog
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1);
  
  // Ensure we have tour groups
  const tourGroups = Array.isArray(tour.tourGroups) ? tour.tourGroups : [];
  
  // Log group data for debugging
  useEffect(() => {
    logger.debug("TourGroupsSection: Tour groups data", {
      tourId: tour.id,
      groupCount: tourGroups.length,
      groups: tourGroups.map((g, i) => ({
        index: i,
        id: g.id,
        name: g.name,
        guideId: g.guideId || 'none'
      }))
    });
  }, [tour.id, tourGroups]);
  
  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };
  
  // Open the guide assignment dialog
  const handleAssignGuide = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsAssignGuideOpen(true);
  };
  
  // Get valid guide options - making sure each guide has all required properties
  const validGuides = guides.map(guide => processGuideInfo(guide));
  
  // Add special guides if they exist in the tour
  const allGuides = addSpecialGuides(validGuides, tour, guide1Info, guide2Info, guide3Info);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Groups & Guides</CardTitle>
      </CardHeader>
      <CardContent>
        <GroupsList 
          tourGroups={tourGroups}
          getGuideNameAndInfo={getGuideNameAndInfo}
          tourId={tour.id}
          handleAssignGuide={handleAssignGuide}
        />
        
        {/* Guide Assignment Dialog */}
        {isAssignGuideOpen && selectedGroupIndex >= 0 && tourGroups[selectedGroupIndex] && (
          <AssignGuideDialog
            isOpen={isAssignGuideOpen}
            onOpenChange={setIsAssignGuideOpen}
            tourId={tour.id}
            groupIndex={selectedGroupIndex}
            guides={allGuides}
            currentGuideId={tourGroups[selectedGroupIndex].guideId}
          />
        )}
      </CardContent>
    </Card>
  );
};
