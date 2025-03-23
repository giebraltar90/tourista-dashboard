
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { processGuideIdForAssignment } from "./utils/guideAssignmentUtils";
import { logger } from "@/utils/logger";

export const useAssignGuide = (tourOrId: TourCardProps | string, onSuccess?: () => void) => {
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
    
    // Reset state
    setIsAssigning(true);
    setAssignmentError(null);
    
    try {
      logger.debug("🔄 [AssignGuide] Starting guide assignment:", {
        tourId,
        groupIdOrIndex,
        guideId
      });
      
      // If we're dealing with a numerical index, we need to find the actual group ID
      let actualGroupId: string;
      
      if (typeof groupIdOrIndex === 'number') {
        // Fetch the current tour groups to find the correct ID from the index
        const { data: tourData, error: tourError } = await supabase
          .from("tours")
          .select("tour_groups(id, name, size, child_count, guide_id, participants(*))")
          .eq("id", tourId)
          .single();
          
        if (tourError) {
          logger.error("🔄 [AssignGuide] Error fetching tour groups:", tourError);
          setAssignmentError("Failed to fetch tour groups: " + tourError.message);
          toast.error("Error fetching tour groups");
          return false;
        }
        
        if (!tourData?.tour_groups || !Array.isArray(tourData.tour_groups) || !tourData.tour_groups[groupIdOrIndex]) {
          logger.error("🔄 [AssignGuide] Group index out of bounds:", {
            groupIndex: groupIdOrIndex,
            availableGroups: tourData?.tour_groups?.length || 0
          });
          setAssignmentError("Invalid group index");
          toast.error("Invalid group index");
          return false;
        }
        
        actualGroupId = tourData.tour_groups[groupIdOrIndex].id;
        
        // Log detailed information about the group we're updating
        logger.debug(`🔄 [AssignGuide] Resolved group index ${groupIdOrIndex} to group ID ${actualGroupId}`, {
          groupName: tourData.tour_groups[groupIdOrIndex].name,
          currentGuide: tourData.tour_groups[groupIdOrIndex].guide_id,
          size: tourData.tour_groups[groupIdOrIndex].size,
          childCount: tourData.tour_groups[groupIdOrIndex].child_count,
          participantsCount: tourData.tour_groups[groupIdOrIndex].participants?.length || 0
        });
      } else {
        // If we already have a string ID, use it directly
        actualGroupId = groupIdOrIndex;
        logger.debug(`🔄 [AssignGuide] Using provided group ID directly: ${actualGroupId}`);
      }
      
      // Fetch all available guides to ensure we can map special IDs to proper UUIDs
      const { data: availableGuides } = await supabase
        .from("guides")
        .select("id, name")
        .limit(50);
      
      const guides = availableGuides || [];
      
      // Process the guide ID - special handling for the "unassign" case
      let finalGuideId: string | null = null;
      
      if (guideId !== "_none") {
        // Use our utility function to find the correct UUID
        finalGuideId = processGuideIdForAssignment(guideId, guides);
        
        if (!finalGuideId && guideId !== "_none") {
          logger.warn("🔄 [AssignGuide] Could not map guide ID to a valid UUID:", guideId);
        }
      }
      
      logger.debug("🔄 [AssignGuide] Making Supabase update with:", {
        tourId,
        groupId: actualGroupId,
        originalGuideId: guideId,
        finalGuideId: finalGuideId
      });
      
      // Fetch current group data to prepare the name
      const { data: currentGroup } = await supabase
        .from("tour_groups")
        .select("name, participants(*)")
        .eq("id", actualGroupId)
        .single();
      
      // Prepare group name
      let baseGroupName = currentGroup?.name || "";
      
      // Extract just the group number part if possible
      let groupNumber = "";
      if (baseGroupName) {
        const groupMatch = baseGroupName.match(/^Group\s+(\d+)/i);
        if (groupMatch && groupMatch[1]) {
          groupNumber = groupMatch[1];
          logger.debug(`🔄 [AssignGuide] Extracted group number ${groupNumber} from "${baseGroupName}"`);
        }
      }
      
      // Create new group name
      let newGroupName = groupNumber ? `Group ${groupNumber}` : baseGroupName;
      
      // Add guide name if assigned
      if (finalGuideId) {
        const guideName = guides.find(g => g.id === finalGuideId)?.name;
        if (guideName) {
          newGroupName = groupNumber 
            ? `Group ${groupNumber} (${guideName})` 
            : `${baseGroupName} (${guideName})`;
          logger.debug(`🔄 [AssignGuide] Created new group name with guide: "${newGroupName}"`);
        }
      } else {
        logger.debug(`🔄 [AssignGuide] Using base group name without guide: "${newGroupName}"`);
      }
      
      // Update the guide assignment in the database
      const { error } = await supabase
        .from("tour_groups")
        .update({ 
          guide_id: finalGuideId,
          name: newGroupName
        })
        .eq("id", actualGroupId)
        .eq("tour_id", tourId);
        
      if (error) {
        logger.error("🔄 [AssignGuide] Error assigning guide:", error);
        setAssignmentError(error.message);
        toast.error("Error assigning guide: " + error.message);
        return false;
      }

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
      setIsAssigning(false);
    }
  };

  return {
    assignGuide,
    isAssigning,
    assignmentError,
  };
};
