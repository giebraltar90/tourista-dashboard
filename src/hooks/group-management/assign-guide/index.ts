import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { validateAssignGuideInputs, verifyGroupExists } from "./validation";
import { fetchAndProcessGuideId } from "./processGuideId";
import { resolveGroupIdOrIndex } from "./resolveGroupId";
import { createDisplayNameForGroup } from "./createGroupName";
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
      const actualGroupId = await resolveGroupIdOrIndex(tourId || "", groupIdOrIndex);
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
      
      // Handle the group name update and guide assignment
      const updatedName = await createDisplayNameForGroup(
        actualGroupId, 
        finalGuideId, 
        guideId === "_none"
      );
      
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

  return {
    assignGuide,
    isAssigning,
    assignmentError
  };
};
