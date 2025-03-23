
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGuideTicketRequirements } from "@/hooks/tour-details/useGuideTicketRequirements";
import { GuideInfo } from "@/types/ventrata";
import { useEffect } from "react";
import { logger } from "@/utils/logger";
import { 
  ParticipantTicketsSection, 
  GuideTicketsSection,
  TotalTicketsSection 
} from "./tickets";

interface TicketsCardProps {
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
  requiredTickets?: number;
  location?: string;
  guide1Info?: GuideInfo | null;
  guide2Info?: GuideInfo | null;
  guide3Info?: GuideInfo | null;
  tourGroups?: any[];
  tourId?: string;
}

export const TicketsCard = ({ 
  adultTickets, 
  childTickets, 
  totalTickets,
  requiredTickets,
  location = '',
  guide1Info = null,
  guide2Info = null,
  guide3Info = null,
  tourGroups = [],
  tourId = ''
}: TicketsCardProps) => {
  // Ensure counts are non-negative numbers
  const validAdultTickets = Math.max(0, adultTickets || 0);
  const validChildTickets = Math.max(0, childTickets || 0);
  
  // Special monitoring for specific tour ID
  const isSpecialMonitoringTour = tourId === '324598820';
  
  // Create a simplified mock tour for the guide requirements hook
  const mockTour = {
    id: tourId,
    location: location || '',
    tourGroups: tourGroups || [],
    date: new Date(),
    tourName: '',
    tourType: 'default' as 'default' | 'food' | 'private',
    startTime: '',
    referenceCode: '',
    guide1: guide1Info?.name || '',
    guide2: guide2Info?.name || '',
    guide3: guide3Info?.name || '',
    numTickets: 0,
    isHighSeason: false
  };
  
  // Special logging for monitored tour
  if (isSpecialMonitoringTour) {
    logger.debug(`🔍 [TOUR MONITORING] TicketsCard initializing for tour ${tourId}`, {
      location,
      guide1: guide1Info?.name,
      guide1Type: guide1Info?.guideType,
      guide2: guide2Info?.name,
      guide2Type: guide2Info?.guideType,
      guide3: guide3Info?.name,
      guide3Type: guide3Info?.guideType,
      participantTickets: {
        adult: validAdultTickets,
        child: validChildTickets,
        total: validAdultTickets + validChildTickets
      }
    });
  }
  
  // Get guide ticket requirements
  const { locationNeedsGuideTickets, hasAssignedGuides, guideTickets } = useGuideTicketRequirements(
    mockTour, guide1Info, guide2Info, guide3Info
  );
  
  const { 
    adultTickets: guideAdultTickets, 
    childTickets: guideChildTickets,
    guides: guidesWithTickets
  } = guideTickets;
  
  // Log detailed debug information for guide tickets
  useEffect(() => {
    // Only log for special monitoring tours or when there's a change in tickets
    const shouldLogDetail = isSpecialMonitoringTour || 
                           guideAdultTickets > 0 || 
                           guideChildTickets > 0;
    
    if (shouldLogDetail) {
      logger.debug(`🎟️ [TicketsCard] Tour ${tourId} ticket data:`, {
        location,
        locationNeedsGuideTickets,
        hasAssignedGuides,
        guideDetails: {
          guide1: guide1Info ? `${guide1Info.name} (${guide1Info.guideType})` : 'none',
          guide2: guide2Info ? `${guide2Info.name} (${guide2Info.guideType})` : 'none',
          guide3: guide3Info ? `${guide3Info.name} (${guide3Info.guideType})` : 'none',
        },
        tickets: {
          participantAdults: validAdultTickets,
          participantChildren: validChildTickets,
          guideAdultTickets,
          guideChildTickets,
          totalGuideTickets: guideAdultTickets + guideChildTickets,
        },
        guides: guidesWithTickets.map(g => ({
          name: g.guideName,
          type: g.guideType,
          ticketType: g.ticketType
        }))
      });
    }
  }, [
    tourId, location, locationNeedsGuideTickets, hasAssignedGuides, 
    validAdultTickets, validChildTickets, guideAdultTickets, guideChildTickets,
    guide1Info, guide2Info, guide3Info, guidesWithTickets, isSpecialMonitoringTour
  ]);
  
  // Enhanced logging for specific tours with issues
  useEffect(() => {
    // Log extra details for problematic tours (adding the requested tour ID)
    if (['313911645', '313922567', '324598761', '324598820'].includes(tourId)) {
      logger.debug(`🚨 [TicketsCard] SPECIAL TOUR MONITORING: ${tourId}`, {
        location,
        needsGuideTickets: locationNeedsGuideTickets,
        guideTickets: {
          adult: guideAdultTickets,
          child: guideChildTickets, 
          total: guideAdultTickets + guideChildTickets
        },
        guides: guidesWithTickets.map(g => ({
          name: g.guideName,
          type: g.guideType,
          ticketType: g.ticketType
        }))
      });
    }
  }, [tourId, location, locationNeedsGuideTickets, guideAdultTickets, guideChildTickets, guidesWithTickets]);
  
  // Total required tickets calculations
  const totalRequiredAdultTickets = validAdultTickets + guideAdultTickets;
  const totalRequiredChildTickets = validChildTickets + guideChildTickets;
  const totalRequiredTickets = totalRequiredAdultTickets + totalRequiredChildTickets;
  
  // Determine if we have enough tickets
  const hasEnoughTickets = !requiredTickets || totalRequiredTickets <= requiredTickets;

  // Format the total tickets display
  const formattedTotalTickets = totalRequiredChildTickets > 0 && totalRequiredAdultTickets > 0
    ? `${totalRequiredAdultTickets} + ${totalRequiredChildTickets}`
    : `${totalRequiredTickets}`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <ParticipantTicketsSection 
            validAdultTickets={validAdultTickets}
            validChildTickets={validChildTickets}
          />

          <GuideTicketsSection 
            locationNeedsGuideTickets={locationNeedsGuideTickets}
            guideAdultTickets={guideAdultTickets}
            guideChildTickets={guideChildTickets}
            guidesWithTickets={guidesWithTickets}
          />
          
          <TotalTicketsSection
            hasEnoughTickets={hasEnoughTickets}
            formattedTotalTickets={formattedTotalTickets}
          />
        </div>
      </CardContent>
    </Card>
  );
};
