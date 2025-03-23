
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Prepare a group name for display, optionally incorporating guide name
 */
export const prepareGroupName = async (
  groupId: string, 
  guideId: string | null
): Promise<string> => {
  try {
    // First, get the current group name
    const { data: group, error: groupError } = await supabase
      .from("tour_groups")
      .select("name")
      .eq("id", groupId)
      .single();
      
    if (groupError) {
      logger.error("🔄 [AssignGuide] Error fetching group:", groupError);
      return "";
    }
    
    let groupName = group?.name || "";
    
    // If no guide ID is provided, just use the base name
    if (!guideId) {
      return groupName;
    }
    
    // Get the guide name if a guide ID is provided
    const { data: guide, error: guideError } = await supabase
      .from("guides")
      .select("name")
      .eq("id", guideId)
      .single();
      
    if (guideError) {
      logger.error("🔄 [AssignGuide] Error fetching guide:", guideError);
      return groupName;
    }
    
    // Create a display name that includes the guide if available
    if (guide && guide.name) {
      // If the group name already contains a guide name in parentheses, replace it
      if (groupName.includes("(") && groupName.includes(")")) {
        groupName = groupName.replace(/\s*\([^)]*\)\s*$/, "");
      }
      
      // Append the guide name in parentheses
      return `${groupName.trim()} (${guide.name})`;
    }
    
    return groupName;
  } catch (error) {
    logger.error("🔄 [AssignGuide] Error in prepareGroupName:", error);
    return "";
  }
};

// Important: Export createDisplayNameForGroup as an alias of prepareGroupName
export const createDisplayNameForGroup = prepareGroupName;
