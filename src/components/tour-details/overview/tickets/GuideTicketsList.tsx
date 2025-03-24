
import { Badge } from "@/components/ui/badge";
import { logger } from "@/utils/logger";
import { GuideWithTicket } from "./GuideTicketsSection";

interface GuideTicketsListProps {
  guides: GuideWithTicket[];
}

export const GuideTicketsList = ({ guides }: GuideTicketsListProps) => {
  // Log the guides being received for debugging
  logger.debug("🎫 [GuideTicketsList] Rendering with guides:", guides.map(g => ({
    name: g.guideName,
    type: g.guideType,
    ticket: g.ticketType
  })));

  if (guides.length === 0) {
    return (
      <div className="mt-2 space-y-1 bg-muted/20 p-2 rounded-sm text-xs">
        <h4 className="font-medium">Guide ticket details:</h4>
        <div className="flex justify-between items-center italic text-muted-foreground">
          <span>No guides requiring tickets</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-2 space-y-1 bg-muted/20 p-2 rounded-sm text-xs">
      <h4 className="font-medium">Guide ticket details:</h4>
      
      {guides.map((guide, index) => {
        // Ensure we have a valid guide name (fixes "unknown" values)
        const displayName = guide.guideName && guide.guideName !== "Unknown guide1" && 
                            guide.guideName !== "Unknown guide2" && guide.guideName !== "Unknown guide3" 
                            ? guide.guideName 
                            : guide.guideInfo?.name || "Unnamed Guide";
                            
        return (
          <div key={index} className="flex justify-between items-center">
            <span className="font-medium">{displayName}</span>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-[10px]">{guide.guideType}</span>
              {guide.ticketType ? (
                <Badge variant={guide.ticketType === 'child' ? 'outline' : 'secondary'} className="text-xs">
                  {guide.ticketType === 'adult' ? 'Adult Ticket' : 'Child Ticket'}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">No Ticket</Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
