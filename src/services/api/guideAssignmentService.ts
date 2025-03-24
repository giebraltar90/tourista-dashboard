
import { supabase } from "@/integrations/supabase/client";
import { isValidUuid } from "./utils/guidesUtils";
import { logger } from "@/utils/logger";
import { EventEmitter } from "@/utils/eventEmitter";

/**
 * Updates a guide's assignment to a group in Supabase directly with improved persistence
 */
export const updateGuideInSupabase = async (
  tourId: string, 
  groupId: string, 
  guideId: string | null,
  groupName?: string
): Promise<boolean> => {
  if (!tourId || !groupId) {
    console.error("Missing required parameters for updateGuideInSupabase:", { tourId, groupId });
    return false;
  }

  try {
    logger.debug(`Updating guide assignment in Supabase for tour ${tourId}, group ${groupId}:`, {
      guideId,
      groupName
    });
    
    // Build update object based on what data is provided
    const updateData: any = {};
    
    // Add guide_id to update
    if (guideId === null || guideId === "_none") {
      // Set to null to unassign
      updateData.guide_id = null;
      logger.debug("Setting guide_id to null (unassigning)");
    } else {
      // Add the guide ID
      updateData.guide_id = guideId;
      logger.debug(`Setting guide_id to: ${guideId}`);
    }
    
    // Only add name to update if it's provided
    if (groupName) {
      updateData.name = groupName;
    }
    
    // Always add updated_at timestamp to ensure the change is tracked
    updateData.updated_at = new Date().toISOString();

    // Log the actual data being sent to the database
    logger.debug("Sending to database:", updateData);

    // Try update with manual retry logic
    let success = false;
    let attempt = 0;
    const maxRetries = 3;
    
    while (attempt < maxRetries && !success) {
      try {
        const { error } = await supabase
          .from('tour_groups')
          .update(updateData)
          .eq('id', groupId)
          .eq('tour_id', tourId);
          
        if (!error) {
          logger.debug(`Successfully updated guide assignment on attempt ${attempt + 1}`);
          success = true;
          break;
        } else {
          logger.error(`Error updating guide assignment (attempt ${attempt + 1}/${maxRetries}):`, error);
          
          // If that failed, try with just the guide_id as a more targeted update
          if (attempt === 0) {
            const reducedUpdate = {
              guide_id: updateData.guide_id,
              updated_at: updateData.updated_at
            };
            
            const { error: reducedError } = await supabase
              .from('tour_groups')
              .update(reducedUpdate)
              .eq('id', groupId);
              
            if (!reducedError) {
              logger.debug("Successfully updated guide assignment with reduced fields");
              success = true;
              break;
            }
          }
        }
      } catch (error) {
        logger.error(`Exception in update attempt ${attempt + 1}/${maxRetries}:`, error);
      }
      
      // Increment and add backoff delay
      attempt++;
      if (attempt < maxRetries) {
        const delay = Math.min(200 * Math.pow(2, attempt), 3000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    if (!success) {
      logger.error(`Failed to update guide assignment after ${maxRetries} attempts`);
      return false;
    }
    
    // After successful update to the group, also update the guide_N_id in the tours table
    // This is critical for maintaining guide assignments properly
    if (guideId && guideId.startsWith("guide")) {
      const guideNumber = guideId.replace("guide", "");
      if (["1", "2", "3"].includes(guideNumber)) {
        const tourUpdateField = `guide${guideNumber}_id`;
        
        // For special guide IDs (guide1, guide2, guide3), find the actual guide UUID
        // by looking for a guide assigned to this group
        const { data: groupData, error: groupError } = await supabase
          .from('tour_groups')
          .select('guide_id')
          .eq('id', groupId)
          .single();
          
        if (!groupError && groupData?.guide_id) {
          // Update the corresponding field in the tours table
          const tourUpdateData: any = {};
          tourUpdateData[tourUpdateField] = groupData.guide_id;
          
          const { error: tourUpdateError } = await supabase
            .from('tours')
            .update(tourUpdateData)
            .eq('id', tourId);
            
          if (tourUpdateError) {
            logger.error(`Error updating ${tourUpdateField} in tours table:`, tourUpdateError);
            // Continue since the primary group update succeeded
          } else {
            logger.debug(`Successfully updated ${tourUpdateField} in tours table to ${groupData.guide_id}`);
          }
        }
      }
    } else if (guideId === null || guideId === "_none") {
      // When removing a guide, we should check if this was assigned as a main guide in the tour
      try {
        // First get the current tour data to check guide assignments
        const { data: tourData } = await supabase
          .from('tours')
          .select('guide1_id, guide2_id, guide3_id')
          .eq('id', tourId)
          .single();
          
        if (tourData) {
          // Check if this group's guide was assigned as a main guide
          const { data: groupBeforeUpdate } = await supabase
            .from('tour_groups')
            .select('guide_id')
            .eq('id', groupId)
            .single();
            
          const previousGuideId = groupBeforeUpdate?.guide_id;
          
          // If the previous guide was a main guide, remove it
          if (previousGuideId) {
            const updateData: Record<string, any> = {};
            let needsUpdate = false;
            
            if (tourData.guide1_id === previousGuideId) {
              updateData.guide1_id = null;
              needsUpdate = true;
            }
            if (tourData.guide2_id === previousGuideId) {
              updateData.guide2_id = null;
              needsUpdate = true;
            }
            if (tourData.guide3_id === previousGuideId) {
              updateData.guide3_id = null;
              needsUpdate = true;
            }
            
            if (needsUpdate) {
              const { error: updateError } = await supabase
                .from('tours')
                .update(updateData)
                .eq('id', tourId);
                
              if (updateError) {
                logger.error("Error removing guide from tour:", updateError);
              }
            }
          }
        }
      } catch (error) {
        logger.error("Error checking main guide assignments:", error);
      }
    }
    
    // Emit event to notify that guide assignments have changed
    EventEmitter.emit(`guide-assignment-updated:${tourId}`, { 
      tourId, 
      groupId, 
      guideId 
    });
    
    logger.debug("Successfully updated guide assignment in Supabase");
    return true;
  } catch (error) {
    logger.error("Error updating guide assignment:", error);
    return false;
  }
};

/**
 * Fully updates the guide references in tours table with improved reliability
 */
export const updateTourGuidesInDatabase = async (
  tourId: string,
  guide1Id: string | null,
  guide2Id: string | null,
  guide3Id: string | null
): Promise<boolean> => {
  try {
    logger.debug(`Updating all guides for tour ${tourId}:`, { guide1Id, guide2Id, guide3Id });
    
    const updateData: any = {};
    
    if (guide1Id !== undefined) {
      updateData.guide1_id = guide1Id === "_none" ? null : guide1Id;
    }
    
    if (guide2Id !== undefined) {
      updateData.guide2_id = guide2Id === "_none" ? null : guide2Id;
    }
    
    if (guide3Id !== undefined) {
      updateData.guide3_id = guide3Id === "_none" ? null : guide3Id;
    }
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    // Only proceed if we have data to update
    if (Object.keys(updateData).length === 0) {
      logger.debug("No guide data to update");
      return true;
    }
    
    // Try the update with exponential backoff retry
    for (let attempt = 1; attempt <= 3; attempt++) {
      const { error } = await supabase
        .from('tours')
        .update(updateData)
        .eq('id', tourId);
        
      if (!error) {
        logger.debug(`Successfully updated all guides for tour on attempt ${attempt}`);
        
        // Force update of any related groups to ensure consistency
        await updateTourGroupsGuideConsistency(tourId, guide1Id, guide2Id, guide3Id);
        
        return true;
      }
      
      logger.error(`Error updating tour guides (attempt ${attempt}/3):`, error);
      
      if (attempt < 3) {
        // Wait with exponential backoff before retrying
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
      }
    }
    
    return false;
  } catch (error) {
    logger.error("Error updating tour guides:", error);
    return false;
  }
};

/**
 * Ensures consistency between tours table guide assignments and tour_groups table
 */
const updateTourGroupsGuideConsistency = async (
  tourId: string,
  guide1Id: string | null = null,
  guide2Id: string | null = null,
  guide3Id: string | null = null
): Promise<void> => {
  try {
    // First, get the current tour record to see guide assignments
    const { data: tourData, error: tourError } = await supabase
      .from('tours')
      .select('id, guide1_id, guide2_id, guide3_id')
      .eq('id', tourId)
      .single();
      
    if (tourError || !tourData) {
      logger.error("Error fetching tour for guide consistency check:", tourError);
      return;
    }
    
    // Get all groups for this tour
    const { data: tourGroups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, name, guide_id')
      .eq('tour_id', tourId);
      
    if (groupsError || !tourGroups) {
      logger.error("Error fetching tour groups for guide consistency check:", groupsError);
      return;
    }
    
    // Create a map of which guides are assigned to which groups
    const guideGroupMap: Record<string, string> = {};
    tourGroups.forEach(group => {
      if (group.guide_id) {
        guideGroupMap[group.guide_id] = group.id;
      }
    });
    
    // Use provided guide IDs or fallback to what's in the database
    const guidesToCheck = [
      { fieldName: 'guide1_id', guideId: guide1Id !== undefined ? guide1Id : tourData.guide1_id },
      { fieldName: 'guide2_id', guideId: guide2Id !== undefined ? guide2Id : tourData.guide2_id },
      { fieldName: 'guide3_id', guideId: guide3Id !== undefined ? guide3Id : tourData.guide3_id }
    ];
    
    // Make sure tour's main guides are assigned to groups
    for (const { fieldName, guideId } of guidesToCheck) {
      if (guideId && !guideGroupMap[guideId] && guideId !== "_none") {
        // This guide is in the tour but not assigned to any group
        // Find a group to assign it to
        const availableGroupIndex = tourGroups.findIndex(g => !g.guide_id);
        
        if (availableGroupIndex !== -1) {
          const groupToUpdate = tourGroups[availableGroupIndex];
          
          // Assign the guide to this group
          const { error: assignError } = await supabase
            .from('tour_groups')
            .update({ 
              guide_id: guideId,
              updated_at: new Date().toISOString()
            })
            .eq('id', groupToUpdate.id);
            
          if (assignError) {
            logger.error(`Error fixing guide consistency for ${fieldName}:`, assignError);
          } else {
            logger.debug(`Fixed guide consistency: Assigned ${fieldName} (${guideId}) to group ${groupToUpdate.id}`);
            
            // Update our local data structure
            tourGroups[availableGroupIndex].guide_id = guideId;
            guideGroupMap[guideId] = groupToUpdate.id;
          }
        }
      }
    }
    
    // Make sure groups match their guide assignments in the tour record
    for (const group of tourGroups) {
      if (group.guide_id) {
        // Check if this guide is one of the main guides
        const isTourMainGuide = 
          group.guide_id === tourData.guide1_id || 
          group.guide_id === tourData.guide2_id || 
          group.guide_id === tourData.guide3_id;
        
        // If not a main guide, update the group name to reflect the guide
        if (!isTourMainGuide) {
          // Get guide name for the group name update
          const { data: guideData } = await supabase
            .from('guides')
            .select('name')
            .eq('id', group.guide_id)
            .maybeSingle();
            
          const guideName = guideData?.name || 'Guide';
          const groupIndex = tourGroups.findIndex(g => g.id === group.id);
          const newGroupName = `Group ${groupIndex + 1} (${guideName})`;
          
          // Only update if the name needs to change
          if (group.name !== newGroupName) {
            await supabase
              .from('tour_groups')
              .update({ 
                name: newGroupName,
                updated_at: new Date().toISOString()
              })
              .eq('id', group.id);
          }
        }
      }
    }
  } catch (error) {
    logger.error("Error in guide consistency update:", error);
  }
};
