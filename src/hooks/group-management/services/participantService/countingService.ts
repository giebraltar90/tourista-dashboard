import { VentrataTourGroup } from "@/types/ventrata";

/**
 * Calculate the total number of participants in tour groups
 */
export const calculateTotalParticipants = (groups: VentrataTourGroup[]): number => {
  if (!groups || !Array.isArray(groups)) return 0;
  
  return groups.reduce((sum, group) => {
    return sum + (group.size || 0);
  }, 0);
};

/**
 * Calculate the total number of child participants in tour groups
 */
export const calculateTotalChildCount = (groups: VentrataTourGroup[]): number => {
  if (!groups || !Array.isArray(groups)) return 0;
  
  return groups.reduce((sum, group) => {
    return sum + (group.childCount || 0);
  }, 0);
};

/**
 * Calculate guide adult tickets needed based on guide info
 * Each GA Ticket guide needs one adult ticket in locations requiring tickets
 */
export const calculateGuideAdultTickets = (
  location: string = "",
  guides: Array<{
    id: string;
    name: string;
    info: any;
  }> = []
): number => {
  // If no location or no guides, no guide adult tickets needed
  if (!location || !guides.length) return 0;
  
  // Check if this location requires guide tickets
  const requiresGuideTickets = 
    location.toLowerCase().includes('versailles') || 
    location.toLowerCase().includes('montmartre');
  
  if (!requiresGuideTickets) {
    console.log(`🔍 [calculateGuideAdultTickets] Location "${location}" doesn't require guide tickets`);
    return 0;
  }
  
  // Count how many GA Ticket guides we have (they need adult tickets)
  // Keep track of processed guides by name to avoid duplicates
  const processedGuideIds = new Set<string>();
  let gaTicketGuideCount = 0;
  
  guides.forEach(guide => {
    // Skip if no info
    if (!guide?.info) return;
    
    // Skip if already processed this guide by ID
    if (processedGuideIds.has(guide.id)) return;
    
    // Add to processed list
    processedGuideIds.add(guide.id);
    
    // Check guide type
    if (guide.info.guideType === 'GA Ticket') {
      console.log(`🔍 [calculateGuideAdultTickets] Guide ${guide.id} (${guide.name}) with type GA Ticket needs adult ticket`);
      gaTicketGuideCount++;
    }
  });
  
  console.log(`🔍 [calculateGuideAdultTickets] Total adult guide tickets: ${gaTicketGuideCount}`);
  return gaTicketGuideCount;
};

/**
 * Calculate guide child tickets based on guide info
 * Each GA Free guide needs one child ticket in locations requiring tickets
 */
export const calculateGuideChildTickets = (
  location: string = "",
  guides: Array<{
    id: string;
    name: string;
    info: any;
  }> = []
): number => {
  // If no location or no guides, no guide child tickets needed
  if (!location || !guides.length) return 0;
  
  // Check if this location requires guide tickets
  const requiresGuideTickets = 
    location.toLowerCase().includes('versailles') || 
    location.toLowerCase().includes('montmartre');
  
  if (!requiresGuideTickets) {
    console.log(`🔍 [calculateGuideChildTickets] Location "${location}" doesn't require guide tickets`);
    return 0;
  }
  
  // Count how many GA Free guides we have (they need child tickets)
  // Keep track of processed guides by ID to avoid duplicates
  const processedGuideIds = new Set<string>();
  let gaFreeGuideCount = 0;
  
  guides.forEach(guide => {
    // Skip if no info
    if (!guide?.info) return;
    
    // Skip if already processed this guide
    if (processedGuideIds.has(guide.id)) return;
    
    // Add to processed list
    processedGuideIds.add(guide.id);
    
    // Check guide type
    if (guide.info.guideType === 'GA Free') {
      console.log(`🔍 [calculateGuideChildTickets] Guide ${guide.id} (${guide.name}) with type GA Free needs child ticket`);
      gaFreeGuideCount++;
    }
  });
  
  console.log(`🔍 [calculateGuideChildTickets] Total child guide tickets: ${gaFreeGuideCount}`);
  return gaFreeGuideCount;
};

/**
 * Format a participant count to show adults + children
 */
export const formatParticipantCount = (
  totalCount: number, 
  childCount: number
): string => {
  if (childCount <= 0) {
    return `${totalCount}`;
  }
  
  const adultCount = totalCount - childCount;
  return `${adultCount}+${childCount}`;
};
