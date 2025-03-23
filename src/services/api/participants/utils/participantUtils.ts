
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateRandomParticipant } from "./testDataUtils";

/**
 * Fetch participants for groups
 */
export const fetchParticipantsForGroups = async (groupIds) => {
  try {
    if (!groupIds || groupIds.length === 0) {
      console.log("DATABASE DEBUG: No group IDs provided for participants");
      return { success: true, participants: [] };
    }
    
    console.log("DATABASE DEBUG: Fetching participants for groups:", groupIds);
    
    const { data: participants, error } = await supabase
      .from('participants')
      .select('*')
      .in('group_id', groupIds);
      
    if (error) {
      console.error("DATABASE DEBUG: Error fetching participants:", error);
      return { success: false, error: error.message };
    }

    console.log(`DATABASE DEBUG: Found ${participants.length} participants`);
    return { success: true, participants };
  } catch (error) {
    console.error("DATABASE DEBUG: Error in fetchParticipantsForGroups:", error);
    return { success: false, error: String(error) };
  }
};

/**
 * Create test participants for groups
 */
export const createTestParticipants = async (groups) => {
  try {
    if (!groups || groups.length === 0) {
      console.log("DATABASE DEBUG: No groups provided for test participant creation");
      return { success: false, error: "No groups provided" };
    }
    
    console.log(`DATABASE DEBUG: Creating test participants for ${groups.length} groups`);
    
    // Create test participants for each group
    const testParticipants = [];
    
    for (const group of groups) {
      // Create 2-3 test participants per group
      const participantCount = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < participantCount; i++) {
        const participant = generateRandomParticipant(group.id);
        testParticipants.push(participant);
      }
    }
    
    // Batch insert participants
    if (testParticipants.length > 0) {
      const { data, error } = await supabase
        .from('participants')
        .insert(testParticipants)
        .select();
        
      if (error) {
        console.error("DATABASE DEBUG: Error creating test participants:", error);
        return { success: false, error: error.message };
      }
      
      console.log(`DATABASE DEBUG: Created ${data.length} test participants`);
      return { success: true, participants: data };
    }
    
    return { success: true, participants: [] };
  } catch (error) {
    console.error("DATABASE DEBUG: Error in createTestParticipants:", error);
    return { success: false, error: String(error) };
  }
};
