
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PenSquare } from "lucide-react";
import { TicketsManagementProps } from "./types";
import { TicketStatus } from "./TicketStatus";
import { TicketBucketInfo } from "./TicketBucketInfo";
import { useTicketBuckets } from "@/hooks/useTicketBuckets";
import { useEffect } from "react";
import { doesGuideNeedTicket, getGuideTicketType } from "@/hooks/guides/useGuideTickets";
import { GuideTicketRequirements } from "./GuideTicketRequirements";
import { useTicketCountLogic } from "@/hooks/tour-details/useParticipantCounts";

export const TicketsManagement = ({ tour, guide1Info, guide2Info, guide3Info }: TicketsManagementProps) => {
  // Calculate total participants from tour groups
  const totalParticipants = tour.tourGroups.reduce((sum, group) => {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      return sum + group.participants.reduce((groupSum, p) => groupSum + (p.count || 1), 0);
    }
    return sum + group.size;
  }, 0);
  
  // Calculate child count
  const totalChildCount = tour.tourGroups.reduce((sum, group) => {
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      return sum + group.participants.reduce((groupSum, p) => groupSum + (p.childCount || 0), 0);
    }
    return sum + (group.childCount || 0);
  }, 0);
  
  // Calculate guide tickets based on guide info and location
  const isTourRequiringGuideTickets = 
    tour.location.toLowerCase().includes('versailles') || 
    tour.location.toLowerCase().includes('montmartre');
  
  // Check if guides need tickets
  const guide1NeedsTicket = guide1Info && isTourRequiringGuideTickets ? 
    doesGuideNeedTicket(guide1Info, tour.location) : false;
  
  const guide2NeedsTicket = guide2Info && isTourRequiringGuideTickets ? 
    doesGuideNeedTicket(guide2Info, tour.location) : false;
  
  const guide3NeedsTicket = guide3Info && isTourRequiringGuideTickets ? 
    doesGuideNeedTicket(guide3Info, tour.location) : false;
  
  // Get ticket types for guides
  const guide1TicketType = guide1Info ? getGuideTicketType(guide1Info) : null;
  const guide2TicketType = guide2Info ? getGuideTicketType(guide2Info) : null;
  const guide3TicketType = guide3Info ? getGuideTicketType(guide3Info) : null;
  
  // Count required tickets by type
  const requiredAdultTickets = (totalParticipants - totalChildCount) + 
    (guide1TicketType === 'adult' ? 1 : 0) + 
    (guide2TicketType === 'adult' ? 1 : 0) + 
    (guide3TicketType === 'adult' ? 1 : 0);
    
  const requiredChildTickets = totalChildCount + 
    (guide1TicketType === 'child' ? 1 : 0) + 
    (guide2TicketType === 'child' ? 1 : 0) + 
    (guide3TicketType === 'child' ? 1 : 0);
  
  // Count total guide tickets needed
  const guideTicketsNeeded = (guide1NeedsTicket ? 1 : 0) + 
                            (guide2NeedsTicket ? 1 : 0) + 
                            (guide3NeedsTicket ? 1 : 0);
  
  // Total required tickets including guides
  const requiredTickets = totalParticipants + guideTicketsNeeded;

  // Fetch ticket buckets for this tour
  const { data: ticketBuckets = [], isLoading: isLoadingBuckets } = useTicketBuckets(tour.id);
  const tourDate = new Date(tour.date);
  
  // Calculate if we have enough tickets
  const availableTickets = ticketBuckets.length > 0 ? 
    ticketBuckets.reduce((sum, b) => b.tour_id === tour.id ? sum + b.max_tickets : sum, 0) : 
    (tour.numTickets || totalParticipants);
  
  const hasEnoughTickets = availableTickets >= requiredTickets;
  
  // Log ticket calculations for debugging
  useEffect(() => {
    console.log("🎫 [TicketsManagement] Ticket requirements:", {
      totalParticipants,
      totalChildCount,
      isTourRequiringGuideTickets,
      guide1: guide1Info?.name,
      guide2: guide2Info?.name,
      guide3: guide3Info?.name,
      guide1NeedsTicket,
      guide2NeedsTicket,
      guide3NeedsTicket,
      guide1TicketType,
      guide2TicketType,
      guide3TicketType,
      requiredAdultTickets,
      requiredChildTickets,
      guideTicketsNeeded,
      requiredTickets,
      bucketCount: ticketBuckets.length,
      availableTickets,
      hasEnoughTickets
    });
  }, [
    ticketBuckets, 
    totalParticipants, 
    totalChildCount,
    guideTicketsNeeded, 
    requiredTickets, 
    guide1Info, 
    guide2Info, 
    guide3Info,
    availableTickets
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Management</CardTitle>
        <CardDescription>Manage tickets for this tour</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {isTourRequiringGuideTickets && (
            <GuideTicketRequirements
              tour={{
                guide1: guide1Info?.name || tour.guide1 || "Unknown",
                guide2: guide2Info?.name || tour.guide2 || "",
                guide3: guide3Info?.name || tour.guide3 || "",
                location: tour.location
              }}
              guide1Info={guide1Info}
              guide2Info={guide2Info}
              guide3Info={guide3Info}
              guide1NeedsTicket={guide1NeedsTicket}
              guide2NeedsTicket={guide2NeedsTicket}
              guide3NeedsTicket={guide3NeedsTicket}
              guide1TicketType={guide1TicketType}
              guide2TicketType={guide2TicketType}
              guide3TicketType={guide3TicketType}
              hasEnoughTickets={hasEnoughTickets}
              availableTickets={availableTickets}
              requiredTickets={requiredTickets}
              requiredAdultTickets={requiredAdultTickets}
              requiredChildTickets={requiredChildTickets}
            />
          )}

          {/* Ticket buckets section */}
          <TicketBucketInfo 
            buckets={ticketBuckets} 
            isLoading={isLoadingBuckets} 
            tourId={tour.id}
            requiredTickets={requiredTickets}
            tourDate={tourDate}
            totalParticipants={totalParticipants}
            guideTicketsNeeded={guideTicketsNeeded}
          />
          
          <Separator />
          
          {/* Ticket status summary */}
          <TicketStatus
            purchasedCount={availableTickets}
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
