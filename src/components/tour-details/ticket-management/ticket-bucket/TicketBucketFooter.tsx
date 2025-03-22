
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface TicketBucketFooterProps {
  totalBucketTickets: number;
  requiredTickets: number;
  hasEnoughBucketTickets: boolean;
  guideTicketsNeeded?: number;
}

export const TicketBucketFooter = ({ 
  totalBucketTickets, 
  requiredTickets, 
  hasEnoughBucketTickets,
  guideTicketsNeeded = 0
}: TicketBucketFooterProps) => {
  // Calculate participant tickets (total required minus guides)
  const participantTicketsNeeded = requiredTickets - guideTicketsNeeded;
  const formattedTicketRequirements = guideTicketsNeeded > 0 
    ? `${participantTicketsNeeded} + ${guideTicketsNeeded}`
    : requiredTickets.toString();

  return (
    <div className="mt-4 pt-4 border-t space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">Total Available:</span>
        <Badge 
          variant={hasEnoughBucketTickets ? "secondary" : "destructive"} 
          className={hasEnoughBucketTickets ? "bg-green-100 text-green-800" : ""}
        >
          {totalBucketTickets} tickets
        </Badge>
      </div>
      
      <div className="flex items-center">
        {hasEnoughBucketTickets ? (
          <div className="w-full p-2 bg-green-50 text-green-700 rounded-md flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
            <span className="text-sm">
              Tour allocation: {formattedTicketRequirements} tickets assigned to this tour
              {guideTicketsNeeded > 0 && ` (${guideTicketsNeeded} for guides)`}
            </span>
          </div>
        ) : (
          <div className="w-full p-2 bg-amber-50 text-amber-700 rounded-md flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
            <span className="text-sm">
              No bucket assigned. This tour needs {formattedTicketRequirements} tickets
              {guideTicketsNeeded > 0 && ` (including ${guideTicketsNeeded} for guides)`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
