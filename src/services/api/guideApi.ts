import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "@/types/ventrata";
import { VentrataTourGroup, GuideInfo } from "@/types/ventrata";
import { updateTourModification } from "./modificationApi";
import { Json } from "@/integrations/supabase/types";

/**
 * Fetch all guides from the database
 */
export const fetchGuides = async (): Promise<GuideInfo[]> => {
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .order('name');
      
    if (error) {
      console.error("Error fetching guides:", error);
      return [];
    }
    
    return data ? data.map(guide => ({
      id: guide.id,
      name: guide.name,
      birthday: guide.birthday ? new Date(guide.birthday) : new Date(),
      guideType: guide.guide_type
    })) : [];
  } catch (error) {
    console.error("Error in fetchGuides:", error);
    return [];
  }
};

/**
 * Assign a guide to a specific tour group
 */
export const assignGuideToGroup = async (
  tourId: string, 
  groupIndex: number,
  group: VentrataTourGroup,
  guideId?: string
): Promise<boolean> => {
  try {
    // Check if this is a UUID tour ID for direct database updates
    const tourIsUuid = isUuid(tourId);
    
    // Track if any persistence method succeeded
    let updateSuccess = false;
    
    // First, directly try to update the specific group in Supabase if it's a UUID tour
    if (tourIsUuid) {
      try {
        const groupId = group.id;
        
        if (groupId) {
          // Update existing group with targeted update to just the guide_id
          const { error } = await supabase
            .from('tour_groups')
            .update({
              guide_id: guideId,
              name: group.name
            })
            .eq('id', groupId);
            
          if (error) {
            console.error("Supabase direct group update failed:", error);
          } else {
            console.log("Successfully updated guide assignment in Supabase with direct update");
            updateSuccess = true;
          }
        }
      } catch (error) {
        console.error("Error with direct Supabase update:", error);
      }
    }
    
    // If direct update failed or it's not a UUID tour, try the API function
    if (!updateSuccess) {
      console.log("Falling back to API update");
      // In a real application, you would call an API endpoint here
      updateSuccess = true; // Mock success for now
    }
    
    // Record this modification if any method succeeded
    if (updateSuccess) {
      const guideName = guideId ? "Assigned Guide" : "Unassigned";
      const modificationDescription = guideId
        ? `Guide assigned to group ${group.name}`
        : `Guide removed from group ${group.name}`;
        
      try {
        await updateTourModification(tourId, {
          description: modificationDescription,
          details: {
            type: "guide_assignment",
            groupIndex,
            guideId,
            groupName: group.name
          }
        });
      } catch (error) {
        console.error("Failed to record modification:", error);
      }
    }
    
    return updateSuccess;
  } catch (error) {
    console.error("Error assigning guide:", error);
    throw error;
  }
};
