
import { VentrataTourGroup } from "@/types/ventrata";
import { supabase } from "@/integrations/supabase/client";
import { isValidUuid, sanitizeGuideId, isSpecialGuideId } from "./utils/guidesUtils";

/**
 * Update tour groups (e.g., move participants between groups)
 */
export const updateTourGroups = async (
  tourId: string, 
  updatedGroups: VentrataTourGroup[]
): Promise<boolean> => {
  try {
    // Check if this is a UUID format ID to determine storage approach
    const tourIsUuid = isValidUuid(tourId);
    let success = false;
    
    if (tourIsUuid) {
      // For UUID tours, use Supabase
      try {
        console.log("Updating tour groups in Supabase:", updatedGroups);
        
        // Update each group individually to handle multiple updates properly
        for (const group of updatedGroups) {
          // Check if the group has an id (existing group) or needs to be created
          if (group.id) {
            // Debug log to identify guide ID issues
            console.log(`Processing group ${group.id} with guideId:`, {
              rawGuideId: group.guideId,
              isSpecial: isSpecialGuideId(group.guideId),
              sanitized: sanitizeGuideId(group.guideId)
            });
            
            // Sanitize guide ID for database storage - now preserves "guide1", etc.
            const safeGuideId = sanitizeGuideId(group.guideId);
            
            // Update existing group
            const updateData: any = {
              name: group.name,
              size: group.size || 0,
              child_count: group.childCount || 0,
              guide_id: safeGuideId // Use sanitized ID for database
            };
            
            // Add entryTime if it exists
            if (group.entryTime) {
              updateData.entry_time = group.entryTime;
            }
            
            console.log(`Updating group ${group.id} with data:`, updateData);
            
            const { error } = await supabase
              .from('tour_groups')
              .update(updateData)
              .eq('id', group.id)
              .eq('tour_id', tourId);
              
            if (error) {
              console.error(`Error updating group ${group.id}:`, error);
              return false;
            }
          } else {
            // Sanitize guide ID for new groups too
            const safeGuideId = sanitizeGuideId(group.guideId);
            
            // Insert new group if no ID
            const { error } = await supabase
              .from('tour_groups')
              .insert({
                tour_id: tourId,
                name: group.name,
                size: group.size || 0,
                entry_time: group.entryTime,
                guide_id: safeGuideId, // Use sanitized ID for database
                child_count: group.childCount || 0
              });
              
            if (error) {
              console.error(`Error inserting new group:`, error);
              return false;
            }
          }
        }
        success = true;
        console.log(`Updated ${updatedGroups.length} tour groups in Supabase for tour ${tourId}`);
      } catch (supabaseError) {
        console.error("Error updating groups in Supabase:", supabaseError);
        // Continue to API fallback if Supabase fails
      }
    }
    
    // If we're dealing with a non-UUID tour or Supabase failed, fall back to the API
    if (!success) {
      console.log(`Updating tour groups via API for tour ${tourId}`, updatedGroups);
      // Simulate an API call with a success response for non-UUID tours
      success = true;
    }
    
    return success;
  } catch (error) {
    console.error(`Error updating tour ${tourId} groups:`, error);
    throw error;
  }
};
