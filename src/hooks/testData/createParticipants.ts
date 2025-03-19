
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates test participants in the database
 */
export const createTestParticipants = async (groupData: Array<{id: string}>) => {
  console.log("Creating test participants...");
  
  if (!groupData || groupData.length === 0) {
    console.error("No groups available to create participants for");
    return [];
  }
  
  // Create participants for all groups
  const participants = [];
  
  // Participants for first tour, first group
  if (groupData.length > 0) {
    participants.push(
      {
        group_id: groupData[0].id,
        name: "Smith Family",
        count: 2,
        booking_ref: "BK001",
        child_count: 1
      },
      {
        group_id: groupData[0].id,
        name: "John Davis",
        count: 1,
        booking_ref: "BK002",
        child_count: 0
      },
      {
        group_id: groupData[0].id,
        name: "Rodriguez Family",
        count: 3,
        booking_ref: "BK003",
        child_count: 1
      }
    );
  }
  
  // Participants for first tour, second group
  if (groupData.length > 1) {
    participants.push(
      {
        group_id: groupData[1].id,
        name: "Wilson Couple",
        count: 2,
        booking_ref: "BK004",
        child_count: 0
      },
      {
        group_id: groupData[1].id,
        name: "Laura Chen",
        count: 1,
        booking_ref: "BK005",
        child_count: 0
      },
      {
        group_id: groupData[1].id,
        name: "Michael Brown",
        count: 1,
        booking_ref: "BK006",
        child_count: 1
      }
    );
  }
  
  // Participants for second tour
  if (groupData.length > 2) {
    participants.push(
      {
        group_id: groupData[2].id,
        name: "Johnson Family",
        count: 4,
        booking_ref: "BK007",
        child_count: 2
      },
      {
        group_id: groupData[2].id,
        name: "Emily Parker",
        count: 1,
        booking_ref: "BK008",
        child_count: 0
      }
    );
  }
  
  // Third tour, first group
  if (groupData.length > 3) {
    participants.push(
      {
        group_id: groupData[3].id,
        name: "Garcia Family",
        count: 3,
        booking_ref: "BK009",
        child_count: 1
      },
      {
        group_id: groupData[3].id,
        name: "Taylor Group",
        count: 5,
        booking_ref: "BK010",
        child_count: 2
      }
    );
  }
  
  // Third tour, second group
  if (groupData.length > 4) {
    participants.push(
      {
        group_id: groupData[4].id,
        name: "Anderson Couple",
        count: 2,
        booking_ref: "BK011",
        child_count: 0
      },
      {
        group_id: groupData[4].id,
        name: "Thomas Young",
        count: 1,
        booking_ref: "BK012",
        child_count: 0
      },
      {
        group_id: groupData[4].id,
        name: "Martinez Family",
        count: 4,
        booking_ref: "BK013",
        child_count: 2
      }
    );
  }
  
  const { data: participantData, error: participantError } = await supabase
    .from('participants')
    .insert(participants)
    .select();
    
  if (participantError) {
    console.error("Error creating participants:", participantError);
    throw participantError;
  }
  
  console.log("Created test participants:", participantData);
  return participantData || [];
};
