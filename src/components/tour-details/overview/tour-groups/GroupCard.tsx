
import { Button } from "@/components/ui/button";
import { VentrataTourGroup } from "@/types/ventrata";

interface GroupCardProps {
  index: number;
  group: VentrataTourGroup;
  tourId: string;
  guideName: string;
  guideInfo: any;
  handleAssignGuide: (groupIndex: number) => void;
}

export const GroupCard = ({
  index,
  group,
  tourId,
  guideName,
  guideInfo,
  handleAssignGuide
}: GroupCardProps) => {
  // Create group display name with guide in parentheses if assigned, including guide type
  const displayName = guideName && guideName !== "Unassigned" 
    ? `Group ${index + 1} (${guideName}${guideInfo?.guideType ? ` - ${guideInfo.guideType}` : ''})`
    : `Group ${index + 1}`;

  return (
    <div 
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
            onClick={() => handleAssignGuide(index)}
          >
            {guideName && guideName !== "Unassigned" ? "Change Guide" : "Assign Guide"}
          </Button>
        </div>
      </div>
    </div>
  );
};
