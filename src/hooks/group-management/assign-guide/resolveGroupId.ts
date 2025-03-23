
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Resolve a group ID from a tour ID and group index
 */
export const resolveGroupId = async (
  tourId: string, 
  groupIndex: number
): Promise<{ groupId: string; groupData?: any }> => {
  try {
    logger.debug("🔄 [AssignGuide] Resolving group ID:", { tourId, groupIndex });
    
    // Get all groups for the tour
    const { data: groups, error } = await supabase
      .from("tour_groups")
      .select("*")
      .eq("tour_id", tourId)
      .order("created_at", { ascending: true });
      
    if (error) {
      logger.error("🔄 [AssignGuide] Error fetching groups:", error);
      return { groupId: "" };
    }
    
    // Check if we have groups and if groupIndex is valid
    if (!groups || !Array.isArray(groups) || groupIndex >= groups.length) {
      logger.error("🔄 [AssignGuide] Invalid group index:", { 
        groupIndex, 
        groupsCount: groups?.length || 0 
      });
      return { groupId: "" };
    }
    
    // Get the group at the specified index
    const group = groups[groupIndex];
    
    logger.debug("🔄 [AssignGuide] Found group:", { 
      groupId: group.id, 
      groupName: group.name 
    });
    
    return { 
      groupId: group.id,
      groupData: group 
    };
  } catch (error) {
    logger.error("🔄 [AssignGuide] Unexpected error in resolveGroupId:", error);
    return { groupId: "" };
  }
};
