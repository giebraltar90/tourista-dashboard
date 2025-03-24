
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Sync group names with guide assignments to prevent UI inconsistencies
 */
export const syncGroupNamesWithGuides = async (tourId: string): Promise<boolean> => {
  try {
    logger.debug(`Starting guide-group name sync for tour ${tourId}`);
    
    // 1. First, fetch the tour to get guide information
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('guide1_id, guide2_id, guide3_id')
      .eq('id', tourId)
      .maybeSingle();
      
    if (tourError) {
      logger.error(`Error fetching tour ${tourId} for guide sync:`, tourError);
      return false;
    }
    
    if (!tour) {
      logger.error(`Tour ${tourId} not found for guide sync`);
      return false;
    }
    
    // 2. Fetch the guides by ID to get their names
    const guideIds = [tour.guide1_id, tour.guide2_id, tour.guide3_id].filter(Boolean);
    
    if (guideIds.length === 0) {
      logger.debug(`No guides assigned to tour ${tourId}, skipping sync`);
      return true; // Nothing to sync
    }
    
    const { data: guides, error: guidesError } = await supabase
      .from('guides')
      .select('id, name')
      .in('id', guideIds);
      
    if (guidesError) {
      logger.error(`Error fetching guides for tour ${tourId}:`, guidesError);
      return false;
    }
    
    // Create a map of guide IDs to names
    const guideMap = new Map<string, string>();
    guides?.forEach(guide => {
      if (guide.id) guideMap.set(guide.id, guide.name);
    });
    
    // 3. Fetch the tour groups to update their names
    const { data: groups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, name, guide_id')
      .eq('tour_id', tourId);
      
    if (groupsError) {
      logger.error(`Error fetching groups for tour ${tourId}:`, groupsError);
      return false;
    }
    
    if (!groups || groups.length === 0) {
      logger.debug(`No groups found for tour ${tourId}, skipping sync`);
      return true; // Nothing to sync
    }
    
    // 4. Update group names based on their assigned guides
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const groupNumber = i + 1;
      
      // Skip if no guide is assigned
      if (!group.guide_id) {
        continue;
      }
      
      // Get guide name from the map
      const guideName = guideMap.get(group.guide_id);
      
      if (!guideName) {
        logger.warn(`Guide ${group.guide_id} not found for group ${group.id}`);
        continue;
      }
      
      // Format new group name with guide name
      const newGroupName = `Group ${groupNumber} (${guideName})`;
      
      // Only update if the name is different
      if (group.name !== newGroupName) {
        logger.debug(`Updating group ${group.id} name from "${group.name}" to "${newGroupName}"`);
        
        const { error: updateError } = await supabase
          .from('tour_groups')
          .update({ name: newGroupName })
          .eq('id', group.id);
          
        if (updateError) {
          logger.error(`Error updating group ${group.id} name:`, updateError);
          // Continue with other groups
        }
      }
    }
    
    logger.debug(`Completed guide-group name sync for tour ${tourId}`);
    return true;
  } catch (error) {
    logger.error(`Error in syncGroupNamesWithGuides for tour ${tourId}:`, error);
    return false;
  }
};
