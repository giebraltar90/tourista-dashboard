
import { cn } from "@/lib/utils";
import { logger } from "@/utils/logger";
import { GuideTicketsList } from "./GuideTicketsList";

interface GuideWithTicket {
  guideName: string;
  guideType: string;
  ticketType: "adult" | "child" | null;
}

interface GuideTicketsSectionProps {
  locationNeedsGuideTickets: boolean;
  guideAdultTickets: number;
  guideChildTickets: number;
  guidesWithTickets: GuideWithTicket[];
}

export const GuideTicketsSection = ({
  locationNeedsGuideTickets,
  guideAdultTickets,
  guideChildTickets,
  guidesWithTickets
}: GuideTicketsSectionProps) => {
  // Log the input props for debugging
  logger.debug(`🎟️ [GuideTicketsSection] Rendering with:`, {
    locationNeedsGuideTickets,
    guideAdultTickets,
    guideChildTickets,
    guidesWithTicketsCount: guidesWithTickets.length,
    guidesDetail: guidesWithTickets.map(g => ({
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
        <span className="font-medium">{guideAdultTickets}</span>
      </div>
      
      {/* Display guide child tickets - always show this row */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Guide child tickets:</span>
        <span className="font-medium">{guideChildTickets}</span>
      </div>
      
      {/* Show total if there are any guide tickets */}
      {(guideAdultTickets > 0 || guideChildTickets > 0) && (
        <div className="flex justify-between text-sm mt-1 pt-1 border-t border-border">
          <span className="text-muted-foreground">Total guide tickets:</span>
          <span className="font-medium">{guideAdultTickets + guideChildTickets}</span>
        </div>
      )}
      
      {/* Show guide details if there are any */}
      {guidesWithTickets.length > 0 && (
        <GuideTicketsList guides={guidesWithTickets} />
      )}
    </div>
  );
};
