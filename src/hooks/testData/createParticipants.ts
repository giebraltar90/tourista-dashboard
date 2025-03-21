
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
  
  // Track how many participants we've created per group for logging
  const groupParticipantCounts = {};
  
  // Loop through all groups and ensure each one gets at least 2 participants
  for (let i = 0; i < groupData.length; i++) {
    const groupId = groupData[i].id;
    const groupIndex = i + 1;
    
    // Initialize the count tracker
    groupParticipantCounts[groupId] = 0;
    
    // Generate 2-3 participants for each group
    const numParticipants = Math.floor(Math.random() * 2) + 2; // 2 or 3
    
    for (let j = 0; j < numParticipants; j++) {
      const baseIndex = i * 10 + j; // Create unique indices across groups
      
      const participant = {
        group_id: groupId,
        name: `${getRandomFamilyName(baseIndex)} ${getParticipantType(j)}`,
        count: Math.floor(Math.random() * 3) + 1, // 1-3 people
        booking_ref: `BK${String(100 + baseIndex).padStart(3, '0')}`,
        child_count: Math.random() > 0.7 ? 1 : 0 // 30% chance of having a child
      };
      
      participants.push(participant);
      groupParticipantCounts[groupId] = (groupParticipantCounts[groupId] || 0) + 1;
    }
    
    console.log(`Added ${groupParticipantCounts[groupId]} participants to Group ${groupIndex} (${groupId})`);
  }
  
  // Insert all participants at once for better performance
  try {
    const { data: participantData, error: participantError } = await supabase
      .from('participants')
      .insert(participants)
      .select();
      
    if (participantError) {
      console.error("Error creating participants:", participantError);
      throw participantError;
    }
    
    console.log(`Successfully created ${participantData?.length || 0} test participants across ${groupData.length} groups`);
    
    // Log details about distribution
    for (const groupId in groupParticipantCounts) {
      console.log(`Group ${groupId}: ${groupParticipantCounts[groupId]} participants`);
    }
    
    return participantData || [];
  } catch (error) {
    console.error("Failed to create participants:", error);
    return [];
  }
};

// Helper functions to generate more realistic test data
function getRandomFamilyName(index: number): string {
  const familyNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", 
    "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris",
    "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
  ];
  
  // Ensure we always have a name by using modulo
  return familyNames[index % familyNames.length];
}

function getParticipantType(index: number): string {
  const types = ["Family", "Couple", "Group", "Reservation"];
  return types[index % types.length];
}
