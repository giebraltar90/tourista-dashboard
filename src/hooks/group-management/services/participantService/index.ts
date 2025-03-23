import { logger } from "@/utils/logger";

/**
 * Formats participant count for display, optionally showing child count
 */
export const formatParticipantCount = (totalCount: number, childCount: number = 0): string => {
  logger.debug(`PARTICIPANTS DEBUG: formatParticipantCount called with totalCount=${totalCount}, childCount=${childCount}`);
  
  // Calculate adult count
  const adultCount = totalCount - childCount;
  
  // If there are children, format as adults+children
  if (childCount > 0) {
    logger.debug(`PARTICIPANTS DEBUG: Formatting as adults+children: ${adultCount}+${childCount}`);
    return `${adultCount}+${childCount}`;
  }
  
  // Otherwise just show total
  logger.debug(`PARTICIPANTS DEBUG: Formatting as just total: ${totalCount}`);
  return `${totalCount}`;
};

/**
 * Validates a participant object
 */
export const validateParticipant = (participant: any): boolean => {
  // Basic validation
  if (!participant) return false;
  
  // Must have at least ID or name
  if (!participant.id && !participant.name) return false;
  
  // If count is present, must be a positive number
  if (participant.count !== undefined && (typeof participant.count !== 'number' || participant.count < 1)) {
    return false;
  }
  
  // If childCount is present, must be a non-negative number and less than or equal to count
  if (participant.childCount !== undefined) {
    if (typeof participant.childCount !== 'number' || participant.childCount < 0) {
      return false;
    }
    
    const count = participant.count || 1;
    if (participant.childCount > count) {
      return false;
    }
  }
  
  return true;
};

/**
 * Normalizes participant data
 */
export const normalizeParticipant = (participant: any): any => {
  if (!participant) return null;
  
  return {
    id: participant.id,
    name: participant.name || 'Unknown Participant',
    count: participant.count || 1,
    childCount: participant.childCount || 0,
    group_id: participant.group_id,
    bookingRef: participant.bookingRef || participant.booking_ref || 'Unknown'
  };
};
