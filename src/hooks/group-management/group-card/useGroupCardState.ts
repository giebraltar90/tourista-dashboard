
import { useState, useEffect, useCallback } from "react";
import { VentrataParticipant } from "@/types/ventrata";
import { formatParticipantCount } from "@/hooks/group-management/utils/countingService";
import { logger } from "@/utils/logger";

/**
 * Custom hook to manage state for a group card
 */
export const useGroupCardState = (
  participants: VentrataParticipant[] | undefined,
  groupId: string,
  groupName: string,
  groupIndex: number,
  totalParticipants: number = 0,
  childCount: number = 0,
  onRefreshCallback?: () => void
) => {
  // Start expanded by default
  const [isExpanded, setIsExpanded] = useState(true);
  const [localParticipants, setLocalParticipants] = useState<VentrataParticipant[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Format the participant count for display
  const displayParticipants = formatParticipantCount(totalParticipants, childCount);
  
  // Calculate adult count
  const adultCount = totalParticipants - childCount;
  
  // Log the debug info for group content
  useEffect(() => {
    logger.debug(`DATABASE DEBUG: Calculated from participants for ${groupName}:`, {
      totalParticipants,
      childCount,
      participantsCount: Array.isArray(participants) ? participants.length : 0
    });
    
    // Log formatting
    logger.debug(`PARTICIPANTS DEBUG: formatParticipantCount called with`, {
      totalParticipants,
      childCount
    });
    
    if (childCount > 0) {
      logger.debug(`PARTICIPANTS DEBUG: Formatting as adults+children: ${adultCount}+${childCount}`);
    } else {
      logger.debug(`PARTICIPANTS DEBUG: Formatting as just total: ${totalParticipants}`);
    }
    
    logger.debug(`DATABASE DEBUG: Final calculations for ${groupName}:`, {
      totalParticipants,
      childCount,
      adultCount,
      displayParticipants,
      rawParticipants: Array.isArray(participants) ? participants.length : 0,
      visibleParticipants: Array.isArray(localParticipants) ? localParticipants.length : 0
    });
  }, [groupName, totalParticipants, childCount, adultCount, displayParticipants, participants, localParticipants]);
  
  // Set the local participants from props
  useEffect(() => {
    if (Array.isArray(participants)) {
      setLocalParticipants(participants);
    } else {
      setLocalParticipants([]);
    }
  }, [participants]);
  
  // Handle refreshing participants
  const handleRefreshParticipants = useCallback(() => {
    if (onRefreshCallback) {
      setIsRefreshing(true);
      
      // Call the refresh callback
      onRefreshCallback();
      
      // Set a timeout to end the refreshing state
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1500);
    }
  }, [onRefreshCallback]);
  
  return {
    isExpanded,
    setIsExpanded,
    localParticipants,
    isRefreshing,
    handleRefreshParticipants,
    totalParticipants,
    childCount,
    adultCount,
    displayParticipants
  };
};
