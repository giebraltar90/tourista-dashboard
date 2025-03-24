
import { cn } from "@/lib/utils";

interface TotalTicketsSectionProps {
  hasEnoughTickets: boolean;
  formattedTotalTickets: string;
}

export const TotalTicketsSection = ({
  hasEnoughTickets,
  formattedTotalTickets
}: TotalTicketsSectionProps) => {
  return (
    <div className="pt-1">
      <div className="flex justify-between text-sm font-medium border-t border-border pt-1">
        <span>Total required:</span>
        <span 
          className={cn(
            hasEnoughTickets ? "text-green-600" : "text-red-600",
          )}
        >
          {formattedTotalTickets}
        </span>
      </div>
    </div>
  );
};
