
import { GuideInfo } from "@/types/ventrata";

// Define the interface for a guide with a ticket
export interface GuideWithTicket {
  guideName: string;
  guideType: string;
  ticketType: "adult" | "child" | null;
  guideInfo: GuideInfo | null;
  needsTicket?: boolean;
}

interface GuideTicketsSectionProps {
  guides: GuideWithTicket[];
  adultTickets: number;
  childTickets: number;
}

export const GuideTicketsSection = ({ guides, adultTickets, childTickets }: GuideTicketsSectionProps) => {
  if (guides.length === 0) {
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium">Guide Tickets</p>
        <p className="text-xs text-muted-foreground">No guide tickets required</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Guide Tickets ({adultTickets + childTickets})</p>
      <div className="space-y-1">
        {guides.map((guide, index) => (
          <p key={index} className="text-xs flex justify-between">
            <span>{guide.guideName} ({guide.guideType})</span>
            <span className="font-medium">{guide.ticketType || 'None'}</span>
          </p>
        ))}
      </div>
    </div>
  );
};
