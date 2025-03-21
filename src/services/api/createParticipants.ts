
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
    const allParticipants = [];
    
    // Make sure all groups get participants
    for (const group of groups) {
      // Create 2-3 test participants per group
      const numParticipants = Math.floor(Math.random() * 2) + 2; // 2 or 3
      const groupParticipants = [];
      
      for (let i = 0; i < numParticipants; i++) {
        const participantName = getRandomParticipantName();
        const participantCount = Math.floor(Math.random() * 3) + 1; // 1-3 people
        const childCount = Math.random() > 0.7 ? 1 : 0; // 30% chance of a child
        
        const participant = {
          name: participantName,
          count: participantCount,
          child_count: childCount,
          group_id: group.id,
          booking_ref: `TEST-${uuidv4().substring(0, 8)}`
        };
        
        groupParticipants.push(participant);
        allParticipants.push(participant);
      }
      
      console.log(`DATABASE DEBUG: Created ${groupParticipants.length} participants for group ${group.id} (${group.name || 'Unnamed'})`);
      results.push({ groupId: group.id, participantsCreated: groupParticipants.length });
    }
    
    // Insert all participants at once
    if (allParticipants.length > 0) {
      const { data, error } = await supabase
        .from('participants')
        .insert(allParticipants)
        .select();
        
      if (error) {
        console.error(`DATABASE DEBUG: Error creating participants:`, error);
        return { success: false, error: error.message, results };
      }
      
      console.log(`DATABASE DEBUG: Successfully created ${data?.length || 0} participants`);
      return { success: true, data, results };
    }
    
    return { success: true, results };
  } catch (error) {
    console.error("DATABASE DEBUG: Error creating test participants:", error);
    return { success: false, error: String(error) };
  }
};

// Helper function to generate more realistic participant names
function getRandomParticipantName() {
  const firstNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller"];
  const descriptors = ["Family", "Couple", "Group", "Reservation"];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
  
  return `${firstName} ${descriptor}`;
}
