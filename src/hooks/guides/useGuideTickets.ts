
import { GuideInfo } from "@/types/ventrata";

// Helper function to determine if a guide needs a ticket based on tour location and guide type
export function doesGuideNeedTicket(guide: GuideInfo, tourLocation: string): boolean {
  console.log("GUIDE TICKET DEBUG: Checking if guide needs ticket:", {
    guideName: guide.name,
    guideType: guide.guideType,
    tourLocation
  });
  
  // Only Versailles tours require special ticket handling for guides
  if (!tourLocation || !tourLocation.toLowerCase().includes('versailles')) {
    return false;
  }
  
  // Based on guide type
  switch (guide.guideType) {
    case 'GA Ticket':
      console.log(`GUIDE TICKET DEBUG: Guide ${guide.name} (GA Ticket) needs an adult ticket`);
      return true; // Needs an adult ticket
    case 'GA Free':
      console.log(`GUIDE TICKET DEBUG: Guide ${guide.name} (GA Free) needs a child ticket`);
      return true; // Needs a child ticket
    case 'GC':
      console.log(`GUIDE TICKET DEBUG: Guide ${guide.name} (GC) does not need a ticket`);
      return false; // No ticket needed
    default:
      console.log(`GUIDE TICKET DEBUG: Guide ${guide.name} (${guide.guideType || 'unknown type'}) - defaulting to no ticket`);
      return false;
  }
}

// Helper function to get the type of ticket needed for a guide
export function getGuideTicketType(guide: GuideInfo): 'adult' | 'child' | null {
  console.log("GUIDE TICKET DEBUG: Getting ticket type for guide:", {
    guideName: guide.name,
    guideType: guide.guideType
  });
  
  switch (guide.guideType) {
    case 'GA Ticket':
      console.log(`GUIDE TICKET DEBUG: Guide ${guide.name} needs adult ticket`);
      return 'adult'; // Needs an adult ticket
    case 'GA Free':
      console.log(`GUIDE TICKET DEBUG: Guide ${guide.name} needs child ticket`);
      return 'child'; // Needs a child ticket
    case 'GC':
    default:
      console.log(`GUIDE TICKET DEBUG: Guide ${guide.name} needs no ticket`);
      return null; // No ticket needed
  }
}
