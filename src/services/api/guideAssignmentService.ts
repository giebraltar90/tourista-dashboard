
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { EventEmitter } from "@/utils/eventEmitter";

/**
 * Update a guide assignment in Supabase with improved error handling and synchronization
 */
export const updateGuideInSupabase = async (
  tourId: string,
  groupId: string,
  guideId: string | null,
  groupName: string = ""
): Promise<boolean> => {
  try {
    if (!tourId || !groupId) {
      logger.error("Invalid parameters for guide update:", { tourId, groupId });
      return false;
    }
    
    logger.debug("Updating guide in Supabase:", { 
      tourId, 
      groupId, 
      guideId: guideId || 'None',
      groupName
    });
    
    // Strategy 1: Use the RPC function to bypass materialized view refresh
    try {
      const { error: rpcError } = await supabase.rpc(
        'update_group_guide_no_triggers',
        {
          p_group_id: groupId,
          p_guide_id: guideId,
          p_name: groupName || `Group ${Math.floor(Math.random() * 1000)}`
        }
      );
      
      if (!rpcError) {
        logger.debug("Guide updated successfully via RPC function");
        
        // Emit events to notify of guide change
        EventEmitter.emit(`guide-change:${tourId}`);
        
        return true;
      }
      
      logger.debug("RPC function error, trying standard update:", rpcError);
    } catch (rpcErr) {
      logger.debug("RPC function not available, trying standard update:", rpcErr);
    }
    
    // Strategy 2: Use a direct update with select (less likely to trigger materialized view)
    try {
      const { error: selectError } = await supabase
        .from("tour_groups")
        .update({ 
          guide_id: guideId, 
          name: groupName || `Group ${Math.floor(Math.random() * 1000)}`,
          updated_at: new Date().toISOString()
        })
        .eq("id", groupId)
        .eq("tour_id", tourId)
        .select();
        
      if (!selectError) {
        logger.debug("Guide updated successfully with select query");
        
        // Emit events to notify of guide change
        EventEmitter.emit(`guide-change:${tourId}`);
        
        return true;
      }
      
      if (selectError.message.includes('materialized view')) {
        logger.debug("Materialized view error with select query, trying standard update");
      } else {
        logger.error("Error with select update:", selectError);
      }
    } catch (selectErr) {
      logger.debug("Error with select update:", selectErr);
    }
    
    // Strategy 3: Standard update
    const { error } = await supabase
      .from("tour_groups")
      .update({ 
        guide_id: guideId, 
        name: groupName || `Group ${Math.floor(Math.random() * 1000)}`,
        updated_at: new Date().toISOString()
      })
      .eq("id", groupId)
      .eq("tour_id", tourId);
      
    if (error) {
      logger.error("Error updating guide in Supabase:", error);
      
      // Try the fallback function if available
      try {
        const { error: altError } = await supabase.rpc('update_tour_group_without_refresh', {
          p_group_id: groupId,
          p_guide_id: guideId,
          p_name: groupName || `Group ${Math.floor(Math.random() * 1000)}`
        });
        
        if (altError) {
          logger.error("Alternative update function failed:", altError);
          return false;
        }
        
        logger.debug("Guide updated successfully via alternative function");
        
        // Emit events to notify of guide change
        EventEmitter.emit(`guide-change:${tourId}`);
        
        return true;
      } catch (altErr) {
        logger.error("Error with alternative update function:", altErr);
        return false;
      }
    }
    
    logger.debug("Guide updated successfully");
    
    // Explicitly sync guide assignments across tables
    try {
      await supabase.rpc('sync_guide_assignments_across_tables', {
        p_tour_id: tourId
      });
    } catch (syncError) {
      logger.warn("Could not sync guide assignments:", syncError);
      // Continue even if sync fails, as the trigger should handle it
    }
    
    // Emit events to notify of guide change
    EventEmitter.emit(`guide-change:${tourId}`);
    
    return true;
  } catch (err) {
    logger.error("Error in updateGuideInSupabase:", err);
    return false;
  }
};

/**
 * Get all guides assigned to a tour
 */
export const getTourGuideAssignments = async (tourId: string) => {
  if (!tourId) return [];
  
  try {
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('guide1_id, guide2_id, guide3_id')
      .eq('id', tourId)
      .single();
      
    if (tourError) {
      logger.error("Error fetching tour guide assignments:", tourError);
      return [];
    }
    
    const { data: groups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, name, guide_id')
      .eq('tour_id', tourId);
      
    if (groupsError) {
      logger.error("Error fetching group guide assignments:", groupsError);
      return [];
    }
    
    // Combine main guides and group guides
    const assignments = [];
    
    if (tour.guide1_id) {
      assignments.push({
        type: 'main',
        position: 'guide1',
        guideId: tour.guide1_id
      });
    }
    
    if (tour.guide2_id) {
      assignments.push({
        type: 'main',
        position: 'guide2',
        guideId: tour.guide2_id
      });
    }
    
    if (tour.guide3_id) {
      assignments.push({
        type: 'main',
        position: 'guide3',
        guideId: tour.guide3_id
      });
    }
    
    // Add group guides
    if (groups && groups.length > 0) {
      groups.forEach(group => {
        if (group.guide_id) {
          assignments.push({
            type: 'group',
            groupId: group.id,
            groupName: group.name,
            guideId: group.guide_id
          });
        }
      });
    }
    
    return assignments;
  } catch (error) {
    logger.error("Error retrieving guide assignments:", error);
    return [];
  }
};

/**
 * Sync guide assignments between tour and tour_groups tables
 */
export const syncTourGuideAssignments = async (tourId: string): Promise<boolean> => {
  try {
    if (!tourId) return false;
    
    const { data, error } = await supabase.rpc('sync_guide_assignments_across_tables', {
      p_tour_id: tourId
    });
    
    if (error) {
      logger.error("Error syncing guide assignments:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    logger.error("Exception in syncTourGuideAssignments:", err);
    return false;
  }
};
