
import { GuideWithTicket } from "./types";
import { GuideTicketsList } from "./GuideTicketsList";

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
  if (adultTickets === 0 && childTickets === 0) {
    return null;
  }
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Guide tickets:</span>
        <span className="font-medium">{adultTickets + childTickets}</span>
      </div>
      
      {guides.length > 0 && <GuideTicketsList guides={guides} />}
    </div>
  );
};
