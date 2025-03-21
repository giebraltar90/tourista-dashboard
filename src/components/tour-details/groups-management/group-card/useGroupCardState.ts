
import { useState, useEffect, useCallback } from "react";
import { VentrataParticipant } from "@/types/ventrata";
import { formatParticipantCount } from "@/hooks/group-management/services/participantService";

/**
 * Custom hook to manage group card state
 */
export const useGroupCardState = (
  participants: VentrataParticipant[] | undefined,
  groupId: string,
  groupName: string,
  groupIndex: number,
  size?: number,
  childCount?: number,
  onRefreshParticipants?: () => void
) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localParticipants, setLocalParticipants] = useState<VentrataParticipant[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Initialize local participants state
  useEffect(() => {
    console.log(`GROUP CARD STATE: Setting participants for ${groupName}:`, {
      rawParticipants: participants,
      hasParticipantsArray: Array.isArray(participants),
      participantsLength: Array.isArray(participants) ? participants.length : 0,
      size,
      childCount
    });
    
    if (Array.isArray(participants) && participants.length > 0) {
      setLocalParticipants(participants);
    } else {
      // If no participants are available, set an empty array
      setLocalParticipants([]);
    }
  }, [participants, groupId, groupName, size, childCount]);
  
  // Handle refreshing participants
  const handleRefreshParticipants = useCallback(() => {
    if (!onRefreshParticipants) return;
    
    console.log(`GROUP CARD STATE: Refreshing participants for ${groupName} (${groupId})`);
    setIsRefreshing(true);
    
    // Call the refresh function
    onRefreshParticipants();
    
    // Set a timeout to remove the refreshing state
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  }, [onRefreshParticipants, groupId, groupName]);
  
  // Calculate totals from participants
  let totalParticipants = 0;
  let childCount1 = 0;
  
  if (Array.isArray(localParticipants) && localParticipants.length > 0) {
    // Count directly from participants array
    for (const participant of localParticipants) {
      totalParticipants += participant.count || 1;
      childCount1 += participant.childCount || 0;
    }
    
    console.log(`GROUP CARD STATE: Calculated from participants for ${groupName}:`, {
      totalParticipants,
      childCount: childCount1,
      participantsCount: localParticipants.length
    });
  } else if (typeof size === 'number' && size > 0) {
    // Fallback to size property if provided and we have no participants
    // This will be removed in the UI with a message to refresh
    totalParticipants = 0;
    childCount1 = 0;
    
    console.log(`GROUP CARD STATE: No participants for ${groupName}, database size: ${size}`);
  }
  
  // Calculate adult count
  const adultCount = Math.max(0, totalParticipants - childCount1);
  
  // Format the participant count for display
  const displayParticipants = formatParticipantCount(totalParticipants, childCount1);
  
  console.log(`GROUP CARD STATE: Final calculations for ${groupName}:`, {
    totalParticipants,
    childCount: childCount1,
    adultCount,
    displayParticipants,
    rawParticipants: Array.isArray(participants) ? participants.length : 0,
    visibleParticipants: localParticipants.length
  });
  
  return {
    isExpanded,
    setIsExpanded,
    localParticipants,
    isRefreshing,
    handleRefreshParticipants,
    totalParticipants,
    childCount: childCount1,
    adultCount,
    displayParticipants
  };
};
