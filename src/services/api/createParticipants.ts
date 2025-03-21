
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Create test participants for a tour's groups
 */
export const createTestParticipants = async (tourId: string) => {
  console.log("DATABASE DEBUG: Creating test participants for tour:", tourId);
  
  try {
    // First get the tour groups
    const { data: groups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, name')
      .eq('tour_id', tourId);
      
    if (groupsError) {
      console.error("DATABASE DEBUG: Error fetching groups:", groupsError);
      return { success: false, error: groupsError.message };
    }
    
    if (!groups || groups.length === 0) {
      console.log("DATABASE DEBUG: No groups found for tour:", tourId);
      return { success: false, error: "No groups found for this tour" };
    }
    
    console.log(`DATABASE DEBUG: Found ${groups.length} groups, creating test participants...`);
    
    // Create test participants for each group
    const results = [];
    
    for (const group of groups) {
      // Create 2-3 test participants per group
      const numParticipants = Math.floor(Math.random() * 2) + 2; // 2 or 3
      
      for (let i = 0; i < numParticipants; i++) {
        const { data, error } = await supabase
          .from('participants')
          .insert({
            name: `Test Participant ${i+1} (${group.name || 'Group'})`,
            count: Math.floor(Math.random() * 2) + 1, // 1 or 2
            child_count: Math.random() > 0.5 ? 1 : 0, // 50% chance of a child
            group_id: group.id,
            booking_ref: `TEST-${uuidv4().substring(0, 8)}`
          })
          .select();
          
        if (error) {
          console.error(`DATABASE DEBUG: Error creating test participant for group ${group.id}:`, error);
          results.push({ groupId: group.id, success: false, error: error.message });
        } else {
          console.log(`DATABASE DEBUG: Created test participant for group ${group.id}:`, data);
          results.push({ groupId: group.id, success: true, data });
        }
      }
    }
    
    return { 
      success: results.every(r => r.success), 
      results
    };
  } catch (error) {
    console.error("DATABASE DEBUG: Error creating test participants:", error);
    return { success: false, error: String(error) };
  }
};
