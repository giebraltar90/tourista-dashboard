import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Resolves a group index to an actual group ID
 */
export const resolveGroupId = async (
  tourId: string,
  groupIdOrIndex: string | number
): Promise<{ groupId: string | null; groupData?: any }> => {
  // If we already have a string ID, use it directly
  if (typeof groupIdOrIndex === 'string') {
    logger.debug(`🔄 [AssignGuide] Using provided group ID directly: ${groupIdOrIndex}`);
    return { groupId: groupIdOrIndex };
  }
  
  // Otherwise, we need to fetch the groups and find the ID by index
  const { data: tourData, error: tourError } = await supabase
    .from("tours")
    .select("tour_groups(id, name, size, child_count, guide_id, participants(*))")
    .eq("id", tourId)
    .single();
    
  if (tourError) {
    logger.error("🔄 [AssignGuide] Error fetching tour groups:", tourError);
    return { groupId: null };
  }
  
  if (!tourData?.tour_groups || !Array.isArray(tourData.tour_groups) || !tourData.tour_groups[groupIdOrIndex]) {
    logger.error("🔄 [AssignGuide] Group index out of bounds:", {
      groupIndex: groupIdOrIndex,
      availableGroups: tourData?.tour_groups?.length || 0
    });
    return { groupId: null };
  }
  
  const actualGroupId = tourData.tour_groups[groupIdOrIndex].id;
  
  // Log detailed information about the group we're updating
  logger.debug(`🔄 [AssignGuide] Resolved group index ${groupIdOrIndex} to group ID ${actualGroupId}`, {
    groupName: tourData.tour_groups[groupIdOrIndex].name,
    currentGuide: tourData.tour_groups[groupIdOrIndex].guide_id,
    size: tourData.tour_groups[groupIdOrIndex].size,
    childCount: tourData.tour_groups[groupIdOrIndex].child_count,
    participantsCount: tourData.tour_groups[groupIdOrIndex].participants?.length || 0
  });
  
  return { 
    groupId: actualGroupId,
    groupData: tourData.tour_groups[groupIdOrIndex]
  };
};
