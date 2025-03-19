
import { useState } from "react";
import { GroupDialogs } from "../GroupDialogs";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useDeleteGroup } from "@/hooks/group-management";

interface GroupDialogsContainerProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  selectedGroupIndex: number | null;
  setSelectedGroupIndex: (index: number | null) => void;
}

export const GroupDialogsContainer = ({
  tour,
  guide1Info,
  guide2Info,
  guide3Info,
  selectedGroupIndex,
  setSelectedGroupIndex
}: GroupDialogsContainerProps) => {
  // Dialog states
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isAssignGuideOpen, setIsAssignGuideOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Hooks for group operations
  const { deleteGroup, isDeleting } = useDeleteGroup(tour.id);
  
  // Handlers for opening dialogs
  const openAddGroupDialog = () => {
    setIsAddGroupOpen(true);
  };
  
  const openEditGroupDialog = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsEditGroupOpen(true);
  };
  
  const openAssignGuideDialog = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setIsAssignGuideOpen(true);
  };
  
  const openDeleteDialog = () => {
    if (selectedGroupIndex !== null) {
      setIsDeleteDialogOpen(true);
    }
  };
  
  // Handle group deletion
  const handleDeleteGroup = async () => {
    if (selectedGroupIndex !== null) {
      await deleteGroup(selectedGroupIndex);
      setIsDeleteDialogOpen(false);
      setSelectedGroupIndex(null);
    }
  };

  return {
    // Dialog open states
    isAddGroupOpen,
    isEditGroupOpen,
    isAssignGuideOpen,
    isDeleteDialogOpen,
    
    // Dialog open handlers
    openAddGroupDialog,
    openEditGroupDialog,
    openAssignGuideDialog,
    openDeleteDialog,
    
    // Dialog control
    setIsAddGroupOpen,
    setIsEditGroupOpen,
    setIsAssignGuideOpen,
    setIsDeleteDialogOpen,
    
    // Delete handler
    handleDeleteGroup,
    isDeleting,
    
    // Render all dialogs
    dialogsComponent: (
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
    )
  };
};
