
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGuideTicketRequirements } from "@/hooks/tour-details/useGuideTicketRequirements";
import { GuideInfo } from "@/types/ventrata";
import { VentrataTourGroup } from "@/types/ventrata";
import { Separator } from "@/components/ui/separator";
import { ParticipantTicketsSection, GuideTicketsSection, TotalTicketsSection } from "./tickets";
import { useEffect } from "react";
import { logger } from "@/utils/logger";

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
  
  // Log changes to participant counts or guides to help with debugging
  useEffect(() => {
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
    locationNeedsGuideTickets
  ]);
  
  // Check if we have enough tickets
  const hasEnoughTickets = totalTickets >= requiredTickets;
  
  // Calculate total tickets needed (participants + guide tickets)
  const totalTicketsNeeded = totalTickets + guideTickets.adultTickets + guideTickets.childTickets;
  
  // Calculate the actual total required tickets including guides
  const actualRequiredTickets = requiredTickets > 0 ? 
    requiredTickets : totalTicketsNeeded;
  
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
          formattedTotalTickets={`${totalTickets}`}
          requiredTickets={actualRequiredTickets} // Pass the required tickets value
        />
      </CardContent>
    </Card>
  );
};
