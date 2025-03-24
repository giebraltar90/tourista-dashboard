
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Generate a group name based on guide assignment
 * 
 * @param groupId The ID of the group
 * @param guideId The ID of the guide (or null if no guide)
 * @returns A generated group name
 */
export const generateGroupName = async (groupId: string, guideId: string | null): Promise<string> => {
  try {
    // If no guide ID, use default name
    if (!guideId || guideId === "_none") {
      return `Group ${groupId.substring(0, 4)}`;
    }
    
    // Fetch guide info
    const { data, error } = await supabase
      .from('guides')
      .select('name')
      .eq('id', guideId)
      .single();
      
    if (error || !data) {
      logger.error("Error fetching guide for name generation:", error);
      return `Group ${groupId.substring(0, 4)}`;
    }
    
    // Use guide name for group
    return `${data.name}'s Group`;
  } catch (error) {
    logger.error("Error generating group name:", error);
    return `Group ${groupId.substring(0, 4)}`;
  }
};
