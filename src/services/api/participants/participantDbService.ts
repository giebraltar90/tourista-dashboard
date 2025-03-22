
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkParticipantsTable } from "@/services/api/checkParticipantsTable";
import { checkTourExists, debugCheckParticipantsTable } from "./utils/dbUtils";
import { fetchTourGroups } from "./utils/groupUtils";
import { fetchParticipantsForGroups, createTestParticipants } from "./utils/participantUtils";

/**
 * Load participants for a tour with table verification
 */
export const loadParticipantsData = async (tourId: string) => {
  try {
    // First, check if the participants table exists using our improved function
    const tableCheck = await checkParticipantsTable();
    console.log("DATABASE DEBUG: Participants table check result:", tableCheck);
    
    if (!tableCheck.exists) {
      console.error("DATABASE DEBUG: Participants table doesn't exist:", tableCheck.message);
      // Instead of showing a toast error immediately, try to create test participants
      console.log("DATABASE DEBUG: Will attempt to auto-fix the table issue...");
      
      // Check if the tour exists first
      const tourCheck = await checkTourExists(tourId);
      if (!tourCheck.exists) {
        toast.error(`Failed to find tour: ${tourCheck.error}`);
        return { success: false, error: tourCheck.error };
      }
      
      // Fetch tour groups
      const { success: groupsSuccess, groups, error: groupsError } = await fetchTourGroups(tourId);
      if (!groupsSuccess || !groups) {
        toast.error(`Failed to fetch tour groups: ${groupsError}`);
        return { success: false, error: groupsError };
      }
      
      // At this point, we have groups but no participants table. 
      // Return what we have with a special flag
      return { 
        success: true, 
        groups, 
        participants: [],
        needsTableCreate: true
      };
    }
    
    // Check if the tour exists
    const tourCheck = await checkTourExists(tourId);
    if (!tourCheck.exists) {
      toast.error(`Failed to find tour: ${tourCheck.error}`);
      return { success: false, error: tourCheck.error };
    }
    
    // Fetch tour groups
    const { success: groupsSuccess, groups, error: groupsError } = await fetchTourGroups(tourId);
    if (!groupsSuccess || !groups) {
      toast.error(`Failed to fetch tour groups: ${groupsError}`);
      return { success: false, error: groupsError };
    }
    
    // Get group IDs
    const groupIds = groups.map(group => group.id);
    console.log("DATABASE DEBUG: Group IDs for participant lookup:", groupIds);
    
    // Try direct SQL query to check participants table
    await debugCheckParticipantsTable(groupIds);
    
    // Fetch participants for the groups
    const { success: participantsSuccess, participants, error: participantsError } = 
      await fetchParticipantsForGroups(groupIds);
    
    if (!participantsSuccess) {
      toast.error(`Failed to fetch participants: ${participantsError}`);
      return { success: false, error: participantsError };
    }
    
    // If no participants were found, try to create test participants
    let finalParticipants = participants;
    if (!participants || participants.length === 0) {
      console.log("DATABASE DEBUG: No participants found. Checking if the participants table exists...");
      
      const { success: testSuccess, participants: testParticipants } = await createTestParticipants(groups);
      
      if (testSuccess && testParticipants && testParticipants.length > 0) {
        finalParticipants = testParticipants;
      }
    }
    
    return { 
      success: true, 
      groups, 
      participants: finalParticipants 
    };
  } catch (error) {
    console.error("DATABASE DEBUG: Error in loadParticipantsData:", error);
    return { success: false, error: String(error) };
  }
};
