
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PenSquare } from "lucide-react";
import { TicketsManagementProps } from "./types";
import { TicketStatus } from "./TicketStatus";
import { TicketBucketInfo } from "./TicketBucketInfo";
import { useTicketBuckets } from "@/hooks/useTicketBuckets";
import { useEffect } from "react";
import { doesGuideNeedTicket } from "@/hooks/guides/useGuideTickets";

export const TicketsManagement = ({ tour, guide1Info, guide2Info, guide3Info }: TicketsManagementProps) => {
  // Calculate total participants from tour groups
  const totalParticipants = tour.tourGroups.reduce((sum, group) => {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      return sum + group.participants.reduce((groupSum, p) => groupSum + (p.count || 1), 0);
    }
    return sum + group.size;
  }, 0);
  
  // Calculate guide tickets based on guide info and location
  const isVersaillesTour = tour.location.toLowerCase().includes('versailles');
  
  // Check if guides need tickets
  const guide1NeedsTicket = guide1Info && isVersaillesTour ? 
    doesGuideNeedTicket(guide1Info, tour.location) : false;
  
  const guide2NeedsTicket = guide2Info && isVersaillesTour ? 
    doesGuideNeedTicket(guide2Info, tour.location) : false;
  
  const guide3NeedsTicket = guide3Info && isVersaillesTour ? 
    doesGuideNeedTicket(guide3Info, tour.location) : false;
  
  // Count total guide tickets needed
  const guideTicketsNeeded = (guide1NeedsTicket ? 1 : 0) + 
                            (guide2NeedsTicket ? 1 : 0) + 
                            (guide3NeedsTicket ? 1 : 0);
  
  // Total required tickets including guides
  const requiredTickets = totalParticipants + guideTicketsNeeded;

  // Fetch ticket buckets for this tour
  const { data: ticketBuckets = [], isLoading: isLoadingBuckets } = useTicketBuckets(tour.id);
  const tourDate = new Date(tour.date);
  
  // Log ticket calculations for debugging
  useEffect(() => {
    console.log("🎫 [TicketsManagement] Ticket requirements:", {
      totalParticipants,
      isVersaillesTour,
      guide1: guide1Info?.name,
      guide2: guide2Info?.name,
      guide3: guide3Info?.name,
      guide1NeedsTicket,
      guide2NeedsTicket,
      guide3NeedsTicket,
      guideTicketsNeeded,
      requiredTickets,
      bucketCount: ticketBuckets.length
    });
  }, [
    ticketBuckets, 
    totalParticipants, 
    guideTicketsNeeded, 
    requiredTickets, 
    guide1Info, 
    guide2Info, 
    guide3Info
  ]);

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
