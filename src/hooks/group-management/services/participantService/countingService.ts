
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
 * Calculate guide tickets needed based on the tour location and guide list
 * 
 * Rules:
 * - GA Free = 1 Child Ticket
 * - GA Ticket = 1 Adult Ticket
 * - GC = No Ticket
 */
export const calculateGuideTickets = (
  location: string = "",
  guide1: string = "",
  guide2: string = "",
  guide3: string = ""
): number => {
  // If no location, no guide tickets needed
  if (!location) return 0;
  
  // Normalize location to lowercase for comparison
  const locationLower = location.toLowerCase();
  
  // Check if this location requires guide tickets
  const requiresGuideTickets = 
    locationLower.includes('versailles') || 
    locationLower.includes('montmartre');
  
  if (!requiresGuideTickets) {
    return 0;
  }
  
  // Count how many guides are assigned (non-empty strings)
  let guideCount = 0;
  if (guide1) guideCount++;
  if (guide2) guideCount++;
  if (guide3) guideCount++;
  
  console.log(`GUIDE TICKET DEBUG: Found ${guideCount} guides for location ${location}`);
  
  // Each guide needs 1 adult ticket, but we need to check their type
  // This function only counts GA Ticket guides now
  // GA Free guides are counted in calculateGuideChildTickets
  return guideCount;
};

/**
 * Calculate guide child tickets based on the tour location and guide list
 * Each guide needs one child ticket if GA Free
 * This is separate from guide tickets (adult tickets)
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
  
  // Normalize location to lowercase for comparison
  const locationLower = location.toLowerCase();
  
  // Check if this location requires guide tickets
  const requiresGuideTickets = 
    locationLower.includes('versailles') || 
    locationLower.includes('montmartre');
  
  if (!requiresGuideTickets) {
    return 0;
  }
  
  // Count how many GA Free guides we have (they need child tickets)
  let gaFreeGuideCount = 0;
  let gaTicketGuideCount = 0;
  let gcGuideCount = 0;
  
  guides.forEach(guide => {
    // Check guide type
    const guideType = guide?.info?.guideType;
    
    if (guideType === 'GA Free') {
      gaFreeGuideCount++;
    } else if (guideType === 'GA Ticket') {
      gaTicketGuideCount++;  
    } else if (guideType === 'GC') {
      gcGuideCount++;
    }
  });
  
  console.log(`GUIDE TICKET DEBUG: For location ${location}, found ${gaFreeGuideCount} GA Free, ${gaTicketGuideCount} GA Ticket, and ${gcGuideCount} GC guides`);
  
  // Return only GA Free guide count, as they need child tickets
  return gaFreeGuideCount;
};
