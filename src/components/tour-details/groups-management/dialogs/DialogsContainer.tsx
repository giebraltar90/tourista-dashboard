
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { AddGroupDialog } from "./AddGroupDialog";
import { EditGroupDialog } from "./EditGroupDialog";
import { AssignGuideDialog } from "./AssignGuideDialog";
import { DeleteGroupDialog } from "../DeleteGroupDialog";
import { useProcessGuides } from "@/hooks/group-management/useProcessGuides";
import { useGuideData } from "@/hooks/guides/useGuideData";

interface GroupDialogsContainerProps {
  tourId: string;
  tour: any;
  selectedGroupIndex: number | null;
  isAddGroupOpen: boolean;
  setIsAddGroupOpen: (open: boolean) => void;
  isEditGroupOpen: boolean;
  setIsEditGroupOpen: (open: boolean) => void;
  isAssignGuideOpen: boolean;
  setIsAssignGuideOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  handleDeleteGroup: () => Promise<void>;
  isDeleting: boolean;
}

export const GroupDialogsContainer = ({
  tourId,
  tour,
  selectedGroupIndex,
  isAddGroupOpen,
  setIsAddGroupOpen,
  isEditGroupOpen,
  setIsEditGroupOpen,
  isAssignGuideOpen,
  setIsAssignGuideOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  guide1Info,
  guide2Info,
  guide3Info,
  handleDeleteGroup,
  isDeleting
}: GroupDialogsContainerProps) => {
  // Get all guides from the database
  const { guides: allGuides = [] } = useGuideData() || { guides: [] };
  
  // Process guides for dialog selection
  const { validGuides } = useProcessGuides(tour, allGuides, guide1Info, guide2Info, guide3Info);
  
  return (
    <>
      <AddGroupDialog
        tourId={tourId}
        isOpen={isAddGroupOpen}
        onOpenChange={setIsAddGroupOpen}
      />
      
      {selectedGroupIndex !== null && tour.tourGroups[selectedGroupIndex] && (
        <EditGroupDialog
          tourId={tourId}
          group={tour.tourGroups[selectedGroupIndex]}
          groupIndex={selectedGroupIndex}
          isOpen={isEditGroupOpen}
          onOpenChange={setIsEditGroupOpen}
        />
      )}
      
      {selectedGroupIndex !== null && tour.tourGroups[selectedGroupIndex] && (
        <AssignGuideDialog
          tourId={tourId}
          groupIndex={selectedGroupIndex}
          guides={validGuides}
          currentGuideId={tour.tourGroups[selectedGroupIndex].guideId || "_none"}
          isOpen={isAssignGuideOpen}
          onOpenChange={setIsAssignGuideOpen}
        />
      )}
      
      <DeleteGroupDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        isDeleting={isDeleting}
        onConfirmDelete={handleDeleteGroup}
      />
    </>
  );
};
