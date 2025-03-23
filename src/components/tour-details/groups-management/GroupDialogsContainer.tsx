
import { GroupDialogs } from "./GroupDialogs";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useDialogsState } from "./hooks/useDialogsState";

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
  // Get dialog states and handlers
  const dialogsState = useDialogsState(tour.id, selectedGroupIndex, setSelectedGroupIndex);
  
  // Return an object with all the dialog states, handlers, and the rendered component
  return {
    // Dialog open states
    isAddGroupOpen: dialogsState.isAddGroupOpen,
    isEditGroupOpen: dialogsState.isEditGroupOpen,
    isAssignGuideOpen: dialogsState.isAssignGuideOpen,
    isDeleteDialogOpen: dialogsState.isDeleteDialogOpen,
    
    // Dialog open handlers
    openAddGroupDialog: dialogsState.openAddGroupDialog,
    openEditGroupDialog: dialogsState.openEditGroupDialog,
    openAssignGuideDialog: dialogsState.openAssignGuideDialog,
    openDeleteDialog: dialogsState.openDeleteDialog,
    
    // Dialog control
    setIsAddGroupOpen: dialogsState.setIsAddGroupOpen,
    setIsEditGroupOpen: dialogsState.setIsEditGroupOpen,
    setIsAssignGuideOpen: dialogsState.setIsAssignGuideOpen,
    setIsDeleteDialogOpen: dialogsState.setIsDeleteDialogOpen,
    
    // Delete handler
    handleDeleteGroup: dialogsState.handleDeleteGroup,
    isDeleting: dialogsState.isDeleting,
    
    // Render all dialogs
    dialogsComponent: (
      <GroupDialogs
        tourId={tour.id}
        tour={tour}
        selectedGroupIndex={selectedGroupIndex}
        isAddGroupOpen={dialogsState.isAddGroupOpen}
        setIsAddGroupOpen={dialogsState.setIsAddGroupOpen}
        isEditGroupOpen={dialogsState.isEditGroupOpen}
        setIsEditGroupOpen={dialogsState.setIsEditGroupOpen}
        isAssignGuideOpen={dialogsState.isAssignGuideOpen}
        setIsAssignGuideOpen={dialogsState.setIsAssignGuideOpen}
        isDeleteDialogOpen={dialogsState.isDeleteDialogOpen}
        setIsDeleteDialogOpen={dialogsState.setIsDeleteDialogOpen}
        guide1Info={guide1Info}
        guide2Info={guide2Info}
        guide3Info={guide3Info}
        handleDeleteGroup={dialogsState.handleDeleteGroup}
        isDeleting={dialogsState.isDeleting}
      />
    )
  };
};
