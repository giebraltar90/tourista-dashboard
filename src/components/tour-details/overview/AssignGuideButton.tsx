
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAssignGuide } from "@/hooks/group-management";
import { GuideSelectionPopover } from "./GuideSelectionPopover";
import { toast } from "sonner";

interface AssignGuideButtonProps {
  tourId: string;
  guideId: string;
  guideName?: string;
  groupIndex: number;
  guides: Array<{
    id: string;
    name: string;
    info: any;
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
  const [isAssigning, setIsAssigning] = useState(false);
  const { assignGuide } = useAssignGuide(tourId);
  
  const isGuideAssigned = !!guideName && guideName !== "Unassigned";
  
  const handleAssignGuide = async (selectedGuideId: string) => {
    try {
      setIsAssigning(true);
      
      const success = await assignGuide(groupIndex, selectedGuideId);
      
      if (success) {
        toast.success(`Guide assigned successfully to ${displayName}`);
      } else {
        toast.error("Failed to assign guide");
      }
    } catch (error) {
      console.error("Error assigning guide:", error);
      toast.error("Failed to assign guide");
    } finally {
      setIsAssigning(false);
    }
  };
  
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
