
import { GuideInfo } from "@/types/ventrata";

// Helper function to determine if a guide needs a ticket based on tour location and guide type
export function doesGuideNeedTicket(guide: GuideInfo | null, tourLocation: string): boolean {
  if (!guide || !guide.guideType || !tourLocation) {
    console.log(`GUIDE TICKET DEBUG: [doesGuideNeedTicket] Guide or location info missing, defaulting to no ticket`, {
      hasGuide: !!guide,
      guideType: guide?.guideType,
      tourLocation: tourLocation || 'undefined'
    });
    return false;
  }
  
  // Special case for Sophie Miller - always GC guide, never needs a ticket
  if (guide.name && guide.name.toLowerCase().includes('sophie miller')) {
    console.log(`GUIDE TICKET DEBUG: [doesGuideNeedTicket] Sophie Miller detected, always a GC guide (no ticket)`);
    return false;
  }
  
  console.log("GUIDE TICKET DEBUG: [doesGuideNeedTicket] Checking if guide needs ticket:", {
    guideName: guide?.name,
    guideType: guide?.guideType,
    tourLocation,
    isGuideInfoValid: !!guide && !!guide.guideType,
    isSophieMiller: guide?.name ? guide.name.toLowerCase().includes('sophie miller') : false
  });
  
  // Check if this is a location requiring guide tickets
  const isVersaillesLocationMatched = tourLocation?.toLowerCase().includes('versailles');
  const isMontmartreLocationMatched = tourLocation?.toLowerCase().includes('montmartre');
  
  if (!isVersaillesLocationMatched && !isMontmartreLocationMatched) {
    console.log(`GUIDE TICKET DEBUG: [doesGuideNeedTicket] Location ${tourLocation} does not require guide tickets`);
    return false;
  }
  
  // Based on guide type - make sure we use exact string comparison
  if (guide.guideType === 'GA Ticket') {
    console.log(`GUIDE TICKET DEBUG: [doesGuideNeedTicket] Guide ${guide.name} (GA Ticket) needs an adult ticket`);
    return true; // Needs an adult ticket
  } else if (guide.guideType === 'GA Free') {
    console.log(`GUIDE TICKET DEBUG: [doesGuideNeedTicket] Guide ${guide.name} (GA Free) needs a child ticket`);
    return true; // Needs a child ticket
  } else if (guide.guideType === 'GC') {
    console.log(`GUIDE TICKET DEBUG: [doesGuideNeedTicket] Guide ${guide.name} (GC) does not need a ticket`);
    return false; // No ticket needed
  } else {
    console.log(`GUIDE TICKET DEBUG: [doesGuideNeedTicket] Guide ${guide.name} (${guide.guideType || 'unknown type'}) - defaulting to no ticket`);
    return false;
  }
}

// Helper function to get the type of ticket needed for a guide
export function getGuideTicketType(guide: GuideInfo | null): 'adult' | 'child' | null {
  if (!guide || !guide.guideType) {
    console.log("GUIDE TICKET DEBUG: [getGuideTicketType] Guide info is invalid, returning null ticket type", {
      hasGuide: !!guide,
      guideType: guide?.guideType
    });
    return null;
  }
  
  // Special case for Sophie Miller - always GC guide, never needs a ticket
  if (guide.name && guide.name.toLowerCase().includes('sophie miller')) {
    console.log(`GUIDE TICKET DEBUG: [getGuideTicketType] Sophie Miller detected, always a GC guide (no ticket)`);
    return null;
  }
  
  console.log("GUIDE TICKET DEBUG: [getGuideTicketType] Getting ticket type for guide:", {
    guideName: guide.name,
    guideType: guide.guideType,
    isSophieMiller: guide.name ? guide.name.toLowerCase().includes('sophie miller') : false
  });
  
  // Make sure we use exact string comparison
  if (guide.guideType === 'GA Ticket') {
    console.log(`GUIDE TICKET DEBUG: [getGuideTicketType] Guide ${guide.name} needs adult ticket`);
    return 'adult'; // Needs an adult ticket
  } else if (guide.guideType === 'GA Free') {
    console.log(`GUIDE TICKET DEBUG: [getGuideTicketType] Guide ${guide.name} needs child ticket`);
    return 'child'; // Needs a child ticket
  } else if (guide.guideType === 'GC') {
    console.log(`GUIDE TICKET DEBUG: [getGuideTicketType] Guide ${guide.name} needs no ticket (GC guide)`);
    return null; // No ticket needed
  } else {
    console.log(`GUIDE TICKET DEBUG: [getGuideTicketType] Guide ${guide.name} (${guide.guideType}) needs no ticket (unknown type)`);
    return null; // No ticket needed
  }
}
