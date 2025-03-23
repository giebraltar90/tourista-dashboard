
import { Badge } from "@/components/ui/badge";

interface ParticipantTicketsSectionProps {
  validAdultTickets: number;
  validChildTickets: number;
}

export const ParticipantTicketsSection = ({ 
  validAdultTickets, 
  validChildTickets 
}: ParticipantTicketsSectionProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">Participant Tickets</span>
        <Badge variant="outline" className="font-medium">
          {validAdultTickets} + {validChildTickets}
        </Badge>
      </div>
      
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Adults</span>
          <span>{validAdultTickets}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Children</span>
          <span>{validChildTickets}</span>
        </div>
      </div>
    </div>
  );
};
