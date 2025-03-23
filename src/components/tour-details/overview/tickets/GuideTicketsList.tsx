
import { Separator } from "@/components/ui/separator";

interface GuideTicketsListProps {
  guides: {
    guideName: string;
    guideType: string;
    ticketType: "adult" | "child" | null;
  }[];
}

export const GuideTicketsList = ({ guides }: GuideTicketsListProps) => {
  // Don't render if no guides need tickets
  const guidesNeedingTickets = guides.filter(g => g.ticketType !== null);
  if (guidesNeedingTickets.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">Guide Tickets</span>
      
      <div className="space-y-2">
        {guidesNeedingTickets.map((guide, index) => (
          <div key={index} className="flex justify-between items-center text-xs">
            <span>{guide.guideName}</span>
            <span className="text-muted-foreground">
              {guide.ticketType === "adult" ? "Adult ticket" : "Child ticket"}
            </span>
          </div>
        ))}
      </div>
      
      <Separator className="my-2" />
    </div>
  );
};
