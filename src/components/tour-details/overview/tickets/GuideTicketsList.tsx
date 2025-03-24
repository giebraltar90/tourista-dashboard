
import { Badge } from "@/components/ui/badge";

interface GuideTicketsListProps {
  guides: Array<{
    guideName: string;
    guideType: string;
    ticketType: "adult" | "child" | null;
  }>;
}

export const GuideTicketsList = ({ guides }: GuideTicketsListProps) => {
  // Skip rendering if there are no guides
  if (!guides || guides.length === 0) return null;
  
  return (
    <div className="mt-2 space-y-1">
      <p className="text-xs text-muted-foreground">Guide details:</p>
      {guides.map((guide, index) => {
        // Determine badge color based on ticket type
        let badgeClass = "bg-blue-100 text-blue-800 border-blue-300";
        let ticketText = "No Ticket";
        
        if (guide.ticketType === "adult") {
          badgeClass = "bg-indigo-100 text-indigo-800 border-indigo-300";
          ticketText = "Adult Ticket";
        } else if (guide.ticketType === "child") {
          badgeClass = "bg-green-100 text-green-800 border-green-300";
          ticketText = "Child Ticket";
        }
        
        return (
          <div key={index} className="flex justify-between items-center text-xs">
            <span>{guide.guideName}</span>
            <Badge variant="outline" className={`${badgeClass} text-xs`}>
              {ticketText}
            </Badge>
          </div>
        );
      })}
    </div>
  );
};
