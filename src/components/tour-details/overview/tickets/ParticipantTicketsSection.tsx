
interface ParticipantTicketsSectionProps {
  validAdultTickets: number;
  validChildTickets: number;
}

export const ParticipantTicketsSection = ({ 
  validAdultTickets,
  validChildTickets 
}: ParticipantTicketsSectionProps) => {
  return (
    <>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Participant adult tickets:</span>
        <span className="font-medium">{validAdultTickets}</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-muted-foreground">Participant child tickets:</span>
        <span className="font-medium">{validChildTickets}</span>
      </div>
    </>
  );
};
