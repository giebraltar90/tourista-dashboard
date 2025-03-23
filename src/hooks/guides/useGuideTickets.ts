
import { GuideInfo } from '@/types/ventrata';
import { logger } from '@/utils/logger';
import { locationRequiresGuideTickets } from '@/hooks/tour-details/services/ticket-calculation/locationUtils';
import { guideTypeNeedsTicket, determineTicketTypeForGuide } from '@/hooks/tour-details/services/ticket-calculation/guideTypeUtils';

/**
 * Determines if a guide needs a ticket based on guide type and location
 */
export const doesGuideNeedTicket = (
  guideInfo: GuideInfo | null, 
  location: string = ''
): boolean => {
  // Check if location requires tickets
  const requiresTickets = locationRequiresGuideTickets(location);
  
  logger.debug(`🎫 [doesGuideNeedTicket] Location "${location}", requires tickets: ${requiresTickets}`);
    
  if (!requiresTickets) {
    logger.debug(`🎫 [doesGuideNeedTicket] Location "${location}" doesn't require guide tickets`);
    return false;
  }
  
  // No guide info, no ticket
  if (!guideInfo) {
    logger.debug('🎫 [doesGuideNeedTicket] No guide info, no ticket needed');
    return false;
  }

  logger.debug(`🎫 [doesGuideNeedTicket] Guide info:`, {
    guideName: guideInfo.name,
    guideType: guideInfo.guideType,
    location: location
  });
  
  // Use our modular utility function to check if guide type needs ticket
  const needsTicket = guideTypeNeedsTicket(guideInfo.guideType);
  
  if (needsTicket) {
    logger.debug(`🎫 [doesGuideNeedTicket] Guide with type ${guideInfo.guideType} needs a ticket`);
  } else {
    logger.debug(`🎫 [doesGuideNeedTicket] Guide with type ${guideInfo.guideType} doesn't need a ticket`);
  }
  
  return needsTicket;
};

/**
 * Get the type of ticket a guide needs (adult or child)
 */
export const getGuideTicketType = (guideInfo: GuideInfo | null): 'adult' | 'child' | null => {
  // No guide info, no ticket
  if (!guideInfo) {
    logger.debug(`🎫 [getGuideTicketType] No guide info, no ticket type needed`);
    return null;
  }
  
  // Use our modular utility function to determine ticket type
  const ticketType = determineTicketTypeForGuide(guideInfo.guideType);
  
  logger.debug(`🎫 [getGuideTicketType] Guide ${guideInfo.name} with type ${guideInfo.guideType} needs ${ticketType ? `a ${ticketType} ticket` : 'no ticket'}`);
  
  return ticketType;
};
