
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
  
  // This function only counts guide presence, not their ticket requirements
  // The actual ticket calculation will be done based on guide types
  return 0;
};

/**
 * Calculate guide adult tickets needed based on the tour location and guide list with guide types
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
  
  // Normalize location to lowercase for comparison
  const locationLower = location.toLowerCase();
  
  // Check if this location requires guide tickets
  const requiresGuideTickets = 
    locationLower.includes('versailles') || 
    locationLower.includes('montmartre');
  
  if (!requiresGuideTickets) {
    return 0;
  }
  
  // Count how many GA Ticket guides we have (they need adult tickets)
  let gaTicketGuideCount = 0;
  
  guides.forEach(guide => {
    // Check guide type
    const guideType = guide?.info?.guideType;
    
    if (guideType === 'GA Ticket') {
      gaTicketGuideCount++;
    }
  });
  
  console.log(`GUIDE TICKET DEBUG: For location ${location}, found ${gaTicketGuideCount} GA Ticket guides needing adult tickets`);
  
  // Return GA Ticket guide count, as they need adult tickets
  return gaTicketGuideCount;
};

/**
 * Calculate guide child tickets based on the tour location and guide list
 * Each guide needs one child ticket if GA Free
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
  
  guides.forEach(guide => {
    // Check guide type
    const guideType = guide?.info?.guideType;
    
    if (guideType === 'GA Free') {
      gaFreeGuideCount++;
    }
  });
  
  console.log(`GUIDE TICKET DEBUG: For location ${location}, found ${gaFreeGuideCount} GA Free guides needing child tickets`);
  
  // Return GA Free guide count, as they need child tickets
  return gaFreeGuideCount;
};
