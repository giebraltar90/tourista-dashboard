
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCheck, User, UserX } from "lucide-react";
import { GuideSelectionDialogProps } from "./types";
import { useGuideNameInfo } from "@/hooks/group-management/utils/guideInfoUtils";

export const GuideSelectionDialog = ({
  isOpen,
  onClose,
  onSelect,
  guides,
  currentGuideId,
  tour,
  guide1Info,
  guide2Info,
  guide3Info
}: GuideSelectionDialogProps) => {
  const { getGuideNameAndInfo } = useGuideNameInfo(tour, guide1Info, guide2Info, guide3Info);

  // Filter out unknown guides
  const validGuides = guides.filter(guide => 
    guide && guide.name && !guide.name.startsWith("Unknown")
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Guide</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Button
            variant="outline"
            className="w-full justify-start mb-4"
            onClick={() => onSelect(null)}
          >
            <UserX className="mr-2 h-4 w-4" />
            <span>Remove guide assignment</span>
          </Button>
          
          <div className="space-y-2">
            {validGuides.map((guide) => {
              const isSelected = currentGuideId === guide.id;
              const guideType = guide.guide_type || guide.guideType || "GA Ticket";
              
              return (
                <Button
                  key={guide.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full justify-start ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => onSelect(guide.id)}
                >
                  {isSelected ? (
                    <UserCheck className="mr-2 h-4 w-4" />
                  ) : (
                    <User className="mr-2 h-4 w-4" />
                  )}
                  <span>{guide.name}</span>
                  <span className="ml-auto text-xs opacity-70">
                    {guideType}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
