
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Fetches current group data and prepares new group name
 */
export const prepareGroupName = async (
  tourId: string,
  actualGroupId: string,
  finalGuideId: string | null
): Promise<string | null> => {
  try {
    // Fetch current group data
    const { data: currentGroup, error: currentGroupError } = await supabase
      .from("tour_groups")
      .select("name, participants(*)")
      .eq("id", actualGroupId)
      .single();
      
    if (currentGroupError) {
      logger.error("🔄 [AssignGuide] Error fetching current group data:", currentGroupError);
      return null;
    }
    
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
      // Fetch the guide name
      const { data: guideData } = await supabase
        .from("guides")
        .select("name")
        .eq("id", finalGuideId)
        .single();
      
      if (guideData?.name) {
        newGroupName = groupNumber 
          ? `Group ${groupNumber} (${guideData.name})` 
          : `${baseGroupName} (${guideData.name})`;
        logger.debug(`🔄 [AssignGuide] Created new group name with guide: "${newGroupName}"`);
      }
    } else {
      logger.debug(`🔄 [AssignGuide] Using base group name without guide: "${newGroupName}"`);
    }
    
    return newGroupName;
  } catch (error) {
    logger.error("🔄 [AssignGuide] Error preparing group name:", error);
    return null;
  }
};
