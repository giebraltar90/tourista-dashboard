
import { GuideInfo } from "@/types/ventrata";

/**
 * Determines if a guide needs a ticket based on tour location and guide type
 * Rules:
 * - GA Free guides need a child ticket at Versailles/Montmartre
 * - GA Ticket guides need an adult ticket at Versailles/Montmartre
 * - GC guides never need a ticket
 * - Sophie Miller is always treated as a GC guide (never needs a ticket)
 */
export function doesGuideNeedTicket(guide: GuideInfo | null, tourLocation: string): boolean {
  // No guide or no location means no ticket
  if (!guide || !guide.guideType || !tourLocation) {
    return false;
  }
  
  // Special case for Sophie Miller - always GC guide, never needs a ticket
  if (guide.name && guide.name.toLowerCase().includes('sophie miller')) {
    return false;
  }
  
  // Check if this is a location requiring guide tickets
  const requiresGuideTickets = 
    tourLocation.toLowerCase().includes('versailles') || 
    tourLocation.toLowerCase().includes('montmartre');
  
  if (!requiresGuideTickets) {
    return false;
  }
  
  // Based on guide type
  if (guide.guideType === 'GA Ticket') {
    return true; // Needs an adult ticket
  } else if (guide.guideType === 'GA Free') {
    return true; // Needs a child ticket
  } else if (guide.guideType === 'GC') {
    return false; // No ticket needed
  }
  
  // Default case
  return false;
}

/**
 * Gets the type of ticket needed for a guide
 * Returns:
 * - 'adult' for GA Ticket guides
 * - 'child' for GA Free guides
 * - null for GC guides or guides not needing tickets
 */
export function getGuideTicketType(guide: GuideInfo | null): 'adult' | 'child' | null {
  // No guide or no guide type means no ticket
  if (!guide || !guide.guideType) {
    return null;
  }
  
  // Special case for Sophie Miller - always GC guide, never needs a ticket
  if (guide.name && guide.name.toLowerCase().includes('sophie miller')) {
    return null;
  }
  
  // Based on guide type
  if (guide.guideType === 'GA Ticket') {
    return 'adult'; // Needs an adult ticket
  } else if (guide.guideType === 'GA Free') {
    return 'child'; // Needs a child ticket
  }
  
  // Default case (GC guides or unknown types)
  return null;
}
