
import { useState } from "react";
import { GroupsList } from "./GroupsList";
import { getGuideNameAndInfo } from "./GuideUtils";
import { AssignGuideDialog } from "../../groups-management/dialogs/AssignGuideDialog";
import { useGuides } from "@/hooks/useGuides";
import { Guide, GuideInfo } from "@/types/ventrata";

interface TourGroupsSectionProps {
  tourGroups: any[];
  tourId: string;
}

export const TourGroupsSection = ({ 
  tourGroups,
  tourId
}: TourGroupsSectionProps) => {
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const { data: guides = [] } = useGuides();
  
  // Prepare guides data for the dialogs
  const dialogGuides = guides.map(guide => ({
    id: guide.id,
    name: guide.name,
    info: {
      name: guide.name,
      guideType: guide.guide_type
    } as GuideInfo
  }));
  
  const handleAssignGuide = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsAssignGuideOpen(true);
  };
  
  // Helper function to get guide name and info
  const getGuideInfo = (guideId?: string) => {
    return getGuideNameAndInfo(guides as Guide[], guideId);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Tour Groups</h3>
      </div>
    
      <GroupsList
        tourGroups={tourGroups}
        getGuideNameAndInfo={getGuideInfo}
        tourId={tourId}
        handleAssignGuide={handleAssignGuide}
      />
      
      {isAssignGuideOpen && selectedGroupIndex !== null && (
        <AssignGuideDialog
          isOpen={isAssignGuideOpen}
          onOpenChange={setIsAssignGuideOpen}
          tourId={tourId}
          groupIndex={selectedGroupIndex}
          guides={dialogGuides}
          currentGuideId={tourGroups[selectedGroupIndex]?.guideId}
        />
      )}
    </div>
  );
};
