
import { useState } from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useDeleteGroup } from "@/hooks/group-management";
import { GroupListItem } from "./GroupListItem";
import { GroupDialogs } from "./GroupDialogs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

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
  
  // Helper to get guide name for display
  const getGuideNameAndInfo = (guideId?: string) => {
    if (!guideId) return { name: "Unassigned", info: null };
    
    if ((guideId === "guide1" || guideId === guide1Info?.id) && guide1Info) {
      return { name: tour.guide1, info: guide1Info };
    } else if ((guideId === "guide2" || guideId === guide2Info?.id) && guide2Info) {
      return { name: tour.guide2 || "", info: guide2Info };
    } else if ((guideId === "guide3" || guideId === guide3Info?.id) && guide3Info) {
      return { name: tour.guide3 || "", info: guide3Info };
    }
    
    return { name: "Unassigned", info: null };
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Groups ({tour.tourGroups.length})</h3>
        <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <PlusCircle className="h-4 w-4 mr-1" /> Add Group
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {tour.tourGroups.map((group, index) => {
          const { name: guideName, info: guideInfo } = getGuideNameAndInfo(group.guideId);
          
          return (
            <GroupListItem
              key={index}
              group={group}
              index={index}
              guideName={guideName}
              guideInfo={guideInfo}
              onAction={handleGroupAction}
            />
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
