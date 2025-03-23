
import { Button } from "@/components/ui/button";
import { UserRound, UserPlus } from "lucide-react";
import { useState } from "react";
import { AssignGuideDialog } from "../groups-management/dialogs";
import { useGuides } from "@/hooks/useGuides";
import { GuideInfo } from "@/types/ventrata";

interface TourGroupGuideProps {
  tourId: string;
  groupIndex: number;
  guideId?: string;
  guideName?: string;
  isSmall?: boolean;
  guideInfo?: GuideInfo | null;
}

export const TourGroupGuide = ({ 
  tourId, 
  groupIndex, 
  guideId, 
  guideName,
  isSmall = false,
  guideInfo
}: TourGroupGuideProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: guides = [] } = useGuides();
  
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  
  // Determine guide type badge
  const guideTypeBadge = guideInfo?.guideType ? 
    <span className="text-xs bg-blue-100 text-blue-800 rounded px-1.5 py-0.5 ml-1">
      {guideInfo.guideType}
    </span> : null;
    
  return (
    <>
      {guideId ? (
        <Button
          variant="outline"
          size={isSmall ? "sm" : "default"}
          className="flex items-center gap-1.5 w-full justify-start"
          onClick={handleOpenDialog}
        >
          <UserRound className={`${isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} text-primary`} />
          <span className="truncate">{guideName || "Unknown Guide"}</span>
          {guideTypeBadge}
        </Button>
      ) : (
        <Button
          variant="outline"
          size={isSmall ? "sm" : "default"}
          className="flex items-center gap-1.5 w-full justify-start text-muted-foreground"
          onClick={handleOpenDialog}
        >
          <UserPlus className={`${isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} text-muted-foreground`} />
          Assign Guide
        </Button>
      )}
      
      {isDialogOpen && (
        <AssignGuideDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          tourId={tourId}
          groupIndex={groupIndex}
          guides={guides}
          currentGuideId={guideId}
        />
      )}
    </>
  );
};
