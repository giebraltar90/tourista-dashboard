
import { useCallback, useRef, useEffect } from "react";
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
  
  // Add refs for debouncing and tracking refreshes
  const refreshTimeoutRef = useRef<number | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);
  
  // Auto-refresh when tourId changes, but only once
  useEffect(() => {
    if (tourId && isInitialLoadRef.current) {
      console.log(`PARTICIPANTS DEBUG: Initial load for tour ${tourId}`);
      
      // Mark initial load as complete
      isInitialLoadRef.current = false;
      
      // Set a short delay to allow other operations to complete
      const timer = window.setTimeout(() => {
        console.log(`PARTICIPANTS DEBUG: Executing delayed initial load for tour ${tourId}`);
        loadParticipants(tourId);
        // Update last refresh time
        lastRefreshTimeRef.current = Date.now();
      }, 500);
      
      return () => window.clearTimeout(timer);
    }
  }, [tourId]);
  
  // Wrapper for loadParticipants to include setLocalTourGroups
  const loadParticipants = useCallback((tourId: string) => {
    console.log(`PARTICIPANTS DEBUG: Loading participants for tour ${tourId}`);
    
    // Prevent too frequent refreshes (minimum 5 seconds between refreshes)
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
    if (timeSinceLastRefresh < 5000 && lastRefreshTimeRef.current > 0) {
      console.log(`PARTICIPANTS DEBUG: Skipping refresh, too soon (${timeSinceLastRefresh}ms since last refresh)`);
      return;
    }
    
    return loadParticipantsInner(tourId, (loadedGroups) => {
      console.log(`PARTICIPANTS DEBUG: Participants loaded, processing groups:`, loadedGroups);
      
      // Ensure we received an array of groups
      if (!Array.isArray(loadedGroups)) {
        console.error("PARTICIPANTS DEBUG: Invalid groups data received:", loadedGroups);
        return;
      }
      
      // Ensure each group has a participants array and entryTime
      const processedGroups = loadedGroups.map(group => ({
        ...group,
        entryTime: group.entryTime || "9:00", // Ensure entryTime exists
        participants: Array.isArray(group.participants) ? group.participants : []
      }));

      console.log(`PARTICIPANTS DEBUG: Processed groups:`, 
        processedGroups.map(g => ({
          id: g.id,
          name: g.name || 'Unnamed',
          entryTime: g.entryTime,
          size: g.size,
          childCount: g.childCount,
          participantsCount: g.participants?.length || 0
        }))
      );
      
      // Set the groups directly without any internal setTimeout
      setLocalTourGroups(processedGroups);
      
      // Update the last refresh time
      lastRefreshTimeRef.current = Date.now();
      
      // Clear any existing recalculation timeout
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      
      // Perform a single recalculation after a short delay
      refreshTimeoutRef.current = window.setTimeout(() => {
        // Get the recalculated groups
        const updatedGroups = recalculateGroupSizes();
        
        if (Array.isArray(updatedGroups)) {
          console.log(`PARTICIPANTS DEBUG: Final recalculated groups:`, 
            updatedGroups.map(g => ({
              id: g.id,
              name: g.name || 'Unnamed',
              entryTime: g.entryTime,
              size: g.size,
              childCount: g.childCount,
              participantsCount: g.participants?.length || 0
            }))
          );
        }
        
        refreshTimeoutRef.current = null;
      }, 200);
    });
  }, [loadParticipantsInner, setLocalTourGroups, recalculateGroupSizes]);

  // Add a refresh function with improved debounce to manually trigger participant loading
  const refreshParticipants = useCallback(() => {
    if (!tourId) return;
    
    // Prevent rapid consecutive refreshes with a minimum time between calls
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
    
    if (timeSinceLastRefresh < 5000 && lastRefreshTimeRef.current > 0) {
      console.log(`PARTICIPANTS DEBUG: Skipping manual refresh, too soon (${timeSinceLastRefresh}ms since last refresh)`);
      return;
    }
    
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current);
    }
    
    console.log(`PARTICIPANTS DEBUG: Manually refreshing participants for tour ${tourId}`);
    toast.info("Refreshing participants...");
    
    // Set a short timeout to debounce multiple clicks
    refreshTimeoutRef.current = window.setTimeout(() => {
      loadParticipants(tourId);
      refreshTimeoutRef.current = null;
    }, 100);
  }, [tourId, loadParticipants]);

  return {
    loadParticipants,
    refreshParticipants,
    isLoadingParticipants
  };
};
