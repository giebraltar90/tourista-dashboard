
import { User, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuideInfo, Guide } from "@/types/ventrata";

interface GuideOptionProps {
  guide: Guide;
  isSelected: boolean;
  onSelect: () => void;
}

export const GuideOption = ({ guide, isSelected, onSelect }: GuideOptionProps) => {
  // Get the guide type from either property (for compatibility)
  const guideType = guide.guideType || guide.guide_type || "GA Ticket";
  
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className={`w-full justify-start ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
      onClick={onSelect}
    >
      {isSelected ? <UserCheck className="mr-2 h-4 w-4" /> : <User className="mr-2 h-4 w-4" />}
      <span>{guide.name}</span>
      <span className="ml-auto text-xs opacity-70">
        {guideType}
      </span>
    </Button>
  );
};

interface GuideSelectionListProps {
  guides: Guide[];
  currentGuideId: string | null;
  onSelect: (guideId: string) => void;
}

export const GuideSelectionList = ({ guides, currentGuideId, onSelect }: GuideSelectionListProps) => {
  if (!guides || guides.length === 0) {
    return (
      <div className="text-center p-4">
        No guides available
      </div>
    );
  }

  return (
    <div className="py-4 space-y-2">
      {guides.map((guide) => (
        <GuideOption
          key={guide.id}
          guide={guide}
          isSelected={currentGuideId === guide.id}
          onSelect={() => onSelect(guide.id)}
        />
      ))}
    </div>
  );
};

// Function to check if a guide is valid for selection
export const isGuideValid = (
  guide: Guide,
  currentTour: any,
  assignedGuides: string[] = []
): boolean => {
  // Skip if the guide is already assigned to this tour and not the current assignment
  if (
    assignedGuides.includes(guide.id) &&
    guide.id !== currentTour.guide1Id &&
    guide.id !== currentTour.guide2Id &&
    guide.id !== currentTour.guide3Id
  ) {
    return false;
  }
  
  return true;
};
