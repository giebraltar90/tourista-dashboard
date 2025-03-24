
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase, supabaseWithRetry } from "@/integrations/supabase/client";
import { checkTourExists } from "@/services/api/participants/utils/dbUtils";
import { syncTourGroupSizes } from "./services/participantService/syncService";
import { VentrataTourGroup, VentrataParticipant } from "@/types/ventrata";
import { EventEmitter } from "@/utils/eventEmitter";

const MAX_CONCURRENT_OPERATIONS = 3;
let pendingOperations = 0;

/**
 * Hook for refreshing participant data with improved error handling
 */
export const useParticipantRefresh = (tourId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  
  // Track whether any toast is currently displayed to avoid toast spam
  const [isToastActive, setIsToastActive] = useState(false);
  
  // Function to load participants with retries and better error handling
  const loadParticipants = useCallback(async (groupIds: string[]) => {
    try {
      if (pendingOperations >= MAX_CONCURRENT_OPERATIONS) {
        console.warn("Too many concurrent operations, delaying participant load");
        return [];
      }
      
      pendingOperations++;
      
      // Use retry mechanism for better reliability
      const result = await supabaseWithRetry(async () => {
        const { data, error } = await supabase
          .from('participants')
          .select('*')
          .in('group_id', groupIds);
          
        if (error) throw error;
        return data || [];
      });
      
      return result;
    } catch (err) {
      console.error("DATABASE DEBUG: Failed to load participants:", err);
      throw err;
    } finally {
      pendingOperations--;
    }
  }, []);
  
  // Primary refresh function with improved reliability
  const refreshParticipants = useCallback(async () => {
    if (!tourId) return;
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Show loading toast only if none is active
      if (!isToastActive) {
        setIsToastActive(true);
        toast.loading("Refreshing participant data...");
      }
      
      // First check if tour exists
      const tourCheck = await checkTourExists(tourId);
      if (!tourCheck.exists) {
        setError("Tour not found");
        toast.error("Error: Tour not found");
        setIsToastActive(false);
        return;
      }
      
      // Get all groups for this tour with retry
      const { data: groups, error: groupsError } = await supabaseWithRetry(async () => {
        return await supabase
          .from('tour_groups')
          .select('id')
          .eq('tour_id', tourId);
      });
      
      if (groupsError || !groups) {
        console.error("DATABASE DEBUG: Failed to load tour groups:", groupsError);
        setError(groupsError?.message || "Failed to load tour groups");
        toast.error("Error loading tour groups");
        setIsToastActive(false);
        return;
      }
      
      const groupIds = groups.map(g => g.id);
      if (groupIds.length === 0) {
        setLastRefreshed(new Date());
        toast.success("No groups to refresh");
        setIsToastActive(false);
        return;
      }
      
      // Get participants for these groups
      await loadParticipants(groupIds);
      
      // Synchronize group sizes based on participants
      await syncTourGroupSizes(tourId);
      
      // Emit event to notify other components
      EventEmitter.emit(`participant-change:${tourId}`);
      
      setLastRefreshed(new Date());
      toast.success("Participants refreshed successfully");
      setIsToastActive(false);
    } catch (err) {
      console.error("DATABASE DEBUG: Failed to load participant data:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      
      // Show error toast only if none is active
      if (!isToastActive) {
        toast.error(`Error refreshing participants: ${errorMessage}`);
      }
      setIsToastActive(false);
    } finally {
      setIsLoading(false);
      // Always clear toast active state after operation completes
      setTimeout(() => setIsToastActive(false), 100);
    }
  }, [tourId, isLoading, isToastActive, loadParticipants]);
  
  // Function to move participants between groups with retries
  const moveParticipant = useCallback(async (
    participant: VentrataParticipant, 
    fromGroupId: string, 
    toGroupId: string
  ) => {
    if (!tourId || isLoading) return false;
    
    try {
      setIsLoading(true);
      
      // Update participant to new group
      const { error } = await supabaseWithRetry(async () => {
        return await supabase
          .from('participants')
          .update({ group_id: toGroupId })
          .eq('id', participant.id);
      });
      
      if (error) {
        console.error("Failed to move participant:", error);
        toast.error("Failed to move participant");
        return false;
      }
      
      // Sync group sizes after move
      await syncTourGroupSizes(tourId);
      
      // Notify other components
      EventEmitter.emit(`participant-change:${tourId}`);
      
      toast.success("Participant moved successfully");
      return true;
    } catch (err) {
      console.error("Error moving participant:", err);
      toast.error("Error moving participant");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [tourId, isLoading]);
  
  // Initial load on mount
  useEffect(() => {
    if (tourId) {
      refreshParticipants();
    }
  }, [tourId, refreshParticipants]);
  
  return {
    isLoading,
    error,
    lastRefreshed,
    refreshParticipants,
    moveParticipant,
    loadParticipants
  };
};
