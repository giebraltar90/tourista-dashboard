
import { useState } from "react";
import { toast } from "sonner";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { logger } from "@/utils/logger";

import { validateAssignGuideInputs, verifyGroupExists } from "./validation";
import { resolveGroupId } from "./resolveGroupId";
import { fetchAndProcessGuideId } from "./processGuideId";
import { prepareGroupName } from "./createGroupName";
import { updateGroupGuideAssignment, updateTourGuideReference } from "./updateDatabase";
import { UseAssignGuideResult } from "./types";

/**
 * Hook for handling guide assignment operations.
 * This is a refactored version of the original useAssignGuide hook.
 */
export const useAssignGuide = (tourOrId: TourCardProps | string, onSuccess?: () => void): UseAssignGuideResult => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // Function to get tour ID based on the input
  const getTourId = () => {
    if (typeof tourOrId === 'string') {
      return tourOrId;
    }
    return tourOrId.id;
  };

  const assignGuide = async (groupIdOrIndex: string | number, guideId: string) => {
    const tourId = getTourId();
    
    // Validate basic inputs
    const validation = validateAssignGuideInputs(tourId, groupIdOrIndex);
    if (!validation.isValid) {
      setAssignmentError(validation.errorMessage);
      toast.error(`Error: ${validation.errorMessage}`);
      return false;
    }
    
    // Reset state
    setIsAssigning(true);
    setAssignmentError(null);
    
    try {
      logger.debug("🔄 [AssignGuide] Starting guide assignment:", {
        tourId,
        groupIdOrIndex,
        guideId
      });
      
      // Resolve group ID from index if needed
      const { groupId: actualGroupId } = await resolveGroupId(tourId, groupIdOrIndex);
      
      if (!actualGroupId) {
        setAssignmentError("Invalid group index or ID");
        toast.error("Error: Invalid group");
        return false;
      }
      
      // Verify group exists
      const groupExists = await verifyGroupExists(actualGroupId, tourId);
      if (!groupExists) {
        setAssignmentError("Group not found or does not belong to this tour");
        toast.error("Error: Group not found");
        return false;
      }
      
      // Process the guide ID
      const finalGuideId = await fetchAndProcessGuideId(guideId);
      
      logger.debug("🔄 [AssignGuide] Making database update with:", {
        tourId,
        groupId: actualGroupId,
        originalGuideId: guideId,
        finalGuideId: finalGuideId
      });
      
      // Prepare the new group name
      const newGroupName = await prepareGroupName(tourId, actualGroupId, finalGuideId);
      
      if (!newGroupName) {
        setAssignmentError("Error preparing group name");
        toast.error("Error preparing group name");
        return false;
      }
      
      // Update the group in the database
      const updateSuccess = await updateGroupGuideAssignment(
        tourId, 
        actualGroupId, 
        finalGuideId, 
        newGroupName
      );
      
      if (!updateSuccess) {
        setAssignmentError("Failed to update group in database");
        toast.error("Error updating group");
        return false;
      }
      
      // Update tour guide references if needed
      await updateTourGuideReference(tourId, guideId, finalGuideId);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Log success
      logger.debug("🔄 [AssignGuide] Successfully assigned guide", {
        groupId: actualGroupId,
        guideId: finalGuideId,
        newGroupName
      });

      // Show success toast
      toast.success(
        guideId === "_none" 
          ? "Guide has been removed from this group"
          : "Guide has been assigned to this group"
      );

      return true;
    } catch (err) {
      const error = err as Error;
      logger.error("🔄 [AssignGuide] Error in guide assignment:", error);
      setAssignmentError(error.message);
      toast.error("Error assigning guide: " + error.message);
      return false;
    } finally {
      // Add a small delay before setting isAssigning to false to prevent UI glitches
      setTimeout(() => {
        setIsAssigning(false);
      }, 300);
    }
  };

  return {
    assignGuide,
    isAssigning,
    assignmentError,
  };
};

// Export individual components for testing or direct use
export * from "./types";
export * from "./validation";
export * from "./resolveGroupId";
export * from "./processGuideId";
export * from "./createGroupName";
export * from "./updateDatabase";
