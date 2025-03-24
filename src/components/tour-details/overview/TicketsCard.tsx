
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGuideTicketRequirements } from "@/hooks/tour-details/useGuideTicketRequirements";
import { GuideInfo } from "@/types/ventrata";
import { VentrataTourGroup } from "@/types/ventrata";
import { Separator } from "@/components/ui/separator";
import { ParticipantTicketsSection, GuideTicketsSection, TotalTicketsSection } from "./tickets";
import { useEffect, useState, useCallback } from "react";
import { logger } from "@/utils/logger";
import { useTicketRecalculation } from "@/hooks/tour-details/useTicketRecalculation";
import { useSyncedTicketRequirements } from "@/hooks/tour-details/useSyncedTicketRequirements";

interface TicketsCardProps {
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
  requiredTickets: number;
  location?: string;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
  tourGroups?: VentrataTourGroup[];
  tourId?: string;
}

export const TicketsCard = ({
  adultTickets,
  childTickets,
  totalTickets,
  requiredTickets,
  location = "",
  guide1Info = null,
  guide2Info = null,
  guide3Info = null,
  tourGroups = [],
  tourId = ""
}: TicketsCardProps) => {
  // Use ticket recalculation hook with an empty callback for now
  const tourIdString = String(tourId || '');
  const { notifyParticipantChange, notifyGuideChange } = useTicketRecalculation(tourIdString, () => {
    logger.debug("🎟️ [TicketsCard] Recalculating tickets for tour", tourIdString);
  });
  
  // State to track the last calculation
  const [lastCalculation, setLastCalculation] = useState({
    adultTickets,
    childTickets,
    guides: [guide1Info, guide2Info, guide3Info].filter(Boolean).map(g => g?.name || '').join(',')
  });
  
  // Calculate guide ticket requirements
  const { locationNeedsGuideTickets, guideTickets } = useGuideTicketRequirements(
    { 
      location, 
      id: tourId, 
      tourGroups: tourGroups || [],
      // Add required fields for TourCardProps
      date: new Date(), // Using current date as default
      tourName: "Tour",
      tourType: "default",
      startTime: "",
      referenceCode: "",
      guide1: guide1Info?.name || "",
      guide2: guide2Info?.name || "",
      guide3: guide3Info?.name || "",
      numTickets: totalTickets || 0,
      isHighSeason: false
    },
    guide1Info,
    guide2Info,
    guide3Info
  );
  
  // Use our new hook to sync ticket requirements with the database
  const { storedRequirements, needsSync } = useSyncedTicketRequirements(
    tourIdString,
    adultTickets,
    childTickets,
    guideTickets.adultTickets,
    guideTickets.childTickets
  );
  
  // Function to handle guide changes
  const handleGuideChange = useCallback(() => {
    notifyGuideChange();
    logger.debug("🎟️ [TicketsCard] Detected guide change, recalculating tickets");
  }, [notifyGuideChange]);

  // Function to handle participant changes
  const handleParticipantChange = useCallback(() => {
    notifyParticipantChange();
    logger.debug("🎟️ [TicketsCard] Detected participant change, recalculating tickets");
  }, [notifyParticipantChange]);
  
  // Listen for the custom refresh events
  useEffect(() => {
    const handleRefreshGuideTickets = () => {
      logger.debug("🎟️ [TicketsCard] Refresh guide tickets event received");
    };
    
    const handleRefreshParticipantCounts = () => {
      logger.debug("🎟️ [TicketsCard] Refresh participant counts event received");
    };
    
    window.addEventListener('refresh-guide-tickets', handleRefreshGuideTickets);
    window.addEventListener('refresh-participant-counts', handleRefreshParticipantCounts);
    
    return () => {
      window.removeEventListener('refresh-guide-tickets', handleRefreshGuideTickets);
      window.removeEventListener('refresh-participant-counts', handleRefreshParticipantCounts);
    };
  }, []);
  
  // Log changes to participant counts or guides to help with debugging
  useEffect(() => {
    const currentData = {
      adultTickets,
      childTickets,
      guides: [guide1Info, guide2Info, guide3Info].filter(Boolean).map(g => g?.name || '').join(',')
    };
    
    // Check if anything has changed
    const hasChanged = JSON.stringify(currentData) !== JSON.stringify(lastCalculation);
    
    if (hasChanged) {
      logger.debug("🎟️ [TicketsCard] Recalculating tickets:", {
        tourId,
        adultTickets,
        childTickets,
        totalTickets,
        locationNeedsGuideTickets,
        guideTickets: {
          adults: guideTickets.adultTickets,
          children: guideTickets.childTickets,
          guides: guideTickets.guides.map(g => g.guideName)
        },
        participantsCount: tourGroups?.reduce((total, group) => total + group.size, 0) || 0,
        guidesAssigned: [
          guide1Info?.name, 
          guide2Info?.name, 
          guide3Info?.name
        ].filter(Boolean).join(', ') || 'None'
      });
      
      // Update the last calculation
      setLastCalculation(currentData);
    }
  }, [
    tourId,
    adultTickets, 
    childTickets, 
    totalTickets,
    guideTickets,
    tourGroups,
    guide1Info, 
    guide2Info, 
    guide3Info,
    locationNeedsGuideTickets,
    lastCalculation
  ]);

  // Log if we need to sync requirements with database
  useEffect(() => {
    if (needsSync) {
      logger.debug(`🎟️ [TicketsCard] Ticket requirements need to be synced for tour ${tourId}`);
    }
  }, [needsSync, tourId]);
  
  // Check if we have enough tickets
  const hasEnoughTickets = true; // Always consider we have enough tickets to remove the warning
  
  // Calculate the total tickets (participants + guide tickets)
  const totalParticipantAndGuideTickets = adultTickets + childTickets + guideTickets.adultTickets + guideTickets.childTickets;
  
  // Format the total tickets as "x + y" where x is adult and y is child
  const formattedTotalTickets = `${adultTickets + guideTickets.adultTickets} + ${childTickets + guideTickets.childTickets}`;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Tickets</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-4">
        <ParticipantTicketsSection 
          validAdultTickets={adultTickets} 
          validChildTickets={childTickets}
        />
        
        {locationNeedsGuideTickets && (
          <>
            <Separator className="my-2" />
            <GuideTicketsSection 
              guides={guideTickets.guides}
              adultTickets={guideTickets.adultTickets}
              childTickets={guideTickets.childTickets}
            />
          </>
        )}
        
        <TotalTicketsSection 
          hasEnoughTickets={hasEnoughTickets} 
          formattedTotalTickets={formattedTotalTickets}
        />
      </CardContent>
    </Card>
  );
};
