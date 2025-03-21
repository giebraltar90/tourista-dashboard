
import { supabase } from "@/integrations/supabase/client";
import { isValidUuid } from "./utils/guidesUtils";

/**
 * Updates a guide's assignment to a group in Supabase directly
 */
export const updateGuideInSupabase = async (
  tourId: string, 
  groupId: string, 
  guideId: string | null,
  groupName?: string
): Promise<boolean> => {
  if (!tourId || !groupId) {
    console.error("Missing required parameters for updateGuideInSupabase:", { tourId, groupId });
    return false;
  }

  try {
    console.log(`Updating guide assignment in Supabase for tour ${tourId}, group ${groupId}:`, {
      guideId,
      groupName
    });
    
    // First, fetch the current group to ensure we have all data
    const { data: currentGroup, error: fetchError } = await supabase
      .from('tour_groups')
      .select('*')
      .eq('id', groupId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching current group data:", fetchError);
      // Continue with update anyway
    }
    
    // Build update object based on what data is provided
    const updateData: any = {};
    
    // Only add guide_id to update if it's valid
    if (guideId === null || guideId === "_none") {
      // Set to null to unassign
      updateData.guide_id = null;
      console.log("Setting guide_id to null (unassigning)");
    } else if (isValidUuid(guideId)) {
      // Only add valid UUIDs
      updateData.guide_id = guideId;
      console.log(`Setting guide_id to UUID: ${guideId}`);
    } else {
      console.error("Invalid UUID format for guide_id:", guideId);
      return false;
    }
    
    // Only add name to update if it's provided
    if (groupName) {
      updateData.name = groupName;
    }

    // Log the actual data being sent to the database
    console.log("Sending to database:", updateData);

    // Update the guide assignment in the database
    const { error, data } = await supabase
      .from('tour_groups')
      .update(updateData)
      .eq('id', groupId)
      .eq('tour_id', tourId)
      .select();
      
    if (error) {
      console.error("Error updating guide assignment:", error);
      return false;
    }
    
    console.log("Successfully updated guide assignment in Supabase. Response:", data);
    // Add a small delay to let database update propagate
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  } catch (error) {
    console.error("Error updating guide assignment:", error);
    return false;
  }
};
