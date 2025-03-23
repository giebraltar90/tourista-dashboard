
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { updateGroupGuide } from "@/services/api/tour/groupGuideService";
import { toast } from "sonner";
import { VentrataTourGroup } from "@/types/ventrata";
import { GuideInfo } from "@/types/ventrata";
import { EventEmitter } from "@/utils/eventEmitter";

interface GroupGuideManagementProps {
  isOpen: boolean;
  onClose: () => void;
  tourId: string;
  group: VentrataTourGroup;
  groupIndex: number;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  guide1: string;
  guide2?: string;
  guide3?: string;
  onGroupsUpdated: () => void;
}

export const GroupGuideManagement = ({
  isOpen,
  onClose,
  tourId,
  group,
  groupIndex,
  guide1Info,
  guide2Info,
  guide3Info,
  guide1,
  guide2,
  guide3,
  onGroupsUpdated
}: GroupGuideManagementProps) => {
  // Get current guide ID from the group, or undefined if no guide is assigned
  const currentGuideId = group.guideId;
  
  // State to track selected guide
  const [selectedGuideId, setSelectedGuideId] = useState<string | undefined>(currentGuideId);
  
  // Handle saving the guide assignment
  const handleSaveGuide = async () => {
    try {
      // Call API to update the guide for this group
      const success = await updateGroupGuide(tourId, group.id, selectedGuideId);
      
      if (success) {
        toast.success(`Guide ${selectedGuideId ? 'assigned' : 'removed'} successfully`);
        
        // Notify that guides have changed
        EventEmitter.emit(`guide-change:${tourId}`);
        
        // Call the callback to update the parent component
        onGroupsUpdated();
        
        // Close the dialog
        onClose();
      } else {
        toast.error("Failed to update guide assignment");
      }
    } catch (error) {
      console.error("Error updating guide:", error);
      toast.error("Error assigning guide");
    }
  };
  
  // Function to get guide display name with type
  const getGuideDisplay = (guideId: string, guideInfo: GuideInfo | null) => {
    if (!guideInfo) return guideId;
    return `${guideInfo.name} (${guideInfo.guideType})`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Guide to Group</DialogTitle>
          <DialogDescription>
            Select a guide to assign to {group.name || `Group ${groupIndex + 1}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup 
            value={selectedGuideId || "none"} 
            onValueChange={(value) => setSelectedGuideId(value === "none" ? undefined : value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="font-normal">No Guide</Label>
            </div>
            
            {guide1 && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={guide1} id="guide1" />
                <Label htmlFor="guide1" className="font-normal">
                  {getGuideDisplay(guide1, guide1Info)}
                </Label>
              </div>
            )}
            
            {guide2 && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={guide2} id="guide2" />
                <Label htmlFor="guide2" className="font-normal">
                  {getGuideDisplay(guide2, guide2Info)}
                </Label>
              </div>
            )}
            
            {guide3 && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={guide3} id="guide3" />
                <Label htmlFor="guide3" className="font-normal">
                  {getGuideDisplay(guide3, guide3Info)}
                </Label>
              </div>
            )}
          </RadioGroup>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSaveGuide}>
            <Check className="mr-2 h-4 w-4" /> Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
