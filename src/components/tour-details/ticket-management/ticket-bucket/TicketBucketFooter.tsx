
import { Badge } from "@/components/ui/badge";

interface TicketBucketFooterProps {
  totalBucketTickets: number;
  requiredTickets: number;
  hasEnoughBucketTickets: boolean;
}

export const TicketBucketFooter = ({ 
  totalBucketTickets, 
  requiredTickets, 
  hasEnoughBucketTickets 
}: TicketBucketFooterProps) => {
  return (
    <div className="flex justify-between items-center pt-2 mt-2 border-t">
      <span className="font-medium">Total Available:</span>
      <Badge 
        variant={hasEnoughBucketTickets ? "secondary" : "destructive"} 
        className={hasEnoughBucketTickets ? "bg-green-100 text-green-800" : ""}
      >
        {totalBucketTickets} tickets
        {requiredTickets > 0 && (
          <span className="ml-1">
            ({requiredTickets} needed)
          </span>
        )}
      </Badge>
    </div>
  );
};
