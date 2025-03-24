
import { logger } from "@/utils/logger";

/**
 * Count tickets by type from guide requirements
 */
export const countTicketsByType = (
  guidesWithRequirements: Array<{
    guideName?: string;
    guideType?: string;
    needsTicket?: boolean;
    ticketType: "adult" | "child" | null;
  }>
): { adultTickets: number; childTickets: number; totalTickets: number } => {
  let adultTickets = 0;
  let childTickets = 0;
  
  guidesWithRequirements.forEach(guide => {
    // Only count tickets for guides that need tickets
    if (guide.needsTicket) {
      if (guide.ticketType === 'adult') adultTickets++;
      else if (guide.ticketType === 'child') childTickets++;
    }
  });
  
  const total = adultTickets + childTickets;
  
  logger.debug(`🎟️ [TicketAggregation] Counted tickets:`, {
    adultTickets,
    childTickets,
    totalTickets: total
  });
  
  return {
    adultTickets,
    childTickets,
    totalTickets: total
  };
};

/**
 * Map guide requirement objects to the guides array format
 * used in the ticket calculation result
 */
export const mapGuidesToResultFormat = (
  guideRequirements: Array<{
    guideName: string;
    guideType: string;
    needsTicket: boolean;
    ticketType: "adult" | "child" | null;
  }>
): Array<{
  guideName: string;
  guideType: string;
  ticketType: "adult" | "child" | null;
}> => {
  return guideRequirements.map(guide => ({
    guideName: guide.guideName,
    guideType: guide.guideType || "Unknown",
    ticketType: guide.ticketType
  }));
};
