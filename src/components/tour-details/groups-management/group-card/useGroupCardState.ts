
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
    if (Array.isArray(participants)) {
      // Filter out placeholder participants for display, but include in calculations
      const displayParticipants = participants.filter(p => 
        !String(p.id).startsWith('placeholder-') && !String(p.id).startsWith('fallback-')
      );
      
      console.log(`GROUP CARD STATE: Setting local participants for ${groupName}:`, {
        groupId,
        rawParticipantsCount: participants.length,
        displayParticipantsCount: displayParticipants.length,
        hasPlaceholders: participants.length !== displayParticipants.length
      });
      
      setLocalParticipants(displayParticipants);
    } else {
      setLocalParticipants([]);
    }
  }, [participants, groupId, groupName]);
  
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
  
  // Calculate totals from all participants, including placeholders
  let totalParticipants = 0;
  let childCount1 = 0;
  
  if (Array.isArray(participants) && participants.length > 0) {
    // Count directly from participants array
    for (const participant of participants) {
      totalParticipants += participant.count || 1;
      childCount1 += participant.childCount || 0;
    }
  } else if (typeof size === 'number' && size > 0) {
    // Fallback to size property if provided
    totalParticipants = size;
    childCount1 = typeof childCount === 'number' ? childCount : 0;
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
