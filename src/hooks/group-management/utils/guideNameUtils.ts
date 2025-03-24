
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

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

/**
 * Find a guide name based on their ID
 */
export const findGuideName = (
  guideId: string | undefined | null, 
  guides: any[] = [], 
  tour: any
): string => {
  if (!guideId) return "Unassigned";
  
  // Check in guides array first by ID
  const guideById = guides.find(g => g.id === guideId);
  if (guideById && guideById.name) return guideById.name;
  
  // Check standard guide references
  if (tour) {
    if (guideId === "guide1" || guideId === tour.guide1Id) return tour.guide1 || "Primary Guide";
    if (guideId === "guide2" || guideId === tour.guide2Id) return tour.guide2 || "Secondary Guide";
    if (guideId === "guide3" || guideId === tour.guide3Id) return tour.guide3 || "Assistant Guide";
  }
  
  // If we can't find a name, use a truncated version of the UUID
  if (typeof guideId === 'string' && guideId.length > 8) {
    return `Guide (${guideId.substring(0, 6)}...)`;
  }
  
  return "Unknown Guide";
};

/**
 * Get guide name for assignment
 */
export const getGuideNameForAssignment = (
  guideId: string | null,
  guides: any[],
  tour: any
): string => {
  if (!guideId) return "Unassigned";
  return findGuideName(guideId, guides, tour);
};
