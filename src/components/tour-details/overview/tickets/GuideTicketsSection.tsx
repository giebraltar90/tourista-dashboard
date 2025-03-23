
import { GuideTicketsList } from "./GuideTicketsList";

interface GuideTicketsSectionProps {
  locationNeedsGuideTickets: boolean;
  guideAdultTickets: number;
  guideChildTickets: number;
  guidesWithTickets: Array<{
    guideName: string;
    guideType: string;
    ticketType: string | null;
  }>;
}

export const GuideTicketsSection = ({ 
  locationNeedsGuideTickets,
  guideAdultTickets,
  guideChildTickets,
  guidesWithTickets
}: GuideTicketsSectionProps) => {
  if (!locationNeedsGuideTickets) return null;
  
  return (
    <>
      <div className="pt-2 pb-1 text-xs text-muted-foreground border-t">
        Guide Tickets
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">GA Ticket guides (adult):</span>
        <span className="font-medium">{guideAdultTickets}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">GA Free guides (child):</span>
        <span className="font-medium">{guideChildTickets}</span>
      </div>
      
      <GuideTicketsList guides={guidesWithTickets} />
    </>
  );
};
