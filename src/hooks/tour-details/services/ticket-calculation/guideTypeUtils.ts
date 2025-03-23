
/**
 * Check if a guide's type indicates they need a ticket
 */
export const guideTypeNeedsTicket = (guideType: string = ""): boolean => {
  // Normalize guide type to uppercase for consistent comparison
  const guideTypeUpper = (guideType || "").toUpperCase();
  
  // GC guides never need tickets
  if (guideTypeUpper === "GC") {
    return false;
  }
  
  // All other guide types need tickets
  return true;
};

/**
 * Determine the ticket type needed based on guide type
 */
export const determineTicketTypeForGuide = (guideType: string = ""): "adult" | "child" | null => {
  // Normalize guide type to uppercase for consistent comparison
  const guideTypeUpper = (guideType || "").toUpperCase();
  
  // GC guides don't need tickets
  if (guideTypeUpper === "GC") {
    return null;
  }
  
  // GA Free (under 26) guides need child tickets
  if (guideTypeUpper.includes("FREE") || 
      guideTypeUpper.includes("UNDER") || 
      guideTypeUpper.includes("U26")) {
    return "child";
  }
  
  // GA Ticket (over 26) guides and others need adult tickets
  return "adult";
};
