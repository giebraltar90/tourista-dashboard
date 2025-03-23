
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
  // Only show guides that need tickets
  const guidesWithTickets = guides.filter(g => g.ticketType !== null);
  
  if (guidesWithTickets.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-2 space-y-1 pt-1 border-t border-border">
      <p className="text-xs text-muted-foreground mb-1">Guide details:</p>
      
      {guidesWithTickets.map((guide, index) => (
        <div key={index} className="flex justify-between items-center text-xs">
          <span className="truncate">{guide.guideName}</span>
          <Badge 
            variant="outline" 
            className={`text-xs ${
              guide.ticketType === 'adult' 
                ? 'bg-blue-50 text-blue-800 border-blue-200' 
                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
            }`}
          >
            {guide.ticketType === 'adult' ? 'Adult' : 'Child'} ticket
          </Badge>
        </div>
      ))}
    </div>
  );
};
