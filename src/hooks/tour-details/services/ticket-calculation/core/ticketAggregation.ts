
import { logger } from "@/utils/logger";

/**
 * Count tickets by type from guide requirements
 */
export const countTicketsByType = (
  guidesWithRequirements: Array<{
    needsTicket: boolean;
    ticketType: string | null;
  }>
): { adultTickets: number; childTickets: number; totalTickets: number } => {
  let adultTickets = 0;
  let childTickets = 0;
  
  guidesWithRequirements.forEach(guide => {
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
    ticketType: string | null;
  }>
): Array<{
  guideName: string;
  guideType: string;
  ticketType: string | null;
}> => {
  return guideRequirements.map(guide => ({
    guideName: guide.guideName,
    guideType: guide.guideType || "Unknown",
    ticketType: guide.ticketType
  }));
};
