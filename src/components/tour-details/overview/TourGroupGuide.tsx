
import { Badge } from "@/components/ui/badge";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { useAssignGuide } from "@/hooks/group-management/useAssignGuide";
import { useState } from "react";
import { Users, UserCheck, UserX } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { mapSpecialGuideIdToUuid, isValidUuid } from "@/services/api/utils/guidesUtils";

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
  const [isSelecting, setIsSelecting] = useState(false);
  
  // Calculate group size directly from the size property
  const totalGroupSize = group?.size || 0;
  const childCount = group?.childCount || 0;
  
  // Format participant count to show adults + children
  const formattedParticipantCount = childCount > 0 
    ? `${totalGroupSize - childCount}+${childCount}` 
    : totalGroupSize;

  // Extract group number from the name to keep consistent numbering
  let groupDisplayNumber = groupIndex + 1;
  if (group?.name) {
    const match = group.name.match(/Group (\d+)/);
    if (match && match[1]) {
      groupDisplayNumber = parseInt(match[1], 10);
    }
  }
  
  const handleAssignGuide = async (guideId: string) => {
    if (!tour?.id) {
      toast.error("Cannot assign guide: Missing tour ID");
      return;
    }
    
    setIsAssigning(true);
    setIsSelecting(false);
    
    try {
      // Map special guide IDs (like guide1) to actual UUIDs
      const actualGuideId = guideId === "_none" ? null : mapSpecialGuideIdToUuid(guideId, tour);
      
      console.log(`Assigning guide with ID ${guideId} to group ${groupIndex} (display number ${groupDisplayNumber})`, {
        originalId: guideId,
        mappedId: actualGuideId,
        isValidUuid: actualGuideId ? isValidUuid(actualGuideId) : false
      });
      
      // Check if we have a valid UUID or null (for unassign)
      if (guideId !== "_none" && actualGuideId === null) {
        toast.error(`Cannot assign guide: Could not map "${guideId}" to a valid UUID`);
        setIsAssigning(false);
        return;
      }
      
      // Now pass the mapped UUID to assignGuide
      const success = await assignGuide(groupIndex, actualGuideId);
      
      if (!success) {
        toast.error("Failed to assign guide");
      }
    } catch (error) {
      console.error("Error assigning guide:", error);
      toast.error("Failed to assign guide: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsAssigning(false);
    }
  };

  // Check if guide is assigned
  const isGuideAssigned = !!guideName && guideName !== "Unassigned";

  return (
    <div className={`p-4 rounded-lg border ${isGuideAssigned ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-base">Group {groupDisplayNumber}</h3>
        <Badge variant="outline" className="bg-blue-50">
          {formattedParticipantCount} {totalGroupSize === 1 ? 'person' : 'people'}
        </Badge>
      </div>
      
      <div className="flex items-center space-x-3 mt-2">
        <div className={`p-1.5 rounded-full ${isGuideAssigned ? 'bg-green-100' : 'bg-amber-100'}`}>
          {isGuideAssigned ? 
            <UserCheck className="h-4 w-4 text-green-600" /> : 
            <UserX className="h-4 w-4 text-amber-600" />
          }
        </div>
        
        <div className="flex-1">
          <div className="font-medium">
            {isGuideAssigned ? (
              <span>{guideName}</span>
            ) : (
              <span className="text-amber-600">Unassigned</span>
            )}
            {guideInfo?.guideType && (
              <Badge variant="outline" className="ml-2 text-xs bg-blue-100 text-blue-800">
                {guideInfo.guideType}
              </Badge>
            )}
          </div>
        </div>
        
        {isSelecting ? (
          <div className="w-40">
            <Select onValueChange={handleAssignGuide} defaultValue={group.guideId || "_none"}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select guide" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Unassign</SelectItem>
                {guideOptions.map((guide) => (
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
            onClick={() => setIsSelecting(true)}
            disabled={isAssigning}
          >
            {isAssigning ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                Assigning...
              </>
            ) : isGuideAssigned ? (
              "Change Guide"
            ) : (
              "Assign Guide"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
