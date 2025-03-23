
import { supabase } from "@/integrations/supabase/client";
import { processGuideIdForAssignment } from "../utils/guideAssignmentUtils";
import { logger } from "@/utils/logger";

/**
 * Fetches available guides and processes the guide ID
 */
export const processGuideId = async (
  guideId: string
): Promise<string | null> => {
  // Fetch all available guides to ensure we can map special IDs to proper UUIDs
  const { data: availableGuides, error: guidesError } = await supabase
    .from("guides")
    .select("id, name")
    .limit(50);
    
  if (guidesError) {
    logger.error("🔄 [AssignGuide] Error fetching guides:", guidesError);
    return null;
  }
  
  const guides = availableGuides || [];
  
  // Process the guide ID - special handling for the "unassign" case
  if (guideId !== "_none") {
    // Use our utility function to find the correct UUID
    const finalGuideId = processGuideIdForAssignment(guideId, guides);
    
    if (!finalGuideId && guideId !== "_none") {
      logger.warn("🔄 [AssignGuide] Could not map guide ID to a valid UUID:", guideId);
    }
    
    return finalGuideId;
  }
  
  return null;
};
