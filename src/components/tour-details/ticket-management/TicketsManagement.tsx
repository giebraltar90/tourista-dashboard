
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PenSquare } from "lucide-react";
import { TicketsManagementProps } from "./types";
import { TicketStatus } from "./TicketStatus";
import { TicketBucketInfo } from "./TicketBucketInfo";
import { useTicketBuckets } from "@/hooks/useTicketBuckets";
import { useEffect } from "react";

export const TicketsManagement = ({ tour, guide1Info, guide2Info, guide3Info }: TicketsManagementProps) => {
  // Calculate total participants for ticket requirements
  const totalParticipants = tour.tourGroups.reduce((sum, group) => {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      return sum + group.participants.reduce((groupSum, p) => groupSum + (p.count || 1), 0);
    }
    return sum + group.size;
  }, 0);
  
  // Add guides who need tickets
  const isVersaillesTour = tour.location.toLowerCase().includes('versailles');
  const guideTicketsNeeded = isVersaillesTour ? 
    (guide1Info ? 1 : 0) + (guide2Info ? 1 : 0) + (guide3Info ? 1 : 0) : 0;
  
  // Total required tickets
  const requiredTickets = totalParticipants + guideTicketsNeeded;

  // Fetch ticket buckets for this tour
  const { data: ticketBuckets = [], isLoading: isLoadingBuckets } = useTicketBuckets(tour.id);
  const tourDate = new Date(tour.date);
  
  // Update allocated tickets in buckets to reflect participant count
  useEffect(() => {
    if (ticketBuckets.length > 0) {
      // Log information about the ticket calculations
      console.log("🎫 Ticket allocation calculation:", {
        totalParticipants,
        guideTicketsNeeded,
        requiredTickets,
        buckets: ticketBuckets.map(b => ({
          id: b.id,
          reference: b.reference_number,
          maxTickets: b.max_tickets,
          allocatedTickets: b.allocated_tickets,
          // For display purposes, we'll show allocated tickets including our tour participants
          effectiveAllocatedTickets: b.allocated_tickets + (b.tour_id === tour.id ? requiredTickets : 0),
          availableTickets: b.available_tickets
        }))
      });
    }
  }, [ticketBuckets, requiredTickets, tour.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Management</CardTitle>
        <CardDescription>Manage tickets for this tour</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Ticket buckets section */}
          <TicketBucketInfo 
            buckets={ticketBuckets} 
            isLoading={isLoadingBuckets} 
            tourId={tour.id}
            requiredTickets={requiredTickets}
            tourDate={tourDate}
            totalParticipants={totalParticipants}
          />
          
          <Separator />
          
          {/* Ticket status summary */}
          <TicketStatus
            purchasedCount={ticketBuckets.length > 0 ? 
              ticketBuckets.reduce((sum, b) => b.tour_id === tour.id ? sum + b.max_tickets : sum, 0) : 
              totalParticipants}
            pendingCount={0}
            distributedCount={requiredTickets}
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
