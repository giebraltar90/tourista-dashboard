
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, UserPlus, Trash2, Users } from "lucide-react";
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";

interface GroupListItemProps {
  group: VentrataTourGroup;
  index: number;
  guideName: string;
  guideInfo: GuideInfo | null;
  onAction: (index: number, action: 'edit' | 'assignGuide' | 'delete') => void;
}

export const GroupListItem = ({ 
  group, 
  index, 
  guideName, 
  guideInfo, 
  onAction 
}: GroupListItemProps) => {
  // Calculate the actual participant count from the participants array
  const participantCount = group.participants?.length || 0;
  const totalPeople = group.size || 0;
  
  return (
    <div className="p-4 border rounded-md">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h4 className="font-medium">{group.name}</h4>
            <Badge className="ml-2">{totalPeople} participants</Badge>
            {group.childCount && group.childCount > 0 && (
              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
                {group.childCount} {group.childCount === 1 ? 'child' : 'children'}
              </Badge>
            )}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            Entry time: {group.entryTime}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onAction(index, 'edit')}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onAction(index, 'assignGuide')}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="text-red-500 hover:bg-red-50"
            onClick={() => onAction(index, 'delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-3 flex items-center">
        <Users className="h-4 w-4 mr-1.5 text-muted-foreground" />
        <span className="text-sm font-medium">Guide:</span>
        {guideName && guideName !== "Unassigned" ? (
          <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
            {guideName} {guideInfo?.guideType ? `(${guideInfo.guideType})` : ""}
          </Badge>
        ) : (
          <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">
            Unassigned
          </Badge>
        )}
      </div>
      
      <div className="mt-3">
        <span className="text-sm font-medium">Participants: {participantCount}</span>
      </div>
    </div>
  );
};
