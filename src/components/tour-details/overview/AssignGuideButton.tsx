
import { Button } from "@/components/ui/button";
import { useAssignGuide } from "@/hooks/group-management/useAssignGuide";
import { useState } from "react";
import { GuideSelectionPopover } from "./GuideSelectionPopover";
import { GuideOption } from "@/hooks/group-management/types";

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
      return;
    } catch (error) {
      console.error("Error assigning guide:", error);
      return;
    } finally {
      setIsAssigning(false);
    }
  };
  
  const isGuideAssigned = !!guideId && guideId !== "_none";
  
  // Convert guides to match GuideOption type by ensuring info is always present
  const typeSafeGuides: GuideOption[] = guides.map(guide => ({
    id: guide.id,
    name: guide.name,
    info: guide.info || null // Convert undefined to null to satisfy the required property
  }));
  
  return (
    <GuideSelectionPopover
      isGuideAssigned={isGuideAssigned}
      isAssigning={isAssigning}
      selectedGuide={guideId || "_none"}
      guideOptions={typeSafeGuides}
      onAssignGuide={handleAssignGuide}
      displayName={displayName}
    />
  );
};
