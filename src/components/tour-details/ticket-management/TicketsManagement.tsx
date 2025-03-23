
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketsManagementProps } from "./types";
import { TicketCountCard } from "./TicketCountCard";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { TicketStatus } from "./TicketStatus";
import { TicketSufficiencyAlert } from "./TicketSufficiencyAlert";
import { TicketBucketInfo } from "./TicketBucketInfo";
import { calculateGuideTicketsNeeded } from "@/hooks/group-management/utils";

export const TicketsManagement = ({ 
  tour, 
  guide1Info, 
  guide2Info, 
  guide3Info 
}: TicketsManagementProps) => {
  const [activeTab, setActiveTab] = useState("status");
  
  // Calculate total participants and child count
  const totalParticipants = tour.tourGroups.reduce(
    (sum, group) => sum + group.size, 
    0
  );
  
  const totalChildCount = tour.tourGroups.reduce(
    (sum, group) => sum + group.childCount, 
    0
  );
  
  const adultParticipants = totalParticipants - totalChildCount;
  
  // Calculate tickets needed for guides based on guide types
  const { 
    adultTickets: guideAdultTickets, 
    childTickets: guideChildTickets,
    guides: guidesWithTickets
  } = calculateGuideTicketsNeeded(
    guide1Info,
    guide2Info,
    guide3Info,
    tour.location,
    tour.tourGroups
  );
  
  // Total tickets needed including guides
  const totalAdultTicketsNeeded = adultParticipants + guideAdultTickets;
  const totalChildTicketsNeeded = totalChildCount + guideChildTickets;
  const totalTicketsNeeded = totalAdultTicketsNeeded + totalChildTicketsNeeded;
  
  // Get the number of tickets already assigned to this tour
  const purchasedTickets = tour.numTickets || 0;
  
  // Get information about guides that need tickets
  const guidesNeedingAdultTickets = guidesWithTickets.filter(g => g.ticketType === 'adult');
  const guidesNeedingChildTickets = guidesWithTickets.filter(g => g.ticketType === 'child');
  
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Ticket Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="status">Ticket Status</TabsTrigger>
            <TabsTrigger value="buckets">Ticket Buckets</TabsTrigger>
          </TabsList>
          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TicketCountCard
                title="Adult Tickets Needed"
                description={`${adultParticipants} adult participants ${guideAdultTickets > 0 ? `+ ${guideAdultTickets} guides` : ''}`}
                count={totalAdultTicketsNeeded}
                guideTickets={guidesNeedingAdultTickets}
                totalCount={totalTicketsNeeded}
              />
              
              <TicketCountCard
                title="Child Tickets Needed"
                description={`${totalChildCount} child participants ${guideChildTickets > 0 ? `+ ${guideChildTickets} guides` : ''}`}
                count={totalChildTicketsNeeded}
                guideTickets={guidesNeedingChildTickets}
                totalCount={totalTicketsNeeded}
              />
            </div>
            
            <TicketStatus
              purchasedCount={purchasedTickets}
              pendingCount={0}
              distributedCount={0}
            />
            
            <TicketSufficiencyAlert
              hasEnoughTickets={purchasedTickets >= totalTicketsNeeded}
              availableTickets={purchasedTickets}
              requiredTickets={totalTicketsNeeded}
              requiredAdultTickets={totalAdultTicketsNeeded}
              requiredChildTickets={totalChildTicketsNeeded}
            />
            
            {guidesWithTickets.length > 0 && (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Guide Ticket Information</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 text-sm">
                    <li>GA Ticket guides (over 26): Require adult tickets for Versailles.</li>
                    <li>GA Free guides (under 26): Require child tickets for Versailles.</li>
                    <li>GC guides: Can guide inside Versailles, no tickets needed.</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="buckets">
            <TicketBucketInfo
              buckets={[]}
              isLoading={false}
              tourId={tour.id}
              requiredTickets={totalTicketsNeeded}
              tourDate={tour.date}
              totalParticipants={totalParticipants}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
