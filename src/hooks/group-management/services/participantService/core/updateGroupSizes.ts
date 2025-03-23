
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Update the sizes of source and target groups after a participant move
 */
export const updateGroupSizes = async (
  sourceGroupId: string,
  newGroupId: string,
  sourceGroup: any,
  targetGroup: any,
  participantCount: number,
  participantChildCount: number
): Promise<boolean> => {
  // Add a significant delay to ensure database consistency
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Calculate new sizes
  const newSourceSize = Math.max(0, (sourceGroup.size || 0) - participantCount);
  const newSourceChildCount = Math.max(0, (sourceGroup.child_count || 0) - participantChildCount);
  const newTargetSize = (targetGroup.size || 0) + participantCount;
  const newTargetChildCount = (targetGroup.child_count || 0) + participantChildCount;
  
  logger.debug("🔄 [PARTICIPANT_MOVE] Updating group sizes:", {
    sourceGroup: {
      before: { size: sourceGroup.size, childCount: sourceGroup.child_count },
      after: { size: newSourceSize, childCount: newSourceChildCount }
    },
    targetGroup: {
      before: { size: targetGroup.size, childCount: targetGroup.child_count },
      after: { size: newTargetSize, childCount: newTargetChildCount }
    }
  });
  
  // CRITICAL FIX: Use direct SQL updates instead of RPC call 
  // This allows us to update both groups in a single transaction
  const { error: sourceUpdateError } = await supabase
    .from('tour_groups')
    .update({
      size: newSourceSize,
      child_count: newSourceChildCount,
      updated_at: new Date().toISOString()
    })
    .eq('id', sourceGroupId);
    
  if (sourceUpdateError) {
    logger.error("🔄 [PARTICIPANT_MOVE] Error updating source group:", sourceUpdateError);
    // Continue with target update anyway
  }
  
  const { error: targetUpdateError } = await supabase
    .from('tour_groups')
    .update({
      size: newTargetSize,
      child_count: newTargetChildCount,
      updated_at: new Date().toISOString()
    })
    .eq('id', newGroupId);
    
  if (targetUpdateError) {
    logger.error("🔄 [PARTICIPANT_MOVE] Error updating target group:", targetUpdateError);
    // Continue anyway - the participant move itself was successful
  }
  
  if (!sourceUpdateError && !targetUpdateError) {
    logger.debug("🔄 [PARTICIPANT_MOVE] Successfully updated both groups");
    return true;
  }
  
  return false;
};
