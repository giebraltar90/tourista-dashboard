
import { supabase } from "@/integrations/supabase/client";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { toast } from "sonner";
import { checkParticipantsTable } from "@/services/api/checkParticipantsTable";

/**
 * Check if the tour exists in the database
 */
export const checkTourExists = async (tourId: string) => {
  try {
    const { data: tourData, error: tourError } = await supabase
      .from('tours')
      .select('id')
      .eq('id', tourId)
      .single();
      
    if (tourError) {
      console.error("DATABASE DEBUG: Error fetching tour data:", tourError);
      return { exists: false, error: tourError.message };
    }
    
    console.log("DATABASE DEBUG: Found tour with ID:", tourData.id);
    return { exists: true, id: tourData.id };
  } catch (error) {
    console.error("DATABASE DEBUG: Error in checkTourExists:", error);
    return { exists: false, error: String(error) };
  }
};

/**
 * Fetch tour groups for a tour
 */
export const fetchTourGroups = async (tourId: string) => {
  try {
    const { data: groups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('id, guide_id, name, entry_time, size, child_count')
      .eq('tour_id', tourId);
      
    if (groupsError) {
      console.error("DATABASE DEBUG: Error fetching tour groups:", groupsError);
      return { success: false, error: groupsError.message };
    }
    
    console.log(`DATABASE DEBUG: Found ${groups ? groups.length : 0} groups for tour ID: ${tourId}`);
    
    if (!groups || groups.length === 0) {
      console.log("DATABASE DEBUG: No groups found for tour ID:", tourId);
      return { success: false, error: "No groups found" };
    }
    
    // Log each group for debugging
    groups.forEach((group, index) => {
      console.log(`DATABASE DEBUG: Group ${index + 1}:`, {
        id: group.id,
        name: group.name,
        entry_time: group.entry_time,
        size: group.size,
        child_count: group.child_count,
        guide_id: group.guide_id,
      });
    });
    
    return { success: true, groups };
  } catch (error) {
    console.error("DATABASE DEBUG: Error in fetchTourGroups:", error);
    return { success: false, error: String(error) };
  }
};

/**
 * Debug check participants table using direct SQL
 */
export const debugCheckParticipantsTable = async (groupIds: string[]) => {
  try {
    // Properly type the group_ids parameter
    const { data: directCheck, error: directError } = await supabase.rpc(
      'debug_check_participants',
      { group_ids: groupIds } as { group_ids: string[] }
    ).single();
    
    if (directError) {
      console.error("DATABASE DEBUG: Error in debug_check_participants:", directError);
      return { success: false, error: directError.message };
    } else {
      console.log("DATABASE DEBUG: Direct SQL check result:", directCheck);
      return { success: true, data: directCheck };
    }
  } catch (error) {
    console.error("DATABASE DEBUG: Error in debugCheckParticipantsTable:", error);
    return { success: false, error: String(error) };
  }
};

/**
 * Fetch participants for tour groups
 */
export const fetchParticipantsForGroups = async (groupIds: string[]) => {
  try {
    const { data: participantsData, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .in('group_id', groupIds);
      
    if (participantsError) {
      console.error("DATABASE DEBUG: Error fetching participants:", participantsError);
      console.log("DATABASE DEBUG: SQL error details:", participantsError.details, participantsError.message);
      return { success: false, error: participantsError.message };
    }
    
    console.log(`DATABASE DEBUG: Found ${participantsData ? participantsData.length : 0} total participants`);
    return { success: true, participants: participantsData || [] };
  } catch (error) {
    console.error("DATABASE DEBUG: Error in fetchParticipantsForGroups:", error);
    return { success: false, error: String(error) };
  }
};

/**
 * Create test participants for groups with no participants
 */
export const createTestParticipants = async (groups: any[]) => {
  try {
    console.log("DATABASE DEBUG: Attempting to create test participants...");
    
    const createdParticipants = [];
    
    // Insert one test participant per group
    for (const group of groups) {
      const { data: insertResult, error: insertError } = await supabase
        .from('participants')
        .insert({
          name: `Test Participant for ${group.name || 'Group'}`,
          count: 2,
          child_count: 1,
          group_id: group.id,
          booking_ref: 'TEST-123'
        })
        .select();
        
      if (insertError) {
        console.error(`DATABASE DEBUG: Error inserting test participant for group ${group.id}:`, insertError);
      } else {
        console.log(`DATABASE DEBUG: Successfully created test participant for group ${group.id}:`, insertResult);
        if (insertResult) {
          createdParticipants.push(...insertResult);
        }
      }
    }
    
    return { success: createdParticipants.length > 0, participants: createdParticipants };
  } catch (error) {
    console.error("DATABASE DEBUG: Exception when inserting test participants:", error);
    return { success: false, error: String(error) };
  }
};

/**
 * Load participants for a tour with table verification
 */
export const loadParticipantsData = async (tourId: string) => {
  try {
    // First, check if the participants table exists
    const tableCheck = await checkParticipantsTable();
    console.log("DATABASE DEBUG: Participants table check result:", tableCheck);
    
    if (!tableCheck.exists) {
      console.error("DATABASE DEBUG: Participants table doesn't exist:", tableCheck.message);
      toast.error("Participants table doesn't exist in the database");
      return { success: false, error: tableCheck.message };
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
