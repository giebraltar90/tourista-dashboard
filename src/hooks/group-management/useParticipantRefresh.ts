
import { useCallback, useRef } from "react";
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
  // Add a debounce ref to prevent too frequent refreshes
  const refreshTimeoutRef = useRef<number | null>(null);
  
  // Wrapper for loadParticipants to include setLocalTourGroups
  const loadParticipants = useCallback((tourId: string) => {
    console.log(`PARTICIPANTS DEBUG: Loading participants for tour ${tourId}`);
    return loadParticipantsInner(tourId, (loadedGroups) => {
      console.log(`PARTICIPANTS DEBUG: Participants loaded, processing groups:`, loadedGroups);
      
      // Ensure we received an array of groups
      if (!Array.isArray(loadedGroups)) {
        console.error("PARTICIPANTS DEBUG: Invalid groups data received:", loadedGroups);
        return;
      }
      
      // Ensure each group has a participants array
      const processedGroups = loadedGroups.map(group => ({
        ...group,
        participants: Array.isArray(group.participants) ? group.participants : []
      }));

      console.log(`PARTICIPANTS DEBUG: Processed groups:`, 
        processedGroups.map(g => ({
          id: g.id,
          name: g.name || 'Unnamed',
          size: g.size,
          childCount: g.childCount,
          participantsCount: g.participants?.length || 0,
          participants: g.participants?.map(p => ({
            id: p.id,
            name: p.name,
            count: p.count || 1,
            childCount: p.childCount || 0
          }))
        }))
      );
      
      // Set the groups and trigger size recalculation
      setLocalTourGroups(processedGroups);
      
      // Force a recalculation after a short delay
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = window.setTimeout(() => {
        // Get the recalculated groups directly
        const updatedGroups = recalculateGroupSizes();
        
        if (Array.isArray(updatedGroups)) {
          console.log(`PARTICIPANTS DEBUG: After recalculation, updated groups:`, 
            updatedGroups.map(g => ({
              id: g.id,
              name: g.name || 'Unnamed',
              size: g.size,
              childCount: g.childCount,
              participantsCount: g.participants?.length || 0,
              participants: g.participants?.map(p => ({
                id: p.id,
                name: p.name,
                count: p.count || 1,
                childCount: p.childCount || 0
              }))
            }))
          );
        }
        
        refreshTimeoutRef.current = null;
      }, 300);
    });
  }, [loadParticipantsInner, setLocalTourGroups, recalculateGroupSizes]);

  // Add a refresh function to manually trigger participant loading
  const refreshParticipants = useCallback(() => {
    if (!tourId) return;
    
    // Prevent rapid consecutive refreshes
    if (refreshTimeoutRef.current) {
      console.log("PARTICIPANTS DEBUG: Refresh already in progress, skipping redundant refresh");
      return;
    }
    
    console.log(`PARTICIPANTS DEBUG: Manually refreshing participants for tour ${tourId}`);
    toast.info("Refreshing participants...");
    
    // Set a long debounce to prevent repeated refreshes
    refreshTimeoutRef.current = window.setTimeout(() => {
      loadParticipants(tourId);
      refreshTimeoutRef.current = null;
    }, 300);
  }, [tourId, loadParticipants]);

  return {
    loadParticipants,
    refreshParticipants,
    isLoadingParticipants
  };
};
