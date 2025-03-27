
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { isValidUuid } from "../utils/guidesUtils";

/**
 * Fetches guide data for multiple guide IDs and creates a map of ID to name
 */
export const fetchGuideData = async (guideIds: Set<string>): Promise<Record<string, string>> => {
  let guideMap: Record<string, string> = {};
  
  if (guideIds.size === 0) {
    return guideMap;
  }
  
  try {
    // Filter for valid UUIDs
    const validGuideIds = Array.from(guideIds).filter(id => isValidUuid(id));
    logger.debug("🔍 Fetching guide data for IDs:", validGuideIds);
    
    if (validGuideIds.length === 0) {
      return guideMap;
    }
    
    const { data: guides, error: guidesError } = await supabase
      .from('guides')
      .select('id, name')
      .in('id', validGuideIds);
      
    if (guidesError) {
      logger.error("❌ Error fetching guides:", guidesError);
    } else if (guides && guides.length > 0) {
      guideMap = guides.reduce((map, guide) => {
        map[guide.id] = guide.name;
        return map;
      }, {} as Record<string, string>);
      
      logger.debug("✅ Successfully built guide map", { 
        requestedCount: guideIds.size, 
        retrievedCount: guides.length 
      });
    }
  } catch (guideErr) {
    logger.error("❌ Exception while fetching guides:", guideErr);
  }
  
  return guideMap;
}
