
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface GuideOption {
  id: string;
  name: string;
  info: any | null;
}

interface GuideSelectionPopoverProps {
  isGuideAssigned: boolean;
  isAssigning: boolean;
  selectedGuide: string;
  guideOptions: GuideOption[];
  onAssignGuide: (guideId: string) => Promise<void>;
  displayName: string;
}

export const GuideSelectionPopover = ({
  isGuideAssigned,
  isAssigning,
  selectedGuide,
  guideOptions,
  onAssignGuide,
  displayName
}: GuideSelectionPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAssignGuide = async (guideId: string) => {
    if (guideId === selectedGuide) {
      setIsOpen(false);
      return;
    }
    
    try {
      await onAssignGuide(guideId);
      setIsOpen(false);
    } catch (error) {
      console.error("Error in GuideSelectionPopover:", error);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" disabled={isAssigning}>
          {isGuideAssigned ? "Change Guide" : "Assign Guide"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Assign Guide to {displayName}</h4>
          <Select 
            onValueChange={(value) => handleAssignGuide(value)}
            value={selectedGuide}
            disabled={isAssigning}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select guide" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">None (Unassigned)</SelectItem>
              {guideOptions.filter(guide => guide.name).map((guide) => (
                <SelectItem key={guide.id} value={guide.id}>
                  {guide.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
};
