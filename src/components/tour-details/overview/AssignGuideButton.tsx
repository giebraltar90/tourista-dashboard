
import { Button } from "@/components/ui/button";
import { useAssignGuide } from "@/hooks/group-management/useAssignGuide";
import { useState } from "react";
import { GuideSelectionPopover } from "./GuideSelectionPopover";

interface AssignGuideButtonProps {
  tourId: string;
  guideId: string;
  guideName?: string;
  groupIndex: number;
  guides: Array<{
    id: string;
    name: string;
    info?: any;
  }>;
  displayName: string;
}

export const AssignGuideButton = ({ 
  tourId, 
  guideId, 
  guideName,
  groupIndex, 
  guides,
  displayName
}: AssignGuideButtonProps) => {
  const { assignGuide } = useAssignGuide(tourId);
  const [isAssigning, setIsAssigning] = useState(false);
  
  const handleAssignGuide = async (selectedGuideId: string) => {
    try {
      setIsAssigning(true);
      await assignGuide(groupIndex, selectedGuideId);
      return true;
    } catch (error) {
      console.error("Error assigning guide:", error);
      return false;
    } finally {
      setIsAssigning(false);
    }
  };
  
  const isGuideAssigned = !!guideId && guideId !== "_none";
  
  return (
    <GuideSelectionPopover
      isGuideAssigned={isGuideAssigned}
      isAssigning={isAssigning}
      selectedGuide={guideId || "_none"}
      guideOptions={guides}
      onAssignGuide={handleAssignGuide}
      displayName={displayName}
    />
  );
};
