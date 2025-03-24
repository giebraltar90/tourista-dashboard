
import { Badge } from "@/components/ui/badge";

interface GuideWithTicket {
  guideName: string;
  guideType: string;
  ticketType: "adult" | "child" | null;
}

interface GuideTicketsListProps {
  guides: GuideWithTicket[];
}

export const GuideTicketsList = ({ guides }: GuideTicketsListProps) => {
  if (guides.length === 0) return null;
  
  return (
    <div className="mt-2 space-y-1 bg-muted/20 p-2 rounded-sm text-xs">
      <h4 className="font-medium">Guide ticket details:</h4>
      
      {guides.map((guide, index) => (
        <div key={index} className="flex justify-between items-center">
          <span>{guide.guideName}</span>
          {guide.ticketType ? (
            <Badge variant={guide.ticketType === 'child' ? 'outline' : 'secondary'} className="text-xs">
              {guide.ticketType === 'adult' ? 'Adult Ticket' : 'Child Ticket'}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">No Ticket</Badge>
          )}
        </div>
      ))}
    </div>
  );
};
