
import { supabase } from "@/integrations/supabase/client";
import { VentrataParticipant, VentrataTourGroup } from "@/types/ventrata";
import { toast } from "sonner";

/**
 * Get participants for a tour, combining Supabase data with fallback data
 */
export const fetchParticipantsForTour = async (tourId: string): Promise<VentrataParticipant[]> => {
  console.log("fetchParticipantsForTour called for tourId:", tourId);
  try {
    // First, get the tour groups for this tour
    const { data: tourGroups, error: tourGroupsError } = await supabase
      .from('tour_groups')
      .select('id')
      .eq('tour_id', tourId);
      
    if (tourGroupsError) {
      console.error("Error fetching tour groups:", tourGroupsError);
      throw tourGroupsError;
    }
    
    if (!tourGroups || tourGroups.length === 0) {
      console.log("No tour groups found for tour:", tourId);
      return generateDemoParticipants(5);
    }
    
    // Get group IDs for the IN clause
    const groupIds = tourGroups.map(group => group.id);
    console.log("Found group IDs:", groupIds);
    
    // Fetch participants for these groups
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .in('group_id', groupIds);
      
    if (participantsError) {
      console.error("Error fetching participants:", participantsError);
      throw participantsError;
    }
    
    if (!participants || participants.length === 0) {
      console.log("No participants found, generating demo data");
      return generateDemoParticipants(5);
    }
    
    console.log("Found participants:", participants);
    
    // Map the database results to the VentrataParticipant structure
    return participants.map(p => ({
      id: p.id,
      name: p.name,
      count: p.count || 1,
      bookingRef: p.booking_ref,
      childCount: p.child_count || 0,
      group_id: p.group_id
    }));
  } catch (error) {
    console.error("Error in fetchParticipantsForTour:", error);
    // Return demo data as fallback
    return generateDemoParticipants(5);
  }
};

/**
 * Update a participant in the database
 */
export const updateParticipant = async (
  participantId: string,
  groupId: string
): Promise<boolean> => {
  try {
    console.log("Updating participant", participantId, "to group", groupId);
    
    const { error } = await supabase
      .from('participants')
      .update({ group_id: groupId })
      .eq('id', participantId);
      
    if (error) {
      console.error("Error updating participant:", error);
      toast.error("Failed to update participant");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in updateParticipant:", error);
    toast.error("Error updating participant");
    return false;
  }
};

/**
 * Generate demo participants for testing
 */
export const generateDemoParticipants = (count: number = 10): VentrataParticipant[] => {
  const firstNames = ["John", "Jane", "Robert", "Emma", "Michael", "Sophia", "William", "Olivia", "David", "Ava"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Martinez"];
  
  return Array.from({ length: count }).map((_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const participantCount = Math.floor(Math.random() * 3) + 1;
    const childCount = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;
    
    return {
      id: `demo-${index}-${Date.now()}`,
      name: `${firstName} ${lastName}`,
      count: participantCount,
      bookingRef: `BK${10000 + index}`,
      childCount,
      group_id: "" // Will be assigned later
    };
  });
};

/**
 * Get all groups for a tour
 */
export const fetchGroupsForTour = async (tourId: string): Promise<VentrataTourGroup[]> => {
  try {
    const { data, error } = await supabase
      .from('tour_groups')
      .select(`
        id, name, size, entry_time, guide_id, child_count,
        participants (id, name, count, booking_ref, child_count)
      `)
      .eq('tour_id', tourId);
      
    if (error) {
      console.error("Error fetching tour groups:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("No groups found for tour:", tourId);
      return [];
    }
    
    // Transform the data to match the VentrataTourGroup structure
    return data.map(group => ({
      id: group.id,
      name: group.name,
      size: group.size,
      entryTime: group.entry_time,
      guideId: group.guide_id,
      childCount: group.child_count,
      participants: group.participants ? group.participants.map(p => ({
        id: p.id,
        name: p.name,
        count: p.count || 1,
        bookingRef: p.booking_ref,
        childCount: p.child_count || 0,
        group_id: group.id
      })) : []
    }));
  } catch (error) {
    console.error("Error in fetchGroupsForTour:", error);
    return [];
  }
};
