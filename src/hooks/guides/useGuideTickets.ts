
import { GuideInfo } from "@/types/ventrata";

// Helper function to determine if a guide needs a ticket based on tour location and guide type
export function doesGuideNeedTicket(guide: GuideInfo, tourLocation: string): boolean {
  if (!guide || !guide.guideType || !tourLocation) {
    console.log(`GUIDE TICKET DEBUG: Guide or location info missing, defaulting to no ticket`);
    return false;
  }
  
  console.log("GUIDE TICKET DEBUG: Checking if guide needs ticket:", {
    guideName: guide?.name,
    guideType: guide?.guideType,
    tourLocation,
    isGuideInfoValid: !!guide && !!guide.guideType
  });
  
  // Check if this is a location requiring guide tickets
  const isVersaillesLocationMatched = tourLocation?.toLowerCase().includes('versailles');
  const isMontmartreLocationMatched = tourLocation?.toLowerCase().includes('montmartre');
  
  if (!isVersaillesLocationMatched && !isMontmartreLocationMatched) {
    console.log(`GUIDE TICKET DEBUG: Location ${tourLocation} does not require guide tickets`);
    return false;
  }
  
  // Based on guide type - make sure we use exact string comparison
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
  if (!guide || !guide.guideType) {
    console.log("GUIDE TICKET DEBUG: Guide info is invalid, returning null ticket type");
    return null;
  }
  
  console.log("GUIDE TICKET DEBUG: Getting ticket type for guide:", {
    guideName: guide.name,
    guideType: guide.guideType
  });
  
  // Make sure we use exact string comparison
  switch (guide.guideType) {
    case 'GA Ticket':
      console.log(`GUIDE TICKET DEBUG: Guide ${guide.name} needs adult ticket`);
      return 'adult'; // Needs an adult ticket
    case 'GA Free':
      console.log(`GUIDE TICKET DEBUG: Guide ${guide.name} needs child ticket`);
      return 'child'; // Needs a child ticket
    case 'GC':
      console.log(`GUIDE TICKET DEBUG: Guide ${guide.name} needs no ticket (GC guide)`);
      return null; // No ticket needed
    default:
      console.log(`GUIDE TICKET DEBUG: Guide ${guide.name} (${guide.guideType}) needs no ticket (unknown type)`);
      return null; // No ticket needed
  }
}
