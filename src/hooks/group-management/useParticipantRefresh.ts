
import { useCallback } from "react";
import { VentrataTourGroup } from "@/types/ventrata";
import { toast } from "sonner";
import { useParticipantLoading } from "./useParticipantLoading";

/**
 * Hook for refreshing participant data and calculations
 */
export const useParticipantRefresh = (
  tourId: string | undefined,
  localTourGroups: VentrataTourGroup[],
  setLocalTourGroups: (groups: VentrataTourGroup[]) => void,
  recalculateGroupSizes: () => VentrataTourGroup[]
) => {
  // Get participant loading capabilities
  const { loadParticipants: loadParticipantsInner, isLoading: isLoadingParticipants } = useParticipantLoading();
  
  // Wrapper for loadParticipants to include setLocalTourGroups
  const loadParticipants = useCallback((tourId: string) => {
    console.log(`PARTICIPANTS DEBUG: Loading participants for tour ${tourId}`);
    return loadParticipantsInner(tourId, (groups: VentrataTourGroup[]) => {
      console.log(`PARTICIPANTS DEBUG: Participants loaded, processing ${groups.length} groups`);
      
      // Ensure each group has a participants array
      const processedGroups = groups.map(group => ({
        ...group,
        participants: Array.isArray(group.participants) ? group.participants : []
      }));
      
      // Set the groups and trigger size recalculation
      setLocalTourGroups(processedGroups);
      setTimeout(() => {
        recalculateGroupSizes();
      }, 100);
    });
  }, [loadParticipantsInner, setLocalTourGroups, recalculateGroupSizes]);

  // Add a refresh function to manually trigger participant loading
  const refreshParticipants = useCallback(() => {
    if (!tourId) return;
    
    console.log(`PARTICIPANTS DEBUG: Manually refreshing participants for tour ${tourId}`);
    toast.info("Refreshing participants...");
    loadParticipants(tourId);
    
    // Force recalculation of all group sizes after loading
    setTimeout(() => {
      recalculateGroupSizes();
    }, 500);
  }, [tourId, loadParticipants, recalculateGroupSizes]);

  return {
    loadParticipants,
    refreshParticipants,
    isLoadingParticipants
  };
};
