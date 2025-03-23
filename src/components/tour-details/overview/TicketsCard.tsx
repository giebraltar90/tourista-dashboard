
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGuideTicketRequirements } from "@/hooks/tour-details/useGuideTicketRequirements";
import { GuideInfo } from "@/types/ventrata";
import { useEffect } from "react";
import { logger } from "@/utils/logger";

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
    guide1: '',
    guide2: '',
    guide3: '',
    numTickets: 0,
    isHighSeason: false
  };
  
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
    logger.debug(`🎟️ [TicketsCard] Tour ${tourId} ticket data:`, {
      location,
      locationNeedsGuideTickets,
      hasAssignedGuides,
      participantAdults: validAdultTickets,
      participantChildren: validChildTickets,
      guideAdultTickets,
      guideChildTickets,
      totalGuideTickets: guideAdultTickets + guideChildTickets,
      guidesCount: guidesWithTickets.length,
      guides: guidesWithTickets.map(g => ({
        name: g.guideName,
        type: g.guideType,
        ticketType: g.ticketType
      })),
      groupCount: Array.isArray(tourGroups) ? tourGroups.length : 0,
      groupsWithGuides: Array.isArray(tourGroups) ? 
        tourGroups.filter(g => g.guideId && g.guideId !== 'unassigned').length : 0
    });
    
    // Log tour groups with assigned guides
    if (Array.isArray(tourGroups) && tourGroups.length > 0) {
      const groupsWithGuides = tourGroups.filter(g => g.guideId && g.guideId !== 'unassigned');
      if (groupsWithGuides.length > 0) {
        logger.debug(`🎟️ [TicketsCard] Groups with assigned guides:`, 
          groupsWithGuides.map(g => ({
            id: g.id,
            name: g.name || 'Unnamed',
            guideId: g.guideId,
            guideName: g.guideName || 'Unknown'
          }))
        );
      }
    }
    
    // Log guides details
    logger.debug(`🎟️ [TicketsCard] Available guides for ticket calculation:`, {
      guide1: guide1Info ? {
        id: guide1Info.id,
        name: guide1Info.name,
        type: guide1Info.guideType
      } : null,
      guide2: guide2Info ? {
        id: guide2Info.id,
        name: guide2Info.name,
        type: guide2Info.guideType
      } : null,
      guide3: guide3Info ? {
        id: guide3Info.id,
        name: guide3Info.name,
        type: guide3Info.guideType
      } : null
    });
  }, [
    tourId, location, locationNeedsGuideTickets, hasAssignedGuides, 
    validAdultTickets, validChildTickets, guideAdultTickets, guideChildTickets,
    guide1Info, guide2Info, guide3Info, guidesWithTickets, tourGroups
  ]);
  
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
          <div className="flex justify-between">
            <span className="text-muted-foreground">Participant adult tickets:</span>
            <span className="font-medium">{validAdultTickets}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Participant child tickets:</span>
            <span className="font-medium">{validChildTickets}</span>
          </div>

          {locationNeedsGuideTickets && hasAssignedGuides && (
            <>
              <div className="pt-2 pb-1 text-xs text-muted-foreground border-t">
                Guide Tickets
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GA Ticket guides (adult):</span>
                <span className="font-medium">{guideAdultTickets}</span>
              </div>
  
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GA Free guides (child):</span>
                <span className="font-medium">{guideChildTickets}</span>
              </div>
              
              {guidesWithTickets.length > 0 && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {guidesWithTickets.map((guide, idx) => (
                    <div key={idx} className="flex justify-between items-center py-0.5">
                      <span>{guide.guideName}</span>
                      <Badge variant="outline" className="text-xs h-5">
                        {guide.ticketType}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          <div className="flex justify-between pt-2 border-t">
            <span className="text-muted-foreground">Total tickets needed:</span>
            <Badge 
              variant="outline" 
              className={`font-medium ${hasEnoughTickets ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"}`}
            >
              {formattedTotalTickets}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
