
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAssignGuide } from "@/hooks/group-management";
import { GuideSelectionPopover } from "./GuideSelectionPopover";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  
  // Track local selected guide for immediate UI updates
  const [localGuideId, setLocalGuideId] = useState(guideId);
  
  // Update local state when props change
  useEffect(() => {
    if (guideId !== localGuideId) {
      setLocalGuideId(guideId);
    }
  }, [guideId]);
  
  const isGuideAssigned = !!guideName && guideName !== "Unassigned";
  
  const handleAssignGuide = async (selectedGuideId: string) => {
    // If selecting the same guide, just return
    if (selectedGuideId === localGuideId) return;
    
    try {
      setIsAssigning(true);
      
      // Update local state immediately for responsive UI
      setLocalGuideId(selectedGuideId);
      
      // Cancel any current queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['tour', tourId] });
      
      const success = await assignGuide(groupIndex, selectedGuideId);
      
      if (!success) {
        // If failed, revert the local state
        setLocalGuideId(guideId);
        toast.error("Failed to assign guide");
      }
    } catch (error) {
      console.error("Error assigning guide:", error);
      // Revert local state on error
      setLocalGuideId(guideId);
      toast.error("Failed to assign guide");
    } finally {
      setIsAssigning(false);
    }
  };
  
  return (
    <GuideSelectionPopover
      isGuideAssigned={isGuideAssigned}
      isAssigning={isAssigning}
      selectedGuide={localGuideId || "_none"}
      guideOptions={guides}
      onAssignGuide={handleAssignGuide}
      displayName={displayName}
    />
  );
};
