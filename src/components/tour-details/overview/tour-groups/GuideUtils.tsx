
import { 
  Check, 
  Users, 
  Ticket, 
  User, 
  UserMinus 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GuideInfo, Guide } from "@/types/ventrata";

interface GuideSelectionListProps {
  guides: any[];
  currentGuideId: string | null;
  onSelect: (guideId: string) => void;
}

export const GuideSelectionList = ({ 
  guides, 
  currentGuideId, 
  onSelect 
}: GuideSelectionListProps) => {
  if (!guides || guides.length === 0) {
    return <div className="text-center py-4">No guides available</div>;
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-2">
        {guides.map((guide) => {
          const isSelected = currentGuideId === guide.id;
          const guideType = 'guideType' in guide 
            ? guide.guideType 
            : (guide.guide_type || 'Unknown');
          
          return (
            <div
              key={guide.id}
              className={`p-3 border rounded-md flex items-center justify-between cursor-pointer transition-colors ${
                isSelected ? "bg-primary/10 border-primary/30" : "hover:bg-muted"
              }`}
              onClick={() => onSelect(guide.id)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{guide.name}</div>
                  <div className="text-xs text-muted-foreground">{guideType}</div>
                </div>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary" />}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export const GuideTicketBadge = ({ guideType }: { guideType: string }) => {
  if (!guideType) return null;
  
  if (guideType === "GC" || guideType.includes("skip") || guideType.includes("no ticket")) {
    return <Badge variant="outline">No Ticket Required</Badge>;
  }
  
  if (guideType.includes("Free") || guideType.includes("FREE") || guideType.includes("Child")) {
    return <Badge variant="secondary">Child Ticket Required</Badge>;
  }
  
  return <Badge variant="secondary">Adult Ticket Required</Badge>;
};
