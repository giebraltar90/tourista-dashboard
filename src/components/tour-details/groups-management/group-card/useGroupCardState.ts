
import { useState, useEffect, useCallback } from "react";
import { VentrataParticipant } from "@/types/ventrata";
import { EventEmitter } from "@/utils/eventEmitter";
import { formatParticipantCount } from "@/hooks/group-management/services/participantService/formatParticipantService";

export const useGroupCardState = (
  initialParticipants: VentrataParticipant[] | undefined,
  groupId: string,
  groupName: string,
  groupIndex: number,
  initialSize: number = 0,
  initialChildCount: number = 0,
  onRefreshParticipants?: () => void
) => {
  // State for whether the group details are expanded
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  
  // State for participants in this group
  const [localParticipants, setLocalParticipants] = useState<VentrataParticipant[]>(
    Array.isArray(initialParticipants) ? [...initialParticipants] : []
  );
  
  // State for refreshing status
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Update local participants when initialParticipants change
  useEffect(() => {
    if (Array.isArray(initialParticipants)) {
      setLocalParticipants([...initialParticipants]);
      
      // Emit event when participants change
      const tourId = groupId.split('-')[0]; // Extract tour ID from group ID if needed
      if (tourId) {
        EventEmitter.emit(`participant-change:${tourId}`);
      }
    }
  }, [initialParticipants, groupId]);
  
  // Handler for refreshing participants
  const handleRefreshParticipants = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      if (typeof onRefreshParticipants === 'function') {
        await onRefreshParticipants();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefreshParticipants]);
  
  // Calculate counts from participants
  const totalParticipants = localParticipants.reduce(
    (total, p) => total + (p.count || 1), 
    0
  );
  
  const childCount = localParticipants.reduce(
    (total, p) => total + (p.childCount || 0), 
    0
  );
  
  const adultCount = totalParticipants - childCount;
  
  // For display: prefer calculated values over initial values and format using our standard function
  const calculatedTotal = totalParticipants > 0 ? totalParticipants : (initialSize || 0);
  const calculatedChildCount = childCount > 0 ? childCount : (initialChildCount || 0);
  
  // Format the display string in our standard format: "adult + child"
  const displayParticipants: string = formatParticipantCount(calculatedTotal, calculatedChildCount);
  
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
