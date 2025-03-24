
import { useState, useCallback, useRef } from "react";
import { VentrataTourGroup } from "@/types/ventrata";
import { loadParticipantsData } from "@/services/api/participants/participantDbService";
import { toast } from "sonner";
import { supabaseWithRetry } from "@/integrations/supabase/client";

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
  const lastToastTime = useRef(Date.now());
  const initialLoadComplete = useRef(false);
  const loadOperationInProgress = useRef(false);
  
  /**
   * Load participants for a tour with improved error handling
   */
  const loadParticipants = useCallback(async (tourIdParam: string = tourId, showToast: boolean = false) => {
    const usedTourId = tourIdParam || tourId;
    if (!usedTourId) {
      console.error("DATABASE DEBUG: No tour ID provided for loading participants");
      return;
    }
    
    // Prevent concurrent refreshes
    if (loadOperationInProgress.current) {
      console.log("DATABASE DEBUG: Skipping participant load - operation already in progress");
      return;
    }
    
    // Prevent frequent refreshes - add a time-based guard
    const now = Date.now();
    const timeSinceLastLoad = now - lastToastTime.current;
    if (timeSinceLastLoad < 2000 && initialLoadComplete.current) {
      console.log("DATABASE DEBUG: Skipping too frequent participant refresh");
      return;
    }
    
    console.log("DATABASE DEBUG: loadParticipants called for tourId:", usedTourId);
    setIsLoadingParticipants(true);
    loadOperationInProgress.current = true;
    
    try {
      // Use retry mechanism for more reliable access
      const result = await supabaseWithRetry(async () => {
        return await loadParticipantsData(usedTourId);
      });
      
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
          
          // Show success toast if needed and not too frequent
          const isInitialLoad = !initialLoadComplete.current;
          if (showToast && !isInitialLoad && timeSinceLastLoad > 5000) {
            toast.success("Participants loaded successfully");
            lastToastTime.current = now;
          }
          
          // Mark initial load as complete
          initialLoadComplete.current = true;
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
      if (showToast && !toast.isActive('participants-error')) {
        toast.error("Error loading participants", {
          id: 'participants-error',
          duration: 3000
        });
      }
    } finally {
      setIsLoadingParticipants(false);
      loadOperationInProgress.current = false;
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
