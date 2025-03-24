
import { Fragment, ReactNode } from "react";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { AddGroupDialog } from "../dialogs/AddGroupDialog";
import { EditGroupDialog } from "../dialogs/EditGroupDialog";
import { AssignGuideDialog } from "../dialogs/AssignGuideDialog";
import { DeleteGroupDialog } from "../DeleteGroupDialog";
import { useDialogUtils } from "../hooks/useDialogUtils";
import { useGuides } from "@/hooks/useGuides";

interface GroupDialogsContainerProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  selectedGroupIndex: number | null;
  setSelectedGroupIndex: (index: number | null) => void;
  onGuideAssigned?: () => void;
}

export const GroupDialogsContainer = ({
  tour,
  guide1Info,
  guide2Info,
  guide3Info,
  selectedGroupIndex,
  setSelectedGroupIndex,
  onGuideAssigned
}: GroupDialogsContainerProps) => {
  const { data: guidesData = [] } = useGuides();
  
  // Transform the guides data for compatibility
  const guides = guidesData.map(guide => ({
    id: guide.id,
    name: guide.name,
    info: {
      name: guide.name,
      birthday: guide.birthday ? new Date(guide.birthday) : new Date(),
      guideType: guide.guide_type
    } as GuideInfo
  }));
  
  // Use the dialog utilities
  const {
    isDialogOpen,
    dialogType,
    openAssignGuideDialog,
    openAddGroupDialog,
    openEditGroupDialog,
    openDeleteGroupDialog,
    closeDialog
  } = useDialogUtils(
    tour,
    guide1Info,
    guide2Info,
    guide3Info,
    selectedGroupIndex,
    setSelectedGroupIndex
  );
  
  // Render all dialogs based on dialogType
  let dialogComponent: ReactNode = null;
  
  if (isDialogOpen && selectedGroupIndex !== null) {
    const currentGroup = tour.tourGroups?.[selectedGroupIndex];
    const currentGuideId = currentGroup?.guideId;
    
    if (dialogType === 'assignGuide' && currentGroup) {
      dialogComponent = (
        <AssignGuideDialog
          isOpen={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeDialog();
            // Don't call onSuccess here as it doesn't exist on the component
          }}
          tourId={tour.id}
          groupIndex={selectedGroupIndex}
          guides={guides}
          currentGuideId={currentGuideId}
        />
      );
    } else if (dialogType === 'editGroup' && currentGroup) {
      dialogComponent = (
        <EditGroupDialog
          isOpen={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
          tourId={tour.id}
          group={currentGroup}
          groupIndex={selectedGroupIndex}
        />
      );
    } else if (dialogType === 'deleteGroup') {
      dialogComponent = (
        <DeleteGroupDialog
          isOpen={isDialogOpen}
          setIsOpen={(open) => {
            if (!open) closeDialog();
          }}
          isDeleting={false}
          onConfirmDelete={async () => {
            closeDialog();
          }}
        />
      );
    }
  } else if (isDialogOpen && dialogType === 'addGroup') {
    dialogComponent = (
      <AddGroupDialog
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        tourId={tour.id}
      />
    );
  }
  
  return {
    openAssignGuideDialog,
    openAddGroupDialog,
    openEditGroupDialog,
    openDeleteGroupDialog,
    closeDialog,
    dialogsComponent: dialogComponent ? <Fragment>{dialogComponent}</Fragment> : null
  };
};
