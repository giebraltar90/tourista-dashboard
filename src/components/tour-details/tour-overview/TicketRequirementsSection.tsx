
import { Card, CardContent } from "@/components/ui/card";
import { useTicketRequirements } from "@/hooks/tour-details/useTicketRequirements";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketRequirementsSectionProps {
  tourId: string;
}

export const TicketRequirementsSection = ({ tourId }: TicketRequirementsSectionProps) => {
  const { requirements, isLoading, error } = useTicketRequirements(tourId);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground">Error loading ticket requirements.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Adult Tickets</h3>
          <p className="font-semibold">{requirements.participantAdultCount + requirements.guideAdultTickets}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Child Tickets</h3>
          <p className="font-semibold">{requirements.participantChildCount + requirements.guideChildTickets}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Total Tickets</h3>
          <p className="font-semibold">{requirements.totalTicketsRequired}</p>
        </CardContent>
      </Card>
    </div>
  );
};
