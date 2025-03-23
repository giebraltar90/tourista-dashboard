
interface ParticipantTicketsSectionProps {
  validAdultTickets: number;
  validChildTickets: number;
}

export const ParticipantTicketsSection = ({ 
  validAdultTickets, 
  validChildTickets 
}: ParticipantTicketsSectionProps) => {
  // Ensure values are valid numbers
  const displayAdultTickets = validAdultTickets >= 0 ? validAdultTickets : 0;
  const displayChildTickets = validChildTickets >= 0 ? validChildTickets : 0;
  
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">
        Participant Tickets
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Adult participants:</span>
        <span className="font-medium">{displayAdultTickets}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Child participants:</span>
        <span className="font-medium">{displayChildTickets}</span>
      </div>
    </div>
  );
};
