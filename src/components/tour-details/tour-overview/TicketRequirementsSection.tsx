
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface TicketRequirementsSectionProps {
  tourId: string;
}

export const TicketRequirementsSection = ({ tourId }: TicketRequirementsSectionProps) => {
  const [totalTickets, setTotalTickets] = useState<number>(0);
  
  // Simplified calculation for demo purposes
  useEffect(() => {
    // This would normally fetch from the API or calculate based on participants
    const calculateTickets = () => {
      // Random number between 10 and 30 for demo
      const randomTickets = Math.floor(Math.random() * 20) + 10;
      setTotalTickets(randomTickets);
    };
    
    calculateTickets();
  }, [tourId]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Total Tickets Required</h3>
          <p className="font-semibold">{totalTickets}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Ticket Status</h3>
          <p className="font-semibold">
            {totalTickets > 0 ? "Tickets Required" : "No Tickets Required"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
