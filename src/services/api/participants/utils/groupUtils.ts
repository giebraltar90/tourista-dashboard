
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch tour groups for a tour
 */
export const fetchTourGroups = async (tourId: string) => {
  try {
    const { data: groups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, guide_id, name, entry_time, size, child_count')
      .eq('tour_id', tourId);
      
    if (groupsError) {
      console.error("DATABASE DEBUG: Error fetching tour groups:", groupsError);
      return { success: false, error: groupsError.message };
    }
    
    console.log(`DATABASE DEBUG: Found ${groups ? groups.length : 0} groups for tour ID: ${tourId}`);
    
    if (!groups || groups.length === 0) {
      console.log("DATABASE DEBUG: No groups found for tour ID:", tourId);
      return { success: false, error: "No groups found" };
    }
    
    // Log each group for debugging
    groups.forEach((group, index) => {
      console.log(`DATABASE DEBUG: Group ${index + 1}:`, {
        id: group.id,
        name: group.name,
        entry_time: group.entry_time,
        size: group.size,
        child_count: group.child_count,
        guide_id: group.guide_id,
      });
    });
    
    return { success: true, groups };
  } catch (error) {
    console.error("DATABASE DEBUG: Error in fetchTourGroups:", error);
    return { success: false, error: String(error) };
  }
};
