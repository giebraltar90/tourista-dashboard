
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GroupsList } from "./GroupsList";
import { VentrataTourGroup } from "@/types/ventrata";
import { useState } from "react";
import { GuideInfo } from "@/types/ventrata";
import { GuideSelectionDialog } from "./GuideSelectionDialog";
import { useGuideData } from "@/hooks/useGuideData";
import { useGuideNameInfo } from "@/hooks/group-management/useGuideNameInfo";
import { useUpdateTourGroups } from "@/hooks/useTourData";
import { updateTourModification } from "@/services/ventrataApi";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { EventEmitter } from "@/utils/eventEmitter";

interface TourGroupsSectionProps {
  tourGroups: VentrataTourGroup[];
  tourId: string;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export const TourGroupsSection = ({
  tourGroups,
  tourId,
  guide1Info,
  guide2Info,
  guide3Info,
}: TourGroupsSectionProps) => {
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
  const { guides = [] } = useGuideData();
  const { mutateAsync: updateGroups } = useUpdateTourGroups();
  
  // Create a mock tour object from the data we have 
  const mockTour = {
    id: tourId,
    guide1: guide1Info?.name || "",
    guide2: guide2Info?.name || "",
    guide3: guide3Info?.name || "",
    guide1_id: guide1Info?.id || "",
    guide2_id: guide2Info?.id || "",
    guide3_id: guide3Info?.id || "",
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
      await updateGroups({
        tourId,
        updatedGroups,
      });
      
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
      
      toast.success(`${guideId ? `Guide ${guideName} assigned to` : 'Guide removed from'} Group ${selectedGroupIndex + 1}`);
    } catch (error) {
      console.error("Error updating guide assignment:", error);
      toast.error("Failed to update guide assignment");
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
          tourId={tourId}
          handleAssignGuide={handleAssignGuide}
        />
        
        {isGuideDialogOpen && (
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
