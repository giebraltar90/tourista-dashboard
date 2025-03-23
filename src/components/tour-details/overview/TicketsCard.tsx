
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateGuideTicketsNeeded } from "@/hooks/group-management/utils/ticketCalculation";
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
  
  // Check if location needs guide tickets
  const locationNeedsGuideTickets = location && 
    (location.toLowerCase().includes('versailles') || location.toLowerCase().includes('montmartre'));
  
  // Check if there are assigned guides in any groups
  const hasAssignedGuides = tourGroups?.some(g => {
    const hasGuide = g.guideId && g.guideId !== "unassigned";
    logger.debug(`🎟️ [TicketsCard] Group guide check: ${g.name || 'Group'} - guideId: ${g.guideId}, hasGuide: ${hasGuide}`);
    return hasGuide;
  }) || false;
  
  logger.debug(`🎟️ [TicketsCard] Tour ${tourId} has assigned guides: ${hasAssignedGuides}, requires tickets: ${locationNeedsGuideTickets}`);
  
  // Calculate guide tickets only if needed and there are assigned guides
  const { 
    adultTickets: guideAdultTickets, 
    childTickets: guideChildTickets,
    guides: guidesWithTickets
  } = (locationNeedsGuideTickets && hasAssignedGuides) ? calculateGuideTicketsNeeded(
    guide1Info,
    guide2Info,
    guide3Info,
    location,
    tourGroups
  ) : { adultTickets: 0, childTickets: 0, guides: [] };
  
  // Log ticket calculation for debugging
  useEffect(() => {
    logger.debug("🎟️ [TicketsCard] Ticket calculation for tour " + tourId, {
      tourId,
      location,
      locationNeedsGuideTickets,
      hasAssignedGuides,
      validAdultTickets,
      validChildTickets,
      guideAdultTickets,
      guideChildTickets,
      guidesWithTickets,
      guide1: guide1Info ? `${guide1Info.name} (${guide1Info.guideType})` : 'null',
      guide2: guide2Info ? `${guide2Info.name} (${guide2Info.guideType})` : 'null',
      guide3: guide3Info ? `${guide3Info.name} (${guide3Info.guideType})` : 'null',
      tourGroupsCount: tourGroups?.length || 0,
      tourGroupGuides: tourGroups?.map(g => g.guideId || 'none') || []
    });
    
    // Print detailed info for each guide
    if (guide1Info) {
      logger.debug(`🎟️ [TicketsCard] Guide1 details:`, {
        id: guide1Info.id,
        name: guide1Info.name,
        type: guide1Info.guideType,
        needsTicket: guidesWithTickets.some(g => g.guideName === guide1Info.name)
      });
    }
    
    if (guide2Info) {
      logger.debug(`🎟️ [TicketsCard] Guide2 details:`, {
        id: guide2Info.id,
        name: guide2Info.name,
        type: guide2Info.guideType,
        needsTicket: guidesWithTickets.some(g => g.guideName === guide2Info.name)
      });
    }
    
    if (guide3Info) {
      logger.debug(`🎟️ [TicketsCard] Guide3 details:`, {
        id: guide3Info.id,
        name: guide3Info.name,
        type: guide3Info.guideType,
        needsTicket: guidesWithTickets.some(g => g.guideName === guide3Info.name)
      });
    }
    
    // Log the actual guides assigned to groups
    logger.debug(`🎟️ [TicketsCard] Guides assigned to groups:`, {
      assignments: tourGroups?.map(g => ({
        groupName: g.name || `Group ${g.id}`,
        guideId: g.guideId || 'none'
      })) || []
    });
  }, [validAdultTickets, validChildTickets, guideAdultTickets, guideChildTickets, 
      guide1Info, guide2Info, guide3Info, location, guidesWithTickets, tourGroups, tourId, 
      locationNeedsGuideTickets, hasAssignedGuides]);
  
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
            <span className="text-muted-foreground">Adult tickets:</span>
            <span className="font-medium">{validAdultTickets}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Child tickets:</span>
            <span className="font-medium">{validChildTickets}</span>
          </div>

          {guideAdultTickets > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GA Ticket (adult):</span>
              <span className="font-medium">{guideAdultTickets}</span>
            </div>
          )}

          {guideChildTickets > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GA Free (child):</span>
              <span className="font-medium">{guideChildTickets}</span>
            </div>
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
