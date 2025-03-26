
import { VentrataTourGroup } from "@/types/ventrata";
import { Button } from "@/components/ui/button";
import { GuideNameAndInfo } from "./types";

interface GroupsListProps {
  tourGroups: VentrataTourGroup[];
  getGuideNameAndInfo: (guideId?: string) => { name: string; info: any };
  onAssignGuide: (groupIndex: number) => void;
}

export const GroupsList = ({ 
  tourGroups, 
  getGuideNameAndInfo, 
  onAssignGuide 
}: GroupsListProps) => {
  if (!tourGroups || tourGroups.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No tour groups available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tourGroups.map((group, index) => {
        const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);
        
        // Hide unknown guides
        if (guideName && guideName.startsWith('Unknown')) {
          return null;
        }
        
        // Create group display name with guide in parentheses if assigned, including guide type
        const displayName = guideName && guideName !== "Unassigned" 
          ? `Group ${index + 1} (${guideName}${guideInfo?.guideType ? ` - ${guideInfo.guideType}` : ''})`
          : `Group ${index + 1}`;
          
        return (
          <div 
            key={group.id || index}
            className="border rounded-lg overflow-hidden"
          >
            <div className="bg-muted/30 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{displayName}</h3>
              </div>
              <div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAssignGuide(index)}
                >
                  {guideName && guideName !== "Unassigned" ? "Change Guide" : "Assign Guide"}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
