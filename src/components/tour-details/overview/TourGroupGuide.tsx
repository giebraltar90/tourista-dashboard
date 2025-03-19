
import { Badge } from "@/components/ui/badge";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { useAssignGuide } from "@/hooks/group-management/useAssignGuide";
import { useGuideData } from "@/hooks/useGuideData";
import { isUuid } from "@/services/api/tour/guideUtils";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { GuideBadge } from "./GuideBadge";
import { GuideSelectionPopover } from "./GuideSelectionPopover";
import { GroupStatusIndicator } from "./GroupStatusIndicator";

interface TourGroupGuideProps {
  tour: TourCardProps;
  group: VentrataTourGroup;
  groupIndex: number;
  guideName: string;
  guideInfo: GuideInfo | null;
  guideOptions: Array<{
    id: string;
    name: string;
    info: GuideInfo | null;
  }>;
}

export const TourGroupGuide = ({ 
  tour, 
  group, 
  groupIndex, 
  guideName, 
  guideInfo, 
  guideOptions 
}: TourGroupGuideProps) => {
  const { assignGuide } = useAssignGuide(tour.id);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(group.guideId || "_none");
  const previousGuideIdRef = useRef<string | undefined>(group.guideId);
  const { guides } = useGuideData();
  
  // Display name should default to "Group X" if not set
  const displayName = group.name || `Group ${groupIndex + 1}`;
  
  // Update our local state if the group's guideId changes from an external source
  useEffect(() => {
    // Only update state if the guide ID has actually changed
    if (group.guideId !== previousGuideIdRef.current) {
      setSelectedGuide(group.guideId || "_none");
      previousGuideIdRef.current = group.guideId;
    }
  }, [group.guideId]);
  
  // Helper to resolve guide name from ID
  const getGuideDisplayName = (guideId?: string) => {
    if (!guideId || guideId === "_none") return "Not assigned";
    
    // Check standard guide references first
    if (guideId === "guide1") return tour.guide1 || "Primary Guide";
    if (guideId === "guide2") return tour.guide2 || "Secondary Guide";
    if (guideId === "guide3") return tour.guide3 || "Assistant Guide";
    
    // Check if it's a UUID and find in guides list
    if (isUuid(guideId)) {
      const guideMatch = guides.find(g => g.id === guideId);
      if (guideMatch) return guideMatch.name;
    }
    
    // Return original if it seems to be a name already
    return guideId;
  };

  const handleAssignGuide = async (guideId: string) => {
    if (guideId === selectedGuide) return;
    
    setIsAssigning(true);
    
    try {
      // Optimistically update the UI first
      setSelectedGuide(guideId);
      previousGuideIdRef.current = guideId === "_none" ? undefined : guideId;
      
      // Call the API to update the guide
      await assignGuide(groupIndex, guideId);
    } catch (error) {
      // Revert optimistic update if there was an error
      console.error("Error assigning guide:", error);
      setSelectedGuide(group.guideId || "_none");
      previousGuideIdRef.current = group.guideId;
      
      toast.error("Failed to assign guide");
    } finally {
      setIsAssigning(false);
    }
  };

  // Use the local state instead of the potentially outdated group prop
  const isGuideAssigned = (selectedGuide !== "_none" && selectedGuide !== undefined);

  return (
    <div className={`p-4 rounded-lg border ${isGuideAssigned ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-base">{displayName}</h3>
        <Badge variant="outline" className="bg-blue-50">
          {group.size} people
        </Badge>
      </div>
      
      <div className="flex items-center space-x-3 mt-2">
        <GroupStatusIndicator isAssigned={isGuideAssigned} />
        
        <div className="flex-1">
          <GuideBadge 
            guideName={guideName} 
            guideInfo={guideInfo} 
            isAssigned={isGuideAssigned} 
          />
        </div>
        
        <GuideSelectionPopover
          isGuideAssigned={isGuideAssigned}
          isAssigning={isAssigning}
          selectedGuide={selectedGuide}
          guideOptions={guideOptions}
          onAssignGuide={handleAssignGuide}
          displayName={displayName}
        />
      </div>
    </div>
  );
};
