
import { useState, useCallback } from "react";
import { VentrataTourGroup } from "@/types/ventrata";
import { loadParticipantsData } from "@/services/api/participants/participantDbService";
import { toast } from "sonner";

/**
 * Hook for refreshing and loading participants for a tour
 */
export const useParticipantRefresh = (
  tourId: string,
  localTourGroups: VentrataTourGroup[],
  setLocalTourGroups: (groups: VentrataTourGroup[]) => void,
  recalculateGroupSizes: () => void
) => {
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  
  /**
   * Load participants for a tour
   */
  const loadParticipants = useCallback(async (tourIdParam: string = tourId, showToast: boolean = true) => {
    const usedTourId = tourIdParam || tourId;
    if (!usedTourId) {
      console.error("DATABASE DEBUG: No tour ID provided for loading participants");
      return;
    }
    
    console.log("DATABASE DEBUG: loadParticipants called for tourId:", usedTourId);
    setIsLoadingParticipants(true);
    console.log("DATABASE DEBUG: Checking participants table existence");
    
    try {
      const result = await loadParticipantsData(usedTourId);
      
      if (result.success) {
        console.log("DATABASE DEBUG: Loaded participants successfully");
        
        // Update the local tour groups with the participants
        if (result.groups && result.groups.length > 0) {
          const updatedGroups = [...result.groups].map(group => {
            // Find participants for this group
            const groupParticipants = Array.isArray(result.participants) 
              ? result.participants.filter(p => p.group_id === group.id)
              : [];
            
            // Return the updated group
            return {
              ...group,
              guideId: group.guide_id || undefined,
              entryTime: group.entry_time || "",
              childCount: group.child_count || 0,
              participants: groupParticipants.map(p => ({
                id: p.id,
                name: p.name,
                count: p.count,
                childCount: p.child_count || 0,
                bookingRef: p.booking_ref || "",
                groupId: p.group_id
              }))
            };
          });
          
          console.log("DATABASE DEBUG: Updated groups with participants:", updatedGroups);
          setLocalTourGroups(updatedGroups);
          
          // Recalculate group sizes
          recalculateGroupSizes();
          
          // Show success toast if needed
          if (showToast) {
            toast.success("Participants loaded successfully");
          }
        } else {
          console.log("DATABASE DEBUG: No groups returned from loadParticipantsData");
        }
      } else {
        console.error("DATABASE DEBUG: Failed to load participant data:", result.error);
        if (showToast) {
          toast.error(`Failed to load participants: ${result.error}`);
        }
      }
    } catch (error) {
      console.error("DATABASE DEBUG: Error loading participants:", error);
      if (showToast) {
        toast.error("Error loading participants");
      }
    } finally {
      setIsLoadingParticipants(false);
    }
  }, [tourId, setLocalTourGroups, recalculateGroupSizes]);
  
  /**
   * Refresh participants for a tour
   */
  const refreshParticipants = useCallback(() => {
    console.log("DATABASE DEBUG: Refreshing participants for tour:", tourId);
    loadParticipants(tourId, true);
  }, [tourId, loadParticipants]);
  
  return {
    loadParticipants,
    refreshParticipants,
    isLoadingParticipants
  };
};
