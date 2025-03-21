
import { useState, useCallback, useRef } from "react";
import { VentrataTourGroup } from "@/types/ventrata";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { 
  loadParticipantsData 
} from "@/services/api/participants/participantDbService";
import { 
  createGroupsWithParticipants,
  logGroupsWithParticipants 
} from "@/services/api/participants/participantDataUtils";

/**
 * Hook to handle loading participants for a tour
 */
export const useParticipantLoading = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const lastToastTime = useRef(0);
  const toastIdRef = useRef<string | number | null>(null);
  
  // Load participants data from Supabase
  const loadParticipants = useCallback(async (
    tourId: string,
    onParticipantsLoaded: (groups: VentrataTourGroup[]) => void,
    showSuccessToast = false // Add parameter to control success toast
  ) => {
    console.log("DATABASE DEBUG: loadParticipants called for tourId:", tourId);
    
    // Prevent loading if already in progress
    if (isLoading) {
      console.log("DATABASE DEBUG: Skipping loadParticipants, already in progress");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Load all participant data with error handling
      const { success, groups, participants, error } = await loadParticipantsData(tourId);
      
      if (!success) {
        console.error("DATABASE DEBUG: Failed to load participant data:", error);
        setIsLoading(false);
        return;
      }
      
      if (!groups || groups.length === 0) {
        console.log("DATABASE DEBUG: No groups found for tour ID:", tourId);
        toast.warning("No groups found for this tour");
        setIsLoading(false);
        return;
      }
      
      // Create an array of groups with their participants
      const groupsWithParticipants = createGroupsWithParticipants(groups, participants || []);
      
      // Log the final data
      logGroupsWithParticipants(groupsWithParticipants);
      
      // Call the callback with the groups data
      onParticipantsLoaded(groupsWithParticipants);
      
      // Invalidate queries to force UI updates, but manage toast notifications carefully
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
        window.dispatchEvent(new CustomEvent('participants-loaded'));
        
        // Only show success toast if requested AND enough time has passed since last toast
        const now = Date.now();
        if (showSuccessToast && now - lastToastTime.current > 3000) {
          // Dismiss any existing toasts first
          if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
          }
          
          // Show new toast and store its ID
          toastIdRef.current = toast.success("Participant data refreshed");
          lastToastTime.current = now;
        }
      }, 500);
    } catch (error) {
      console.error("DATABASE DEBUG: Exception in loadParticipants:", error);
      toast.error("Failed to load participants");
    } finally {
      setIsLoading(false);
    }
  }, [queryClient, isLoading]);
  
  return { loadParticipants, isLoading };
};
