
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client"; 
import { logger } from "@/utils/logger";

/**
 * Hook to synchronize tour guide data with group guide assignments
 * This helps maintain consistency between the tour's guides and group assignments
 */
export const useSyncTourGroupGuides = (tourId: string) => {
  useEffect(() => {
    if (!tourId) return;
    
    const syncGuides = async () => {
      try {
        // Get tour data with guides
        const { data: tourData, error: tourError } = await supabase
          .from('tours')
          .select('guide1_id, guide2_id, guide3_id')
          .eq('id', tourId)
          .single();
          
        if (tourError || !tourData) {
          logger.error("Error fetching tour for guide sync:", tourError);
          return;
        }
        
        // Get tour groups
        const { data: groups, error: groupsError } = await supabase
          .from('tour_groups')
          .select('id, guide_id, name')
          .eq('tour_id', tourId);
          
        if (groupsError || !groups) {
          logger.error("Error fetching groups for guide sync:", groupsError);
          return;
        }
        
        logger.debug("Guide sync data:", {
          tourId,
          guide1_id: tourData.guide1_id || 'none',
          guide2_id: tourData.guide2_id || 'none',
          guide3_id: tourData.guide3_id || 'none',
          groups: groups.map(g => ({ id: g.id, guide_id: g.guide_id || 'none' }))
        });
        
        // Check if guide IDs in tour match the guide IDs in groups
        const tourGuideIds = [
          tourData.guide1_id, 
          tourData.guide2_id, 
          tourData.guide3_id
        ].filter(Boolean);
        
        const groupGuideIds = groups
          .map(group => group.guide_id)
          .filter(Boolean);
        
        // Guide IDs that are in tour but not in any group
        const guidesNotInGroups = tourGuideIds.filter(
          guideId => !groupGuideIds.includes(guideId)
        );
        
        // If there are guides in tour that aren't assigned to groups, assign them
        if (guidesNotInGroups.length > 0) {
          logger.debug("Found guides in tour not assigned to groups:", guidesNotInGroups);
          
          // Find groups without guides to assign these to
          const unassignedGroups = groups.filter(group => !group.guide_id);
          
          // Assign guides to unassigned groups
          for (let i = 0; i < Math.min(guidesNotInGroups.length, unassignedGroups.length); i++) {
            const guideId = guidesNotInGroups[i];
            const group = unassignedGroups[i];
            
            // Get guide name for the group name
            const { data: guideData } = await supabase
              .from('guides')
              .select('name')
              .eq('id', guideId)
              .maybeSingle();
            
            // Update group name with guide name
            const guideName = guideData?.name || 'Guide';
            const groupIndex = groups.findIndex(g => g.id === group.id);
            const newName = `Group ${groupIndex + 1} (${guideName})`;
            
            // Update the group with the guide
            const { error: updateError } = await supabase
              .from('tour_groups')
              .update({ 
                guide_id: guideId,
                name: newName,
                updated_at: new Date().toISOString()
              })
              .eq('id', group.id);
              
            if (updateError) {
              logger.error("Error assigning guide to group:", updateError);
            } else {
              logger.debug(`Successfully assigned guide ${guideId} to group ${group.id}`);
            }
          }
        }
        
        // Check if guides in groups are reflected in the tour's guide fields
        const guidesNotInTour = groupGuideIds.filter(
          guideId => !tourGuideIds.includes(guideId)
        );
        
        if (guidesNotInTour.length > 0) {
          logger.debug("Found guides in groups not assigned to tour:", guidesNotInTour);
          
          // Update tour with guides from groups
          const updateData: Record<string, any> = {};
          
          // Fill in empty tour guide slots with guides from groups
          if (!tourData.guide1_id && guidesNotInTour.length > 0) {
            updateData.guide1_id = guidesNotInTour.shift();
          }
          
          if (!tourData.guide2_id && guidesNotInTour.length > 0) {
            updateData.guide2_id = guidesNotInTour.shift();
          }
          
          if (!tourData.guide3_id && guidesNotInTour.length > 0) {
            updateData.guide3_id = guidesNotInTour.shift();
          }
          
          // Only update if we have changes to make
          if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
              .from('tours')
              .update(updateData)
              .eq('id', tourId);
              
            if (updateError) {
              logger.error("Error updating tour guides:", updateError);
            } else {
              logger.debug("Successfully updated tour guides from groups");
            }
          }
        }
      } catch (error) {
        logger.error("Error in guide sync process:", error);
      }
    };
    
    // Run the sync once when the component mounts
    syncGuides();
    
    // Set up listener for guide-change events
    const handleGuideChange = () => {
      syncGuides();
    };
    
    // Listen for guide change events
    window.addEventListener(`guide-change:${tourId}`, handleGuideChange);
    
    // Clean up
    return () => {
      window.removeEventListener(`guide-change:${tourId}`, handleGuideChange);
    };
  }, [tourId]);
};
