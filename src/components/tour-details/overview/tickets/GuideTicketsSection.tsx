
import { Badge } from "@/components/ui/badge";

interface GuideTicketsSectionProps {
  guides: {
    guideName: string;
    guideType: string;
    ticketType: "adult" | "child" | null;
  }[];
  adultTickets: number;
  childTickets: number;
}

export const GuideTicketsSection = ({ guides, adultTickets, childTickets }: GuideTicketsSectionProps) => {
  // Only show section if there are guide tickets
  if (adultTickets === 0 && childTickets === 0) {
    return null;
  }

  // Format the total guide tickets
  const totalGuideTickets = adultTickets + childTickets;
  const formattedGuideTickets = `${adultTickets}${childTickets > 0 ? ` + ${childTickets}` : ''}`;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">Guide Tickets</span>
        <Badge variant="outline" className="font-medium">
          {formattedGuideTickets}
        </Badge>
      </div>
      
      <div className="text-xs text-muted-foreground">
        {guides.length > 0 && (
          <ul className="space-y-1">
            {guides.map((guide, index) => (
              <li key={index} className="flex justify-between">
                <span>{guide.guideName}</span>
                <span>{guide.ticketType === "adult" ? "Adult" : guide.ticketType === "child" ? "Child" : "None"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
