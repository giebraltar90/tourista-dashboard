
import { GuideInfo } from '@/types/ventrata';

/**
 * Determines if a guide name is Sophie Miller
 */
export const isSophieMiller = (name: string = ''): boolean => {
  return name?.toLowerCase().includes('sophie miller');
};

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
    
  if (!requiresTickets) {
    console.log(`🎫 [doesGuideNeedTicket] Location "${location}" doesn't require guide tickets`);
    return false;
  }
  
  // No guide info, no ticket
  if (!guideInfo) {
    console.log('🎫 [doesGuideNeedTicket] No guide info, no ticket needed');
    return false;
  }
  
  // Check if guide is Sophie Miller (always GC, never needs ticket)
  const name = guideInfo?.name || '';
  if (isSophieMiller(name)) {
    console.log('🎫 [doesGuideNeedTicket] Sophie Miller (GC) never needs a ticket');
    return false;
  }
  
  // Check guide type
  const guideType = guideInfo?.guideType || '';
  
  // GC guides don't need tickets
  if (guideType === 'GC') {
    console.log(`🎫 [doesGuideNeedTicket] ${name} (GC) doesn't need a ticket`);
    return false;
  }
  
  // GA Ticket and GA Free guides need tickets
  if (guideType === 'GA Ticket' || guideType === 'GA Free') {
    console.log(`🎫 [doesGuideNeedTicket] ${name} (${guideType}) needs a ticket`);
    return true;
  }
  
  // Default assumption: guide needs a ticket if we can't determine
  console.log(`🎫 [doesGuideNeedTicket] ${name} (unknown type "${guideType}") defaulting to needing a ticket`);
  return true;
};

/**
 * Get the type of ticket a guide needs (adult or child)
 */
export const getGuideTicketType = (guideInfo: GuideInfo | null): 'adult' | 'child' | null => {
  // No guide info, no ticket
  if (!guideInfo) {
    return null;
  }
  
  // Check if guide is Sophie Miller (always GC, never needs ticket)
  const name = guideInfo?.name || '';
  if (isSophieMiller(name)) {
    console.log('🎫 [getGuideTicketType] Sophie Miller (GC) never needs a ticket');
    return null;
  }
  
  // Check guide type
  const guideType = guideInfo?.guideType || '';
  
  // GC guides don't need tickets
  if (guideType === 'GC') {
    return null;
  }
  
  // GA Ticket guides need adult tickets
  if (guideType === 'GA Ticket') {
    return 'adult';
  }
  
  // GA Free guides need child tickets
  if (guideType === 'GA Free') {
    return 'child';
  }
  
  // Default to adult ticket if we can't determine
  return 'adult';
};
