
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGuideTicketRequirements } from "@/hooks/tour-details/useGuideTicketRequirements";
import { GuideInfo } from "@/types/ventrata";
import { VentrataTourGroup } from "@/types/ventrata";
import { Separator } from "@/components/ui/separator";
import { ParticipantTicketsSection, GuideTicketsSection, TotalTicketsSection } from "./tickets";
import { useEffect, useState } from "react";
import { logger } from "@/utils/logger";
import { useTicketRecalculation } from "@/hooks/tour-details/useTicketRecalculation";

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
  // Use ticket recalculation hook
  const tourIdString = String(tourId || '');
  useTicketRecalculation(tourIdString);
  
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
  
  // Track the last calculated data to detect changes
  const [lastCalculation, setLastCalculation] = useState({
    adultTickets,
    childTickets,
    guideAdultTickets: guideTickets.adultTickets,
    guideChildTickets: guideTickets.childTickets,
    guides: guideTickets.guides.map(g => g.guideName).join(',')
  });
  
  // Log changes to participant counts or guides to help with debugging
  useEffect(() => {
    const currentData = {
      adultTickets,
      childTickets,
      guideAdultTickets: guideTickets.adultTickets,
      guideChildTickets: guideTickets.childTickets,
      guides: guideTickets.guides.map(g => g.guideName).join(',')
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
  
  // Check if we have enough tickets
  const hasEnoughTickets = totalTickets >= requiredTickets;
  
  // Calculate total tickets needed (participants + guide tickets)
  const totalTicketsNeeded = adultTickets + childTickets + guideTickets.adultTickets + guideTickets.childTickets;
  
  // Calculate the actual total required tickets including guides
  const actualRequiredTickets = requiredTickets > 0 ? 
    requiredTickets : totalTicketsNeeded;
    
  // Format the total tickets as "x + y" where x is adult and y is child
  const formattedTotalTickets = `${adultTickets} + ${childTickets}`;
  
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
          requiredTickets={actualRequiredTickets}
        />
      </CardContent>
    </Card>
  );
};
