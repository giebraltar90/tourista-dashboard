
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTicketRequirements } from "@/hooks/tour-details/useTicketRequirements";

interface TicketRequirementsSectionProps {
  tourId: string;
}

export const TicketRequirementsSection = ({ tourId }: TicketRequirementsSectionProps) => {
  const { requirements, isLoading } = useTicketRequirements(tourId);
  const [total, setTotal] = useState(0);
  
  useEffect(() => {
    if (requirements) {
      const adultTickets = (requirements.participantAdultCount || 0) + (requirements.guideAdultTickets || 0);
      const childTickets = (requirements.participantChildCount || 0) + (requirements.guideChildTickets || 0);
      setTotal(adultTickets + childTickets);
    }
  }, [requirements]);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground">Loading ticket requirements...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 flex flex-col">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Adult Participants</h3>
          <p className="font-semibold text-lg">{requirements?.participantAdultCount || 0}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-col">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Child Participants</h3>
          <p className="font-semibold text-lg">{requirements?.participantChildCount || 0}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-col">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Guide Tickets</h3>
          <p className="font-semibold text-lg">{(requirements?.guideAdultTickets || 0) + (requirements?.guideChildTickets || 0)}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-col">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Total Tickets Needed</h3>
          <p className="font-semibold text-lg">{total}</p>
        </CardContent>
      </Card>
    </div>
  );
};
