
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GuideOption } from "@/hooks/group-management/types";

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
  const [localSelectedGuide, setLocalSelectedGuide] = useState(selectedGuide);
  const [isSelectInteracted, setIsSelectInteracted] = useState(false);
  const [isInternalAssigning, setIsInternalAssigning] = useState(false);

  // Update local state when props change
  useEffect(() => {
    if (selectedGuide !== localSelectedGuide && !isInternalAssigning) {
      setLocalSelectedGuide(selectedGuide);
    }
  }, [selectedGuide, localSelectedGuide, isInternalAssigning]);

  const handleAssignGuide = async (guideId: string) => {
    // If selecting the same guide, just close the popover
    if (guideId === selectedGuide) {
      setIsOpen(false);
      return;
    }
    
    try {
      console.log(`Selecting guide ${guideId} for ${displayName}`);
      
      // Set internal state to prevent conflicts during assignment
      setIsInternalAssigning(true);
      
      // Update local state first for immediate UI feedback
      setLocalSelectedGuide(guideId);
      setIsSelectInteracted(true);
      
      // Only close the popover if a real selection was made
      if (guideId !== localSelectedGuide) {
        setIsOpen(false);
        
        // Call the parent handler to actually assign the guide
        await onAssignGuide(guideId);
      }
    } catch (error) {
      console.error("Error in GuideSelectionPopover:", error);
      // Revert local state if there was an error
      setLocalSelectedGuide(selectedGuide);
    } finally {
      // Reset the internal assigning state
      setIsInternalAssigning(false);
    }
  };

  // Handle close without selection
  const handleOpenChange = (open: boolean) => {
    // Prevent opening if already assigning
    if (open && (isAssigning || isInternalAssigning)) {
      return;
    }
    
    // If closing without making a selection, reset state
    if (!open && !isSelectInteracted) {
      setLocalSelectedGuide(selectedGuide);
    }
    
    // Reset the interaction flag when closing
    if (!open) {
      setIsSelectInteracted(false);
    }
    
    setIsOpen(open);
  };

  // Process guide options to ensure all have readable names
  const processedOptions = guideOptions.map(guide => {
    if (!guide.name || guide.name.includes('...')) {
      return {
        ...guide,
        name: guide.info?.name || `Guide (ID: ${guide.id.substring(0, 8)})`
      };
    }
    return guide;
  });

  // Make sure guideOptions is properly filtered to only include valid options
  const validOptions = Array.isArray(processedOptions) 
    ? processedOptions
        .filter(guide => guide && guide.id && guide.name)
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" disabled={isAssigning || isInternalAssigning}>
          {isAssigning || isInternalAssigning ? (
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
      <PopoverContent className="w-60 p-3">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Assign Guide to {displayName}</h4>
          <Select 
            onValueChange={(value) => handleAssignGuide(value)}
            value={localSelectedGuide}
            disabled={isAssigning || isInternalAssigning}
            onOpenChange={() => setIsSelectInteracted(true)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select guide" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">None (Unassigned)</SelectItem>
              {validOptions.map((guide) => (
                <SelectItem key={guide.id} value={guide.id}>
                  <div className="flex items-center gap-2">
                    <span>{guide.name}</span>
                    {guide.info?.guideType && (
                      <Badge variant="outline" className="text-xs">
                        {guide.info.guideType}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
};
