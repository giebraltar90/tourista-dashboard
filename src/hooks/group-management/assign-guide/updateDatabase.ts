
import { supabase } from "@/integrations/supabase/client";
import { updateTourGuidesInDatabase } from "@/services/api/guideAssignmentService";
import { logger } from "@/utils/logger";

/**
 * Updates the guide assignment in the database
 */
export const updateGroupGuideAssignment = async (
  tourId: string,
  actualGroupId: string,
  finalGuideId: string | null,
  newGroupName: string
): Promise<boolean> => {
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
    return false;
  }
  
  return true;
};

/**
 * Updates the guide reference in the tours table if needed
 */
export const updateTourGuideReference = async (
  tourId: string,
  guideId: string,
  finalGuideId: string | null
): Promise<boolean> => {
  // Only update if this is a main guide
  if (!guideId.startsWith("guide")) {
    return true;
  }
  
  try {
    // Determine which guide we're updating (guide1, guide2, guide3)
    const guideNumber = guideId.replace("guide", "");
    
    // Only set the specific guide we're updating
    let guide1Id = undefined;
    let guide2Id = undefined;
    let guide3Id = undefined;
    
    // Only set the specific guide we're updating
    if (guideNumber === "1") guide1Id = finalGuideId;
    if (guideNumber === "2") guide2Id = finalGuideId;
    if (guideNumber === "3") guide3Id = finalGuideId;
    
    await updateTourGuidesInDatabase(tourId, guide1Id, guide2Id, guide3Id);
    return true;
  } catch (updateError) {
    logger.error("🔄 [AssignGuide] Error updating tour guides:", updateError);
    // Don't fail the whole operation if this part fails
    return true;
  }
};
