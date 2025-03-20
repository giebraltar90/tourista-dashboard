
import { useTourById } from "../tourData/useTourById";
import { useGuideData } from "../guides/useGuideData";
import { useModifications } from "../useModifications";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  validateGuideAssignment 
} from "./services/utils/validationService";
import {
  findGuideName,
  generateGroupNameWithGuide,
  createModificationDescription
} from "./services/utils/namingService";
import {
  performOptimisticUpdate
} from "./services/utils/optimisticUpdateService";
import { 
  persistGuideAssignmentChanges 
} from "./services/utils/persistenceService";
import { 
  handleUIUpdates 
} from "./services/utils/notificationService";
import { 
  mapGuideIdToUuid 
} from "./services/utils/guideMappingService";

/**
 * Hook to assign or unassign guides to tour groups
 */
export const useAssignGuide = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const { guides = [] } = useGuideData() || { guides: [] };
  const { addModification } = useModifications(tourId);
  const queryClient = useQueryClient();
  
  /**
   * Assign a guide to a specific group
   */
  const assignGuide = useCallback(async (groupIndex: number, guideId?: string | null) => {
    try {
      console.log("Starting guide assignment:", { 
        groupIndex, 
        guideId, 
        tourId, 
        currentGroups: tour?.tourGroups?.map(g => ({id: g.id, name: g.name, guideId: g.guideId})) || []
      });
      
      // Validate parameters
      const validationResult = validateGuideAssignment(tour, groupIndex, guideId);
      if (!validationResult.valid) {
        console.error(validationResult.errorMessage);
        toast.error(validationResult.errorMessage || "Cannot assign guide");
        return false;
      }
      
      // Special handling for "_none" which means "remove guide"
      const actualGuideId = guideId === "_none" ? null : 
                           (guideId ? mapGuideIdToUuid(guideId, tour, guides) : null);
      
      console.log("Guide ID mapping result:", {
        originalId: guideId,
        mappedId: actualGuideId
      });
      
      // Validate that if a guide ID is provided, it should be mapped to a valid UUID
      if (guideId && guideId !== "_none" && !actualGuideId) {
        console.error(`Failed to map guide ID "${guideId}" to a valid UUID`);
        toast.error("Cannot assign guide: Invalid guide ID format or mapping failed");
        return false;
      }
      
      // Get the target group
      const targetGroup = tour!.tourGroups![groupIndex];
      const groupId = targetGroup.id;
      
      // CRITICAL: Preserve participants when updating the group
      const existingParticipants = targetGroup.participants || [];
      
      // Get group number for name generation
      const groupNumber = groupIndex + 1;
      
      // Find guide name for display
      const guideName = findGuideName(actualGuideId, guides, tour);
      
      // Generate a new group name with the guide name
      const groupName = generateGroupNameWithGuide(groupNumber, guideName);
      
      // Prepare for optimistic UI update
      const updatedGroups = [...tour!.tourGroups!];
      updatedGroups[groupIndex] = {
        ...updatedGroups[groupIndex],
        guideId: actualGuideId,
        name: groupName,
        // CRITICAL: Preserve the existing participants
        participants: existingParticipants
      };
      
      // Apply optimistic update to UI
      performOptimisticUpdate(queryClient, tourId, updatedGroups);
      
      // Log for debugging
      console.log("Optimistic update with preserved participants:", {
        groupIndex,
        existingParticipants,
        updatedGroupParticipantCount: updatedGroups[groupIndex].participants?.length || 0
      });
      
      // Save to database
      const updateSuccess = await persistGuideAssignmentChanges(
        tourId,
        groupId,
        actualGuideId,
        groupName,
        updatedGroups
      );
      
      console.log("Database update result:", updateSuccess ? "Success" : "Failed");
      
      // Update UI based on result
      await handleUIUpdates(tourId, queryClient, actualGuideId, guideName, updateSuccess);
      
      if (updateSuccess) {
        // Record the modification
        const modificationDescription = createModificationDescription(
          actualGuideId,
          guideName,
          groupNumber
        );
          
        await addModification(modificationDescription, {
          groupIndex,
          groupId,
          guideId: actualGuideId,
          guideName,
          participantCount: existingParticipants.length // Include participant count in modification record
        });
        
        // Force a refresh to ensure data consistency
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
        }, 1000);
        
        return true;
      } else {
        // Revert optimistic update
        await refetch();
        return false;
      }
    } catch (error) {
      console.error("Error assigning guide:", error);
      toast.error("Failed to assign guide due to an error");
      // Revert optimistic update
      await refetch();
      return false;
    }
  }, [tour, tourId, guides, addModification, queryClient, refetch]);
  
  return { assignGuide };
};

// Helper function to validate UUID format
const isValidUuid = (id: string | undefined): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};
