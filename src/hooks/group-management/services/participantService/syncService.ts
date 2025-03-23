
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Updates the calculated sizes on tour groups based on their participants
 */
export const syncTourGroupSizes = async (tourId: string): Promise<boolean> => {
  try {
    console.log(`PARTICIPANTS DEBUG: Syncing tour group sizes for tour ${tourId}`);
    
    // First get all groups for this tour
    const { data: tourGroups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, participants(id, count, child_count)')
      .eq('tour_id', tourId);
      
    if (groupsError) {
      console.error("Error fetching tour groups for size sync:", groupsError);
      return false;
    }
    
    console.log(`PARTICIPANTS DEBUG: Fetched ${tourGroups.length} groups for size sync`);
    
    // Update each group's size and child_count based on participants
    for (const group of tourGroups) {
      if (!Array.isArray(group.participants)) {
        console.log(`PARTICIPANTS DEBUG: Group ${group.id} has no participants array, skipping`);
        continue;
      }
      
      let totalSize = 0;
      let totalChildCount = 0;
      
      // Calculate from participants
      for (const participant of group.participants) {
        totalSize += participant.count || 1;
        totalChildCount += participant.child_count || 0;
        
        console.log(`PARTICIPANTS DEBUG: Adding participant ${participant.id} with count ${participant.count || 1} and childCount ${participant.child_count || 0}`);
      }
      
      console.log(`PARTICIPANTS DEBUG: Updating group ${group.id} with size ${totalSize} and childCount ${totalChildCount}`);
      
      // Update the group with calculated values
      const { error: updateError } = await supabase
        .from('tour_groups')
        .update({
          size: totalSize,
          child_count: totalChildCount
        })
        .eq('id', group.id);
        
      if (updateError) {
        console.error(`Error updating size for group ${group.id}:`, updateError);
      }
    }
    
    // Add a delay to ensure database consistency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    console.error("Error synchronizing tour group sizes:", error);
    return false;
  }
};
