
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
  // IMPORTANT: Always start expanded by default to show participants immediately
  const [isExpanded, setIsExpanded] = useState(true);
  const [localParticipants, setLocalParticipants] = useState<VentrataParticipant[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Debug log on initial render
  useEffect(() => {
    console.log(`DATABASE DEBUG: useGroupCardState initialized for group ${groupName} (ID: ${groupId})`, {
      hasParticipantsArray: Array.isArray(participants),
      participantsLength: Array.isArray(participants) ? participants.length : 0,
      firstParticipant: Array.isArray(participants) && participants.length > 0 ? participants[0] : null,
      isExpandedInitialValue: true, // Confirm that we're initializing with expanded state
      groupIndex
    });
  }, []);
  
  // Initialize local participants state
  useEffect(() => {
    console.log(`DATABASE DEBUG: Setting participants for ${groupName} (${groupId}):`, {
      rawParticipants: participants,
      hasParticipantsArray: Array.isArray(participants),
      participantsLength: Array.isArray(participants) ? participants.length : 0,
      size,
      childCount,
      isExpanded // Log current expanded state
    });
    
    if (Array.isArray(participants) && participants.length > 0) {
      console.log(`DATABASE DEBUG: Using actual participants for ${groupName}`);
      setLocalParticipants(participants);
    } else {
      // If no participants are available, set an empty array - do NOT create placeholders
      console.log(`DATABASE DEBUG: No participants available for ${groupName}, using empty array`);
      setLocalParticipants([]);
    }
  }, [participants, groupId, groupName, size, childCount]);
  
  // Handle refreshing participants
  const handleRefreshParticipants = useCallback(() => {
    if (!onRefreshParticipants) {
      console.log(`DATABASE DEBUG: No refresh function available for ${groupName}`);
      return;
    }
    
    console.log(`DATABASE DEBUG: Refreshing participants for ${groupName} (${groupId})`);
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
    
    console.log(`DATABASE DEBUG: Calculated from participants for ${groupName}:`, {
      totalParticipants,
      childCount: childCount1,
      participantsCount: localParticipants.length
    });
  } else {
    // We don't use placeholders anymore - set to 0
    totalParticipants = 0;
    childCount1 = 0;
    
    console.log(`DATABASE DEBUG: No participants for ${groupName}, showing 0`);
  }
  
  // Calculate adult count
  const adultCount = Math.max(0, totalParticipants - childCount1);
  
  // Format the participant count for display
  const displayParticipants = formatParticipantCount(totalParticipants, childCount1);
  
  console.log(`DATABASE DEBUG: Final calculations for ${groupName}:`, {
    totalParticipants,
    childCount: childCount1,
    adultCount,
    displayParticipants,
    rawParticipants: Array.isArray(participants) ? participants.length : 0,
    visibleParticipants: localParticipants.length,
    isExpanded // Log the current expanded state
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
