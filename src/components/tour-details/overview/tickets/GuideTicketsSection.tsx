
import { cn } from "@/lib/utils";
import { logger } from "@/utils/logger";
import { GuideTicketsList } from "./GuideTicketsList";

interface GuideWithTicket {
  guideName: string;
  guideType: string;
  ticketType: "adult" | "child" | null;
}

interface GuideTicketsSectionProps {
  guides: GuideWithTicket[];
  adultTickets: number;
  childTickets: number;
}

export const GuideTicketsSection = ({
  guides,
  adultTickets,
  childTickets
}: GuideTicketsSectionProps) => {
  // Always ensure we have a valid guides array
  const validGuides = Array.isArray(guides) ? guides : [];
  
  // Log guide tickets for debugging
  logger.debug(`🎟️ [GuideTicketsSection] Rendering with:`, {
    adultTickets,
    childTickets,
    guidesWithTicketsCount: validGuides.length,
    guidesDetail: validGuides.map(g => ({
      name: g.guideName,
      type: g.guideType,
      ticketType: g.ticketType
    }))
  });
  
  // Always display the section, even if there are no guide tickets
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">
        Guide Tickets
      </div>
      
      {/* Display guide adult tickets - always show this row */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Guide adult tickets:</span>
        <span className="font-medium">{adultTickets}</span>
      </div>
      
      {/* Display guide child tickets - always show this row */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Guide child tickets:</span>
        <span className="font-medium">{childTickets}</span>
      </div>
      
      {/* Show total if there are any guide tickets */}
      {(adultTickets > 0 || childTickets > 0) && (
        <div className="flex justify-between text-sm mt-1 pt-1 border-t border-border">
          <span className="text-muted-foreground">Total guide tickets:</span>
          <span className="font-medium">{adultTickets + childTickets}</span>
        </div>
      )}
      
      {/* Always show GuideTicketsList, which handles empty case internally */}
      <GuideTicketsList guides={validGuides} />
    </div>
  );
};
