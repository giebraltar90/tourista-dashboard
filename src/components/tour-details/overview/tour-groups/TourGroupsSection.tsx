
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuideInfo, VentrataTourGroup, GuideType } from "@/types/ventrata";
import { Button } from "@/components/ui/button";
import { useGuideData } from "@/hooks/guides/useGuideData";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { logger } from "@/utils/logger";
import { GroupsList } from "./GroupsList";
import { GuideSelectionDialog } from "./GuideSelectionDialog";
import { EventEmitter } from "@/utils/eventEmitter";
import { updateTourModification } from "@/services/ventrataApi";
import { useUpdateTourGroups } from "@/hooks/useTourData";
import { useGuideNameInfo } from "@/hooks/group-management/utils/guideInfoUtils";

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
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
  const { guides = [] } = useGuideData();
  const { mutateAsync: updateGroups } = useUpdateTourGroups(tourId);
  
  // Create a mock tour object from the data we have 
  const mockTour: TourCardProps = {
    id: tourId,
    date: new Date(),
    location: "",
    tourName: "",
    tourType: "default" as const,
    startTime: "",
    referenceCode: "",
    guide1: guide1Info?.name || "",
    guide2: guide2Info?.name || "",
    guide3: guide3Info?.name || "",
    guide1Id: guide1Info?.id || "",
    guide2Id: guide2Info?.id || "",
    guide3Id: guide3Info?.id || "",
    tourGroups: [],
    numTickets: 0,
    isHighSeason: false
  };
  
  // Get the guide name and info helper
  const { getGuideNameAndInfo } = useGuideNameInfo(
    mockTour,
    guide1Info,
    guide2Info,
    guide3Info
  );
  
  // Handler for opening the guide assignment dialog
  const handleAssignGuide = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsGuideDialogOpen(true);
  };
  
  // Handler for assigning a guide
  const handleGuideAssigned = async (guideId: string | null) => {
    if (selectedGroupIndex === null) return;
    
    const updatedGroups = [...tourGroups];
    const group = updatedGroups[selectedGroupIndex];
    
    // Get guide name for the modification description
    const guideName = guideId ? getGuideNameAndInfo(guideId).name : "Unassigned";
    
    // Update the group
    updatedGroups[selectedGroupIndex] = {
      ...group,
      guideId: guideId,
    };
    
    try {
      // Update the database
      await updateGroups(updatedGroups);
      
      // Create a modification record
      await updateTourModification(tourId, {
        description: `Group ${selectedGroupIndex + 1}: ${guideId ? `Assigned guide ${guideName}` : 'Removed guide assignment'}`,
        details: {
          type: "guide_assignment",
          groupId: group.id,
          guideId: guideId,
          timestamp: new Date().toISOString(),
        },
      });
      
      // Notify other components
      EventEmitter.emit(`guide-change:${tourId}`);
    } catch (error) {
      console.error("Error updating guide assignment:", error);
    }
    
    setIsGuideDialogOpen(false);
    setSelectedGroupIndex(null);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Groups & Guides</CardTitle>
      </CardHeader>
      <CardContent>
        <GroupsList 
          tourGroups={tourGroups}
          getGuideNameAndInfo={getGuideNameAndInfo}
          onAssignGuide={handleAssignGuide}
        />
        
        {isGuideDialogOpen && selectedGroupIndex !== null && (
          <GuideSelectionDialog
            isOpen={isGuideDialogOpen}
            onClose={() => setIsGuideDialogOpen(false)}
            onSelect={handleGuideAssigned}
            guides={guides}
            currentGuideId={selectedGroupIndex !== null ? tourGroups[selectedGroupIndex].guideId : null}
            tour={mockTour}
            guide1Info={guide1Info}
            guide2Info={guide2Info}
            guide3Info={guide3Info}
          />
        )}
      </CardContent>
    </Card>
  );
};
