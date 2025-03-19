
import { useState } from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useDeleteGroup } from "@/hooks/group-management";
import { GroupDialogs } from "./GroupDialogs";
import { GroupsListHeader } from "./GroupsListHeader";
import { useGuideNameInfo } from "@/hooks/group-management";
import { Button } from "@/components/ui/button";
import { UserRound, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GroupsListProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export const GroupsList = ({ tour, guide1Info, guide2Info, guide3Info }: GroupsListProps) => {
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  
  const { deleteGroup, isDeleting } = useDeleteGroup(tour.id, { redistributeParticipants: true });
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);
  
  const handleGroupAction = (index: number, action: 'edit' | 'assignGuide' | 'delete') => {
    setSelectedGroupIndex(index);
    if (action === 'edit') {
      setIsEditGroupOpen(true);
    } else if (action === 'assignGuide') {
      setIsAssignGuideOpen(true);
    } else if (action === 'delete') {
      setIsDeleteDialogOpen(true);
    }
  };
  
  const handleDeleteGroup = async () => {
    if (selectedGroupIndex === null) return;
    
    const success = await deleteGroup(selectedGroupIndex);
    if (success) {
      setIsDeleteDialogOpen(false);
      setSelectedGroupIndex(null);
    }
  };
  
  const handleAddGroupClick = () => {
    setIsAddGroupOpen(true);
  };
  
  return (
    <div className="space-y-4">
      <GroupsListHeader 
        groupCount={tour.tourGroups.length}
        onAddGroupClick={handleAddGroupClick}
      />
      
      <div className="space-y-4">
        {tour.tourGroups.map((group, index) => {
          const { name: guideName } = getGuideNameAndInfo(group.guideId);
          
          return (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-medium">{group.name}</h3>
                <Badge className="bg-blue-500 text-white hover:bg-blue-500">
                  {group.size} participants
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <UserRound className="h-3 w-3 mr-1" />
                <span>Guide: {guideName || "Unassigned"}</span>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleGroupAction(index, 'assignGuide')}
                >
                  <UserRound className="h-4 w-4" />
                  Assign Guide
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGroupAction(index, 'edit')}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGroupAction(index, 'delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      <GroupDialogs
        tourId={tour.id}
        tour={tour}
        selectedGroupIndex={selectedGroupIndex}
        isAddGroupOpen={isAddGroupOpen}
        setIsAddGroupOpen={setIsAddGroupOpen}
        isEditGroupOpen={isEditGroupOpen}
        setIsEditGroupOpen={setIsEditGroupOpen}
        isAssignGuideOpen={isAssignGuideOpen}
        setIsAssignGuideOpen={setIsAssignGuideOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
        handleDeleteGroup={handleDeleteGroup}
        isDeleting={isDeleting}
      />
    </div>
  );
};
