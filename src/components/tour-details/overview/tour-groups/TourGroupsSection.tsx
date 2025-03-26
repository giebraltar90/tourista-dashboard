
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { GroupsList } from "./GroupsList";
import { logger } from "@/utils/logger";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { AssignGuideDialog } from "@/components/tour-details/groups-management/dialogs/AssignGuideDialog";

interface TourGroupsSectionProps {
  tourGroups: VentrataTourGroup[];
  tourId: string;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
}

export const TourGroupsSection = ({
  tourGroups,
  tourId,
  guide1Info = null,
  guide2Info = null,
  guide3Info = null
}: TourGroupsSectionProps) => {
  // Log guide info for debugging
  React.useEffect(() => {
    logger.debug("TourGroupsSection received guide info:", {
      guide1: guide1Info ? { 
        name: guide1Info.name, 
        type: guide1Info.guideType
      } : null,
      guide2: guide2Info ? { 
        name: guide2Info.name, 
        type: guide2Info.guideType
      } : null,
      guide3: guide3Info ? { 
        name: guide3Info.name, 
        type: guide3Info.guideType
      } : null
    });
  }, [guide1Info, guide2Info, guide3Info]);

  // Create a minimal tour object for the useGuideNameInfo hook
  const minimalTour: TourCardProps = { 
    id: tourId, 
    guide1: '', 
    guide2: '', 
    guide3: '',
    date: new Date(),
    location: '',
    tourName: '',
    tourType: 'default',
    startTime: '',
    referenceCode: '',
    tourGroups: [],
    numTickets: 0,
    isHighSeason: false
  };

  const { getGuideNameAndInfo } = useGuideNameInfo(minimalTour, guide1Info, guide2Info, guide3Info);
  
  // State for guide assignment dialog
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(-1);
  
  const handleAssignGuide = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsAssignGuideOpen(true);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Tour Groups</CardTitle>
      </CardHeader>
      <CardContent>
        <GroupsList 
          tourGroups={tourGroups}
          tourId={tourId}
          getGuideNameAndInfo={getGuideNameAndInfo}
          handleAssignGuide={handleAssignGuide}
        />
        
        {isAssignGuideOpen && selectedGroupIndex >= 0 && tourGroups[selectedGroupIndex] && (
          <AssignGuideDialog
            isOpen={isAssignGuideOpen}
            onOpenChange={setIsAssignGuideOpen}
            tourId={tourId}
            groupIndex={selectedGroupIndex}
            guides={[]}
            currentGuideId={tourGroups[selectedGroupIndex].guideId}
          />
        )}
      </CardContent>
    </Card>
  );
};
