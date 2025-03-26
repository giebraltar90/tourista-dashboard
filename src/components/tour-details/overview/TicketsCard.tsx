
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGuideTicketRequirements } from "@/hooks/tour-details/useGuideTicketRequirements";
import { GuideInfo } from "@/types/ventrata";
import { VentrataTourGroup } from "@/types/ventrata";
import { Separator } from "@/components/ui/separator";
import { ParticipantTicketsSection, GuideTicketsSection, TotalTicketsSection } from "./tickets";
import { useEffect, useState } from "react";
import { logger } from "@/utils/logger";
import { useTicketRequirements } from "@/hooks/tour-details/useTicketRequirements";

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
  // Use ticket requirements hook
  const tourIdString = String(tourId || '');
  const { requirements, derivedRequirements } = useTicketRequirements(tourIdString);
  
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
      guide1Id: guide1Info?.id || "",
      guide2Id: guide2Info?.id || "",
      guide3Id: guide3Info?.id || "",
      numTickets: totalTickets || 0,
      isHighSeason: false
    },
    guide1Info,
    guide2Info,
    guide3Info
  );
  
  // Filter out unknown guides
  const filteredGuides = guideTickets.guides.filter(guide => 
    !guide.guideName.startsWith("Unknown") && guide.guideName
  );
  
  // Create a modified guideTickets object with filtered guides
  const filteredGuideTickets = {
    ...guideTickets,
    guides: filteredGuides
  };
  
  // Log changes to participant counts or guides to help with debugging
  useEffect(() => {
    logger.debug("🎟️ [TicketsCard] Ticket requirements:", {
      tourId,
      adultTickets,
      childTickets,
      guideAdultTickets: guideTickets.adultTickets,
      guideChildTickets: guideTickets.childTickets,
      totalTickets,
      derivedRequirements,
      storedRequirements: requirements
    });
  }, [tourId, adultTickets, childTickets, totalTickets, guideTickets, requirements, derivedRequirements]);
  
  // Check if we have enough tickets
  const hasEnoughTickets = totalTickets >= requiredTickets;
  
  // Calculate total tickets needed (participants + guide tickets)
  const totalTicketsNeeded = adultTickets + childTickets + guideTickets.adultTickets + guideTickets.childTickets;
    
  // Format the total tickets in standard format: "adult + child"
  const totalAdultTickets = adultTickets + guideTickets.adultTickets;
  const totalChildTickets = childTickets + guideTickets.childTickets;
  const formattedTotalTickets = `${totalAdultTickets} + ${totalChildTickets}`;
  
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
        
        {locationNeedsGuideTickets && filteredGuides.length > 0 && (
          <>
            <Separator className="my-2" />
            <GuideTicketsSection 
              guides={filteredGuides}
              adultTickets={guideTickets.adultTickets}
              childTickets={guideTickets.childTickets}
            />
          </>
        )}
        
        <TotalTicketsSection 
          hasEnoughTickets={hasEnoughTickets} 
          formattedTotalTickets={formattedTotalTickets}
          requiredTickets={totalTicketsNeeded}
        />
      </CardContent>
    </Card>
  );
};
