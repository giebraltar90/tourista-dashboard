
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GuideSelectionList } from "./GuideUtils";
import { User, UserMinus } from "lucide-react";
import { GuideInfo } from "@/types/ventrata";
import { useProcessGuides } from "@/hooks/group-management/useProcessGuides";

interface GuideSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (guideId: string | null) => void;
  guides: any[];
  currentGuideId: string | null;
  tour: any;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
}

export const GuideSelectionDialog = ({
  isOpen,
  onClose,
  onSelect,
  guides,
  currentGuideId,
  tour,
  guide1Info,
  guide2Info,
  guide3Info,
}: GuideSelectionDialogProps) => {
  // Process guides for selection
  const { validGuides } = useProcessGuides(tour, guides, guide1Info, guide2Info, guide3Info);
  
  // Handle guide selection
  const handleGuideSelected = (guideId: string) => {
    onSelect(guideId);
  };
  
  // Handle removing guide assignment
  const handleRemoveGuide = () => {
    onSelect(null);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select a guide</DialogTitle>
          <DialogDescription>
            Choose a guide to assign to this tour group
          </DialogDescription>
        </DialogHeader>
        
        <GuideSelectionList
          guides={validGuides}
          currentGuideId={currentGuideId}
          onSelect={handleGuideSelected}
        />
        
        <DialogFooter className="gap-2 sm:gap-0">
          {currentGuideId && (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleRemoveGuide}
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Remove Guide
            </Button>
          )}
          <Button 
            variant="outline" 
            className="w-full sm:w-auto" 
            onClick={onClose}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
