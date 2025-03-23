
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface TicketsCardProps {
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
  requiredTickets?: number;
  location?: string;
}

export const TicketsCard = ({ 
  adultTickets, 
  childTickets, 
  totalTickets,
  requiredTickets,
  location = ''
}: TicketsCardProps) => {
  // Ensure counts are non-negative numbers
  const validAdultTickets = Math.max(0, adultTickets || 0);
  const validChildTickets = Math.max(0, childTickets || 0);
  
  // Total required tickets calculations
  const totalRequiredAdultTickets = validAdultTickets;
  const totalRequiredChildTickets = validChildTickets;
  const totalRequiredTickets = totalRequiredAdultTickets + totalRequiredChildTickets;
  
  // Determine if we have enough tickets
  const hasEnoughTickets = !requiredTickets || totalRequiredTickets <= requiredTickets;

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
          
          <div className="flex justify-between pt-2 border-t">
            <span className="text-muted-foreground">Total:</span>
            <Badge 
              variant="outline" 
              className="font-medium bg-green-100 text-green-800 border-green-300"
            >
              {totalRequiredTickets}
            </Badge>
          </div>
          
          {hasEnoughTickets && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <span className="text-muted-foreground">Status:</span>
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <Check className="h-3 w-3 mr-1" />
                Tickets sufficient
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
