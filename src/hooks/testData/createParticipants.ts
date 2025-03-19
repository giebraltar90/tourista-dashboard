
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates test participants in the database
 */
export const createTestParticipants = async (groupData: Array<{id: string}>) => {
  console.log("Creating test participants...");
  
  // Create participants for some groups
  const participants = [
    // Participants for first tour, first group
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
    },
    
    // Participants for first tour, second group
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
    },
    
    // Participants for second tour
    {
      group_id: groupData[2].id,
      name: "Johnson Family",
      count: 4,
      booking_ref: "BK007",
      child_count: 0
    }
  ];
  
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
