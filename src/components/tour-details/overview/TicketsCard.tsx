
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TicketsCardProps {
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
}

export const TicketsCard = ({ adultTickets, childTickets, totalTickets }: TicketsCardProps) => {
  console.log("COUNTING: TicketsCard received values:", {
    adultTickets,
    childTickets,
    totalTickets
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
            <span className="font-medium">{adultTickets} tickets</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Child (Under 18):</span>
            <span className="font-medium">{childTickets} tickets</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium">
              {totalTickets} tickets
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
