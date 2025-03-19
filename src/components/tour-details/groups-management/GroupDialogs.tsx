
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { AddGroupForm } from "./AddGroupForm";
import { EditGroupForm } from "./EditGroupForm";
import { AssignGuideForm } from "./AssignGuideForm";
import { DeleteGroupDialog } from "./DeleteGroupDialog";

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
  // Create an array of valid guides with proper ids
  const getValidGuides = () => {
    const guides = [];
    
    // Only add guides with valid data
    if (tour.guide1) {
      guides.push({ 
        id: guide1Info?.id || "guide1", 
        name: tour.guide1, 
        info: guide1Info 
      });
    }
    
    if (tour.guide2) {
      guides.push({ 
        id: guide2Info?.id || "guide2", 
        name: tour.guide2, 
        info: guide2Info 
      });
    }
    
    if (tour.guide3) {
      guides.push({ 
        id: guide3Info?.id || "guide3", 
        name: tour.guide3, 
        info: guide3Info 
      });
    }
    
    // Log for debugging
    console.log("Available guides:", guides);
    
    // Filter out any guides with empty names or IDs
    return guides.filter(guide => guide.name && guide.id && guide.id.trim() !== "");
  };
  
  return (
    <>
      <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Group</DialogTitle>
            <DialogDescription>
              Create a new group and assign a guide to it.
            </DialogDescription>
          </DialogHeader>
          <AddGroupForm 
            tourId={tourId} 
            onSuccess={() => setIsAddGroupOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditGroupOpen} onOpenChange={setIsEditGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Modify group details and assignment.
            </DialogDescription>
          </DialogHeader>
          {selectedGroupIndex !== null && tour.tourGroups[selectedGroupIndex] && (
            <EditGroupForm 
              tourId={tourId}
              group={tour.tourGroups[selectedGroupIndex]}
              groupIndex={selectedGroupIndex}
              onSuccess={() => setIsEditGroupOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAssignGuideOpen} onOpenChange={setIsAssignGuideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Guide</DialogTitle>
            <DialogDescription>
              Choose a guide to assign to this group.
            </DialogDescription>
          </DialogHeader>
          {selectedGroupIndex !== null && tour.tourGroups[selectedGroupIndex] && (
            <AssignGuideForm 
              tourId={tourId}
              groupIndex={selectedGroupIndex}
              guides={getValidGuides()}
              currentGuideId={tour.tourGroups[selectedGroupIndex].guideId}
              onSuccess={() => setIsAssignGuideOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <DeleteGroupDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        isDeleting={isDeleting}
        onConfirmDelete={handleDeleteGroup}
      />
    </>
  );
};
