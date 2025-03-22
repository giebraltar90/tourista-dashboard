
import { updateQueryCache } from './coreUpdateService';
import { QueryClient } from "@tanstack/react-query";

/**
 * Logs participant preservation details for a specific group
 */
export const logParticipantPreservation = (
  groupId: string, 
  currentGroup: any, 
  updatedGroup: any
): void => {
  console.log(`PARTICIPANTS PRESERVATION: Optimistically updating group ${groupId}:`, {
    currentParticipantsCount: Array.isArray(currentGroup.participants) 
      ? currentGroup.participants.length 
      : 0,
    updatedParticipantsCount: Array.isArray(updatedGroup.participants) 
      ? updatedGroup.participants.length 
      : 0,
    currentSize: currentGroup.size,
    updatedSize: updatedGroup.size,
    currentChildCount: currentGroup.childCount,
    updatedChildCount: updatedGroup.childCount
  });
};

/**
 * Determines whether participants should be preserved during an update
 */
export const shouldPreserveParticipants = (currentGroup: any, updatedGroup: any): boolean => {
  return Array.isArray(currentGroup.participants) && 
    currentGroup.participants.length > 0 &&
    (!Array.isArray(updatedGroup.participants) || updatedGroup.participants.length === 0);
};

/**
 * Merges a current group with an updated group, preserving participants when needed
 */
export const mergeGroupWithParticipantPreservation = (
  currentGroup: any, 
  updatedGroup: any
): any => {
  // Create merged group with updated properties
  const mergedGroup = {
    ...currentGroup,
    ...updatedGroup
  };
  
  // Explicitly preserve participants if needed
  if (shouldPreserveParticipants(currentGroup, updatedGroup)) {
    console.log("PARTICIPANTS PRESERVATION: Preserving participants that would be lost in update");
    mergedGroup.participants = currentGroup.participants;
  }
  
  console.log(`PARTICIPANTS PRESERVATION: Group after optimistic update:`, {
    id: mergedGroup.id,
    name: mergedGroup.name,
    participantsCount: Array.isArray(mergedGroup.participants) 
      ? mergedGroup.participants.length 
      : 0,
    size: mergedGroup.size,
    childCount: mergedGroup.childCount
  });
  
  return mergedGroup;
};

/**
 * Updates tour groups by matching IDs and preserving participants
 */
export const updateTourGroupsById = (newData: any, updatedGroups: any[]): any => {
  if (Array.isArray(updatedGroups) && Array.isArray(newData.tourGroups)) {
    updatedGroups.forEach(updatedGroup => {
      // Find the matching group by ID and update it
      const groupIndex = newData.tourGroups.findIndex((g: any) => g.id === updatedGroup.id);
      if (groupIndex !== -1) {
        const currentGroup = newData.tourGroups[groupIndex];
        
        // Log participant preservation info
        logParticipantPreservation(updatedGroup.id, currentGroup, updatedGroup);
        
        // Update the group in the cache with participant preservation
        newData.tourGroups[groupIndex] = mergeGroupWithParticipantPreservation(
          currentGroup, 
          updatedGroup
        );
      }
    });
  }
  
  console.log("PARTICIPANTS PRESERVATION: Optimistic update applied to tour data:", {
    tourId: newData.id,
    groupsCount: newData.tourGroups?.length || 0,
    groups: newData.tourGroups?.map((g: any) => ({
      id: g.id,
      name: g.name,
      participantsCount: Array.isArray(g.participants) ? g.participants.length : 0,
      size: g.size,
      childCount: g.childCount
    }))
  });
  
  return newData;
};
