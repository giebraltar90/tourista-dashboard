
import { GuideInfo } from "@/types/ventrata";

// Helper function to determine if a guide needs a ticket based on tour location and guide type
export function doesGuideNeedTicket(guide: GuideInfo, tourLocation: string): boolean {
  // Only Versailles tours require special ticket handling for guides
  if (!tourLocation.toLowerCase().includes('versailles')) {
    return false;
  }
  
  // Based on guide type
  switch (guide.guideType) {
    case 'GA Ticket':
      return true; // Needs an adult ticket
    case 'GA Free':
      return true; // Needs a child ticket
    case 'GC':
      return false; // No ticket needed
    default:
      return false;
  }
}

// Helper function to get the type of ticket needed for a guide
export function getGuideTicketType(guide: GuideInfo): 'adult' | 'child' | null {
  switch (guide.guideType) {
    case 'GA Ticket':
      return 'adult'; // Needs an adult ticket
    case 'GA Free':
      return 'child'; // Needs a child ticket (FIXED: previously was returning 'adult')
    case 'GC':
    default:
      return null; // No ticket needed
  }
}
