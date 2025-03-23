
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
      {guides.map((guide, idx) => (
        <div key={idx} className="flex justify-between items-center py-0.5">
          <span>{guide.guideName}</span>
          <Badge variant="outline" className="text-xs h-5">
            {guide.ticketType}
          </Badge>
        </div>
      ))}
    </div>
  );
};
