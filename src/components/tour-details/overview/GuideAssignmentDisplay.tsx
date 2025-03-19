
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, IdCard, Users } from "lucide-react";
import { format } from "date-fns";
import { GuideInfo } from "@/types/ventrata";
import { VentrataTourGroup } from "@/types/ventrata";
import { AssignGuideButton } from "./AssignGuideButton";
import { useState, useEffect } from "react";

interface GuideAssignmentDisplayProps {
  guideName: string;
  guideInfo: GuideInfo | null;
  guideId: string;
  isPrimary: boolean;
  tourGroups: VentrataTourGroup[];
  getGuideTypeBadgeColor: (guideType?: string) => string;
  tourId: string;
  availableGuides: Array<{
    id: string;
    name: string;
    info: any;
  }>;
}

export const GuideAssignmentDisplay = ({
  guideName,
  guideInfo,
  guideId,
  isPrimary,
  tourGroups,
  getGuideTypeBadgeColor,
  tourId,
  availableGuides
}: GuideAssignmentDisplayProps) => {
  // Track the most current guideName and guideId to prevent UI flickering during updates
  const [currentGuideName, setCurrentGuideName] = useState(guideName);
  const [currentGuideId, setCurrentGuideId] = useState(guideId);
  
  // When parent props change, update our local state to reflect them
  useEffect(() => {
    if (guideName !== currentGuideName) {
      setCurrentGuideName(guideName);
    }
    if (guideId !== currentGuideId) {
      setCurrentGuideId(guideId);
    }
  }, [guideName, guideId]);
  
  // Find corresponding group index for this guide
  const groupIndex = tourGroups.findIndex(group => 
    group.guideId === currentGuideId || (currentGuideName && group.guideId === currentGuideName)
  );
  
  const displayRole = isPrimary 
    ? "Primary Guide" 
    : (currentGuideId === "guide2" ? "Secondary Guide" : "Assistant Guide");

  // Determine the assigned group display text
  const getGroupAssignmentText = () => {
    if (groupIndex === -1) return null;
    return `Group ${groupIndex + 1} (${currentGuideName || "Unassigned"})`;
  };

  const groupAssignmentText = getGroupAssignmentText();

  return (
    <div className="flex items-start space-x-4">
      <div className="bg-primary/10 p-3 rounded-full">
        <Users className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            {groupAssignmentText && (
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {groupAssignmentText}
              </div>
            )}
            <h3 className="font-medium">{currentGuideName || "Unassigned"}</h3>
            <p className="text-sm text-muted-foreground">{displayRole}</p>
          </div>
          
          <AssignGuideButton
            tourId={tourId}
            guideId={currentGuideId}
            guideName={currentGuideName}
            groupIndex={groupIndex >= 0 ? groupIndex : 0}
            guides={availableGuides}
            displayName={displayRole}
          />
        </div>
        
        {guideInfo && (
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center text-sm">
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>{format(guideInfo.birthday, 'MMMM d, yyyy')}</span>
            </div>
            <Badge variant="outline" className={getGuideTypeBadgeColor(guideInfo.guideType)}>
              <IdCard className="h-3.5 w-3.5 mr-1.5" />
              {guideInfo.guideType}
            </Badge>
          </div>
        )}
        
        {/* Show which group this guide is assigned to */}
        {tourGroups.map((group, index) => {
          if (group.guideId === currentGuideId || (currentGuideName && group.guideId === currentGuideName)) {
            return (
              <Badge key={index} className="mt-2 bg-green-100 text-green-800 border-green-300">
                Assigned to Group {index + 1}
              </Badge>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};
