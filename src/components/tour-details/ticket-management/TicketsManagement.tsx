
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PenSquare, Ticket } from "lucide-react";
import { doesGuideNeedTicket, getGuideTicketType } from "@/hooks/useGuideData";
import { TicketsManagementProps } from "./types";
import { TicketCountCard } from "./TicketCountCard";
import { GuideTicketInfo } from "./GuideTicketInfo";
import { TicketStatus } from "./TicketStatus";
import { TicketSufficiencyAlert } from "./TicketSufficiencyAlert";
import { TicketBucketInfo } from "./TicketBucketInfo";
import { useTicketBuckets } from "@/hooks/useTicketBuckets";

export const TicketsManagement = ({ tour, guide1Info, guide2Info, guide3Info }: TicketsManagementProps) => {
  const totalParticipants = tour.tourGroups.reduce((sum, group) => {
    // Calculate total from participants if available
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      return sum + group.participants.reduce((groupSum, p) => groupSum + (p.count || 1), 0);
    }
    // Fall back to size field
    return sum + group.size;
  }, 0);
  
  const totalChildCount = tour.tourGroups.reduce((sum, group) => {
    // Calculate from participants if available
    if (Array.isArray(group.participants) && group.participants.length > 0) {
      return sum + group.participants.reduce((groupSum, p) => groupSum + (p.childCount || 0), 0);
    }
    // Fall back to childCount field
    return sum + (group.childCount || 0);
  }, 0);
  
  const adultTickets = totalParticipants - totalChildCount;
  const childTickets = totalChildCount;
  
  // Determine if this is a Versailles tour
  const isVersaillesTour = tour.location.toLowerCase().includes('versailles');
  
  // Calculate guide ticket requirements
  const guide1NeedsTicket = guide1Info ? doesGuideNeedTicket(guide1Info, tour.location) : false;
  const guide2NeedsTicket = guide2Info ? doesGuideNeedTicket(guide2Info, tour.location) : false;
  const guide3NeedsTicket = guide3Info ? doesGuideNeedTicket(guide3Info, tour.location) : false;
  
  // Get ticket types required for guides
  const guide1TicketType = guide1Info ? getGuideTicketType(guide1Info) : null;
  const guide2TicketType = guide2Info ? getGuideTicketType(guide2Info) : null;
  const guide3TicketType = guide3Info ? getGuideTicketType(guide3Info) : null;
  
  // Calculate total required tickets
  const requiredAdultTickets = adultTickets + 
    (guide1TicketType === 'adult' ? 1 : 0) + 
    (guide2TicketType === 'adult' ? 1 : 0) +
    (guide3TicketType === 'adult' ? 1 : 0);
    
  const requiredChildTickets = childTickets + 
    (guide1TicketType === 'child' ? 1 : 0) + 
    (guide2TicketType === 'child' ? 1 : 0) +
    (guide3TicketType === 'child' ? 1 : 0);
  
  // Determine if we have enough tickets
  const availableTickets = tour.numTickets || totalParticipants;
  const requiredTickets = requiredAdultTickets + requiredChildTickets;
  const hasEnoughTickets = availableTickets >= requiredTickets;

  // Prepare guide adult tickets data
  const adultGuideTickets = [];
  if (guide1Info && guide1TicketType === 'adult') {
    adultGuideTickets.push({
      guideName: guide1Info.name,
      guideType: 'GA Ticket',
      birthday: undefined
    });
  }
  if (guide2Info && guide2TicketType === 'adult') {
    adultGuideTickets.push({
      guideName: guide2Info.name,
      guideType: 'GA Ticket',
      birthday: undefined
    });
  }
  if (guide3Info && guide3TicketType === 'adult') {
    adultGuideTickets.push({
      guideName: guide3Info.name,
      guideType: 'GA Ticket',
      birthday: undefined
    });
  }

  // Prepare guide child tickets data
  const childGuideTickets = [];
  if (guide1Info && guide1TicketType === 'child') {
    childGuideTickets.push({
      guideName: guide1Info.name,
      guideType: 'GA Free',
      birthday: guide1Info.birthday
    });
  }
  if (guide2Info && guide2TicketType === 'child') {
    childGuideTickets.push({
      guideName: guide2Info.name,
      guideType: 'GA Free',
      birthday: guide2Info.birthday
    });
  }
  if (guide3Info && guide3TicketType === 'child') {
    childGuideTickets.push({
      guideName: guide3Info.name,
      guideType: 'GA Free',
      birthday: guide3Info.birthday
    });
  }

  // Get ticket buckets for this tour
  const { data: ticketBuckets = [], isLoading: isLoadingBuckets } = useTicketBuckets(tour.id);

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
          
          {/* Ticket Buckets Section */}
          <TicketBucketInfo 
            buckets={ticketBuckets} 
            isLoading={isLoadingBuckets} 
            tourId={tour.id}
            requiredTickets={requiredTickets}
          />
          
          <Separator />
          
          {isVersaillesTour && (
            <>
              <div className="space-y-4">
                <h3 className="font-medium">Guide Ticket Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <GuideTicketInfo
                    guideName={tour.guide1}
                    guideInfo={guide1Info}
                    needsTicket={guide1NeedsTicket}
                    ticketType={guide1TicketType}
                  />
                  
                  {tour.guide2 && (
                    <GuideTicketInfo
                      guideName={tour.guide2}
                      guideInfo={guide2Info}
                      needsTicket={guide2NeedsTicket}
                      ticketType={guide2TicketType}
                    />
                  )}

                  {tour.guide3 && (
                    <GuideTicketInfo
                      guideName={tour.guide3}
                      guideInfo={guide3Info}
                      needsTicket={guide3NeedsTicket}
                      ticketType={guide3TicketType}
                    />
                  )}
                </div>
              </div>
              
              <TicketSufficiencyAlert
                hasEnoughTickets={hasEnoughTickets}
                availableTickets={availableTickets}
                requiredTickets={requiredTickets}
                requiredAdultTickets={requiredAdultTickets}
                requiredChildTickets={requiredChildTickets}
              />
              
              <Separator />
            </>
          )}
          
          <TicketStatus
            purchasedCount={tour.numTickets || totalParticipants}
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
