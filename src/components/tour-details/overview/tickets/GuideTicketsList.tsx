
import { Badge } from "@/components/ui/badge";

interface GuideTicketsListProps {
  guides: Array<{
    guideName: string;
    guideType: string;
    ticketType: string | null;
  }>;
}

export const GuideTicketsList = ({ guides }: GuideTicketsListProps) => {
  if (guides.length === 0) return null;
  
  return (
    <div className="mt-1 text-xs text-muted-foreground">
      {guides.map((guide, idx) => {
        // Get human-readable ticket type
        const ticketDisplay = guide.ticketType === 'adult' ? 'Adult ticket' :
                            guide.ticketType === 'child' ? 'Child ticket' : 'No ticket';
        
        // Select badge color based on ticket type
        const badgeClass = guide.ticketType === 'adult' ? 'bg-blue-100 text-blue-800' :
                         guide.ticketType === 'child' ? 'bg-green-100 text-green-800' :
                         'bg-gray-100 text-gray-800';
        
        return (
          <div key={idx} className="flex justify-between items-center py-0.5">
            <span className="truncate max-w-[65%]">{guide.guideName}</span>
            <Badge variant="outline" className={`text-xs h-5 ml-1 ${badgeClass}`}>
              {ticketDisplay}
            </Badge>
          </div>
        );
      })}
    </div>
  );
};
