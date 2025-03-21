
import { useState, useEffect, useRef } from "react";
import { VentrataParticipant } from "@/types/ventrata";
import { formatParticipantCount } from "@/hooks/group-management/services/participantService";

export const useGroupCardState = (
  rawParticipants: VentrataParticipant[] | undefined, 
  groupId: string,
  groupName: string,
  groupIndex: number,
  groupSize: number,
  groupChildCount: number,
  onRefreshParticipants?: () => void
) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localParticipants, setLocalParticipants] = useState<VentrataParticipant[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimeoutRef = useRef<number | null>(null);

  // Update local participants when the group's participants change
  useEffect(() => {
    console.log(`PARTICIPANTS DEBUG: GroupCard[${groupIndex}] updating participants:`, {
      groupId,
      groupName: groupName || `Group ${groupIndex + 1}`,
      hasParticipantsArray: Array.isArray(rawParticipants),
      participantsLength: Array.isArray(rawParticipants) ? rawParticipants.length : 0,
      rawParticipants: Array.isArray(rawParticipants) 
        ? rawParticipants.map(p => ({
            id: p.id,
            name: p.name, 
            count: p.count || 1, 
            childCount: p.childCount || 0
          })) 
        : []
    });
    
    if (Array.isArray(rawParticipants)) {
      setLocalParticipants(rawParticipants);
    } else {
      // Ensure we always have an array, even if empty
      setLocalParticipants([]);
    }
  }, [rawParticipants, groupIndex, groupId, groupName]);

  // Force refresh when needed to repopulate the participants list - but with debounce
  useEffect(() => {
    // Only trigger a refresh if we have a mismatch - group has size but no participants
    const shouldRefresh = localParticipants.length === 0 && groupSize > 0 && onRefreshParticipants;
    
    if (shouldRefresh) {
      console.log(`PARTICIPANTS DEBUG: GroupCard[${groupIndex}] has participants mismatch, triggering refresh.`);
      
      // Clear any existing timeout
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
      
      // Debounce the refresh to avoid multiple calls
      refreshTimeoutRef.current = window.setTimeout(() => {
        if (onRefreshParticipants) {
          onRefreshParticipants();
        }
        refreshTimeoutRef.current = null;
      }, 5000); // Only refresh after 5 seconds of no changes
      
      return () => {
        if (refreshTimeoutRef.current) {
          window.clearTimeout(refreshTimeoutRef.current);
        }
      };
    }
  }, [localParticipants.length, groupSize, groupIndex, onRefreshParticipants]);

  const handleRefreshParticipants = () => {
    if (onRefreshParticipants) {
      // Prevent multiple refreshes
      if (isRefreshing) return;
      
      setIsRefreshing(true);
      onRefreshParticipants();
      
      // Reset refresh state after a delay
      window.setTimeout(() => setIsRefreshing(false), 2000);
    }
  };

  // Calculate counts directly from localParticipants array
  let totalParticipants = 0;
  let childCount = 0;
  
  if (Array.isArray(localParticipants) && localParticipants.length > 0) {
    for (const participant of localParticipants) {
      totalParticipants += participant.count || 1;
      childCount += participant.childCount || 0;
    }
  } else {
    // Fall back to group.size if no participants
    totalParticipants = groupSize || 0;
    childCount = groupChildCount || 0;
  }
  
  const adultCount = totalParticipants - childCount;
  const displayParticipants = formatParticipantCount(totalParticipants, childCount);

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
