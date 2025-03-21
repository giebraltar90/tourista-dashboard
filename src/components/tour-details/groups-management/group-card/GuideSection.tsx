
import { Button } from "@/components/ui/button";

interface GuideSectionProps {
  guideName?: string;
  onGuideClick: () => void;
}

export const GuideSection = ({ guideName, onGuideClick }: GuideSectionProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center text-sm">
        <span className="text-muted-foreground mr-1">Guide:</span>
        <span className="font-medium">{guideName || "None"}</span>
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={onGuideClick}
      >
        {guideName ? "Change Guide" : "Assign Guide"}
      </Button>
    </div>
  );
};
