
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TicketsCardProps {
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
  requiredTickets?: number; // Added to show missing tickets
}

export const TicketsCard = ({ 
  adultTickets, 
  childTickets, 
  totalTickets,
  requiredTickets
}: TicketsCardProps) => {
  console.log("PARTICIPANTS DEBUG: TicketsCard initial input values:", {
    adultTickets,
    childTickets,
    totalTickets,
    requiredTickets
  });
  
  // Extra validation to ensure counts are non-negative numbers
  const validAdultTickets = Math.max(0, adultTickets || 0);
  const validChildTickets = Math.max(0, childTickets || 0);
  const validTotalTickets = Math.max(0, totalTickets || 0);
  
  // Double-check that our total matches the sum of adult + child tickets
  const calculatedTotal = validAdultTickets + validChildTickets;
  
  // Always use the calculated total for consistency
  const displayTotal = calculatedTotal;

  // Calculate missing tickets if required tickets is provided
  const missingTickets = requiredTickets && requiredTickets > displayTotal 
    ? requiredTickets - displayTotal 
    : 0;
  
  console.log("PARTICIPANTS DEBUG: TicketsCard final values:", {
    originalValues: { adultTickets, childTickets, totalTickets, requiredTickets },
    validatedValues: { validAdultTickets, validChildTickets, validTotalTickets },
    calculatedTotal,
    displayTotal,
    missingTickets
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Adult (18+):</span>
            <span className="font-medium">{validAdultTickets} tickets</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Child (Under 18):</span>
            <span className="font-medium">{validChildTickets} tickets</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium">
              {displayTotal} tickets
            </span>
          </div>
          
          {missingTickets > 0 && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <span className="text-muted-foreground">Missing:</span>
              <Badge variant="destructive" className="text-xs font-medium">
                {missingTickets} tickets needed
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
