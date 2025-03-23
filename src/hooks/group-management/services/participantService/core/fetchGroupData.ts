
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Fetch data for source and target groups
 */
export const fetchGroupData = async (sourceGroupId: string, newGroupId: string) => {
  const { data: groupsData, error: groupsError } = await supabase
    .from('tour_groups')
    .select('id, size, child_count')
    .in('id', [sourceGroupId, newGroupId]);
    
  if (groupsError) {
    logger.error("🔄 [PARTICIPANT_MOVE] Failed to fetch groups data:", groupsError);
    return { sourceGroup: null, targetGroup: null };
  }
  
  // Extract the source and target group data
  const sourceGroup = groupsData.find(g => g.id === sourceGroupId);
  const targetGroup = groupsData.find(g => g.id === newGroupId);
  
  if (!sourceGroup || !targetGroup) {
    logger.error("🔄 [PARTICIPANT_MOVE] Could not find source or target group:", {
      sourceGroupId, 
      newGroupId, 
      groupsFound: groupsData.map(g => g.id)
    });
    return { sourceGroup: null, targetGroup: null };
  }
  
  logger.debug("🔄 [PARTICIPANT_MOVE] Found source and target groups:", {
    sourceGroup: {
      id: sourceGroup.id,
      size: sourceGroup.size,
      childCount: sourceGroup.child_count
    },
    targetGroup: {
      id: targetGroup.id,
      size: targetGroup.size,
      childCount: targetGroup.child_count
    }
  });
  
  return { sourceGroup, targetGroup };
};
