
import { useState } from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useDeleteGroup } from "@/hooks/group-management";
import { GroupListItem } from "./GroupListItem";
import { GroupDialogs } from "./GroupDialogs";
import { GroupsListHeader } from "./GroupsListHeader";
import { useGuideNameInfo } from "@/hooks/group-management";

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
