
import { supabase } from "@/integrations/supabase/client";
import { VentrataParticipant } from "@/types/ventrata";

// Fixed or demo data to use as a fallback
const demoParticipants: VentrataParticipant[] = [
  {
    id: "demo-1",
    name: "Smith Family",
    count: 2,
    bookingRef: "BK12345",
    childCount: 1,
    group_id: "demo-group-1"
  },
  {
    id: "demo-2",
    name: "John Davis",
    count: 1,
    bookingRef: "BK12346",
    childCount: 0,
    group_id: "demo-group-1"
  },
  {
    id: "demo-3",
    name: "Rodriguez Family",
    count: 3,
    bookingRef: "BK12347",
    childCount: 1,
    group_id: "demo-group-1"
  },
  {
    id: "demo-4",
    name: "Wilson Family",
    count: 4,
    bookingRef: "BK12348",
    childCount: 2,
    group_id: "demo-group-2"
  },
  {
    id: "demo-5",
    name: "Lee Brown",
    count: 2,
    bookingRef: "BK12349",
    childCount: 0,
    group_id: "demo-group-2"
  }
];

/**
 * Fetch participants for a tour from the API or database
 */
export const fetchParticipantsForTour = async (tourId: string): Promise<VentrataParticipant[]> => {
  console.log("PARTICIPANTS DEBUG: fetchParticipantsForTour for tour:", tourId);
  
  try {
    // Try to fetch from Supabase first
    const { data: groups } = await supabase
      .from('tour_groups')
      .select('id')
      .eq('tour_id', tourId);
      
    if (groups && groups.length > 0) {
      const groupIds = groups.map(g => g.id);
      
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .in('group_id', groupIds);
        
      if (error) {
        console.error("PARTICIPANTS DEBUG: Error fetching participants:", error);
        console.log("PARTICIPANTS DEBUG: Falling back to demo data");
        return demoParticipants;
      }
      
      if (data && data.length > 0) {
        console.log("PARTICIPANTS DEBUG: Successfully fetched", data.length, "participants from database");
        
        // Transform to VentrataParticipant format
        return data.map(p => ({
          id: p.id,
          name: p.name,
          count: p.count || 1,
          bookingRef: p.booking_ref,
          childCount: p.child_count || 0,
          group_id: p.group_id
        }));
      }
    }
    
    // If no data found, return demo data
    console.log("PARTICIPANTS DEBUG: No participants found, using demo data");
    return demoParticipants;
  } catch (error) {
    console.error("PARTICIPANTS DEBUG: Error in fetchParticipantsForTour:", error);
    // Return demo data as fallback
    return demoParticipants;
  }
};

/**
 * Update a participant's group assignment
 */
export const updateParticipantGroup = async (
  participantId: string,
  newGroupId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('participants')
      .update({ group_id: newGroupId })
      .eq('id', participantId);
      
    if (error) {
      console.error("Error updating participant group:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateParticipantGroup:", error);
    return false;
  }
};
