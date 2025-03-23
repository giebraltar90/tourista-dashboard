import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { validateAssignGuideInputs, verifyGroupExists } from "./validation";
import { fetchAndProcessGuideId } from "./processGuideId";
import { resolveGroupId } from "./resolveGroupId";
import { updateDatabaseWithGuideAssignment } from "./updateDatabase";
import { UseAssignGuideResult, AssignGuideParams } from "./types";

/**
 * Custom hook for assigning guides to tour groups
 */
export const useAssignGuide = (tourId?: string): UseAssignGuideResult => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Reset error state
  const clearError = useCallback(() => {
    if (assignmentError) {
      setAssignmentError(null);
    }
  }, [assignmentError]);

  /**
   * Assign a guide to a group
   */
  const assignGuide = useCallback(async (
    groupIdOrIndex: string | number,
    guideId: string
  ): Promise<boolean> => {
    clearError();
    setIsAssigning(true);
    
    try {
      // Validate inputs
      const validation = validateAssignGuideInputs(tourId, groupIdOrIndex);
      if (!validation.isValid) {
        setAssignmentError(validation.errorMessage || "Invalid input parameters");
        return false;
      }
      
      // Process guide ID (either a name, "_none" for unassign, or a valid UUID)
      const processedGuideId = await fetchAndProcessGuideId(guideId);
      
      // Handle case where we couldn't process guide ID (but not for unassign)
      if (processedGuideId === null && guideId !== "_none") {
        throw new Error(`Unable to process guide ID: ${guideId}`);
      }
      
      // Resolve the group ID from a string ID or numeric index
      const { groupId: actualGroupId } = await resolveGroupId(tourId || "", groupIdOrIndex);
      if (!actualGroupId) {
        throw new Error(`Could not find group with identifier: ${groupIdOrIndex}`);
      }
      
      // Verify the group exists and is valid for this tour
      const groupExists = await verifyGroupExists(actualGroupId, tourId || "");
      if (!groupExists) {
        throw new Error(`Group ID ${actualGroupId} is not valid for tour ${tourId}`);
      }
      
      logger.log(`🔄 [AssignGuide] Assigning guide ${processedGuideId || "none"} to group ${actualGroupId}`);
      
      // If we're removing a guide (unassign), set guide_id to null
      // Otherwise use the processed guide ID
      const finalGuideId = guideId === "_none" ? null : processedGuideId;
      
      // Create updated name for the group based on guide assignment
      let updatedName = "";
      
      // If removing guide, revert to default name format
      if (guideId === "_none") {
        // Extract group number from existing name or default to "Group"
        const groupMatch = /Group\s+(\d+)/.exec(await fetchGroupName(actualGroupId));
        updatedName = groupMatch ? `Group ${groupMatch[1]}` : "Group";
      } else if (guideId && guideId !== "_none") {
        // For guide assignment, include guide name
        updatedName = `Group (${guideId.split(" ")[0]})`;
      }
      
      // Update the database
      const success = await updateDatabaseWithGuideAssignment(
        actualGroupId,
        finalGuideId,
        updatedName
      );
      
      if (success) {
        // Invalidate queries to refresh data
        if (tourId) {
          queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
        }
        toast.success(`Guide ${guideId === "_none" ? "unassigned" : "assigned"} successfully`);
        return true;
      } else {
        throw new Error("Failed to update database");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error during guide assignment";
      logger.error("🔄 [AssignGuide] Error:", errorMessage);
      setAssignmentError(errorMessage);
      toast.error(`Failed to assign guide: ${errorMessage}`);
      return false;
    } finally {
      setIsAssigning(false);
    }
  }, [tourId, queryClient, clearError]);

  // Helper to fetch a group's current name
  const fetchGroupName = async (groupId: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('tour_groups')
        .select('name')
        .eq('id', groupId)
        .single();
        
      if (error) throw error;
      return data?.name || "Group";
    } catch (error) {
      console.error("Error fetching group name:", error);
      return "Group";
    }
  };

  return {
    assignGuide,
    isAssigning,
    assignmentError
  };
};
