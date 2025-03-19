
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { DeleteGroupDialog } from "./DeleteGroupDialog";
import { AddGroupDialog } from "./dialogs/AddGroupDialog";
import { EditGroupDialog } from "./dialogs/EditGroupDialog";
import { AssignGuideDialog } from "./dialogs/AssignGuideDialog";

interface GroupDialogsProps {
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

export const GroupDialogs = ({
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
}: GroupDialogsProps) => {
  // Create an array of valid guides with properly formatted IDs for use in AssignGuideForm
  const getValidGuides = () => {
    const guides = [];
    
    // Primary guides - use consistent IDs
    if (tour.guide1) {
      guides.push({ 
        id: "guide1", 
        name: tour.guide1, 
        info: guide1Info 
      });
    }
    
    if (tour.guide2) {
      guides.push({ 
        id: "guide2", 
        name: tour.guide2, 
        info: guide2Info 
      });
    }
    
    if (tour.guide3) {
      guides.push({ 
        id: "guide3", 
        name: tour.guide3, 
        info: guide3Info 
      });
    }
    
    // Filter out any guides with empty names or IDs
    return guides.filter(guide => guide.name && guide.id);
  };
  
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
          guides={getValidGuides()}
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
