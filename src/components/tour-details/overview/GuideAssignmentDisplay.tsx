
import { Badge } from "@/components/ui/badge";
import { IdCard, Users } from "lucide-react";
import { GuideInfo } from "@/types/ventrata";
import { VentrataTourGroup } from "@/types/ventrata";
import { Button } from "@/components/ui/button";
import { useAssignGuide } from "@/hooks/group-management/useAssignGuide";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useState } from "react";

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
  const [isChanging, setIsChanging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { assignGuide } = useAssignGuide(tourId);
  
  // Find corresponding group index for this guide
  const groupIndex = tourGroups.findIndex(group => group.guideId === guideId);
  const groupId = groupIndex !== -1 && tourGroups[groupIndex] ? tourGroups[groupIndex].id : "";
  
  const displayRole = isPrimary 
    ? "Primary Guide" 
    : (guideId === "guide2" ? "Secondary Guide" : "Assistant Guide");

  // Determine the assigned group display text
  const groupDisplayText = groupIndex !== -1 ? `Group ${groupIndex + 1}` : "Not assigned to a group";

  const handleGuideChange = async (newGuideId: string) => {
    setIsLoading(true);
    try {
      // Ensure we're passing a numeric value for the group index
      if (groupIndex !== -1) {
        await assignGuide(groupIndex, newGuideId);
      } else if (groupId) {
        // If we have a group ID but not an index, try to find the index
        const foundIndex = tourGroups.findIndex(g => g.id === groupId);
        if (foundIndex !== -1) {
          await assignGuide(foundIndex, newGuideId);
        } else {
          console.error("Could not find group index for ID:", groupId);
        }
      }
    } finally {
      setIsLoading(false);
      setIsChanging(false);
    }
  };

  return (
    <div className="flex items-start space-x-4">
      <div className="bg-primary/10 p-3 rounded-full">
        <Users className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-1">
              {displayRole}
            </div>
            <h3 className="font-medium">{guideName || "Unassigned"}</h3>
          </div>
          
          {isChanging ? (
            <div className="w-40">
              <Select 
                onValueChange={handleGuideChange}
                defaultValue={guideId}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select guide" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Unassign</SelectItem>
                  {availableGuides.map((guide) => (
                    <SelectItem key={guide.id} value={guide.id}>
                      {guide.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsChanging(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Assigning...
                </>
              ) : (
                "Change Guide"
              )}
            </Button>
          )}
        </div>
        
        {guideInfo && (
          <div className="mt-2 space-y-1.5">
            <Badge variant="outline" className={getGuideTypeBadgeColor(guideInfo.guideType)}>
              <IdCard className="h-3.5 w-3.5 mr-1.5" />
              {guideInfo.guideType}
            </Badge>
          </div>
        )}
        
        {groupIndex !== -1 && (
          <Badge key={groupIndex} className="mt-2 bg-green-100 text-green-800 border-green-300">
            Assigned to Group {groupIndex + 1}
          </Badge>
        )}
      </div>
    </div>
  );
};
