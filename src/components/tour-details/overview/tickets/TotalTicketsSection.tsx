
import { Badge } from "@/components/ui/badge";

interface TotalTicketsSectionProps {
  hasEnoughTickets: boolean;
  formattedTotalTickets: string;
}

export const TotalTicketsSection = ({ 
  hasEnoughTickets, 
  formattedTotalTickets 
}: TotalTicketsSectionProps) => {
  return (
    <div className="flex justify-between pt-2 border-t">
      <span className="text-muted-foreground">Total tickets needed:</span>
      <Badge 
        variant="outline" 
        className={`font-medium ${hasEnoughTickets ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"}`}
      >
        {formattedTotalTickets}
      </Badge>
    </div>
  );
};
