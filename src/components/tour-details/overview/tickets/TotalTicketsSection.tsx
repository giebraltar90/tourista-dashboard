
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface TotalTicketsSectionProps {
  hasEnoughTickets: boolean;
  formattedTotalTickets: string;
  requiredTickets: number;
}

export const TotalTicketsSection = ({ 
  hasEnoughTickets, 
  formattedTotalTickets,
  requiredTickets 
}: TotalTicketsSectionProps) => {
  return (
    <div className="pt-2 border-t space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">Total Required</span>
        <div className="flex items-center gap-2">
          <span>{requiredTickets}</span>
          {hasEnoughTickets ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Available tickets</span>
          <span>{formattedTotalTickets}</span>
        </div>
      </div>
    </div>
  );
};
