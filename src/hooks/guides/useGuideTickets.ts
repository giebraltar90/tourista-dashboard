
import { GuideInfo } from '@/types/ventrata';

/**
 * Determines if a guide needs a ticket based on guide type and location
 */
export const doesGuideNeedTicket = (
  guideInfo: GuideInfo | null, 
  location: string = ''
): boolean => {
  // Only need tickets for Versailles and Montmartre
  const requiresTickets = 
    location?.toLowerCase().includes('versailles') || 
    location?.toLowerCase().includes('montmartre');
  
  console.log(`🎫 [doesGuideNeedTicket] Location "${location}", requires tickets: ${requiresTickets}`);
    
  if (!requiresTickets) {
    console.log(`🎫 [doesGuideNeedTicket] Location "${location}" doesn't require guide tickets`);
    return false;
  }
  
  // No guide info, no ticket
  if (!guideInfo) {
    console.log('🎫 [doesGuideNeedTicket] No guide info, no ticket needed');
    return false;
  }

  console.log(`🎫 [doesGuideNeedTicket] Guide info:`, {
    guideName: guideInfo.name,
    guideType: guideInfo.guideType,
    location: location
  });
  
  // Check guide type
  const guideType = guideInfo?.guideType || '';
  
  // GC guides don't need tickets
  if (guideType === 'GC') {
    console.log(`🎫 [doesGuideNeedTicket] Guide with type GC doesn't need a ticket`);
    return false;
  }
  
  // GA Ticket and GA Free guides need tickets
  if (guideType === 'GA Ticket' || guideType === 'GA Free') {
    console.log(`🎫 [doesGuideNeedTicket] Guide with type ${guideType} needs a ticket`);
    return true;
  }
  
  // Default assumption: guide needs a ticket if we can't determine
  console.log(`🎫 [doesGuideNeedTicket] Guide with unknown type "${guideType}" defaulting to needing a ticket`);
  return true;
};

/**
 * Get the type of ticket a guide needs (adult or child)
 */
export const getGuideTicketType = (guideInfo: GuideInfo | null): 'adult' | 'child' | null => {
  // No guide info, no ticket
  if (!guideInfo) {
    console.log(`🎫 [getGuideTicketType] No guide info, no ticket type needed`);
    return null;
  }
  
  // Check guide type
  const guideType = guideInfo?.guideType || '';
  console.log(`🎫 [getGuideTicketType] Determining ticket type for guide with type: ${guideType}`);
  
  // GC guides don't need tickets
  if (guideType === 'GC') {
    console.log(`🎫 [getGuideTicketType] Guide with type GC doesn't need a ticket`);
    return null;
  }
  
  // GA Ticket guides need adult tickets
  if (guideType === 'GA Ticket') {
    console.log(`🎫 [getGuideTicketType] Guide with type GA Ticket needs adult ticket`);
    return 'adult';
  }
  
  // GA Free guides need child tickets
  if (guideType === 'GA Free') {
    console.log(`🎫 [getGuideTicketType] Guide with type GA Free needs child ticket`);
    return 'child';
  }
  
  // Default to adult ticket if we can't determine
  console.log(`🎫 [getGuideTicketType] Guide with unknown type "${guideType}" defaulting to adult ticket`);
  return 'adult';
};
