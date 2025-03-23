
interface ParticipantTicketsSectionProps {
  validAdultTickets: number;
  validChildTickets: number;
}

export const ParticipantTicketsSection = ({ 
  validAdultTickets, 
  validChildTickets 
}: ParticipantTicketsSectionProps) => {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">
        Participant Tickets
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Adult participants:</span>
        <span className="font-medium">{validAdultTickets || 0}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Child participants:</span>
        <span className="font-medium">{validChildTickets || 0}</span>
      </div>
    </div>
  );
};
