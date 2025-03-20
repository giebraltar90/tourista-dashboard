
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TicketsCardProps {
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
}

export const TicketsCard = ({ adultTickets, childTickets, totalTickets }: TicketsCardProps) => {
  // Extra validation to ensure counts are non-negative numbers
  const validAdultTickets = Math.max(0, adultTickets || 0);
  const validChildTickets = Math.max(0, childTickets || 0);
  const validTotalTickets = Math.max(0, totalTickets || 0);
  
  // Double-check that our total matches the sum of adult + child tickets
  const calculatedTotal = validAdultTickets + validChildTickets;
  const displayTotal = calculatedTotal === validTotalTickets ? validTotalTickets : calculatedTotal;
  
  console.log("COUNTING: TicketsCard final values:", {
    originalValues: { adultTickets, childTickets, totalTickets },
    validatedValues: { validAdultTickets, validChildTickets, validTotalTickets },
    calculatedTotal,
    displayTotal
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
        </div>
      </CardContent>
    </Card>
  );
};
