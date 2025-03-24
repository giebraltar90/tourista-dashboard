
/**
 * Count tickets by type from guide requirements
 */
export const countTicketsByType = (
  guidesWithRequirements: Array<{
    needsTicket: boolean;
    ticketType: "adult" | "child" | null;
  }>
): { adultTickets: number; childTickets: number } => {
  // Initialize counters
  let adultTickets = 0;
  let childTickets = 0;
  
  // Count tickets by type
  guidesWithRequirements.forEach(guide => {
    if (guide.needsTicket && guide.ticketType === "adult") {
      adultTickets++;
    } else if (guide.needsTicket && guide.ticketType === "child") {
      childTickets++;
    }
  });
  
  return { adultTickets, childTickets };
};

/**
 * Map guides to result format
 */
export const mapGuidesToResultFormat = (
  guideResults: Array<{
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
  return guideResults.map(guide => ({
    guideName: guide.guideName,
    guideType: guide.guideType,
    // Only set ticketType if guide needs a ticket
    ticketType: guide.needsTicket ? guide.ticketType : null
  }));
};
