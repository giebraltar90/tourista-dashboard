
import { Badge } from "@/components/ui/badge";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { useAssignGuide } from "@/hooks/group-management/useAssignGuide";
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
  const { assignGuide } = useAssignGuide(tour?.id || "");
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<string>(group?.guideId || "_none");
  const previousGuideIdRef = useRef<string | undefined>(group?.guideId);
  
  // Display name should default to "Group X" if not set
  const displayName = group?.name || `Group ${groupIndex + 1}`;
  
  // Calculate group size directly from the size property
  const totalGroupSize = group?.size || 0;
  
  // Update our local state if the group's guideId changes from an external source
  useEffect(() => {
    if (!group) return;
    
    if (group.guideId !== previousGuideIdRef.current) {
      console.log(`Guide ID changed externally for group ${groupIndex}:`, { 
        previous: previousGuideIdRef.current, 
        current: group.guideId 
      });
      setSelectedGuide(group.guideId || "_none");
      previousGuideIdRef.current = group.guideId;
    }
  }, [group, groupIndex]);

  const handleAssignGuide = async (guideId: string) => {
    if (guideId === selectedGuide || !tour?.id) return;
    
    setIsAssigning(true);
    
    try {
      console.log(`Assigning guide ${guideId} to group ${groupIndex}`);
      
      // Optimistically update the UI first
      setSelectedGuide(guideId);
      previousGuideIdRef.current = guideId === "_none" ? undefined : guideId;
      
      // Call the API to update the guide
      await assignGuide(groupIndex, guideId);
    } catch (error) {
      // Revert optimistic update if there was an error
      console.error("Error assigning guide:", error);
      setSelectedGuide(group?.guideId || "_none");
      previousGuideIdRef.current = group?.guideId;
    } finally {
      setIsAssigning(false);
    }
  };

  // Safely check if guide is assigned based on selectedGuide
  const isGuideAssigned = selectedGuide !== "_none" && selectedGuide !== undefined;

  // Guard against missing group data
  if (!group) {
    return (
      <div className="p-4 rounded-lg border border-gray-200">
        <p className="text-muted-foreground">Group data not available</p>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${isGuideAssigned ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-base">{displayName}</h3>
        <Badge variant="outline" className="bg-blue-50">
          {totalGroupSize} people
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
          guideOptions={guideOptions || []}
          onAssignGuide={handleAssignGuide}
          displayName={displayName}
        />
      </div>
    </div>
  );
};
