
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
      // Close the popover while assigning to prevent multiple selections
      setIsOpen(false);
      await onAssignGuide(guideId);
    } catch (error) {
      console.error("Error in GuideSelectionPopover:", error);
    }
  };

  // Make sure guideOptions is properly filtered to only include valid options
  const validOptions = Array.isArray(guideOptions) 
    ? guideOptions
        .filter(guide => guide && guide.id && guide.name)
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" disabled={isAssigning}>
          {isAssigning ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Assigning...
            </>
          ) : isGuideAssigned ? (
            "Change Guide"
          ) : (
            "Assign Guide"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Assign Guide to {displayName}</h4>
          <Select 
            onValueChange={(value) => handleAssignGuide(value)}
            value={selectedGuide || "_none"}
            disabled={isAssigning}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select guide" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">None (Unassigned)</SelectItem>
              {validOptions.map((guide) => (
                <SelectItem key={guide.id} value={guide.id}>
                  {guide.name || guide.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
};
