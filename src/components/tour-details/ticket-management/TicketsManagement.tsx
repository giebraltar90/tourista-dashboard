
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PenSquare } from "lucide-react";
import { TicketsManagementProps } from "./types";
import { TicketCountCard } from "./TicketCountCard";
import { TicketStatus } from "./TicketStatus";
import { TicketBucketInfo } from "./TicketBucketInfo";
import { useTicketBuckets } from "@/hooks/useTicketBuckets";
import { useTicketCountLogic } from "./useTicketCountLogic";
import { GuideTicketRequirements } from "./GuideTicketRequirements";
import { useEffect } from "react";

export const TicketsManagement = ({ tour, guide1Info, guide2Info, guide3Info }: TicketsManagementProps) => {
  // Use the custom hook to handle all ticket count calculations
  const {
    adultTickets,
    childTickets,
    isVersaillesTour,
    guide1NeedsTicket,
    guide2NeedsTicket,
    guide3NeedsTicket,
    guide1TicketType,
    guide2TicketType,
    guide3TicketType,
    requiredAdultTickets,
    requiredChildTickets,
    availableTickets,
    requiredTickets,
    hasEnoughTickets,
    adultGuideTickets,
    childGuideTickets,
    totalParticipants
  } = useTicketCountLogic(tour, guide1Info, guide2Info, guide3Info);

  const { data: ticketBuckets = [], isLoading: isLoadingBuckets } = useTicketBuckets(tour.id);
  const tourDate = new Date(tour.date);
  
  // Log ticket bucket information and calculations for debugging
  useEffect(() => {
    console.log("🔍 [TicketsManagement] Ticket buckets loaded:", {
      bucketCount: ticketBuckets.length,
      totalMaxTickets: ticketBuckets.reduce((sum, b) => sum + b.max_tickets, 0),
      totalAllocatedTickets: ticketBuckets.reduce((sum, b) => sum + b.allocated_tickets, 0),
      totalAvailableTickets: ticketBuckets.reduce((sum, b) => {
        const available = b.available_tickets !== undefined ? 
          b.available_tickets : 
          (b.max_tickets - b.allocated_tickets);
        return sum + available;
      }, 0),
      requiredTickets,
      hasEnoughBucketsForRequiredTickets: ticketBuckets.reduce((sum, b) => {
        const available = b.available_tickets !== undefined ? 
          b.available_tickets : 
          (b.max_tickets - b.allocated_tickets);
        return sum + available;
      }, 0) >= requiredTickets
    });
  }, [ticketBuckets, requiredTickets]);

  // Calculate total tickets from buckets
  const totalBucketTickets = ticketBuckets.reduce((sum, bucket) => {
    const available = bucket.available_tickets !== undefined ? 
      bucket.available_tickets : 
      (bucket.max_tickets - bucket.allocated_tickets);
    return sum + available;
  }, 0);
  
  // Update the availableTickets calculation to use bucket tickets when available
  const effectiveAvailableTickets = ticketBuckets.length > 0 
    ? totalBucketTickets 
    : availableTickets;
  
  // Recalculate if there are enough tickets
  const effectiveHasEnoughTickets = effectiveAvailableTickets >= requiredTickets;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Management</CardTitle>
        <CardDescription>Manage tickets for this tour</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TicketCountCard
              title="Adult Tickets (18+)"
              description="Required for guests aged 18 and above"
              count={adultTickets}
              guideTickets={isVersaillesTour ? adultGuideTickets : undefined}
              totalCount={requiredAdultTickets}
            />
            
            <TicketCountCard
              title="Child Tickets (Under 18)"
              description="For guests below 18 years"
              count={childTickets}
              guideTickets={isVersaillesTour ? childGuideTickets : undefined}
              totalCount={requiredChildTickets}
            />
          </div>
          
          <Separator />
          
          <TicketBucketInfo 
            buckets={ticketBuckets} 
            isLoading={isLoadingBuckets} 
            tourId={tour.id}
            requiredTickets={requiredTickets}
            tourDate={tourDate}
          />
          
          <Separator />
          
          {isVersaillesTour && (
            <GuideTicketRequirements
              tour={tour}
              guide1Info={guide1Info}
              guide2Info={guide2Info}
              guide3Info={guide3Info}
              guide1NeedsTicket={guide1NeedsTicket}
              guide2NeedsTicket={guide2NeedsTicket}
              guide3NeedsTicket={guide3NeedsTicket}
              guide1TicketType={guide1TicketType}
              guide2TicketType={guide2TicketType}
              guide3TicketType={guide3TicketType}
              hasEnoughTickets={effectiveHasEnoughTickets}
              availableTickets={effectiveAvailableTickets}
              requiredTickets={requiredTickets}
              requiredAdultTickets={requiredAdultTickets}
              requiredChildTickets={requiredChildTickets}
            />
          )}
          
          <TicketStatus
            purchasedCount={effectiveAvailableTickets || totalParticipants}
            pendingCount={0}
            distributedCount={tour.numTickets || totalParticipants}
          />
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <Button className="ml-auto">
          <PenSquare className="mr-2 h-4 w-4" />
          Manage Tickets
        </Button>
      </CardFooter>
    </Card>
  );
};
