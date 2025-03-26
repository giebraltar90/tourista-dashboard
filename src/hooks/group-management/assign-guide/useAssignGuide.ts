
import { useCallback } from "react";
import { useTourById } from "../../useTourData";
import { useModifications } from "../../useModifications";
import { toast } from "sonner";
import { resolveGroupId } from "./resolveGroupId";
import { processGuideId } from "./processGuideId";
import { prepareGroupName } from "./createGroupName";
import { updateDatabase } from "./updateDatabase";
import { EventEmitter } from "@/utils/eventEmitter";
import { logger } from "@/utils/logger";
import { syncTourData } from "@/hooks/group-management/services/participantService/syncService";
import { syncTourGuideAssignments } from "@/services/api/guideAssignmentService";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateTourCache } from "@/integrations/supabase/client";

export const useAssignGuide = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const { addModification } = useModifications(tourId);
  const queryClient = useQueryClient();
  
  const assignGuide = useCallback(
    async (groupIndex: number, guideId: string | null) => {
      try {
        if (!tour) {
          toast.error("Tour not found");
          return false;
        }
        
        logger.debug("🔄 [ASSIGN_GUIDE] Starting guide assignment", {
          tourId,
          groupIndex,
          guideId: guideId || "_none"
        });
        
        // Cancel any existing queries to prevent race conditions
        await queryClient.cancelQueries({ queryKey: ['tour', tourId] });
        
        // Resolve group ID from index
        const result = await resolveGroupId(tourId, groupIndex);
        if (!result || !result.groupId) {
          toast.error("Group not found");
          return false;
        }
        
        const groupId = result.groupId;
        
        // Process guide ID (handle special cases like "guide1", "_none", etc.)
        const processedGuideId = await processGuideId(guideId || "_none");
        
        logger.debug("🔄 [ASSIGN_GUIDE] Processed guide ID:", {
          original: guideId,
          processed: processedGuideId
        });
        
        // Prepare the updated group name
        const updatedName = await prepareGroupName(groupId, processedGuideId);
        
        // Show a loading toast
        const loadingToast = toast.loading("Assigning guide...");
        
        // Update the database
        const success = await updateDatabase(groupId, processedGuideId, updatedName);
        
        // Dismiss the loading toast
        toast.dismiss(loadingToast);
        
        if (!success) {
          toast.error("Failed to assign guide - please try again");
          return false;
        }
        
        // Invalidate cache for this tour
        invalidateTourCache(tourId);
        
        // Sync guide assignments to ensure consistency
        try {
          await syncTourGuideAssignments(tourId);
          await syncTourData(tourId);
        } catch (syncError) {
          logger.error("Error during sync after guide assignment:", syncError);
          // Continue even if sync fails
        }
        
        // Record the modification
        try {
          const guideName = processedGuideId ? "new guide" : "removed guide";
          await addModification({
            description: `Group ${groupIndex + 1}: ${processedGuideId ? "Assigned" : "Removed"} guide`,
            details: {
              type: "guide_assignment",
              groupId,
              guideId: processedGuideId,
              timestamp: new Date().toISOString()
            }
          });
        } catch (modError) {
          logger.error("Error adding modification:", modError);
          // Continue even if modification recording fails
        }
        
        // Notify of guide change to trigger ticket recalculation
        EventEmitter.emit(`guide-change:${tourId}`);
        
        logger.debug("🔄 [ASSIGN_GUIDE] Guide assignment completed successfully", {
          groupId,
          guideId: processedGuideId
        });
        
        // Add success toast 
        toast.success(processedGuideId ? "Guide assigned successfully" : "Guide removed successfully");
        
        // Force invalidate and refetch tour data to update UI
        queryClient.invalidateQueries({ queryKey: ['tour'] });
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
        queryClient.invalidateQueries({ queryKey: ['tourStatistics'] });
        queryClient.invalidateQueries({ queryKey: ['tourStatistics', tourId] });
        queryClient.invalidateQueries({ queryKey: ['ticketRequirements'] });
        
        // Ensure refetch after a short delay to catch any lagging updates
        setTimeout(() => {
          refetch();
        }, 300);
        
        return true;
      } catch (error) {
        logger.error("🔄 [ASSIGN_GUIDE] Error assigning guide:", error);
        toast.error("An error occurred while assigning the guide");
        return false;
      }
    },
    [tour, refetch, addModification, tourId, queryClient]
  );
  
  return { assignGuide };
};
